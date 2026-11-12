import { NextResponse } from 'next/server';
import { session } from '@/lib/auth';
import { allSubscribers } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authed = await session();
  if (!authed) return NextResponse.json({ message: 'Unauthorised' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  const people = await allSubscribers();
  return NextResponse.json(
    {
      subscribers: people.map((p) => ({ name: p.name, email: p.email, status: p.status, created_at: p.created_at })),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
