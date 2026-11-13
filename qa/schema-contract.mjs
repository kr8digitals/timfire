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
 * It checks values too, because a column that exists is not the same as a column
 * that accepts what you write. `email_log.purpose` carried a CHECK constraint
 * allowing only 'form_notice', 'welcome', 'publish_notice' and 'broadcast', while
 * the code logged six other purposes — so every insert was rejected, the error was
 * discarded, and the log stayed empty through two real enquiries and every sign-in
 * code. Two value checks now run:
 *   - every literal the code compares or writes to a constrained column, inside
 *     the window of a query on that table, must be one of the allowed values;
 *   - the allowed values for email_log.purpose must be exactly the TemplateSlug
 *     union in lib/email.ts, in both directions.
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
import { tables as schema, domains } from './schema-domains.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SCAN = ['lib', 'app', 'components'];

let failures = 0;
const fail = (msg) => {
  console.log('FAIL ' + msg);
  failures += 1;
};

/* ---------- 1. the declared schema ---------- */

// Columns and CHECK domains are parsed by qa/schema-domains.mjs, which the mock
// database in qa/mock-services.mjs reads too, so the guard and the harness can
// never disagree about what supabase/schema.sql says.
console.log(`schema: ${schema.size} tables declared in supabase/schema.sql`);
for (const [table, cols] of [...schema].sort()) console.log(`  ${table}: ${[...cols].sort().join(', ')}`);
for (const [table, cols] of [...domains].sort()) {
  for (const [column, allowed] of [...cols].sort()) {
    console.log(`  ${table}.${column} accepts: ${[...allowed].join(', ')}`);
  }
}

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

let valueChecks = 0;
const noteValue = (label, column, value, allowed) => {
  valueChecks += 1;
  if (!allowed.has(value)) {
    fail(
      `${label}.${column} is written or compared as "${value}" but the database only accepts ` +
        `${[...allowed].join(', ')} — the row would be rejected (${file})`,
    );
  }
};

let file = '';
const WRITE = ['insert', 'update', 'upsert'];
const FILTER = ['eq', 'neq', 'ilike', 'like', 'gte', 'lte', 'gt', 'lt', 'order', 'is', 'in'];

for (const dir of SCAN) {
  for (const full of files(join(ROOT, dir))) {
    file = relative(ROOT, full);
    const source = readFileSync(full, 'utf8');
    const tablesInFile = new Set();
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

      tablesInFile.add(table);
    }

    /*
     * Values, not just names. A column that exists can still refuse what the
     * code writes, and only the database knows that — so every literal this file
     * assigns to, or compares against, a constrained column is checked against
     * the values its own tables allow. Scoped per file on purpose: `key` means a
     * singleton name in lib/db.ts and a sign-in record name in lib/auth.ts, and
     * only the first of those files has a domain to answer to.
     */
    const columnsHere = new Map();
    for (const table of tablesInFile) {
      for (const [column, allowed] of domains.get(table) ?? []) {
        if (!columnsHere.has(column)) columnsHere.set(column, new Set());
        for (const value of allowed) columnsHere.get(column).add(value);
      }
    }
    for (const [column, allowed] of columnsHere) {
      const label = [...tablesInFile].filter((t) => domains.get(t)?.has(column)).join('|');
      const patterns = [
        new RegExp(`\\b${column}\\s*:\\s*'([^']*)'`, 'g'), // { status: 'queued' }
        new RegExp(`\\b${column}\\s*(?:===|!==|==|!=)\\s*'([^']*)'`, 'g'), // row.status !== 'active'
        new RegExp(`\\.(?:eq|neq|is)\\(\\s*'${column}'\\s*,\\s*'([^']*)'`, 'g'), // .eq('key', 'now')
      ];
      for (const re of patterns) {
        for (const hit of source.matchAll(re)) noteValue(label, column, hit[1], allowed);
      }
      for (const hit of source.matchAll(new RegExp(`\\.in\\(\\s*'${column}'\\s*,\\s*\\[([^\\]]*)\\]`, 'g'))) {
        for (const value of hit[1].matchAll(/'([^']*)'/g)) noteValue(label, column, value[1], allowed);
      }
    }
  }
}

/* ---------- 3. purposes the code can log vs purposes the log accepts ---------- */

const emailSource = readFileSync(join(ROOT, 'lib', 'email.ts'), 'utf8');
const slugUnion = emailSource.match(/export type TemplateSlug\s*=([\s\S]*?);/);
const slugs = new Set([...(slugUnion ? slugUnion[1].matchAll(/'(\w+)'/g) : [])].map((m) => m[1]));
const purposes = domains.get('email_log')?.get('purpose') ?? new Set();
console.log(`\nTemplateSlug in lib/email.ts: ${[...slugs].sort().join(', ')}`);
if (!slugs.size) fail('could not read the TemplateSlug union from lib/email.ts');
for (const slug of [...slugs].sort()) {
  if (!purposes.has(slug)) fail(`lib/email.ts logs purpose "${slug}" but email_log.purpose does not accept it`);
}
for (const purpose of [...purposes].sort()) {
  if (!slugs.has(purpose)) fail(`email_log.purpose accepts "${purpose}" but no template in lib/email.ts uses it`);
}

/* ---------- 4. report ---------- */

const referenced = [...checked.keys()].sort();
const untouched = [...schema.keys()].filter((t) => !checked.has(t)).sort();
console.log(`\ncode references ${referenced.length} of ${schema.size} tables: ${referenced.join(', ')}`);
if (untouched.length) console.log(`not referenced by any query parsed here: ${untouched.join(', ')}`);
console.log(
  `columns checked: ${[...checked.values()].reduce((n, set) => n + set.size, 0)}; values checked: ${valueChecks}`,
);

if (failures) {
  console.log(`\nFAIL: ${failures} schema mismatches — the code and the database disagree.`);
  process.exit(1);
}
console.log('\nPASS: every column the code names exists in the declared schema, and every value it writes is one the database accepts.');
