import { NextRequest, NextResponse } from 'next/server';
import { isPublished } from '@/lib/content';
import { loadSiteData } from '@/lib/db';
import { countsFor } from '@/lib/engagement';
import { postKey } from '@/lib/posts';

const noStore = { 'Cache-Control': 'no-store' };

/**
 * Like and comment totals for a shelf of pieces in one request.
 *
 * The cards on /me each carry a count, and fifteen cards must not become fifteen
 * queries — so the page asks once, with no key at all meaning "everything a
 * reader can open". Counts are totalled in the database; a number assembled from
 * a page of rows would quietly stop being true the day a post gets popular.
 */
export async function GET(req: NextRequest) {
  const { data } = await loadSiteData();
  const published = [
    ...data.journal.filter(isPublished).map((x) => postKey('journal', x.slug)),
    ...data.creative.filter(isPublished).map((x) => postKey('creative', x.slug)),
  ];

  const asked = (req.nextUrl.searchParams.get('posts') || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
  // Only keys that are genuinely public can be counted, so the endpoint cannot
  // be used to probe whether an unpublished slug exists.
  const posts = (asked.length ? asked.filter((key) => published.includes(key)) : published).slice(0, 100);

  const counts = await countsFor(posts);
  if (!counts) {
    return NextResponse.json({ message: 'Counts are unavailable right now.' }, { status: 503, headers: noStore });
  }
  return NextResponse.json({ counts }, { headers: noStore });
}
