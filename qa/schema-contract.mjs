#!/usr/bin/env node
/**
 * Schema contract — the check that would have caught the broken subscription.
 *
 * `subscribers.name` did not exist in the live database while the code wrote it,
 * so every subscription failed with a 503 and nothing said why. This script
 * reads the columns declared in supabase/schema.sql and then reads every
 * Supabase query in the codebase, and fails if the code names a column the
 * schema does not have — for writes (.insert/.update/.upsert), for explicit
 * .select('a,b') lists and for filters (.eq/.ilike/.order/.gte/.not).
 *
 * It runs offline against the committed schema file, so it works in CI, in the
 * sandbox and on a laptop with no database in reach. Keep supabase/schema.sql
 * in step with the live database: after any migration, re-run it and update the
 * file (or the check starts lying in the other direction).
 *
 *   node qa/schema-contract.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SCHEMA = join(ROOT, 'supabase', 'schema.sql');
const SCAN = ['lib', 'app', 'components'];

let failures = 0;
const fail = (msg) => {
  console.log('FAIL ' + msg);
  failures += 1;
};

/* ---------- 1. the declared schema ---------- */

function parseSchema(sql) {
  const tables = new Map();
  const add = (table, column) => {
    if (!tables.has(table)) tables.set(table, new Set());
    tables.get(table).add(column);
  };
  const withoutComments = sql.replace(/--[^\n]*/g, '');
  const createRe = /create\s+table\s+(?:if\s+not\s+exists\s+)?public\.(\w+)\s*\(([\s\S]*?)\n\);/gi;
  for (const [, table, body] of withoutComments.matchAll(createRe)) {
    for (const rawLine of body.split('\n')) {
      const line = rawLine.trim();
      if (!line || /^(primary\s+key|unique|check|constraint|foreign\s+key)/i.test(line)) continue;
      const m = line.match(/^"?(\w+)"?\s+\w/i);
      if (m) add(table, m[1]);
    }
  }
  const alterRe = /alter\s+table\s+public\.(\w+)\s+add\s+column\s+(?:if\s+not\s+exists\s+)?"?(\w+)"?/gi;
  for (const [, table, column] of withoutComments.matchAll(alterRe)) add(table, column);
  return tables;
}

const schema = parseSchema(readFileSync(SCHEMA, 'utf8'));
console.log(`schema: ${schema.size} tables declared in supabase/schema.sql`);
for (const [table, cols] of [...schema].sort()) console.log(`  ${table}: ${[...cols].sort().join(', ')}`);

/* ---------- 2. every query in the code ---------- */

function files(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...files(full));
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

/** Walk a brace-delimited object literal and return its top-level keys. */
function objectKeys(source, openIndex) {
  const keys = [];
  let depth = 0;
  let inString = null;
  let expectKey = true;
  for (let i = openIndex; i < source.length; i += 1) {
    const ch = source[i];
    if (inString) {
      if (ch === '\\') i += 1;
      else if (ch === inString) inString = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch;
      continue;
    }
    if (/\s/.test(ch)) continue;
    if (ch === '{' || ch === '(' || ch === '[') {
      depth += 1;
      if (depth === 1) expectKey = true;
      continue;
    }
    if (ch === '}' || ch === ')' || ch === ']') {
      depth -= 1;
      if (depth === 0) return keys;
      if (depth === 1) expectKey = false;
      continue;
    }
    if (depth !== 1) continue;
    if (ch === ',') {
      expectKey = true;
      continue;
    }
    if (ch === ':') {
      expectKey = false;
      continue;
    }
    const rest = source.slice(i);
    const spread = rest.match(/^\.\.\.[A-Za-z_$][\w$]*/);
    if (spread) {
      // Whatever is spread in is built somewhere else; only the literal keys here
      // can be checked, so step over it.
      i += spread[0].length - 1;
      expectKey = false;
      continue;
    }
    const ident = rest.match(/^[A-Za-z_$][\w$]*/);
    if (ident) {
      if (expectKey) keys.push(ident[0]);
      i += ident[0].length - 1;
    }
  }
  return keys;
}

const checked = new Map(); // table -> Set of columns referenced
const note = (table, column) => {
  if (!checked.has(table)) checked.set(table, new Set());
  checked.get(table).add(column);
  if (!schema.has(table)) return fail(`code queries a table that is not in supabase/schema.sql: ${table}`);
  if (!schema.get(table).has(column)) {
    fail(`column "${column}" is written to ${table} but the schema has no such column (${relative(ROOT, file)})`);
  }
};

let file = '';
const WRITE = ['insert', 'update', 'upsert'];
const FILTER = ['eq', 'neq', 'ilike', 'like', 'gte', 'lte', 'gt', 'lt', 'order', 'is', 'in'];

for (const dir of SCAN) {
  for (const full of files(join(ROOT, dir))) {
    file = relative(ROOT, full);
    const source = readFileSync(full, 'utf8');
    for (const from of source.matchAll(/\.from\(\s*['"](\w+)['"]\s*\)/g)) {
      const table = from[1];
      // One statement at a time: a fixed window would bleed into the next
      // query in the file and blame the wrong table for its columns.
      const semi = source.indexOf(';', from.index);
      const window = source.slice(from.index, semi > 0 ? semi : from.index + 400);

      for (const verb of WRITE) {
        const re = new RegExp(`\\.${verb}\\(\\s*(\\{)`, 'g');
        for (const hit of window.matchAll(re)) {
          for (const key of objectKeys(window, hit.index + hit[0].length - 1)) note(table, key);
        }
      }

      const select = window.match(/\.select\(\s*['"]([^'"]+)['"]/);
      if (select && select[1].trim() !== '*') {
        for (const col of select[1].split(',')) {
          const name = col.trim().split(/\s+/)[0];
          if (name && !name.includes('(')) note(table, name);
        }
      }

      for (const verb of FILTER) {
        const re = new RegExp(`\\.${verb}\\(\\s*['"](\\w+)['"]`, 'g');
        for (const hit of window.matchAll(re)) note(table, hit[1]);
      }
    }
  }
}

/* ---------- 3. report ---------- */

const referenced = [...checked.keys()].sort();
const untouched = [...schema.keys()].filter((t) => !checked.has(t)).sort();
console.log(`\ncode references ${referenced.length} of ${schema.size} tables: ${referenced.join(', ')}`);
if (untouched.length) console.log(`not referenced by any query parsed here: ${untouched.join(', ')}`);
console.log(
  `columns checked: ${[...checked.values()].reduce((n, set) => n + set.size, 0)}`,
);

if (failures) {
  console.log(`\nFAIL: ${failures} schema mismatches — the code and the database disagree.`);
  process.exit(1);
}
console.log('\nPASS: every column the code names exists in the declared schema.');
