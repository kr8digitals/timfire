import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { enquiryInbox } from '@/lib/enquiry';
import { insertEnquiry } from '@/lib/db';
import { FORMS, FORM_KINDS } from '@/lib/forms';

/**
 * One validated endpoint, many purpose-built forms.
 * The `kind` selects the form definition; `answers` carries exactly the fields
 * that form asks for, so an enquiry arrives already structured.
 */
const schema = z.object({
  kind: z.string().refine((k) => FORM_KINDS.includes(k), 'Unknown enquiry type.'),
  name: z.string().trim().min(1, 'Please enter your name.').max(120),
  email: z.string().trim().email('Please enter a valid email address.').max(254),
  answers: z.record(z.string().max(2000)).default({}),
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
  (globalThis as typeof globalThis & { __tfContact?: Map<string, Bucket> }).__tfContact || new Map();
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
    return NextResponse.json({ message: 'Please check the form and try again.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message || 'Please check the form and try again.';
    return NextResponse.json({ message: first }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }
  const { kind, name, email, answers, website } = parsed.data;

  // Honeypot filled -> pretend success so bots learn nothing.
  if (website) return NextResponse.json({ ok: true }, { status: 200, headers: { 'Cache-Control': 'no-store' } });

  // Required fields of the chosen form must actually be present.
  const def = FORMS[kind];
  const missing = def.fields.filter((f) => f.required && !(answers[f.name] || '').trim());
  if (missing.length) {
    return NextResponse.json(
      { message: `Please complete: ${missing.map((m) => m.label).join(', ')}.` },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const key = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  if (rateLimited(key)) {
    return NextResponse.json(
      { message: 'Too many messages. Please try again in a few minutes, or use email / WhatsApp.' },
      { status: 429, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  // The database is the system of record; the session inbox remains as a
  // safety net so a submission is never lost if Supabase is unreachable.
  const id = crypto.randomUUID();
  const stored = await insertEnquiry({ id, kind, name, email, answers });
  if (!stored) {
    inbox.unshift({ id, kind, name, email, answers, at: new Date().toISOString() });
    if (inbox.length > 200) inbox.length = 200;
  }
  return NextResponse.json({ ok: true }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
}
