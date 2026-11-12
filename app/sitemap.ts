import type { MetadataRoute } from 'next';
import { getContent } from '@/lib/cms/store';
import { isLive } from '@/lib/cms/types';
import { resolveServices } from '@/lib/services';

import { SITE_URL as BASE } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getContent();
  const now = new Date();

  const staticRoutes: { path: string; priority: number; change: 'weekly' | 'monthly' | 'yearly' }[] = [
    { path: '', priority: 1, change: 'weekly' },
    { path: 'work', priority: 0.9, change: 'monthly' },
    { path: 'services', priority: 0.95, change: 'monthly' },
    { path: 'gallery', priority: 0.8, change: 'monthly' },
    { path: 'about', priority: 0.85, change: 'monthly' },
    { path: 'journal', priority: 0.9, change: 'weekly' },
    { path: 'creative', priority: 0.7, change: 'monthly' },
    { path: 'ventures', priority: 0.8, change: 'monthly' },
    { path: 'contact', priority: 0.85, change: 'yearly' },
    { path: 'timeline', priority: 0.6, change: 'yearly' },
    { path: 'now', priority: 0.6, change: 'monthly' },
  ];

  const projects = content.projects
    .filter((p) => p.isPublic)
    .map((p) => ({ url: `${BASE}/work/${p.slug}`, lastModified: new Date(p.updatedAt || now), changeFrequency: 'monthly' as const, priority: 0.7 }));

  const posts = content.posts
    .filter(isLive)
    .map((p) => ({ url: `${BASE}/journal/${p.slug}`, lastModified: new Date(p.updatedAt || p.publishedAt || now), changeFrequency: 'monthly' as const, priority: 0.75 }));

  const pieces = content.creative
    .filter(isLive)
    .map((p) => ({ url: `${BASE}/creative/${p.slug}`, lastModified: new Date(p.updatedAt || p.publishedAt || now), changeFrequency: 'yearly' as const, priority: 0.5 }));

  const services = resolveServices(content.serviceOverrides)
    .filter((s) => s.enabled)
    .map((s) => ({ url: `${BASE}/services/${s.key}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.85 }));

  return [
    ...staticRoutes.map((route) => ({
      url: `${BASE}/${route.path}`,
      lastModified: now,
      changeFrequency: route.change,
      priority: route.priority,
    })),
    ...services,
    ...projects,
    ...posts,
    ...pieces,
  ];
}
