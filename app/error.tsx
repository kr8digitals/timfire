'use client';
import Link from 'next/link';

export default function ErrorPage({reset}:{error:Error;reset:()=>void}){
  return (
    <main id="main" className="section">
      <div className="shell">
        <span className="eyebrow">Something went wrong</span>
        <h1>Let&apos;s try that <em>again.</em></h1>
        <p className="page-lead">The page hit an unexpected error. You can retry, or go back home.</p>
        <div className="actions">
          <button className="button primary" onClick={reset}>Try again</button>
          <Link className="button ghost" href="/">Go home</Link>
        </div>
      </div>
    </main>
  );
}
