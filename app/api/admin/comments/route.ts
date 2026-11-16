import { NextResponse } from 'next/server';
import { z } from 'zod';
import { session } from '@/lib/auth';
import { deleteComment, listAllComments, setCommentStatus } from '@/lib/engagement';

/**
 * The owner's side of the comment box.
 *
 * Moderation happens after a comment is live — that is the deal the form makes
 * with the reader, and it is the one the owner chose — so this route only ever
 * hides, restores or deletes what is already there. Hiding is preferred over
 * deleting: it keeps a record of what was said and lets a mistaken click be
 * undone, while a delete is what the reader sees vanish.
 *
 * Comments are reader rows, not dashboard rows, so they are deliberately outside
 * `site_content`. Nothing here can be wiped by a content save.
 */

export const dynamic = 'force-dynamic';

const patch = z.object({
  id: z.string().uuid(),
  action: z.enum(['hide', 'restore', 'delete']),
});

function denied() {
  return NextResponse.json({ message: 'Unauthorised' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
}

export async function GET() {
  if (!(await session())) return denied();
  const comments = await listAllComments(400);
  if (!comments) {
    return NextResponse.json(
      { message: 'Comments could not be read right now. Nothing was changed.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  const hidden = comments.filter((c) => c.status === 'hidden').length;
  return NextResponse.json(
    { comments, hidden, live: comments.length - hidden },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST(req: Request) {
  if (!(await session())) return denied();
  const parsed = patch.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: 'That comment could not be found.' }, { status: 400 });
  }
  const { id, action } = parsed.data;
  const outcome =
    action === 'delete'
      ? await deleteComment(id)
      : await setCommentStatus(id, action === 'hide' ? 'hidden' : 'live');
  if (outcome === 'missing') {
    return NextResponse.json(
      { message: 'That comment is no longer there. The list has been refreshed.' },
      { status: 404 },
    );
  }
  if (outcome === 'error') {
    return NextResponse.json(
      { message: 'That comment could not be changed. Please try again.' },
      { status: 503 },
    );
  }
  return NextResponse.json({ id, action, ok: true });
}
