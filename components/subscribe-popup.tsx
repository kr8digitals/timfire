'use client';
import { useEffect, useRef, useState } from 'react';
import { X, PenLine, Sparkles, Mail } from 'lucide-react';

const REASONS = [
  { icon: PenLine, text: 'Poems, spoken word and articles — the day they are published' },
  { icon: Sparkles, text: 'New work and limited-time offers, before anyone else' },
  { icon: Mail, text: 'One short email at a time, your name on it — never a wall of text' },
];

/**
 * The subscription moment: appears once per session after the visitor has
 * actually read something (55% scroll depth, or 45 seconds), never to someone
 * who already subscribed, and always reopenable from the footer.
 */
export default function SubscribePopup() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const openRequest = () => setOpen(true);
    window.addEventListener('tf-sub-open', openRequest);
    let fired = false;
    const fire = () => {
      if (fired) return;
      fired = true;
      sessionStorage.setItem('tf-sub-seen', '1');
      setOpen(true);
    };
    const onScroll = () => {
      if (fired || sessionStorage.getItem('tf-sub-seen') || localStorage.getItem('tf-sub-done')) return;
      const doc = document.documentElement;
      const depth = (window.scrollY + window.innerHeight) / Math.max(doc.scrollHeight, 1);
      if (depth > 0.55) fire();
    };
    const timer = setTimeout(() => {
      if (!sessionStorage.getItem('tf-sub-seen') && !localStorage.getItem('tf-sub-done')) fire();
    }, 45000);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('tf-sub-open', openRequest);
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setMessage('');
    try {
      const r = await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email }) });
      const v = await r.json().catch(() => null);
      if (!r.ok) {
        setStatus('error');
        setMessage(v?.message || 'Please check the two fields and try again.');
        return;
      }
      localStorage.setItem('tf-sub-done', '1');
      window.dispatchEvent(new Event('tf-sub-done'));
      setStatus('ok');
    } catch {
      setStatus('error');
      setMessage('The list could not be reached. Please try again in a moment.');
    }
  }

  if (!open) return null;
  return (
    <div className="sub-overlay" role="dialog" aria-modal="true" aria-label="Subscribe to updates from TIMFIRE" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div className="sub-card">
        <button ref={closeRef} type="button" className="icon-btn sub-close" onClick={() => setOpen(false)} aria-label="Close subscription prompt">
          <X size={20} />
        </button>
        {status === 'ok' ? (
          <div className="sub-body">
            <span className="eyebrow">Welcome, {name.split(' ')[0]}</span>
            <h3>
              You are on the list, <em>{name.split(' ')[0]}.</em>
            </h3>
            <p>
              The first letter arrives with the next publish — addressed to you, short, and worth the open. A welcome
              email is already on its way to {email}.
            </p>
            <button className="button primary" onClick={() => setOpen(false)}>
              Back to the site
            </button>
          </div>
        ) : (
          <div className="sub-body">
            <span className="eyebrow">Stay close</span>
            <h3>
              The next piece lands <em>in your inbox first.</em>
            </h3>
            <ul className="sub-reasons">
              {REASONS.map((r) => (
                <li key={r.text}>
                  <r.icon size={17} /> <span>{r.text}</span>
                </li>
              ))}
            </ul>
            <form onSubmit={submit}>
              <label className="form-label" htmlFor="sub-name">
                Your name (every email uses it)
              </label>
              <input id="sub-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} autoComplete="name" />
              <label className="form-label" htmlFor="sub-email">
                Email address
              </label>
              <input id="sub-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={254} autoComplete="email" />
              {message && (
                <p className="error-text" role="alert" style={{ margin: '10px 0 0' }}>
                  {message}
                </p>
              )}
              <div className="actions" style={{ marginTop: 16 }}>
                <button className="button primary" type="submit" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Adding you…' : 'Put me on the list'}
                </button>
                <button className="button ghost" type="button" onClick={() => setOpen(false)}>
                  Not now
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
