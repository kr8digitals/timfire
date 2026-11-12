import { NextResponse } from 'next/server';
import { session } from '@/lib/auth';
import { OWNER_EMAIL, sendTemplated } from '@/lib/email';
import { SITE_ORIGIN } from '@/lib/site';

export const dynamic = 'force-dynamic';

/** One click in the dashboard: proves the branded pipeline end to end. */
export async function POST() {
  const authed = await session();
  if (!authed) return NextResponse.json({ message: 'Unauthorised' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  const ok = await sendTemplated('broadcast_newsletter', OWNER_EMAIL, {
    name: 'Timfire',
    body: 'This is the test letter. If you can read it inside the branded shell, every pipeline — template, renderer, Resend, log — is working.',
    link: SITE_ORIGIN,
    offer_title: 'the test',
  });
  return NextResponse.json(
    ok
      ? { ok: true, message: `On its way to ${OWNER_EMAIL}. Check the inbox (and spam, the first time).` }
      : { ok: false, message: 'The send failed. The email log in the database holds the reason.' },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
