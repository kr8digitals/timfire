import { NextRequest, NextResponse } from 'next/server';
import { changePassword, reissue, session } from '@/lib/auth';

const noStore = { 'Cache-Control': 'no-store' };

/**
 * The owner changes his own password from the dashboard. Signed in only: the
 * current password must be typed, the new one is hashed into the database, and
 * a cookie signed with the new hash comes straight back so the change does not
 * lock him out of the room he is standing in.
 */
export async function POST(req: NextRequest) {
  const auth = await session();
  if (!auth) return NextResponse.json({ message: 'Sign in first.' }, { status: 401, headers: noStore });

  let body: { current?: unknown; next?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Please check the form and try again.' }, { status: 400, headers: noStore });
  }
  const current = typeof body.current === 'string' ? body.current : '';
  const next = typeof body.next === 'string' ? body.next : '';

  const result = await changePassword(current, next);
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: result.code, headers: noStore });

  await reissue();
  return NextResponse.json(
    { ok: true, message: 'Password changed. This browser stays signed in; the new password works from your next sign-in.' },
    { status: 200, headers: noStore },
  );
}
