import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { appendEnquiry } from '@/lib/cms/write';
import { inboxReady } from '@/lib/cms/inbox';
import { serviceByKey } from '@/lib/services';
import type { Enquiry } from '@/lib/cms/types';

/**
 * Enquiry intake.
 *
 * Every landing page posts here with a different `service` key and its own set
 * of extra `details` fields, so the owner receives a structured record instead
 * of an untriaged paragraph.
 */

const schema = z.object({
  service: z.string().trim().min(1).max(60),
  name: z.string().trim().min(1, 'Please enter your name.').max(120),
  email: z.string().trim().email('Please enter a valid email address.').max(254),
  phone: z.string().trim().max(60).optional().default(''),
  company: z.string().trim().max(160).optional().default(''),
  budget: z.string().trim().max(120).optional().default(''),
  timeline: z.string().trim().max(120).optional().default(''),
  message: z.string().trim().min(20, 'Please add a little more detail — at least a sentence.').max(6000),
  details: z.record(z.string().max(80), z.string().max(600)).optional().default({}),
  /** honeypot */
  website: z.string().max(400).optional().default(''),
  source: z.string().trim().max(200).optional().default(''),
});

const WINDOW_MS = 15 * 60 * 1000;
const MAX = 6;
type Bucket = { count: number; reset: number };
const buckets: Map<string, Bucket> =
  (globalThis as typeof globalThis & { __tfEnquiry?: Map<string, Bucket> }).__tfEnquiry ?? new Map();
(globalThis as typeof globalThis & { __tfEnquiry?: Map<string, Bucket> }).__tfEnquiry = buckets;

function rateLimited(key: string): boolean {
  const time = Date.now();
  const prev = buckets.get(key);
  if (!prev || prev.reset <= time) {
    buckets.set(key, { count: 1, reset: time + WINDOW_MS });
    return false;
  }
  prev.count += 1;
  return prev.count > MAX;
}

const noStore = { 'Cache-Control': 'no-store' } as const;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Please check the form and try again.' }, { status: 400, headers: noStore });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || 'Please check the form and try again.' },
      { status: 400, headers: noStore },
    );
  }
  const data = parsed.data;

  // Honeypot: accept silently so bots get no signal.
  if (data.website) return NextResponse.json({ ok: true }, { status: 200, headers: noStore });

  const ip = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  if (rateLimited(ip)) {
    return NextResponse.json(
      { message: 'That is a lot of messages in a short time. Please try again shortly, or email hi@kutimfire.com.' },
      { status: 429, headers: noStore },
    );
  }

  if (!inboxReady()) {
    // No key or no storage: do not pretend the message was received.
    return NextResponse.json(
      {
        message:
          'The inbox is not configured on this deployment. Please send it to hi@kutimfire.com or on WhatsApp — both reach me directly.',
        fallbackEmail: 'hi@kutimfire.com',
        fallbackWhatsApp: 'https://wa.me/2348166552758',
      },
      { status: 503, headers: noStore },
    );
  }

  // A valid service key is required so the record can be routed correctly.
  const key = serviceByKey(data.service) ? data.service : 'contact';
  const serviceName = serviceByKey(data.service)?.name ?? 'General enquiry';

  const enquiry: Enquiry = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    service: key,
    name: data.name,
    email: data.email,
    phone: data.phone,
    company: data.company,
    budget: data.budget,
    timeline: data.timeline,
    message: data.message,
    details: data.details,
    status: 'new',
    source: serviceName,
    userAgent: (req.headers.get('user-agent') || '').slice(0, 300),
  };

  const result = await appendEnquiry(enquiry);

  if (!result.ok) {
    // Never lose an enquiry silently: tell the visitor the guaranteed routes.
    return NextResponse.json(
      {
        message:
          'I could not store that message just now. Please send it to hi@kutimfire.com or on WhatsApp — both reach me directly.',
        fallbackEmail: 'hi@kutimfire.com',
        fallbackWhatsApp: 'https://wa.me/2348166552758',
      },
      { status: 503, headers: noStore },
    );
  }

  return NextResponse.json({ ok: true, id: enquiry.id }, { status: 200, headers: noStore });
}
