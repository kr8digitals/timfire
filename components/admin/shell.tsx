'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  PenLine,
  ImageIcon,
  Briefcase,
  Building2,
  Milestone,
  Radio,
  Award,
  Wrench,
  Coins,
  Inbox,
  Settings,
  DatabaseBackup,
  LogOut,
  Save,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import type { SiteContent } from '@/lib/cms/types';
import { Notice } from './kit';
import PostsPanel from './panels/posts';
import CreativePanel from './panels/creative';
import GalleryPanel from './panels/gallery';
import ProjectsPanel from './panels/projects';
import { VenturesPanel, TimelinePanel, NowPanel, CredentialsPanel, ServicesPanel, CurrencyPanel } from './panels/content';
import { SiteSettingsPanel, DataPanel } from './panels/settings';
import EnquiriesPanel from './panels/enquiries';

type TabKey =
  | 'overview'
  | 'posts'
  | 'creative'
  | 'gallery'
  | 'projects'
  | 'ventures'
  | 'timeline'
  | 'now'
  | 'credentials'
  | 'services'
  | 'currency'
  | 'enquiries'
  | 'settings'
  | 'data';

const TABS: { key: TabKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'enquiries', label: 'Enquiries', icon: Inbox },
  { key: 'posts', label: 'Journal', icon: FileText },
  { key: 'gallery', label: 'Gallery', icon: ImageIcon },
  { key: 'projects', label: 'Work', icon: Briefcase },
  { key: 'creative', label: 'Creative', icon: PenLine },
  { key: 'services', label: 'Services', icon: Wrench },
  { key: 'ventures', label: 'Ventures', icon: Building2 },
  { key: 'timeline', label: 'Timeline', icon: Milestone },
  { key: 'now', label: 'Now', icon: Radio },
  { key: 'credentials', label: 'Credentials', icon: Award },
  { key: 'currency', label: 'Currency', icon: Coins },
  { key: 'settings', label: 'Site settings', icon: Settings },
  { key: 'data', label: 'Backup', icon: DatabaseBackup },
];

/** Deep clone that works for plain content objects. */
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export default function AdminShell() {
  const [auth, setAuth] = useState<'checking' | 'in' | 'out'>('checking');
  const [expires, setExpires] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [busy, setBusy] = useState(false);

  const [tab, setTab] = useState<TabKey>('overview');
  const [content, setContent] = useState<SiteContent | null>(null);
  const [draft, setDraft] = useState<SiteContent | null>(null);
  const [sha, setSha] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; kind: 'ok' | 'error' | '' }>({ text: '', kind: '' });
  const [saving, setSaving] = useState(false);
  const [setup, setSetup] = useState<{ ready: boolean; backend: string } | null>(null);

  /* ── Session ───────────────────────────────────────────────────────────── */

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => {
        setAuth(data.authenticated ? 'in' : 'out');
        setExpires(data.expires || 0);
        if (data.setup) setSetup(data.setup);
      })
      .catch(() => setAuth('out'));
  }, []);

  useEffect(() => {
    if (!expires) return;
    const timer = setTimeout(
      () => {
        setAuth('out');
        setMessage({ text: 'Your session expired. Please sign in again.', kind: 'error' });
      },
      Math.max(0, expires - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [expires]);

  /* ── Load content ──────────────────────────────────────────────────────── */

  const load = useCallback(async () => {
    setLoading(true);
    setMessage({ text: '', kind: '' });
    try {
      const res = await fetch('/api/cms/content', { cache: 'no-store' });
      if (res.status === 401) {
        setAuth('out');
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ text: data.message || 'Could not load content.', kind: 'error' });
        return;
      }
      setContent(data.data);
      setDraft(clone(data.data));
      setSha(data.sha || null);
    } catch {
      setMessage({ text: 'Could not load content. Check your connection.', kind: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (auth === 'in') load();
  }, [auth, load]);

  /* ── Warn before losing changes ────────────────────────────────────────── */

  const dirty = Boolean(draft && content && JSON.stringify(draft) !== JSON.stringify(content));
  useEffect(() => {
    if (!dirty) return;
    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = '';
    }
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  /* ── Save ──────────────────────────────────────────────────────────────── */

  async function save() {
    if (!draft) return;
    setSaving(true);
    setMessage({ text: '', kind: '' });
    try {
      const res = await fetch('/api/cms/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: draft, sha }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ text: data.message || 'Could not save.', kind: 'error' });
        return;
      }
      setSha(data.sha || null);
      setContent(clone(draft));
      setMessage({
        text: `Saved. Published changes appear on the live site once the deployment finishes (usually under two minutes).`,
        kind: 'ok',
      });
    } catch {
      setMessage({ text: 'Could not save. Check your connection and try again.', kind: 'error' });
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    if (!content) return;
    if (dirty && !confirm('Discard all unsaved changes?')) return;
    setDraft(clone(content));
    setMessage({ text: 'Changes discarded.', kind: '' });
  }

  const update = useCallback((fn: (next: SiteContent) => void) => {
    setDraft((current) => {
      if (!current) return current;
      const next = clone(current);
      fn(next);
      return next;
    });
  }, []);

  /* ── Login ─────────────────────────────────────────────────────────────── */

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoginError(data.message || 'Could not sign in.');
        return;
      }
      setPassword('');
      setExpires(data.expires || 0);
      setAuth('in');
    } catch {
      setLoginError('Could not sign in. Check your connection.');
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setAuth('out');
    setContent(null);
    setDraft(null);
    setExpires(0);
    setPassword('');
  }

  /* ── Render ────────────────────────────────────────────────────────────── */

  if (auth === 'checking') {
    return (
      <main id="main" className="admin-shell">
        <p className="muted">Checking your session…</p>
      </main>
    );
  }

  if (auth === 'out') {
    return (
      <main id="main" className="admin-shell">
        <div style={{ maxWidth: 440, margin: '10vh auto' }}>
          <Link className="logo" href="/">
            TIMFIRE<span>.</span>
          </Link>
          <h1 style={{ fontSize: 'clamp(1.7rem,3vw,2.2rem)', margin: '18px 0 8px' }}>Sign in</h1>
          <p className="muted" style={{ fontSize: '.94rem' }}>
            This area is for the site owner. Content, enquiries and prices are managed here.
          </p>
          <form onSubmit={signIn} style={{ marginTop: 22 }}>
            <div className="field">
              <label className="form-label" htmlFor="admin-email">
                Email
              </label>
              <input id="admin-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label className="form-label" htmlFor="admin-password">
                Password
              </label>
              <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {loginError && (
              <p className="error-text" role="alert" style={{ marginBottom: 14 }}>
                <AlertTriangle size={15} aria-hidden="true" /> {loginError}
              </p>
            )}
            <button className="button primary wide" type="submit" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p className="small muted" style={{ marginTop: 20, fontSize: '.82rem' }}>
            <Link href="/" style={{ color: 'var(--orange)' }}>
              ← Back to the site
            </Link>
          </p>
        </div>
      </main>
    );
  }

  if (loading && !draft) {
    return (
      <main id="main" className="admin-shell">
        <p className="muted">Loading content…</p>
      </main>
    );
  }

  if (!draft) {
    return (
      <main id="main" className="admin-shell">
        <h1>Content unavailable</h1>
        <Notice kind="error">{message.text || 'The content store could not be reached.'}</Notice>
        <div className="admin-actions">
          <button type="button" className="button primary" onClick={load}>
            Try again
          </button>
          <button type="button" className="button ghost" onClick={signOut}>
            Sign out
          </button>
        </div>
      </main>
    );
  }

  const activeTab = TABS.find((t) => t.key === tab)!;

  return (
    <main id="main" className="admin-shell">
      <header className="admin-head">
        <div>
          <Link className="logo" href="/">
            TIMFIRE<span>.</span>
          </Link>
          <p className="small muted" style={{ margin: '4px 0 0', fontSize: '.8rem' }}>
            {dirty ? (
              <span style={{ color: 'var(--orange)' }}>
                <span className="dirty-dot" aria-hidden="true" />
                Unsaved changes
              </span>
            ) : (
              'All changes saved'
            )}
          </p>
        </div>
        <div className="admin-actions">
          <Link href="/" className="button ghost small" target="_blank">
            <ExternalLink size={14} aria-hidden="true" /> View site
          </Link>
          <button type="button" className="button ghost small" onClick={signOut}>
            <LogOut size={14} aria-hidden="true" /> Sign out
          </button>
          <button type="button" className="button primary small" onClick={save} disabled={!dirty || saving}>
            <Save size={14} aria-hidden="true" /> {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </header>

      {setup && !setup.ready && (
        <Notice kind="error">
          <strong>Saving is not connected.</strong> This deployment has no content storage configured, so edits
          cannot be written. Set <code>GITHUB_CONTENT_TOKEN</code>, <code>GITHUB_CONTENT_REPO</code> and{' '}
          <code>GITHUB_CONTENT_BRANCH</code> in the host&apos;s environment variables and redeploy. The public site
          keeps working in the meantime.
        </Notice>
      )}

      {message.text && (
        <Notice kind={message.kind}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <span>{message.text}</span>
            <button type="button" className="text-link" style={{ minHeight: 0, fontSize: '.85rem' }} onClick={() => setMessage({ text: '', kind: '' })}>
              Dismiss
            </button>
          </div>
        </Notice>
      )}

      <div className="admin-layout">
        <nav className="admin-nav" aria-label="Admin sections">
          {TABS.map((item) => (
            <button key={item.key} type="button" className={tab === item.key ? 'active' : ''} onClick={() => setTab(item.key)} aria-current={tab === item.key ? 'page' : undefined}>
              <item.icon size={16} aria-hidden="true" /> {item.label}
            </button>
          ))}
        </nav>

        <section className="admin-main" aria-label={activeTab.label}>
          <h2 style={{ fontSize: 'clamp(1.4rem,2.4vw,1.9rem)', margin: '0 0 6px' }}>{activeTab.label}</h2>

          {tab === 'overview' && <Overview content={draft} onGo={setTab} dirty={dirty} />}
          {tab === 'posts' && <PostsPanel content={draft} update={update} notify={(text, kind = 'ok') => setMessage({ text, kind })} />}
          {tab === 'creative' && <CreativePanel content={draft} update={update} />}
          {tab === 'gallery' && <GalleryPanel content={draft} update={update} />}
          {tab === 'projects' && <ProjectsPanel content={draft} update={update} />}
          {tab === 'ventures' && <VenturesPanel content={draft} update={update} />}
          {tab === 'timeline' && <TimelinePanel content={draft} update={update} />}
          {tab === 'now' && <NowPanel content={draft} update={update} />}
          {tab === 'credentials' && <CredentialsPanel content={draft} update={update} />}
          {tab === 'services' && <ServicesPanel content={draft} update={update} />}
          {tab === 'currency' && <CurrencyPanel content={draft} update={update} />}
          {tab === 'enquiries' && <EnquiriesPanel />}
          {tab === 'settings' && <SiteSettingsPanel content={draft} update={update} />}
          {tab === 'data' && <DataPanel content={draft} />}
        </section>
      </div>

      {dirty && (
        <div className="admin-topbar">
          <span className="small muted" style={{ fontSize: '.84rem' }}>
            <span className="dirty-dot" aria-hidden="true" /> Unsaved changes
          </span>
          <button type="button" className="button ghost small" onClick={discard}>
            Discard
          </button>
          <button type="button" className="button primary small" onClick={save} disabled={saving}>
            <Save size={14} aria-hidden="true" /> {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      )}

      <nav className="admin-bottom" aria-label="Quick admin sections">
        {TABS.filter((t) => ['overview', 'enquiries', 'posts', 'gallery'].includes(t.key)).map((item) => (
          <button key={item.key} type="button" className={tab === item.key ? 'active' : ''} onClick={() => setTab(item.key)}>
            <item.icon size={18} aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}

/* ── Overview ────────────────────────────────────────────────────────────── */

function Overview({ content, onGo, dirty }: { content: SiteContent; onGo: (tab: TabKey) => void; dirty: boolean }) {
  const publishedPosts = content.posts.filter((p) => p.status === 'published').length;
  const drafts = content.posts.filter((p) => p.status === 'draft').length;
  const scheduled = content.posts.filter((p) => p.status === 'scheduled').length;
  const liveProjects = content.projects.filter((p) => p.isPublic && p.status === 'Live').length;

  const cards: { label: string; value: string | number; note: string; tab: TabKey }[] = [
    { label: 'Enquiries', value: '—', note: 'Open the inbox to see new messages', tab: 'enquiries' },
    { label: 'Articles', value: content.posts.length, note: `${publishedPosts} published · ${drafts} draft · ${scheduled} scheduled`, tab: 'posts' },
    { label: 'Photographs', value: content.gallery.length, note: 'All in the public gallery', tab: 'gallery' },
    { label: 'Projects', value: content.projects.length, note: `${liveProjects} live and public`, tab: 'projects' },
    { label: 'Creative', value: content.creative.length, note: `${content.creative.filter((c) => c.status === 'published').length} published`, tab: 'creative' },
    { label: 'Services', value: 9, note: 'Prices and availability', tab: 'services' },
  ];

  return (
    <>
      {dirty && (
        <div className="notice" style={{ marginTop: 0 }}>
          You have unsaved changes. They are kept in this tab until you save or discard them.
        </div>
      )}
      <div className="page-grid three" style={{ marginTop: 18 }}>
        {cards.map((card) => (
          <button
            key={card.label}
            type="button"
            className="card hoverable"
            onClick={() => onGo(card.tab)}
            style={{ textAlign: 'left', display: 'grid', gap: 6, alignContent: 'start', minHeight: 130 }}
          >
            <span className="kicker" style={{ fontSize: '.7rem' }}>{card.label}</span>
            <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', color: 'var(--orange)', lineHeight: 1 }}>{card.value}</strong>
            <span className="small muted" style={{ fontSize: '.82rem' }}>{card.note}</span>
          </button>
        ))}
      </div>

      <div className="admin-card" style={{ marginTop: 20 }}>
        <h3>How saving works</h3>
        <p className="small muted" style={{ margin: 0 }}>
          Every save commits your content to the repository, which triggers a deploy. Published changes go live when
          that deploy finishes — usually under two minutes. Nothing is public until you press Save, and every version
          you save is kept, so any change can be rolled back.
        </p>
      </div>

      <div className="admin-card">
        <h3>Adding a journal article</h3>
        <p className="small muted" style={{ margin: 0 }}>
          Journal → New article. Write it as a draft, preview it from the article screen, then set the status to
          published (or scheduled with a date and time). Drafts never appear on the public site.
        </p>
      </div>
    </>
  );
}
