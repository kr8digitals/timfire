'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Menu, Search, X, ArrowUpRight, ChevronDown, MessageCircle, Command } from 'lucide-react';
import { NAV_PRIMARY, NAV_MORE, ALL_NAV } from './nav';

/* ── Focus-trapped modal ─────────────────────────────────────────────────── */

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const focusable = () =>
      Array.from(
        node?.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled])',
        ) || [],
      );
    const timer = setTimeout(() => {
      const initial = node?.querySelector<HTMLElement>('[data-initial-focus]');
      (initial || focusable()[0])?.focus();
    }, 20);

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeRef.current();
      }
      if (e.key === 'Tab') {
        const items = focusable();
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', onKey);
    document.body.classList.add('modal-open');
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('modal-open');
      previous?.focus();
    };
  }, []);

  return (
    <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} className="modal" role="dialog" aria-modal="true" aria-label={title}>
        {children}
      </div>
    </div>
  );
}

/* ── Visitor bar ─────────────────────────────────────────────────────────── */

/**
 * Shows the visitor's own local time, derived from their device clock and time
 * zone. No network call, no tracking, no geolocation prompt. It sits in a thin
 * strip above the header rather than floating over the page.
 */
function VisitorBar() {
  const [loc, setLoc] = useState<{ city: string; time: string; offset: string } | null>(null);

  useEffect(() => {
    function read() {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        const city = tz.split('/').pop()?.replace(/_/g, ' ') || '';
        const now = new Date();
        const time = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(now);
        const parts = new Intl.DateTimeFormat(undefined, { timeZoneName: 'shortOffset' }).formatToParts(now);
        const offset = parts.find((p) => p.type === 'timeZoneName')?.value || '';
        setLoc({ city, time, offset });
      } catch {
        setLoc(null);
      }
    }
    read();
    const id = setInterval(read, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <aside className="locbar" aria-label="Your local time">
      <div className="shell">
        <span>
          <i className="loc-dot" aria-hidden="true" />
          {loc?.city ? (
            <>
              You are reading from <strong>{loc.city}</strong>
              {loc.offset ? ` · ${loc.offset}` : ''}
            </>
          ) : (
            'Reading from somewhere in the world'
          )}
        </span>
        <span aria-live="off">
          {loc ? (
            <>
              Your time <strong className="mono">{loc.time}</strong>
            </>
          ) : (
            'TIMFIRE · Abakaliki, Nigeria'
          )}
        </span>
      </div>
    </aside>
  );
}

/* ── Search ──────────────────────────────────────────────────────────────── */

type SearchEntry = { title: string; href: string; type: string; terms: string };
type SearchPayload = { entries: SearchEntry[] };

function SearchDialog({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch('/api/search')
      .then((r) => (r.ok ? r.json() : { entries: [] }))
      .then((data: SearchPayload) => {
        if (alive) {
          setEntries(data.entries || []);
          setLoaded(true);
        }
      })
      .catch(() => alive && setLoaded(true));
    return () => {
      alive = false;
    };
  }, []);

  const q = query.trim().toLowerCase();
  const results = q
    ? entries.filter((e) => e.terms.toLowerCase().includes(q)).slice(0, 12)
    : entries.slice(0, 8);

  return (
    <Modal title="Search TIMFIRE" onClose={onClose}>
      <div className="modalhead">
        <label htmlFor="global-search" className="eyebrow plain">Search my space</label>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close search">
          <X size={18} />
        </button>
      </div>
      <input
        data-initial-focus
        id="global-search"
        autoComplete="off"
        className="search-input"
        style={{ width: '100%', margin: '14px 0', minHeight: 52 }}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Pages, work, writing, photographs…"
        aria-describedby="search-help"
      />
      <p id="search-help" className="sr-only">
        Results update as you type. Press Escape to close.
      </p>
      <div className="search-results" aria-live="polite">
        {results.length ? (
          results.map((r) => (
            <Link key={r.href + r.title} href={r.href} onClick={onClose}>
              <span>
                <small>{r.type}</small>
                <br />
                {r.title}
              </span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          ))
        ) : (
          <p className="muted">
            {loaded ? 'Nothing matches that yet. Try "gallery", "AI agent" or "journal".' : 'Loading…'}
          </p>
        )}
      </div>
    </Modal>
  );
}

/* ── Header ──────────────────────────────────────────────────────────────── */

export function Header() {
  const path = usePathname();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = useCallback(
    (href: string) => (href === '/' ? path === '/' : path === href || path.startsWith(href + '/')),
    [path],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearch((s) => !s);
      }
      if (e.key === 'Escape') setMoreOpen(false);
    }
    function onDown(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('.nav-more')) setMoreOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, []);

  useEffect(() => setMoreOpen(false), [path]);

  if (path.startsWith('/admin')) return null;

  const moreActive = NAV_MORE.some((n) => isActive(n.href));

  return (
    <>
      <header className="header">
        <VisitorBar />
        <div className="shell headrow">
          <Link className="logo" href="/" aria-label="TIMFIRE — home">
            TIMFIRE<span>.</span>
          </Link>

          <nav className="desktopnav" aria-label="Main">
            {NAV_PRIMARY.map((item) => (
              <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? 'page' : undefined}>
                {item.label}
              </Link>
            ))}
            <div className="nav-more">
              <button
                type="button"
                className={`nav-more-btn${moreActive ? ' current' : ''}`}
                aria-expanded={moreOpen}
                aria-controls="nav-more-menu"
                onClick={() => setMoreOpen((v) => !v)}
              >
                More <ChevronDown size={15} aria-hidden="true" style={{ transform: moreOpen ? 'rotate(180deg)' : undefined, transition: 'transform .2s' }} />
              </button>
              {moreOpen && (
                <div className="nav-more-menu" id="nav-more-menu">
                  <button type="button" className="nav-more-close" aria-label="Close menu" onClick={() => setMoreOpen(false)}>
                    <X size={15} />
                  </button>
                  {NAV_MORE.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setMoreOpen(false)} aria-current={isActive(item.href) ? 'page' : undefined}>
                      <span>
                        {item.label}
                        {item.desc && <span style={{ display: 'block', fontSize: '.74rem', color: '#9d8b81' }}>{item.desc}</span>}
                      </span>
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="headtools">
            <button type="button" className="icon-btn" aria-label="Search (Control or Command K)" onClick={() => setSearch(true)}>
              <Search size={19} aria-hidden="true" />
            </button>
            <Link className="headcta" href="/contact">
              Start a project <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
            <button type="button" className="icon-btn mobile-menu" aria-label="Open menu" onClick={() => setMenu(true)} aria-expanded={menu}>
              <Menu size={22} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {menu && (
        <Modal title="Navigation" onClose={() => setMenu(false)}>
          <div className="modalhead">
            <span className="logo">TIMFIRE<span>.</span></span>
            <button type="button" className="icon-btn" onClick={() => setMenu(false)} aria-label="Close menu">
              <X size={20} />
            </button>
          </div>
          <nav className="menu-list" aria-label="All pages">
            {ALL_NAV.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMenu(false)} aria-current={isActive(item.href) ? 'page' : undefined}>
                {item.label}
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            ))}
          </nav>
          <div className="actions" style={{ marginTop: 18 }}>
            <Link href="/contact" className="button primary" onClick={() => setMenu(false)}>
              Start a project <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
            <button type="button" className="button ghost" onClick={() => { setMenu(false); setSearch(true); }}>
              <Command size={15} aria-hidden="true" /> Search
            </button>
          </div>
        </Modal>
      )}

      {search && <SearchDialog onClose={() => setSearch(false)} />}

      <a
        className="whatsapp-float"
        href="https://wa.me/2348166552758?text=Hi%20Timfire%20%E2%80%94%20I%20found%20your%20site."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Message TIMFIRE on WhatsApp (opens in a new tab)"
      >
        <MessageCircle size={23} aria-hidden="true" />
      </a>
    </>
  );
}

/* ── Footer ──────────────────────────────────────────────────────────────── */

export type FooterSocial = { name: string; url: string };

export function Footer({ socials }: { socials: FooterSocial[] }) {
  const path = usePathname();
  if (path.startsWith('/admin')) return null;
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer-top">
          <div>
            <span className="logo">TIMFIRE<span>.</span></span>
            <p style={{ marginTop: 14 }}>
              Kenneth Timothy Iziogo. Websites and AI agents from Abakaliki, working with anyone, anywhere.
            </p>
            <div className="actions" style={{ marginTop: 16 }}>
              <Link href="/contact" className="button small primary">
                Start a project <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div>
            <h2>Pages</h2>
            <nav className="footer-links" aria-label="Footer pages">
              {ALL_NAV.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h2>Work with me</h2>
            <nav className="footer-links" aria-label="Services">
              <Link href="/services/website">Website development</Link>
              <Link href="/services/ai">AI agents</Link>
              <Link href="/services/seo">SEO</Link>
              <Link href="/services/branding">Branding</Link>
              <Link href="/services/mentorship">Mentorship</Link>
            </nav>
          </div>

          <div>
            <h2>Elsewhere</h2>
            <div className="socials">
              <a href="mailto:hi@kutimfire.com">hi@kutimfire.com</a>
              <a href="https://wa.me/2348166552758" target="_blank" rel="noopener noreferrer">
                WhatsApp ↗
              </a>
              {socials.map((s) => (
                <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.name} ↗
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} TIMFIRE · Kenneth Timothy Iziogo</span>
          <span>Think it. KR8 it.</span>
        </div>
        <p className="footer-note">
          Prices are set in Nigerian naira. Other currencies are converted from a published rate table dated on the
          services page — no hidden conversion.
        </p>
      </div>
    </footer>
  );
}
