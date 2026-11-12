import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { enquiryInbox } from '@/lib/enquiry';

const schema = z.object({
  name: z.string().trim().min(1, 'Please enter your name.').max(120),
  email: z.string().trim().email('Please enter a valid email address.').max(254),
  topic: z.string().trim().min(1).max(120),
  message: z.string().trim().min(10, 'Please add a little more detail.').max(5000),
  website: z.string().max(500).optional().default(''),
});

// Session inbox: kept in server memory only. It survives normal uptime but is
// cleared on redeploy. A transactional email provider is still required for
// guaranteed delivery — see docs/KNOWN-LIMITATIONS.md.
const inbox = enquiryInbox();

// Simple in-memory rate limit: 5 submissions per IP per 15 minutes.
const WINDOW_MS = 15 * 60 * 1000;
const MAX = 5;
type Bucket = { count: number; reset: number };
const buckets: Map<string, Bucket> =
  (globalThis as typeof globalThis & { __tfContact?: Map<string, Bucket> }).__tfContact ||
  new Map();
(globalThis as typeof globalThis & { __tfContact?: Map<string, Bucket> }).__tfContact = buckets;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const prev = buckets.get(key);
  if (!prev || prev.reset <= now) {
    buckets.set(key, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  prev.count += 1;
  return prev.count > MAX;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { message: 'Please enter a valid email and message.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message || 'Please check the form and try again.';
    return NextResponse.json({ message: first }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }
  // Honeypot filled -> pretend success so bots learn nothing.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  }
  const key = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  if (rateLimited(key)) {
    return NextResponse.json(
      { message: 'Too many messages. Please try again in a few minutes, or use email / WhatsApp.' },
      { status: 429, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  // No email provider is configured in this build, so the enquiry is stored in
  // the session inbox and acknowledged. Email / WhatsApp remain the guaranteed routes.
  inbox.unshift({
    id: crypto.randomUUID(),
    name: parsed.data.name,
    email: parsed.data.email,
    topic: parsed.data.topic,
    message: parsed.data.message,
    at: new Date().toISOString(),
  });
  if (inbox.length > 200) inbox.length = 200;
  return NextResponse.json({ ok: true }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
}
