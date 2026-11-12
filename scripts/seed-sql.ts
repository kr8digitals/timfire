// Emits INSERT ... ON CONFLICT DO NOTHING statements seeding Supabase from the
// committed seed content. Run: npx tsx scripts/seed-sql.ts > supabase/seed.sql
import { seed } from '../lib/content';

const q = (v: unknown) => `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;

const lines: string[] = [];
const collections = ['stats', 'services', 'websites', 'agents', 'certificates', 'creative', 'journal', 'timeline', 'testimonials', 'socials', 'media'] as const;
for (const collection of collections) {
  for (const item of seed[collection] as { id: string }[]) {
    lines.push(
      `insert into public.site_content (collection, id, data) values ('${collection}', '${item.id}', ${q(item)}) on conflict (collection, id) do nothing;`
    );
  }
}
for (const key of ['profile', 'now', 'settings', 'revisions'] as const) {
  lines.push(
    `insert into public.site_singletons (key, data) values ('${key}', ${q(seed[key])}) on conflict (key) do nothing;`
  );
}
console.log(lines.join('\n'));
