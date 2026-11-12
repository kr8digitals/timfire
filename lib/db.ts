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
  'timeline',
  'testimonials',
  'socials',
  'media',
] as const;
type Collection = (typeof COLLECTIONS)[number];

function seedOrder(collection: Collection): Map<string, number> {
  const map = new Map<string, number>();
  (seed[collection] as { id: string }[]).forEach((item, i) => map.set(item.id, i));
  return map;
}

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
  for (const collection of COLLECTIONS) {
    (data[collection] as unknown[]) = [];
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
    (data[collection] as unknown[]) = rows.map((r) => r.data);
  }
  for (const row of singletons.data ?? []) {
    if (row.key === 'profile') data.profile = row.data as SiteData['profile'];
    else if (row.key === 'now') data.now = row.data as SiteData['now'];
    else if (row.key === 'settings') data.settings = { ...data.settings, ...(row.data as SiteData['settings']) };
    else if (row.key === 'revisions') data.revisions = (row.data as SiteData['revisions']) ?? {};
  }
  return { data, source: 'db' };
}

/** Write the whole SiteData back: upsert every row, drop what disappeared. */
export async function saveSiteData(next: SiteData): Promise<boolean> {
  const supa = db();
  if (!supa) return false;
  for (const collection of COLLECTIONS) {
    const items = next[collection] as { id: string }[];
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
