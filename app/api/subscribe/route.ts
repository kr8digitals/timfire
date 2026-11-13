import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { addSubscriber, sendTemplated } from '@/lib/email';
import { PUBLIC_EMAIL } from '@/lib/site';

export const dynamic = 'force-dynamic';

const schema = z.object({
  name: z.string().trim().min(1, 'Please tell me your name.').max(80),
  email: z.string().trim().email('Please check the email address.').max(254),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Please check the form and try again.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || 'Please check the form and try again.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  const { name, email } = parsed.data;
  const subscriber = await addSubscriber(name, email);
  if (!subscriber) {
    return NextResponse.json(
      { message: `The list is unavailable right now. Please try again soon, or email ${PUBLIC_EMAIL}.` },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  // The welcome mail is best-effort: joining must never fail because of mail.
  // The first letter is still a letter: it carries the one-click unsubscribe
  // like every other mail on the list.
  await sendTemplated('welcome', subscriber.email, { name: subscriber.name }, { unsubToken: subscriber.unsub_token });
  return NextResponse.json({ ok: true, name: subscriber.name }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
}
