import { db } from './db';
import type { Comment, CommentStatus, Counts } from './posts';
import { validPostKey } from './posts';

export type { Comment, CommentStatus, Counts };
export { postKey, validPostKey, MAX_COMMENT, MAX_NAME, MAX_TOKEN } from './posts';

/**
 * What readers leave on a piece: likes and comments.
 *
 * Two rules shape this file. First, these rows belong to readers, not to the
 * owner, so they live in their own tables and a dashboard save — which rewrites
 * `site_content` — can never touch them. Second, a count has to stay true: totals
 * are counted in the database (`engagement_counts`), never assembled from a page
 * of rows that a row limit could silently truncate, and a like is one row per
 * reader per post, so a number can only move when a person moved it.
 *
 * Moderation is after the fact, as the owner chose: a comment is live the moment
 * it is written, and he hides or deletes it afterwards.
 */

function rowToComment(row: Record<string, unknown>): Comment {
  return {
    id: String(row.id ?? ''),
    post: String(row.post ?? ''),
    name: String(row.name ?? ''),
    email: String(row.email ?? ''),
    body: String(row.body ?? ''),
    status: row.status === 'hidden' ? 'hidden' : 'live',
    at: String(row.created_at ?? ''),
  };
}

/** Totals for many pieces at once — what the cards on /me need. */
export async function countsFor(posts: string[]): Promise<Record<string, Counts> | null> {
  const supa = db();
  const keys = [...new Set(posts.map((p) => validPostKey(p)).filter(Boolean))].slice(0, 100);
  const out: Record<string, Counts> = {};
  for (const key of keys) out[key] = { likes: 0, comments: 0 };
  if (!supa || !keys.length) return supa ? out : null;
  const { data, error } = await supa.rpc('engagement_counts', { post_keys: keys });
  if (error) {
    console.error(`[engagement] counts failed: ${error.message}`);
    return null;
  }
  for (const row of (data ?? []) as { post: string; likes: number; comments: number }[]) {
    out[row.post] = { likes: Number(row.likes) || 0, comments: Number(row.comments) || 0 };
  }
  return out;
}

/** What one reader wrote, oldest first, because a thread reads in the order it happened. */
export async function listComments(post: string): Promise<Comment[] | null> {
  const supa = db();
  if (!supa) return null;
  const { data, error } = await supa
    .from('post_comments')
    .select('id,post,name,email,body,status,created_at')
    .eq('post', post)
    .eq('status', 'live')
    .order('created_at', { ascending: true })
    .limit(300);
  if (error) {
    console.error(`[engagement] comment list failed: ${error.message}`);
    return null;
  }
  // The email is never displayed; it exists so the owner can reach the writer.
  return ((data ?? []) as Record<string, unknown>[]).map((row) => ({ ...rowToComment(row), email: '' }));
}

/** Everything, newest first, for the dashboard — hidden comments included. */
export async function listAllComments(limit = 200): Promise<Comment[] | null> {
  const supa = db();
  if (!supa) return null;
  const { data, error } = await supa
    .from('post_comments')
    .select('id,post,name,email,body,status,created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error(`[engagement] admin comment list failed: ${error.message}`);
    return null;
  }
  return ((data ?? []) as Record<string, unknown>[]).map(rowToComment);
}

export async function addComment(entry: {
  post: string;
  name: string;
  email: string;
  body: string;
}): Promise<Comment | null> {
  const supa = db();
  if (!supa) return null;
  const { data, error } = await supa
    .from('post_comments')
    .insert({
      post: entry.post,
      name: entry.name,
      email: entry.email,
      body: entry.body,
      status: 'live',
    })
    .select('id,post,name,email,body,status,created_at')
    .maybeSingle();
  if (error || !data) {
    console.error(`[engagement] comment insert failed: ${error?.message ?? 'no row returned'}`);
    return null;
  }
  return { ...rowToComment(data as Record<string, unknown>), email: '' };
}

/**
 * What a moderation request actually did.
 *
 * PostgREST answers 200 to an UPDATE or DELETE that matched no rows, so a
 * boolean would report success for a comment another session had already
 * removed — and the dashboard would say "Deleted." about a row that was never
 * touched. Asking for the affected ids back is what tells the two apart.
 */
export type ModerationOutcome = 'ok' | 'missing' | 'error';

export async function setCommentStatus(id: string, status: CommentStatus): Promise<ModerationOutcome> {
  const supa = db();
  if (!supa) return 'error';
  const { data, error } = await supa.from('post_comments').update({ status }).eq('id', id).select('id');
  if (error) {
    console.error(`[engagement] comment ${status} failed: ${error.message}`);
    return 'error';
  }
  return (data ?? []).length ? 'ok' : 'missing';
}

export async function deleteComment(id: string): Promise<ModerationOutcome> {
  const supa = db();
  if (!supa) return 'error';
  const { data, error } = await supa.from('post_comments').delete().eq('id', id).select('id');
  if (error) {
    console.error(`[engagement] comment delete failed: ${error.message}`);
    return 'error';
  }
  return (data ?? []).length ? 'ok' : 'missing';
}

/** Whether this reader already liked this piece, so the button knows its own state. */
export async function hasLiked(post: string, token: string): Promise<boolean> {
  const supa = db();
  if (!supa || !token) return false;
  const { data, error } = await supa
    .from('post_likes')
    .select('id')
    .eq('post', post)
    .eq('token', token)
    .maybeSingle();
  if (error) {
    console.error(`[engagement] like lookup failed: ${error.message}`);
    return false;
  }
  return !!data;
}

/**
 * Add or withdraw one like, and return the total afterwards.
 *
 * The pair (post, token) is unique in the database, so two clicks from the same
 * browser cannot become two likes even if they arrive together; a write that
 * loses that race is read back as the like it was trying to be.
 */
export async function setLike(
  post: string,
  token: string,
  name: string,
  liked: boolean,
): Promise<number | null> {
  const supa = db();
  if (!supa) return null;
  if (liked) {
    const { error } = await supa
      .from('post_likes')
      .upsert({ post, token, name }, { onConflict: 'post,token', ignoreDuplicates: true });
    if (error) {
      console.error(`[engagement] like failed: ${error.message}`);
      return null;
    }
  } else {
    const { error } = await supa.from('post_likes').delete().eq('post', post).eq('token', token);
    if (error) {
      console.error(`[engagement] unlike failed: ${error.message}`);
      return null;
    }
  }
  const { count, error: countError } = await supa
    .from('post_likes')
    .select('id', { count: 'exact', head: true })
    .eq('post', post);
  if (countError) {
    console.error(`[engagement] like total failed: ${countError.message}`);
    return null;
  }
  return count ?? 0;
}
