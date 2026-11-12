import type { MetadataRoute } from 'next';
import { publicView } from '@/lib/content';
import { loadSiteData } from '@/lib/db';
import { SERVICE_PAGES } from '@/lib/services-content';
import { SITE_ORIGIN } from '@/lib/site';

const COLLABORATIONS = ['music', 'spoken-word', 'poetry', 'speaking'];

/** Always generated from the live database, never baked at build time, so a
 *  post published from the admin appears here without a redeploy. */
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const { data } = await loadSiteData();
  const published = publicView(data);
  const routes = ['', 'about', 'work', 'ventures', 'services', 'creative', 'journal', 'gallery', 'timeline', 'now', 'contact'];
  const entries: MetadataRoute.Sitemap = routes.map((path) => ({
    url: `${SITE_ORIGIN}/${path}`,
    lastModified,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path ? 0.7 : 1,
  }));
  for (const p of SERVICE_PAGES) {
    entries.push({ url: `${SITE_ORIGIN}/services/${p.slug}`, lastModified, changeFrequency: 'monthly', priority: 0.8 });
  }
  for (const c of COLLABORATIONS) {
    entries.push({ url: `${SITE_ORIGIN}/collaborate/${c}`, lastModified, changeFrequency: 'monthly', priority: 0.6 });
  }
  for (const post of published.journal) {
    entries.push({ url: `${SITE_ORIGIN}/journal/${post.slug}`, lastModified, changeFrequency: 'monthly', priority: 0.6 });
  }
  for (const piece of published.creative) {
    entries.push({ url: `${SITE_ORIGIN}/creative/${piece.slug}`, lastModified, changeFrequency: 'monthly', priority: 0.5 });
  }
  return entries;
}
