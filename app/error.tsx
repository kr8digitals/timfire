'use client';
import Link from 'next/link';
import { useEffect } from 'react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Page error', error);
  }, [error]);

  return (
    <main id="main" className="section">
      <div className="shell">
        <span className="eyebrow">Something went wrong</span>
        <h1 style={{ margin: '18px 0 16px' }}>
          Let&apos;s try that <em>again.</em>
        </h1>
        <p className="page-lead">
          The page hit an unexpected error — not something you did. Retry, go back home, or send me the details and I
          will fix it.
        </p>
        {error.digest && (
          <p className="small muted" style={{ marginTop: 14 }}>
            Reference: <code>{error.digest}</code>
          </p>
        )}
        <div className="actions">
          <button className="button primary" onClick={reset} type="button">
            Try again
          </button>
          <Link className="button ghost" href="/">
            Go home
          </Link>
          <Link className="button ghost" href="/contact">
            Report it
          </Link>
        </div>
      </div>
    </main>
  );
}
