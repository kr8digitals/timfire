import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Users, GraduationCap, Building2, Sparkles } from 'lucide-react';
import { getContent } from '@/lib/cms/store';
import { displayHost } from '@/lib/safe';
import { Related } from '@/components/site/ui';
import { Reveal, Stagger, StaggerItem, HeroItem } from '@/components/site/motion';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Ventures — KR8 DIGITALS, Academy and Tribe',
  description:
    'KR8 DIGITALS is the studio TIMFIRE founded: websites, branding, design, video, SEO and AI agents — funding free eight-week digital-skills cohorts and a community of over three thousand creators.',
  alternates: { canonical: '/ventures' },
  openGraph: {
    title: 'Ventures — KR8 DIGITALS',
    description: 'We create. We innovate. We deliver results. The studio, the academy and the community.',
    images: ['/images/ventures/kr8-founder.webp'],
  },
};

const ICONS = [Building2, GraduationCap, Users] as const;

export default async function VenturesPage() {
  const content = await getContent();
  const ventures = content.ventures.filter((v) => v.isPublic).sort((a, b) => a.order - b.order);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'KR8 DIGITALS',
        url: 'https://kr8digitals.com',
        slogan: 'Whoever you are, whatever you do, we exist because of you.',
        founder: { '@type': 'Person', name: 'Kenneth Timothy Iziogo', alternateName: 'TIMFIRE', url: SITE_URL },
        employee: { '@type': 'Person', name: 'Kenneth Timothy Iziogo' },
        sameAs: ['https://academy.kr8digitals.com'],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Ventures', item: `${SITE_URL}/ventures` },
        ],
      },
    ],
  };

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero — takes the strength of the KR8 line, with the portrait whole in frame */}
      <section className="hero" style={{ background: 'radial-gradient(120% 100% at 76% 6%, #33170f 0%, #180e0a 46%, var(--ink) 82%)' }}>
        <div className="hero-canvas" aria-hidden="true">
          <span className="hero-glow a" />
          <span className="hero-glow b" />
          <span className="hero-arc a" />
          <span className="hero-arc b" />
          <span className="hero-node" style={{ left: '52%', top: '22%' }} />
          <span className="hero-node" style={{ left: '18%', top: '68%', width: 5, height: 5 }} />
        </div>

        <div className="shell hero-inner" style={{ minHeight: 'min(700px,84vh)' }}>
          <div className="hero-copy">
            <HeroItem delay={0.04}>
              <span className="hero-welcome">KR8 DIGITALS · founded 2024</span>
            </HeroItem>
            <HeroItem delay={0.16}>
              <h1 style={{ maxWidth: '14ch' }}>
                We create. We innovate. <em>We deliver results.</em>
              </h1>
            </HeroItem>
            <HeroItem delay={0.32}>
              <p className="hero-lead">
                Three words that had to be earned rather than written. The studio is real work for real clients. The
                Academy is tuition-free training. The Tribe is where it all lands.
              </p>
            </HeroItem>
            <HeroItem delay={0.44}>
              <div className="actions">
                <a href="https://kr8digitals.com" className="button primary" target="_blank" rel="noopener noreferrer">
                  kr8digitals.com <ArrowUpRight size={16} aria-hidden="true" />
                </a>
                <a href="#ecosystem" className="button ghost">
                  How it fits together
                </a>
              </div>
            </HeroItem>
          </div>

          <div className="hero-art" style={{ minHeight: 520 }}>
            <Image
              src="/images/ventures/kr8-founder.webp"
              alt="TIMFIRE, founder of KR8 DIGITALS, seated in a brown suit against a warm backdrop"
              width={1000}
              height={1400}
              priority
              sizes="(max-width: 860px) 96vw, 46vw"
              className="hero-portrait"
              style={{ width: '100%', maxHeight: 640, objectFit: 'contain', objectPosition: 'bottom' }}
            />
          </div>
        </div>
      </section>

      {/* The idea */}
      <section className="section">
        <div className="shell two-col" style={{ alignItems: 'start', gap: 'clamp(28px,5vw,80px)' }}>
          <Reveal>
            <span className="eyebrow">Why a studio</span>
            <h2 style={{ margin: '14px 0 0' }}>
              The client work pays <em>for the teaching.</em>
            </h2>
          </Reveal>
          <div>
            <Reveal>
              <p className="lede" style={{ color: 'var(--paper)' }}>
                Where I am from, the barrier to learning digital skills is not talent or interest. It is money, time and
                access — three things that all cost the same people the most.
              </p>
            </Reveal>
            <Reveal delay={0.06}>
              <p className="muted">
                So KR8 DIGITALS is deliberately two things at once. It is a commercial studio that builds websites,
                brands and agents for businesses that need them. And it is a funding mechanism for free training that
                people could not otherwise afford.
              </p>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="muted">
                It is not charity, and it is not a marketing exercise. It is the model. The studio being good at its job
                is what makes the free cohorts possible, which is a useful pressure: the teaching cannot quietly
                disappear if the work stops being good.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <blockquote style={{ borderLeft: '3px solid var(--orange)', margin: '28px 0 0', paddingLeft: 22 }}>
                <p style={{ fontFamily: 'var(--font-editorial), Georgia, serif', fontSize: 'clamp(1.2rem,2.2vw,1.6rem)', lineHeight: 1.5, margin: 0 }}>
                  &ldquo;Whoever you are, whatever you do, we exist because of you.&rdquo;
                </p>
                <footer style={{ color: 'var(--muted-2)', fontSize: '.82rem', letterSpacing: '.14em', textTransform: 'uppercase', marginTop: 12 }}>
                  The line on the KR8 DIGITALS wall
                </footer>
              </blockquote>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Ecosystem */}
      <section className="section section-ruled" id="ecosystem" style={{ scrollMarginTop: 90 }}>
        <div className="shell">
          <Reveal>
            <div className="sectionhead stackhead">
              <span className="eyebrow">The ecosystem</span>
              <h2>
                Three parts, one <em>purpose.</em>
              </h2>
              <p>Each one makes the others possible.</p>
            </div>
          </Reveal>

          <Stagger className="stack" gap={0.1}>
            {ventures.map((venture, index) => {
              const Icon = ICONS[index % ICONS.length];
              return (
                <StaggerItem key={venture.id}>
                  <article
                    id={venture.slug}
                    className="card"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.15fr)',
                      gap: 'clamp(20px,4vw,48px)',
                      alignItems: 'center',
                      scrollMarginTop: '110px',
                      padding: 'clamp(18px,2.6vw,30px)',
                    }}
                  >
                    <div style={{ borderRadius: 16, overflow: 'hidden', background: '#1a110d' }}>
                      <Image
                        src={venture.image}
                        alt={venture.imageAlt}
                        width={1000}
                        height={900}
                        sizes="(max-width: 860px) 92vw, 40vw"
                        style={{ width: '100%', height: '100%', maxHeight: 360, objectFit: 'cover' }}
                      />
                    </div>
                    <div>
                      <span className="badge outline" style={{ marginBottom: 14 }}>
                        <Icon size={13} aria-hidden="true" /> {index === 0 ? 'The studio' : index === 1 ? 'The academy' : 'The community'}
                      </span>
                      <h3 style={{ fontSize: 'clamp(1.5rem,2.6vw,2rem)', margin: '4px 0 10px' }}>{venture.name}</h3>
                      <p style={{ fontFamily: 'var(--font-display)', color: 'var(--orange)', marginTop: 0, marginBottom: 12, fontSize: '1.02rem' }}>
                        {venture.tagline}
                      </p>
                      <p className="muted">{venture.description}</p>
                      <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '7px 18px', margin: '18px 0 20px', fontSize: '.92rem' }}>
                        {venture.facts.map((fact) => (
                          <div key={fact.label} style={{ display: 'contents' }}>
                            <dt style={{ color: 'var(--muted-2)' }}>{fact.label}</dt>
                            <dd style={{ margin: 0 }}>{fact.value}</dd>
                          </div>
                        ))}
                      </dl>
                      {venture.url && (
                        <a href={venture.url} className="text-link" target="_blank" rel="noopener noreferrer">
                          {displayHost(venture.url)} <ArrowUpRight size={15} aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </article>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* What the studio does */}
      <section className="section section-ruled">
        <div className="shell">
          <Reveal>
            <div className="sectionhead stackhead">
              <span className="eyebrow">The studio&apos;s work</span>
              <h2>
                What KR8 DIGITALS <em>takes on.</em>
              </h2>
              <p>Seven services, delivered with the same standards as everything on this site.</p>
            </div>
          </Reveal>
          <Stagger className="page-grid three" gap={0.05}>
            {[
              ['Website design & development', 'Custom, mobile-first builds that earn their keep.'],
              ['Branding', 'Positioning, identity and the rules that keep it consistent.'],
              ['Graphic design', 'Campaign creative, social sets and event visuals.'],
              ['Video editing', 'Short-form, event films and promotional cuts.'],
              ['SEO', 'Technical foundations, structured data and honest content strategy.'],
              ['AI agents', 'Domain-grounded assistants that answer like someone who works there.'],
              ['Free training', 'Eight-week cohorts through KR8 Academy, with a verifiable KR8 ID.'],
            ].map(([title, body]) => (
              <StaggerItem key={title}>
                <div className="card flat" style={{ height: '100%', display: 'grid', gap: 6, alignContent: 'start' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>{title}</h3>
                  <p className="muted" style={{ margin: 0, fontSize: '.9rem' }}>{body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal delay={0.08}>
            <div className="actions">
              <Link href="/services" className="button primary">
                Services &amp; prices <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/work" className="button ghost">
                See the work <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="shell">
          <Reveal>
            <div className="cta-block">
              <div>
                <span className="eyebrow">Work with the studio</span>
                <h2>
                  Need the studio, the training, <em>or both?</em>
                </h2>
                <p>
                  For client work, the studio runs through KR8 DIGITALS. For training, Academy applications open with
                  each cohort. Either way, start here.
                </p>
                <div className="actions">
                  <Link href="/contact" className="button primary">
                    Start a conversation <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                  <a href="https://academy.kr8digitals.com" className="button ghost" target="_blank" rel="noopener noreferrer">
                    <Sparkles size={15} aria-hidden="true" /> KR8 Academy
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="shell">
        <Related links={[['/work', 'Work'], ['/about', 'About'], ['/timeline', 'Timeline']]} />
      </div>
    </main>
  );
}
