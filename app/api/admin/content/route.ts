import { NextResponse } from 'next/server';
import { session } from '@/lib/auth';
import { loadSiteData, saveSiteData } from '@/lib/db';
import { validate } from '@/lib/validate';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authed = await session();
  if (!authed) return NextResponse.json({ message: 'Unauthorised' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  const { data } = await loadSiteData();
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: Request) {
  const authed = await session();
  if (!authed) return NextResponse.json({ message: 'Unauthorised' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Malformed payload.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }
  let next;
  try {
    next = validate(body);
  } catch {
    return NextResponse.json({ message: 'Content failed validation.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }
  const saved = await saveSiteData(next);
  if (!saved) {
    return NextResponse.json(
      { message: 'The database is not configured or refused the write. Nothing was saved.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}
