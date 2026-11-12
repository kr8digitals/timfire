import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { session } from '@/lib/auth';
import { getContentWithSha, getEnquiries, inboxStatus } from '@/lib/cms/store';
import { saveContent, saveEnquiries, appendEnquiry, uploadImage, allowedImageTypes } from '@/lib/cms/write';
import type { SiteContent, Enquiry } from '@/lib/cms/types';

/**
 * Single admin API surface for the CMS.
 *
 *   GET    /api/cms/content          → current document + version marker
 *   PUT    /api/cms/content          → replace the document (optimistic)
 *   GET    /api/cms/enquiries        → list enquiries
 *   PUT    /api/cms/enquiries        → update statuses / notes
 *   POST   /api/cms/enquiries        → (admin-created record)
 *   POST   /api/cms/upload           → upload an image, returns its path
 *
 * Every method requires a valid admin session.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const noStore = { 'Cache-Control': 'no-store' } as const;

function unauthorised() {
  return NextResponse.json({ message: 'Please sign in again.' }, { status: 401, headers: noStore });
}

const enquirySchema = z.array(
  z.object({
    id: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    service: z.string(),
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    company: z.string(),
    budget: z.string(),
    timeline: z.string(),
    message: z.string(),
    details: z.record(z.string(), z.string()),
    status: z.enum(['new', 'read', 'replied', 'archived']),
    source: z.string(),
    userAgent: z.string(),
  }),
);

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const auth = await session();
  if (!auth) return unauthorised();
  const { path } = await ctx.params;
  const route = path.join('/');

  if (route === 'content') {
    const { data, sha } = await getContentWithSha();
    return NextResponse.json({ data, sha: sha || null }, { headers: noStore });
  }
  if (route === 'enquiries') {
    const list = await getEnquiries();
    const inbox = await inboxStatus();
    return NextResponse.json({ enquiries: list, inbox }, { headers: noStore });
  }
  if (route === 'status') {
    return NextResponse.json({ authenticated: true, expires: auth.expires }, { headers: noStore });
  }
  return NextResponse.json({ message: 'Not found' }, { status: 404, headers: noStore });
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const auth = await session();
  if (!auth) return unauthorised();
  const { path } = await ctx.params;
  const route = path.join('/');
  const actor = (process.env.ADMIN_EMAIL || 'admin').split('@')[0];

  if (route === 'content') {
    let body: { data?: SiteContent; sha?: string | null };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: 'Invalid request body.' }, { status: 400, headers: noStore });
    }
    if (!body.data || typeof body.data !== 'object' || !Array.isArray(body.data.posts)) {
      return NextResponse.json({ message: 'The content document is not valid.' }, { status: 400, headers: noStore });
    }
    const result = await saveContent(body.data, body.sha || undefined, actor);
    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: result.status, headers: noStore });
    }
    const fresh = await getContentWithSha();
    return NextResponse.json({ ok: true, sha: fresh.sha || null, commit: result.commit }, { headers: noStore });
  }

  if (route === 'enquiries') {
    let body: { enquiries?: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: 'Invalid request body.' }, { status: 400, headers: noStore });
    }
    const parsed = enquirySchema.safeParse(body.enquiries);
    if (!parsed.success) {
      return NextResponse.json({ message: 'The enquiry list is not valid.' }, { status: 400, headers: noStore });
    }
    const result = await saveEnquiries(parsed.data as Enquiry[]);
    if (!result.ok) return NextResponse.json({ message: result.message }, { status: result.status, headers: noStore });
    return NextResponse.json({ ok: true }, { headers: noStore });
  }

  return NextResponse.json({ message: 'Not found' }, { status: 404, headers: noStore });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const auth = await session();
  if (!auth) return unauthorised();
  const { path } = await ctx.params;
  const route = path.join('/');
  const actor = (process.env.ADMIN_EMAIL || 'admin').split('@')[0];

  if (route === 'upload') {
    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return NextResponse.json({ message: 'Please choose an image to upload.' }, { status: 400, headers: noStore });
    }
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'Please choose an image to upload.' }, { status: 400, headers: noStore });
    }
    if (!allowedImageTypes().includes(file.type)) {
      return NextResponse.json({ message: 'Only JPG, PNG, WebP, AVIF or GIF images are supported.' }, { status: 400, headers: noStore });
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    const result = await uploadImage(file.name || 'image.jpg', bytes, file.type, actor);
    if (!result.ok) return NextResponse.json({ message: result.message }, { status: result.status, headers: noStore });
    return NextResponse.json({ ok: true, path: result.path }, { headers: noStore });
  }

  if (route === 'enquiries') {
    let body: { enquiry?: Enquiry };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: 'Invalid request body.' }, { status: 400, headers: noStore });
    }
    if (!body.enquiry || typeof body.enquiry !== 'object') {
      return NextResponse.json({ message: 'Missing enquiry.' }, { status: 400, headers: noStore });
    }
    const result = await appendEnquiry(body.enquiry);
    if (!result.ok) return NextResponse.json({ message: result.message }, { status: result.status, headers: noStore });
    return NextResponse.json({ ok: true }, { headers: noStore });
  }

  return NextResponse.json({ message: 'Not found' }, { status: 404, headers: noStore });
}
