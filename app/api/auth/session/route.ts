import { NextResponse } from 'next/server';
import { session } from '@/lib/auth';
import { writeBackend, needsSetup } from '@/lib/cms/store';

/**
 * Reports whether the caller has a session, and whether this deployment can
 * actually store an edit. The admin shows a banner when it cannot, so the owner
 * finds out before writing a long page rather than when the save fails.
 */
export async function GET() {
  const s = await session();
  return NextResponse.json(
    {
      authenticated: !!s,
      expires: s?.expires || 0,
      setup: { ready: !needsSetup(), backend: writeBackend() },
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
