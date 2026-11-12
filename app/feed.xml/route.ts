import { getContent } from '@/lib/cms/store';
import { isLive } from '@/lib/cms/types';
import { SITE_URL } from '@/lib/site';

/** RSS feed for the journal, so readers can subscribe without a platform. */
export const dynamic = 'force-static';
export const revalidate = 3600;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const content = await getContent();
  const posts = content.posts
    .filter(isLive)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, 30);

  const items = posts
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/journal/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/journal/${post.slug}</guid>
      <description>${escapeXml(post.summary)}</description>
      <category>${escapeXml(post.category)}</category>
      ${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join('\n      ')}
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
    </item>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>TIMFIRE — Journal</title>
    <link>${SITE_URL}/journal</link>
    <description>Notes on building websites and AI agents, and on the free training that runs alongside them.</description>
    <language>en-ng</language>
    <copyright>© ${new Date().getFullYear()} Kenneth Timothy Iziogo</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
