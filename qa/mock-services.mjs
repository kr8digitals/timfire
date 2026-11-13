/**
 * Mock services for the offline QA harness (qa/auth-flow.mjs).
 *
 * Two things the site talks to cannot be reached from a sandbox or a CI runner:
 * Resend and Supabase. Rather than skip the tests that need them, this stands up
 * just enough of each to drive the real code paths:
 *
 *   Resend   POST /emails — captures the exact body the SDK would have sent.
 *   Supabase /rest/v1/<table> — an in-memory PostgREST: select with filters,
 *            insert, upsert (Prefer: resolution=merge-duplicates), update,
 *            delete, and the `Accept: application/vnd.pgrst.object+json`
 *            single-object semantics that .single() and .maybeSingle() rely on.
 *
 * Everything captured stays in this process, so a test can read the email that
 * "went out" and the rows that were written — including asserting that the
 * sign-in code was stored as a hash and never as plaintext.
 */
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

const PRIMARY_KEYS = {
  admin_signins: ['key'],
  subscribers: ['id'],
  email_log: ['id'],
  email_templates: ['slug'],
  enquiries: ['id'],
  site_content: ['collection', 'id'],
  site_singletons: ['key'],
};

/** Column defaults the real database supplies, so inserts behave the same. */
function withDefaults(table, row) {
  const out = { ...row };
  if (PRIMARY_KEYS[table]?.includes('id') && !out.id) out.id = randomUUID();
  if (table === 'subscribers') {
    out.status ??= 'active';
    out.source ??= 'site';
    out.unsub_token ??= randomUUID();
    out.created_at ??= new Date().toISOString();
    out.name ??= '';
  }
  if (table === 'email_log') {
    out.status ??= 'queued';
    out.meta ??= {};
    out.created_at ??= new Date().toISOString();
  }
  if (table === 'admin_signins') {
    out.tries ??= 0;
    out.tally ??= 0;
    out.updated_at ??= new Date().toISOString();
  }
  if (table === 'enquiries') {
    out.answers ??= {};
    out.created_at ??= new Date().toISOString();
  }
  return out;
}

function matches(row, filters) {
  return [...filters].every(([column, [op, raw]]) => {
    const value = row[column];
    switch (op) {
      case 'eq':
        return String(value) === raw;
      case 'neq':
        return String(value) !== raw;
      case 'gt':
        return String(value) > raw;
      case 'gte':
        return String(value) >= raw;
      case 'lt':
        return String(value) < raw;
      case 'lte':
        return String(value) <= raw;
      case 'ilike':
      case 'like':
        return new RegExp(
          '^' + raw.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.') + '$',
          'i',
        ).test(String(value ?? ''));
      case 'is':
        return raw === 'null' ? value === null || value === undefined : String(value) === raw;
      case 'in':
        return raw
          .replace(/^\(|\)$/g, '')
          .split(',')
          .some((candidate) => candidate.trim().replace(/^"|"$/g, '') === String(value));
      default:
        return true;
    }
  });
}

function filtersOf(params) {
  const reserved = new Set(['select', 'order', 'limit', 'offset', 'on_conflict']);
  const out = [];
  for (const [key, value] of params) {
    if (reserved.has(key)) continue;
    const dot = String(value).indexOf('.');
    if (dot < 0) continue;
    out.push([key, [String(value).slice(0, dot), String(value).slice(dot + 1)]]);
  }
  return out;
}

export async function startMocks({ resendPort, dbPort }) {
  const emails = [];
  const tables = new Map();
  const rows = (table) => {
    if (!tables.has(table)) tables.set(table, []);
    return tables.get(table);
  };

  const readBody = (req) =>
    new Promise((resolve) => {
      let raw = '';
      req.on('data', (chunk) => {
        raw += chunk;
      });
      req.on('end', () => {
        try {
          resolve(raw ? JSON.parse(raw) : null);
        } catch {
          resolve(null);
        }
      });
    });

  /* ---------------- Resend ---------------- */
  const resend = createServer(async (req, res) => {
    const body = await readBody(req);
    if (req.method === 'POST' && req.url === '/emails') {
      emails.push(body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ id: `re_mock_${emails.length}` }));
      return;
    }
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: `mock resend: unhandled ${req.method} ${req.url}` }));
  });

  /* ---------------- Supabase (PostgREST) ---------------- */
  const supabase = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://mock');
    const table = url.pathname.replace('/rest/v1/', '').replace(/\/$/, '');
    const wantsObject = (req.headers.accept || '').includes('pgrst.object');
    const prefer = req.headers.prefer || '';
    const send = (status, payload) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(payload));
    };
    const single = (list) => {
      if (!wantsObject) return send(200, list);
      if (list.length === 1) return send(200, list[0]);
      return send(406, {
        code: 'PGRST116',
        message: 'JSON object requested, multiple (or no) rows returned',
        details: `${list.length} rows`,
        hint: null,
      });
    };
    if (!PRIMARY_KEYS[table]) return send(404, { message: `mock supabase: unknown table ${table}` });
    const filters = filtersOf(url.searchParams);
    const body = req.method === 'GET' || req.method === 'DELETE' ? null : await readBody(req);

    if (req.method === 'GET') {
      let list = rows(table).filter((row) => matches(row, filters));
      const order = url.searchParams.get('order');
      if (order) {
        const [column, direction] = order.split('.');
        list = [...list].sort((a, b) =>
          direction === 'desc' ? String(b[column]).localeCompare(String(a[column])) : String(a[column]).localeCompare(String(b[column])),
        );
      }
      const limit = url.searchParams.get('limit');
      if (limit) list = list.slice(0, Number(limit));
      return single(list);
    }

    if (req.method === 'POST') {
      const incoming = Array.isArray(body) ? body : [body];
      const upsert = prefer.includes('merge-duplicates');
      const keys = PRIMARY_KEYS[table];
      const written = [];
      for (const item of incoming) {
        const row = withDefaults(table, item);
        const at = rows(table).findIndex((existing) => keys.every((key) => String(existing[key]) === String(row[key])));
        if (at >= 0 && upsert) {
          rows(table)[at] = { ...rows(table)[at], ...row };
          written.push(rows(table)[at]);
        } else if (at >= 0) {
          return send(409, { code: '23505', message: 'duplicate key value violates unique constraint' });
        } else {
          rows(table).push(row);
          written.push(row);
        }
      }
      return single(prefer.includes('return=representation') ? written : []);
    }

    if (req.method === 'PATCH') {
      const changed = [];
      for (const row of rows(table)) {
        if (matches(row, filters)) {
          Object.assign(row, body);
          changed.push(row);
        }
      }
      return single(prefer.includes('return=representation') ? changed : []);
    }

    if (req.method === 'DELETE') {
      const store = rows(table);
      const kept = store.filter((row) => !matches(row, filters));
      const removed = store.length - kept.length;
      tables.set(table, kept);
      return single(prefer.includes('return=representation') ? new Array(removed).fill({ id: null }) : []);
    }

    return send(405, { message: `mock supabase: unhandled ${req.method}` });
  });

  await new Promise((resolve) => resend.listen(resendPort, '127.0.0.1', resolve));
  await new Promise((resolve) => supabase.listen(dbPort, '127.0.0.1', resolve));

  return {
    emails,
    tables,
    table: (name) => rows(name),
    lastEmail: () => emails[emails.length - 1] ?? null,
    async close() {
      await new Promise((resolve) => resend.close(resolve));
      await new Promise((resolve) => supabase.close(resolve));
    },
  };
}
