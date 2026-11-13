'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowRight, Check } from 'lucide-react';

/**
 * The list's home: a band of its own at the foot of every page, immediately
 * above the footer — the place a reader reaches when the page has convinced
 * them, not a badge pinned over the doorway.
 *
 * It opens the same dialog the scroll moment uses, so there is still exactly
 * one way to join. Once someone subscribes the button becomes a thank-you, and
 * on the two pages where an invitation makes no sense (the dashboard and the
 * unsubscribe page) the band stays out of the way entirely.
 */
export default function SubscribeBand() {
  const path = usePathname();
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem('tf-sub-done')) setJoined(true);
    } catch {
      /* private mode: keep offering it */
    }
    const done = () => setJoined(true);
    window.addEventListener('tf-sub-done', done);
    return () => window.removeEventListener('tf-sub-done', done);
  }, []);

  if (path?.startsWith('/admin') || path === '/unsubscribe') return null;

  return (
    <section className="sub-band" aria-label="Get updates by email">
      <div className="shell sub-band-in">
        <div className="sub-band-copy">
          <span className="eyebrow">Stay close</span>
          <h2>
            New poems, new work,
            <br />
            <em>the occasional offer.</em>
          </h2>
          <p>
            One short email at a time, your name on it, never a wall of text. Unsubscribe in one
            click, any time, no hard feelings.
          </p>
        </div>
        <div className="sub-band-act">
          {joined ? (
            <p className="sub-band-done">
              <Check size={18} /> You are on the list. Thank you for staying close.
            </p>
          ) : (
            <button
              type="button"
              className="button primary"
              onClick={() => window.dispatchEvent(new Event('tf-sub-open'))}
            >
              Get updates by email <ArrowRight size={17} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
