import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isPublished } from '@/lib/content';
import { loadSiteData } from '@/lib/db';
import { addComment, countsFor, hasLiked, listComments } from '@/lib/engagement';
import { MAX_COMMENT, MAX_NAME, postKey, validPostKey } from '@/lib/posts';

const noStore = { 'Cache-Control': 'no-store' };

/**
 * Comments on a piece: read them, or leave one.
 *
 * Moderation is after the fact, as the owner chose — a comment is live the
 * moment it is written, and he hides or deletes it from the dashboard. What
 * stands in front of the table instead is the ordinary defences: a honeypot no
 * reader can see, a per-address rate limit, a length cap, and a check that the
 * piece being commented on is actually published, so nothing can attach a
 * comment to a key that points at nothing.
 */

const schema = z.object({
  post: z.string(),
  name: z.string().trim().min(1, 'Please put a name to it — a handle is a name.').max(MAX_NAME, 'That name is too long.'),
  email: z.string().trim().max(254).optional().default(''),
  body: z
    .string()
    .trim()
    .min(2, 'Say something a person can answer.')
    .max(MAX_COMMENT, `Please keep it under ${MAX_COMMENT} characters.`),
  website: z.string().max(500).optional().default(''),
});

// Comment spam arrives in bursts, so the window is short and the allowance small.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 3;
type Bucket = { count: number; reset: number };
const buckets: Map<string, Bucket> =
  (globalThis as typeof globalThis & { __tfComments?: Map<string, Bucket> }).__tfComments || new Map();
(globalThis as typeof globalThis & { __tfComments?: Map<string, Bucket> }).__tfComments = buckets;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const prev = buckets.get(key);
  if (!prev || prev.reset <= now) {
    buckets.set(key, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  prev.count += 1;
  return prev.count > MAX_PER_WINDOW;
}

/** Every piece a reader can actually open right now, as post keys. */
async function publishedKeys(): Promise<Set<string>> {
  const { data } = await loadSiteData();
  const keys = new Set<string>();
  for (const item of data.journal) if (isPublished(item)) keys.add(postKey('journal', item.slug));
  for (const item of data.creative) if (isPublished(item)) keys.add(postKey('creative', item.slug));
  return keys;
}

export async function GET(req: NextRequest) {
  const post = validPostKey(req.nextUrl.searchParams.get('post'));
  if (!post) return NextResponse.json({ message: 'That is not a piece on this site.' }, { status: 400, headers: noStore });
  const token = (req.nextUrl.searchParams.get('token') || '').slice(0, 64);
  const [comments, counts, liked] = await Promise.all([listComments(post), countsFor([post]), hasLiked(post, token)]);
  if (!comments || !counts) {
    return NextResponse.json({ message: 'Comments are unavailable right now. The piece is still here to read.' }, { status: 503, headers: noStore });
  }
  return NextResponse.json({ comments, counts: counts[post], liked }, { headers: noStore });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Please check the form and try again.' }, { status: 400, headers: noStore });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message || 'Please check the form and try again.';
    return NextResponse.json({ message: first }, { status: 400, headers: noStore });
  }
  const { name, email, website } = parsed.data;
  const post = validPostKey(parsed.data.post);

  // Honeypot filled: pretend it worked, so a bot learns nothing from the response.
  if (website || !post) return NextResponse.json({ ok: true }, { status: 200, headers: noStore });

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ message: 'That email address does not look right. It is optional — leave it out if you prefer.' }, { status: 400, headers: noStore });
  }

  const key = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  if (rateLimited(key)) {
    return NextResponse.json({ message: 'That is a lot of comments in a short while. Give it a few minutes and try again.' }, { status: 429, headers: noStore });
  }

  const known = await publishedKeys();
  if (!known.has(post)) {
    return NextResponse.json({ message: 'That piece is not published, so it is not open for comment.' }, { status: 404, headers: noStore });
  }

  const comment = await addComment({ post, name, email, body: parsed.data.body });
  if (!comment) {
    return NextResponse.json({ message: 'Your comment could not be saved. Please try again in a moment.' }, { status: 503, headers: noStore });
  }
  const counts = await countsFor([post]);
  return NextResponse.json({ ok: true, comment, counts: counts?.[post] ?? null }, { status: 201, headers: noStore });
}
