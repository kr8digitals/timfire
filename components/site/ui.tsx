import Link from 'next/link';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Reveal } from './motion';

export function PageHero({
  eyebrow,
  title,
  accent,
  lead,
  children,
  aside,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  lead?: string;
  children?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="page-hero">
      <span className="hero-art-line" aria-hidden="true" />
      <div className={`shell${aside ? ' two-col' : ''}`} style={aside ? { alignItems: 'center', gap: 'clamp(24px,5vw,64px)' } : undefined}>
        <div>
          <Reveal>
            <span className="eyebrow">{eyebrow}</span>
          </Reveal>
          <Reveal delay={0.06}>
            <h1>
              {title}
              {accent && (
                <>
                  {' '}
                  <em>{accent}</em>
                </>
              )}
            </h1>
          </Reveal>
          {lead && (
            <Reveal delay={0.12}>
              <p className="page-lead">{lead}</p>
            </Reveal>
          )}
          {children && <Reveal delay={0.18}>{children}</Reveal>}
        </div>
        {aside && <Reveal delay={0.1}>{aside}</Reveal>}
      </div>
    </section>
  );
}

export function SectionHead({
  eyebrow,
  title,
  accent,
  lead,
  action,
  stack,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  lead?: string;
  action?: { href: string; label: string };
  stack?: boolean;
}) {
  return (
    <div className={`sectionhead${stack ? ' stackhead' : ''}`}>
      <div className="inner">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>
          {title}
          {accent && (
            <>
              {' '}
              <em>{accent}</em>
            </>
          )}
        </h2>
        {lead && <p>{lead}</p>}
      </div>
      {action && (
        <Link href={action.href} className="text-link">
          {action.label} <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

export function Related({
  links,
  back,
}: {
  links: [string, string][];
  back?: { href: string; label: string };
}) {
  return (
    <nav className="related" aria-label="Related pages" style={{ borderTop: '1px solid var(--border-soft)', marginTop: 'var(--s6)', paddingTop: 'var(--s4)', display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
      {back && (
        <Link href={back.href} className="text-link" style={{ marginRight: 'auto' }}>
          <ArrowLeft size={16} aria-hidden="true" /> {back.label}
        </Link>
      )}
      {links.map(([href, label]) => (
        <Link key={href + label} href={href} className="text-link">
          {label} <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      ))}
    </nav>
  );
}

export function Stat({ value, label, source }: { value: string; label: string; source?: string }) {
  return (
    <div>
      <strong>{value}</strong>
      <span>{label}</span>
      {source && <span className="stat-source">{source}</span>}
    </div>
  );
}

/** Buttons used by the CTA blocks, so a page never dumps visitors on /contact by accident. */
export function CTABlock({
  eyebrow,
  title,
  accent,
  lead,
  primary,
  secondary,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  lead?: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string; external?: boolean };
}) {
  return (
    <section className="section">
      <div className="shell">
        <Reveal>
          <div className="cta-block">
            <div>
              <span className="eyebrow">{eyebrow}</span>
              <h2>
                {title}
                {accent && (
                  <>
                    {' '}
                    <em>{accent}</em>
                  </>
                )}
              </h2>
              {lead && <p>{lead}</p>}
              <div className="actions">
                <Link href={primary.href} className="button primary">
                  {primary.label} <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
                {secondary &&
                  (secondary.external ? (
                    <a href={secondary.href} className="button ghost" target="_blank" rel="noopener noreferrer">
                      {secondary.label} <ArrowUpRight size={16} aria-hidden="true" />
                    </a>
                  ) : (
                    <Link href={secondary.href} className="button ghost">
                      {secondary.label} <ArrowUpRight size={16} aria-hidden="true" />
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
