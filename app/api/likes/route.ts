import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isPublished } from '@/lib/content';
import { loadSiteData } from '@/lib/db';
import { setLike } from '@/lib/engagement';
import { MAX_TOKEN, postKey, validPostKey } from '@/lib/posts';

const noStore = { 'Cache-Control': 'no-store' };

/**
 * One like, added or withdrawn.
 *
 * Anyone may like — a guest and a member alike — and the count stays honest the
 * unglamorous way: the reader's browser holds a token, the pair (post, token) is
 * unique in the database, so a person is one like and clicking twice is a like
 * and then not a like. When accounts arrive the token becomes the member id and
 * the name beside it becomes their handle; nothing about the counting changes.
 */

const schema = z.object({
  post: z.string(),
  token: z
    .string()
    .trim()
    .min(8, 'This browser has no reader id yet.')
    .max(MAX_TOKEN, 'That reader id is too long.')
    .regex(/^[A-Za-z0-9_-]+$/, 'That reader id is not one this site issues.'),
  /** A member likes with their handle showing. A guest likes anonymously. */
  name: z.string().trim().max(60).optional().default(''),
  liked: z.boolean(),
});

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 30;
type Bucket = { count: number; reset: number };
const buckets: Map<string, Bucket> =
  (globalThis as typeof globalThis & { __tfLikes?: Map<string, Bucket> }).__tfLikes || new Map();
(globalThis as typeof globalThis & { __tfLikes?: Map<string, Bucket> }).__tfLikes = buckets;

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

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Please try again.' }, { status: 400, headers: noStore });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message || 'Please try again.';
    return NextResponse.json({ message: first }, { status: 400, headers: noStore });
  }
  const post = validPostKey(parsed.data.post);
  if (!post) return NextResponse.json({ message: 'That is not a piece on this site.' }, { status: 400, headers: noStore });

  const ip = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  if (rateLimited(ip)) {
    return NextResponse.json({ message: 'Too many likes too quickly. Give it a few minutes.' }, { status: 429, headers: noStore });
  }

  const { data } = await loadSiteData();
  const published =
    [...data.journal].some((x) => isPublished(x) && postKey('journal', x.slug) === post) ||
    [...data.creative].some((x) => isPublished(x) && postKey('creative', x.slug) === post);
  if (!published) {
    return NextResponse.json({ message: 'That piece is not published.' }, { status: 404, headers: noStore });
  }

  const likes = await setLike(post, parsed.data.token, parsed.data.name, parsed.data.liked);
  if (likes === null) {
    return NextResponse.json({ message: 'That did not register. Please try again in a moment.' }, { status: 503, headers: noStore });
  }
  return NextResponse.json({ ok: true, likes, liked: parsed.data.liked }, { headers: noStore });
}
