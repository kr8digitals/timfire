import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';

const exits: [string, string][] = [
  ['Home', '/'],
  ['About', '/about'],
  ['Work', '/work'],
  ['Ventures', '/ventures'],
  ['Services', '/services'],
  ['Creative', '/creative'],
  ['Journal', '/journal'],
  ['Timeline', '/timeline'],
  ['Now', '/now'],
  ['Contact', '/contact'],
];

export default function NotFound() {
  return (
    <main id="main" className="section">
      <div className="shell">
        <span className="eyebrow">404 · Page not found</span>
        <h1>
          That page isn&apos;t <em>here.</em>
        </h1>
        <p className="page-lead">
          The link may have moved, or it may never have existed. Here is the way back in — or press{' '}
          <kbd className="kbd">Ctrl</kbd> + <kbd className="kbd">K</kbd> to search everything.
        </p>
        <div className="page-grid section" style={{paddingTop:0}}>
          {exits.map(([name, href]) => (
            <Link key={href} href={href} className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
              {name} <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
