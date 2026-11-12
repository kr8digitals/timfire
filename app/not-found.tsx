import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const exits: [string, string][] = [
  ['Home', '/'],
  ['Work', '/work'],
  ['Services', '/services'],
  ['Gallery', '/gallery'],
  ['About', '/about'],
  ['Journal', '/journal'],
  ['Creative', '/creative'],
  ['Ventures', '/ventures'],
  ['Timeline', '/timeline'],
  ['Now', '/now'],
  ['Contact', '/contact'],
];

export default function NotFound() {
  return (
    <main id="main" className="section">
      <div className="shell">
        <span className="eyebrow">404 · Page not found</span>
        <h1 style={{ margin: '18px 0 16px' }}>
          That page isn&apos;t <em>here.</em>
        </h1>
        <p className="page-lead" style={{ marginBottom: 30 }}>
          The link may have moved, or it may never have existed. Here is the way back in — or press{' '}
          <kbd className="kbd">Ctrl</kbd> + <kbd className="kbd">K</kbd> to search everything.
        </p>
        <div className="page-grid three">
          {exits.map(([name, href]) => (
            <Link
              key={href}
              href={href}
              className="card hoverable"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, minHeight: 66, padding: '16px 20px' }}
            >
              {name} <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          ))}
        </div>
        <p className="small muted" style={{ marginTop: 26 }}>
          If you followed a link from somewhere else and expected something here,{' '}
          <Link href="/contact" style={{ color: 'var(--orange)' }}>
            tell me
          </Link>{' '}
          and I will fix it.
        </p>
      </div>
    </main>
  );
}
