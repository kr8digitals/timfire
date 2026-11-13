/**
 * The declared shape of the database, read out of supabase/schema.sql.
 *
 * Two things are worth knowing about a table before you write to it: which
 * columns it has, and which values those columns accept. The second one is easy
 * to miss because it is invisible at the call site — `email_log.purpose` carried
 * a CHECK list that did not include the purposes lib/email.ts logs, so every
 * insert was rejected and the log stayed empty through two real enquiries and
 * every sign-in code. Nothing at the call site could tell.
 *
 * Both the offline guard (qa/schema-contract.mjs) and the mock database
 * (qa/mock-services.mjs) read this, so the mock refuses the same writes the
 * production database refuses instead of nodding along to everything.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
export const SCHEMA_PATH = join(ROOT, 'supabase', 'schema.sql');

const strip = (sql) => sql.replace(/--[^\n]*/g, '');
const literals = (raw) => [...raw.matchAll(/'([^']*)'/g)].map((m) => m[1]);

/** table -> Set of column names. */
export function parseSchema(sql) {
  const tables = new Map();
  const add = (table, column) => {
    if (!tables.has(table)) tables.set(table, new Set());
    tables.get(table).add(column);
  };
  const withoutComments = strip(sql);
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

/**
 * table -> column -> Set of accepted values, from every CHECK (<col> IN (...)),
 * plus the constraint names so a refusal can be reported the way Postgres does.
 */
export function parseChecks(sql) {
  const domains = new Map();
  const names = new Map();
  const add = (table, column, list, name) => {
    if (!domains.has(table)) domains.set(table, new Map());
    domains.get(table).set(column, new Set(list));
    if (name) {
      if (!names.has(table)) names.set(table, new Map());
      names.get(table).set(column, name);
    }
  };
  const withoutComments = strip(sql);
  const inline = /create\s+table\s+(?:if\s+not\s+exists\s+)?public\.(\w+)\s*\(([\s\S]*?)\n\);/gi;
  for (const [, table, body] of withoutComments.matchAll(inline)) {
    for (const hit of body.matchAll(/check\s*\(\s*"?(\w+)"?\s+in\s*\(([^)]*)\)/gi)) add(table, hit[1], literals(hit[2]));
  }
  const altered = /alter\s+table\s+public\.(\w+)\s+add\s+constraint\s+(\w+)\s+check\s*\(\s*"?(\w+)"?\s+in\s*\(([^)]*)\)/gi;
  for (const [, table, name, column, list] of withoutComments.matchAll(altered)) add(table, column, literals(list), name);
  return { domains, names };
}

const SQL = readFileSync(SCHEMA_PATH, 'utf8');
export const tables = parseSchema(SQL);
export const { domains, names: constraintNames } = parseChecks(SQL);

/** The accepted values of one column, or null if it is unconstrained. */
export function allowedValues(table, column) {
  return domains.get(table)?.get(column) ?? null;
}

/**
 * The error PostgREST returns when a row breaks a CHECK constraint, so the mock
 * database fails the way the real one does — same status, same code, same shape
 * the Supabase client puts in `error`.
 */
export function checkViolation(table, row) {
  for (const [column, allowed] of domains.get(table) ?? []) {
    const value = row?.[column];
    if (value === undefined || value === null || allowed.has(value)) continue;
    const name = constraintNames.get(table)?.get(column) ?? `${table}_${column}_check`;
    return {
      code: '23514',
      message: `new row for relation "${table}" violates check constraint "${name}"`,
      details: `Failing row contains ${JSON.stringify(value)} for ${column}; allowed: ${[...allowed].join(', ')}.`,
      hint: null,
    };
  }
  return null;
}
