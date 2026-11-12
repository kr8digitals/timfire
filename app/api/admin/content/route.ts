import { NextResponse } from 'next/server';
import { session } from '@/lib/auth';
import { isPublished, type SiteData } from '@/lib/content';
import { loadSiteData, saveSiteData } from '@/lib/db';
import { activeSubscribers, sendTemplated } from '@/lib/email';
import { SITE_ORIGIN } from '@/lib/site';
import { validate } from '@/lib/validate';

type Publishable = {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: 'draft' | 'scheduled' | 'published';
  visibility: 'public' | 'private';
  publishAt: string;
  summary?: string;
  body?: string;
};

/** Anything flipped to public/published since the last save announces itself to
 *  every subscriber, addressed by name. Best-effort: publishing never fails
 *  because a mail provider hiccuped. */
async function announceFreshlyPublished(prev: SiteData, next: SiteData) {
  const before = new Map<string, Publishable>();
  for (const item of [...prev.journal, ...prev.creative] as unknown as Publishable[]) before.set(item.id, item);
  const fresh = ([...next.journal, ...next.creative] as unknown as Publishable[]).filter((item) => {
    const old = before.get(item.id);
    return isPublished(item) && (!old || !isPublished(old));
  });
  if (!fresh.length) return;
  const people = await activeSubscribers();
  if (!people.length) return;
  const jobs: Promise<unknown>[] = [];
  for (const item of fresh) {
    const isArticle = typeof item.summary === 'string';
    const link = SITE_ORIGIN + (isArticle ? '/journal/' : '/creative/') + item.slug;
    const summaryLine = (item.summary || item.body || '').slice(0, 180);
    for (const person of people) {
      jobs.push(
        sendTemplated(
          'publish_notice',
          person.email,
          { name: person.name, title: item.title, category: String(item.category).toLowerCase(), summary_line: summaryLine, link },
          { unsubToken: person.unsub_token, meta: { item: item.id } },
        ),
      );
    }
  }
  await Promise.allSettled(jobs);
}

export const dynamic = 'force-dynamic';

export async function GET() {
  const authed = await session();
  if (!authed) return NextResponse.json({ message: 'Unauthorised' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  const { data } = await loadSiteData();
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: Request) {
  const authed = await session();
  if (!authed) return NextResponse.json({ message: 'Unauthorised' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Malformed payload.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }
  let next;
  try {
    next = validate(body);
  } catch {
    return NextResponse.json({ message: 'Content failed validation.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }
  const { data: prev } = await loadSiteData();
  const saved = await saveSiteData(next);
  if (!saved) {
    return NextResponse.json(
      { message: 'The database is not configured or refused the write. Nothing was saved.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  await announceFreshlyPublished(prev, next);
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}
