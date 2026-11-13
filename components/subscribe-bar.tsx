'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowRight, X } from 'lucide-react';

const DISMISSED = 'tf-sub-bar-off';
const SUBSCRIBED = 'tf-sub-done';

/**
 * The list has a permanent home on every page: one slim strip above the header,
 * on the site's own terms, that opens the same subscription dialog the scroll
 * moment uses — so there is exactly one way to join, and three ways to find it.
 *
 * It renders in the HTML (no flash, no JavaScript required to see it) and steps
 * aside on mount for anyone who dismissed it or already subscribed, and on the
 * two pages where an invitation makes no sense: the dashboard and the
 * unsubscribe page.
 */
export default function SubscribeBar() {
  const path = usePathname();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISSED) || localStorage.getItem(SUBSCRIBED)) setHidden(true);
    } catch {
      /* private mode: keep showing it */
    }
    const joined = () => setHidden(true);
    window.addEventListener(SUBSCRIBED, joined);
    return () => window.removeEventListener(SUBSCRIBED, joined);
  }, []);

  function dismiss() {
    setHidden(true);
    try {
      localStorage.setItem(DISMISSED, '1');
    } catch {
      /* nothing to persist */
    }
  }

  if (hidden || path?.startsWith('/admin') || path === '/unsubscribe') return null;

  return (
    <div className="sub-bar">
      <div className="shell sub-bar-in">
        <span className="sub-bar-dot" aria-hidden="true" />
        <p>
          <strong>Stay close.</strong> New poems, new work and the occasional offer
          <span className="sub-bar-more"> — one short email at a time, your name on it, never a wall of text.</span>
        </p>
        <button type="button" className="button primary" onClick={() => window.dispatchEvent(new Event('tf-sub-open'))}>
          Get updates by email <ArrowRight size={16} />
        </button>
        <button type="button" className="icon-btn sub-bar-close" onClick={dismiss} aria-label="Hide the updates invitation">
          <X size={17} />
        </button>
      </div>
    </div>
  );
}
