import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cloneSeed, seed, type SiteData } from './content';
import type { Enquiry } from './enquiry';

/**
 * Supabase is the system of record for content, enquiries, subscribers and the
 * email log. The service-role key lives only in server environment variables
 * (Vercel secrets / .env.local); browsers never see it. Row-level security is
 * enabled on every table with no public policies, so this server client is the
 * only path in or out.
 */
let client: SupabaseClient | null = null;

export function db(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!client) client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export const COLLECTIONS = [
  'stats',
  'services',
  'websites',
  'agents',
  'certificates',
  'creative',
  'journal',
  'features',
  'timeline',
  'testimonials',
  'socials',
  'media',
] as const;
type Collection = (typeof COLLECTIONS)[number];

function seedOrder(collection: Collection): Map<string, number> {
  const map = new Map<string, number>();
  ((seed[collection] as { id: string }[] | undefined) ?? []).forEach((item, i) => map.set(item.id, i));
  return map;
}

/** Set once an empty-table read has been reported, so the alarm does not repeat. */
let warnedAboutEmptyTable = false;

/** Assemble the full SiteData shape from the database, seed order preserved. */
export async function loadSiteData(): Promise<{ data: SiteData; source: 'db' | 'seed' }> {
  const supa = db();
  if (!supa) return { data: cloneSeed(), source: 'seed' };
  const [content, singletons] = await Promise.all([
    supa.from('site_content').select('collection,id,data'),
    supa.from('site_singletons').select('key,data'),
  ]);
  if (content.error || singletons.error) return { data: cloneSeed(), source: 'seed' };

  const data = cloneSeed();
  // An empty `site_content` table is damage, not data. Every collection is
  // cleared below and refilled from rows, so a table with no rows renders a
  // site with no services, no work, no prices and no journal — which is what
  // the live site did once, after a save whose payload carried empty lists
  // deleted all 42 rows. Treat that read as a loss and keep the shipped seed
  // collections on screen instead. The singletons live in their own table and
  // still apply, so the owner's live profile copy and rates are never reverted.
  const emptyTable = (content.data ?? []).length === 0;
  if (emptyTable) {
    // Once per instance: the alarm matters, but a request-per-line flood would
    // bury the very logs someone needs while investigating.
    if (!warnedAboutEmptyTable) {
      warnedAboutEmptyTable = true;
      console.warn(
        '[db] site_content returned 0 rows: serving the shipped seed collections so the site is not blank. Investigate before saving from the dashboard.',
      );
    }
  } else {
    for (const collection of COLLECTIONS) {
      (data as unknown as Record<string, unknown>)[collection] = [];
    }
    const rowsByCollection = new Map<string, { id: string; data: unknown }[]>();
    for (const row of content.data ?? []) {
      if (!(COLLECTIONS as readonly string[]).includes(row.collection)) continue;
      const list = rowsByCollection.get(row.collection) ?? [];
      list.push({ id: row.id, data: row.data });
      rowsByCollection.set(row.collection, list);
    }
    for (const collection of COLLECTIONS) {
      const order = seedOrder(collection);
      const rows = rowsByCollection.get(collection) ?? [];
      rows.sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999));
      (data as unknown as Record<string, unknown>)[collection] = rows.map((r) => r.data);
    }
  }
  for (const row of singletons.data ?? []) {
    if (row.key === 'profile') data.profile = row.data as SiteData['profile'];
    else if (row.key === 'now') data.now = row.data as SiteData['now'];
    else if (row.key === 'settings') data.settings = { ...data.settings, ...(row.data as SiteData['settings']) };
    else if (row.key === 'revisions') data.revisions = (row.data as SiteData['revisions']) ?? {};
  }
  return { data, source: emptyTable ? 'seed' : 'db' };
}

/** Write the whole SiteData back: upsert every row, drop what disappeared. */
export async function saveSiteData(next: SiteData): Promise<boolean> {
  const supa = db();
  if (!supa) return false;
  // Total-wipe interlock. This function deletes whatever the payload no longer
  // carries, so a payload whose every collection is empty deletes every row in
  // the table — that is exactly how the site lost all 42 of its content rows.
  // Refuse that write while the table still holds something to lose. Editing
  // stays unrestricted: removing some items, or even emptying one collection,
  // is a normal save and goes through.
  const wouldEmptyEverything = COLLECTIONS.every(
    (collection) => ((next[collection] as unknown[] | undefined) ?? []).length === 0,
  );
  if (wouldEmptyEverything) {
    const probe = await supa.from('site_content').select('id').limit(1);
    if (!probe.error && (probe.data ?? []).length > 0) {
      console.warn(
        '[db] Refused a save that would delete every content row: all collections arrived empty. Nothing was written.',
      );
      return false;
    }
    if (probe.error) {
      console.warn(`[db] Could not probe site_content before an all-empty save, continuing: ${probe.error.message}`);
    }
  }
  for (const collection of COLLECTIONS) {
    const items = next[collection] as { id: string }[] | undefined;
    // A collection the payload does not carry at all is one the sender has never
    // heard of — an older dashboard tab, an import file from before it existed.
    // Deleting its rows because of that is how the site once lost 42 of them, so
    // absence is left alone and only an explicit empty list clears a collection.
    if (items === undefined) continue;
    const rows = items.map((item) => ({ collection, id: item.id, data: item, updated_at: new Date().toISOString() }));
    if (rows.length) {
      const up = await supa.from('site_content').upsert(rows, { onConflict: 'collection,id' });
      if (up.error) return false;
      const quoted = items.map((i) => `'${i.id.replace(/'/g, "''")}'`).join(',');
      const del = await supa.from('site_content').delete().eq('collection', collection).not('id', 'in', `(${quoted})`);
      if (del.error) return false;
    } else {
      const del = await supa.from('site_content').delete().eq('collection', collection);
      if (del.error) return false;
    }
  }
  const singletons = [
    { key: 'profile', data: next.profile },
    { key: 'now', data: next.now },
    { key: 'settings', data: next.settings },
    { key: 'revisions', data: next.revisions },
  ].map((row) => ({ ...row, updated_at: new Date().toISOString() }));
  const up = await supa.from('site_singletons').upsert(singletons, { onConflict: 'key' });
  return !up.error;
}

export async function insertEnquiry(entry: Omit<Enquiry, 'at'>): Promise<boolean> {
  const supa = db();
  if (!supa) return false;
  const { error } = await supa.from('enquiries').insert({
    id: entry.id,
    kind: entry.kind,
    name: entry.name,
    email: entry.email,
    answers: entry.answers,
  });
  return !error;
}

export async function listEnquiries(): Promise<Enquiry[] | null> {
  const supa = db();
  if (!supa) return null;
  const { data, error } = await supa
    .from('enquiries')
    .select('id,kind,name,email,answers,created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error || !data) return null;
  return data.map((row) => ({
    id: row.id,
    kind: row.kind,
    name: row.name,
    email: row.email,
    answers: (row.answers ?? {}) as Record<string, string>,
    at: row.created_at,
  }));
}
