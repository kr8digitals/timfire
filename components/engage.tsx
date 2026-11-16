'use client';
import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Heart, MessageCircle } from 'lucide-react';
import type { Comment, Counts } from '@/lib/posts';

/**
 * Likes and comments, under every piece.
 *
 * No account is needed for either: a reader's browser holds one anonymous token,
 * which is what makes a like one like instead of a button you can hold down. When
 * accounts arrive the token becomes the member id and the name they type becomes
 * the handle beside it — the counting does not change.
 *
 * Moderation is after the fact, as the owner chose, so the promise on the form is
 * the true one: it goes up immediately, and he removes what should not have been
 * said. Nothing here emails anybody — a letter per comment would spend the whole
 * daily allowance the first time a post does well.
 */

const TOKEN_KEY = 'timfire-reader-token';
const NAME_KEY = 'timfire-reader-name';
const EMAIL_KEY = 'timfire-reader-email';

/** This browser's reader id, made once and kept: one person, one like. */
export function readerToken(): string {
  try {
    const existing = localStorage.getItem(TOKEN_KEY);
    if (existing && /^[A-Za-z0-9_-]{8,64}$/.test(existing)) return existing;
    const fresh = (crypto.randomUUID ? crypto.randomUUID() : `r${Date.now()}${Math.random().toString(36).slice(2)}`)
      .replace(/-/g, '')
      .slice(0, 40);
    localStorage.setItem(TOKEN_KEY, fresh);
    return fresh;
  } catch {
    // Private mode with storage blocked: still one like per page load, honestly labelled.
    return `guest-${Math.random().toString(36).slice(2, 12)}`;
  }
}

function remembered(key: string): string {
  try {
    return localStorage.getItem(key) || '';
  } catch {
    return '';
  }
}

function remember(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* a reader who blocks storage still gets to comment */
  }
}

/** "3 days ago" — a thread reads in the order it happened, and this says when. */
export function ago(iso: string): string {
  const then = new Date(iso).getTime();
  if (!then) return '';
  const minutes = Math.round((Date.now() - then) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

/** The two numbers every card carries, so a shelf of pieces reads as one request. */
export function CardCounts({ counts }: { counts?: Counts }) {
  if (!counts) return <p className="card-counts" aria-hidden="true" />;
  return (
    <p className="card-counts">
      <span>
        <Heart size={15} aria-hidden="true" /> {counts.likes}
        <span className="sr-only"> likes</span>
      </span>
      <span>
        <MessageCircle size={15} aria-hidden="true" /> {counts.comments}
        <span className="sr-only"> comments</span>
      </span>
    </p>
  );
}

export default function Engagement({ post }: { post: string }) {
  const [token, setToken] = useState('');
  const [counts, setCounts] = useState<Counts | null>(null);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [body, setBody] = useState('');
  const [website, setWebsite] = useState(''); // honeypot — must stay empty
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setName(remembered(NAME_KEY));
    setEmail(remembered(EMAIL_KEY));
    const mine = readerToken();
    setToken(mine);
    let live = true;
    fetch(`/api/comments?post=${encodeURIComponent(post)}&token=${encodeURIComponent(mine)}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((v) => {
        if (!live || !v) return;
        setComments(v.comments ?? []);
        setCounts(v.counts ?? null);
        setLiked(!!v.liked);
        setLoaded(true);
      })
      .catch(() => live && setLoaded(true));
    return () => {
      live = false;
    };
  }, [post]);

  const toggleLike = useCallback(async () => {
    if (!token || busy) return;
    const next = !liked;
    setBusy(true);
    setLiked(next);
    setCounts((c) => (c ? { ...c, likes: Math.max(0, c.likes + (next ? 1 : -1)) } : c));
    try {
      const r = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post, token, liked: next }),
      });
      const v = await r.json().catch(() => null);
      if (!r.ok) throw new Error(v?.message || 'That did not register.');
      setLiked(!!v.liked);
      setCounts((c) => (c ? { ...c, likes: Number(v.likes) } : { likes: Number(v.likes), comments: 0 }));
    } catch (error) {
      setLiked(!next);
      setCounts((c) => (c ? { ...c, likes: Math.max(0, c.likes + (next ? -1 : 1)) } : c));
      setNote({ kind: 'error', text: error instanceof Error ? error.message : 'That did not register.' });
    } finally {
      setBusy(false);
    }
  }, [busy, liked, post, token]);

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setNote(null);
    if (!name.trim()) return setNote({ kind: 'error', text: 'Please put a name to it — a handle is a name.' });
    if (body.trim().length < 2) return setNote({ kind: 'error', text: 'Say something a person can answer.' });
    setSending(true);
    try {
      const r = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post, name: name.trim(), email: email.trim(), body: body.trim(), website }),
      });
      const v = await r.json().catch(() => null);
      if (!r.ok) throw new Error(v?.message || 'Your comment could not be saved.');
      setBody('');
      remember(NAME_KEY, name.trim());
      remember(EMAIL_KEY, email.trim());
      if (v?.comment) setComments((list) => [...list, v.comment as Comment]);
      if (v?.counts) setCounts(v.counts as Counts);
      setNote({ kind: 'ok', text: 'Up. It is on the page now, and I read every one.' });
    } catch (error) {
      setNote({ kind: 'error', text: error instanceof Error ? error.message : 'Your comment could not be saved.' });
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="section engagement" id="comments" aria-label="Likes and comments">
      <div className="engage-bar">
        <button
          type="button"
          className={'like-button' + (liked ? ' liked' : '')}
          onClick={toggleLike}
          disabled={!loaded || busy}
          aria-pressed={liked}
        >
          <Heart size={18} aria-hidden="true" />
          <span>{counts ? counts.likes : '—'}</span>
          <span className="like-word">{liked ? 'Liked' : 'Like this'}</span>
        </button>
        <p className="engage-count">
          <MessageCircle size={17} aria-hidden="true" />
          {counts ? `${counts.comments} comment${counts.comments === 1 ? '' : 's'}` : 'Comments'}
        </p>
      </div>

      {comments.length ? (
        <ol className="comment-list">
          {comments.map((c) => (
            <li className="comment" key={c.id}>
              <p className="comment-head">
                <strong>{c.name}</strong>
                <time dateTime={c.at}>{ago(c.at)}</time>
              </p>
              <p className="comment-body">{c.body}</p>
            </li>
          ))}
        </ol>
      ) : loaded ? (
        <p className="comment-empty">No comments yet. Yours would be the first thing anyone reads after this.</p>
      ) : null}

      <form className="comment-form contact-form" onSubmit={submit} noValidate>
        <h3>Say something back</h3>
        <p className="field-hint">
          It goes up immediately, and I read every one. A handle is a name — use whatever you are known by.
        </p>
        <div className="row-2">
          <div>
            <label className="form-label" htmlFor="comment-name">
              Your name or handle
            </label>
            <input id="comment-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="nickname" />
          </div>
          <div>
            <label className="form-label" htmlFor="comment-email">
              Email (optional, never shown)
            </label>
            <input id="comment-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} autoComplete="email" />
          </div>
        </div>
        <div>
          <label className="form-label" htmlFor="comment-body">
            Your comment
          </label>
          <textarea id="comment-body" rows={4} value={body} onChange={(e) => setBody(e.target.value)} maxLength={1200} />
          <p className="field-hint" aria-live="polite">
            {body.trim().length} / 1200
          </p>
        </div>
        {/* A reader never sees this field; a bot filling it teaches us nothing and stores nothing. */}
        <div className="honeypot" aria-hidden="true">
          <label htmlFor="comment-website">Leave this field empty</label>
          <input id="comment-website" tabIndex={-1} value={website} onChange={(e) => setWebsite(e.target.value)} autoComplete="off" />
        </div>
        {note ? (
          <p className={note.kind === 'ok' ? 'notice' : 'notice error'} role="status">
            {note.kind === 'ok' ? <CheckCircle2 size={17} aria-hidden="true" /> : <AlertCircle size={17} aria-hidden="true" />}
            {note.text}
          </p>
        ) : null}
        <button className="button primary" type="submit" disabled={sending}>
          {sending ? 'Sending…' : 'Post comment'}
        </button>
      </form>
    </section>
  );
}
