/**
 * The shared vocabulary of reader engagement: how a piece is addressed, what a
 * comment looks like on the wire, and the limits both ends agree on.
 *
 * This module is deliberately free of any database import. `lib/engagement.ts`
 * (server-only, it holds the Supabase client) and the components that render a
 * like button both need these names, and a client component that reached into the
 * server module would drag the Supabase SDK into the browser bundle.
 */

export type CommentStatus = 'live' | 'hidden';

export type Comment = {
  id: string;
  post: string;
  name: string;
  /** Only ever populated for the owner. What a reader sees is their own comment. */
  email: string;
  body: string;
  status: CommentStatus;
  at: string;
};

export type Counts = { likes: number; comments: number };

/** A piece is addressed as `<collection>:<slug>` — journal:they-get-disappointed. */
export const postKey = (collection: 'journal' | 'creative', slug: string): string =>
  `${collection}:${slug}`;

const KEY = /^(journal|creative):([a-z0-9]+(?:-[a-z0-9]+)*)$/;

/** Only a well-formed key is ever written, so no row can point at nothing. */
export function validPostKey(value: unknown): string {
  const key = typeof value === 'string' ? value.trim() : '';
  return KEY.test(key) ? key : '';
}

/** Long enough to say something, short enough that a comment box is not a blog. */
export const MAX_COMMENT = 1200;
export const MAX_NAME = 60;
/** A guest's like is one per browser; the token is that browser's own id. */
export const MAX_TOKEN = 64;
