import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { session } from '@/lib/auth';
import { db } from '@/lib/db';
import type { TemplateSlug } from '@/lib/email';

export const dynamic = 'force-dynamic';

const SLUGS: TemplateSlug[] = ['admin_code', 'welcome', 'ack', 'owner_forward', 'publish_notice', 'broadcast_newsletter', 'broadcast_new_work', 'broadcast_offer'];

const saveSchema = z.object({
  slug: z.string().refine((s): s is TemplateSlug => (SLUGS as string[]).includes(s), 'Unknown template.'),
  subject: z.string().trim().min(3).max(140),
  body: z.string().trim().min(3).max(8000),
});

export async function GET() {
  const authed = await session();
  if (!authed) return NextResponse.json({ message: 'Unauthorised' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  const supa = db();
  if (!supa) return NextResponse.json({ message: 'Database unavailable.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  const { data, error } = await supa.from('email_templates').select('slug,purpose,sender,subject,body,updated_at').order('slug');
  if (error) return NextResponse.json({ message: 'Could not read templates.' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  return NextResponse.json({ templates: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  const authed = await session();
  if (!authed) return NextResponse.json({ message: 'Unauthorised' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  const parsed = saveSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || 'Please check the template.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }
  const supa = db();
  if (!supa) return NextResponse.json({ message: 'Database unavailable.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  const { slug, subject, body } = parsed.data;
  const { error } = await supa.from('email_templates').update({ subject, body, updated_at: new Date().toISOString() }).eq('slug', slug);
  if (error) return NextResponse.json({ message: 'Could not save the template.' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}
