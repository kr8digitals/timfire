import { NextResponse } from 'next/server';
import { session } from '@/lib/auth';
import { publicView } from '@/lib/content';
import { loadSiteData } from '@/lib/db';

export const dynamic = 'force-dynamic';

/** The whole site content in one place: the public view for visitors, the
 *  complete dataset (drafts included) for a signed-in admin session. */
export async function GET() {
  const { data } = await loadSiteData();
  const authed = await session();
  const out = authed ? data : publicView(data);
  return NextResponse.json(out, { headers: { 'Cache-Control': 'no-store' } });
}
