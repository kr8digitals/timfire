import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { session } from '@/lib/auth';
import { activeSubscribers, fill, sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const schema = z.object({
  sender: z.enum(['hello', 'enquiries']).default('hello'),
  audience: z.enum(['all', 'recent']).default('all'),
  subject: z.string().trim().min(3).max(140),
  body: z.string().trim().min(3).max(6000),
  link: z.string().trim().max(500).optional().default(''),
  offer_title: z.string().trim().max(140).optional().default(''),
  purpose: z.string().trim().max(40).default('broadcast'),
});

export async function POST(req: NextRequest) {
  const authed = await session();
  if (!authed) return NextResponse.json({ message: 'Unauthorised' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: 'Please check the composition.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }
  const { sender, audience, subject, body, link, offer_title, purpose } = parsed.data;
  const people = await activeSubscribers(audience === 'recent' ? 30 : undefined);
  if (!people.length) {
    return NextResponse.json({ message: 'Nobody is on the list yet for this audience.', sent: 0, failed: 0 }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  }
  let sent = 0;
  let failed = 0;
  // Small parallel chunks: fast enough to feel instant, gentle on the API.
  for (let i = 0; i < people.length; i += 5) {
    const results = await Promise.all(
      people.slice(i, i + 5).map((person) =>
        sendEmail({
          purpose,
          sender,
          to: person.email,
          subject: fill(subject, { name: person.name, link, offer_title, body }),
          text: fill(body, { name: person.name, link, offer_title, body }),
          preview: 'An update for you',
          unsubToken: person.unsub_token,
          meta: { audience, broadcast: true },
        }),
      ),
    );
    for (const ok of results) (ok ? (sent += 1) : (failed += 1));
  }
  return NextResponse.json({ ok: true, sent, failed }, { headers: { 'Cache-Control': 'no-store' } });
}
