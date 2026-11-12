import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Award, GraduationCap, Code2, Bot, Music, BookOpen } from 'lucide-react';
import { getContent } from '@/lib/cms/store';
import { Related, CTABlock } from '@/components/site/ui';
import { Reveal, Stagger, StaggerItem } from '@/components/site/motion';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About — Kenneth Timothy Iziogo',
  description:
    'The person behind TIMFIRE: Kenneth Timothy Iziogo — website and AI agent developer, founder of KR8 DIGITALS, Linguistics student at Ebonyi State University, from Abakaliki, Nigeria.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About TIMFIRE — Kenneth Timothy Iziogo',
    description: 'Website and AI agent developer. Founder of KR8 DIGITALS. Linguistics student.',
    images: ['/images/about/about-hero.webp'],
  },
};

export default async function AboutPage() {
  const content = await getContent();
  const credentials = content.credentials.filter((c) => c.isPublic);
  const timeline = content.timeline.filter((t) => t.isPublic).slice(-4);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        url: `${SITE_URL}/about`,
        mainEntity: { '@id': `${SITE_URL}/#person` },
      },
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#person`,
        name: 'Kenneth Timothy Iziogo',
        alternateName: ['TIMFIRE', 'Timfire'],
        url: SITE_URL,
        jobTitle: ['Website developer', 'AI agent developer', 'Founder of KR8 DIGITALS'],
        description:
          'Website and AI agent developer from Abakaliki, Ebonyi State, Nigeria. Founder of KR8 DIGITALS and a Linguistics student at Ebonyi State University.',
        alumniOf: [
          { '@type': 'CollegeOrUniversity', name: 'Ebonyi State University' },
          { '@type': 'EducationalOrganization', name: 'Nnodo Secondary School' },
        ],
        knowsAbout: ['Web development', 'AI agents', 'Branding', 'Linguistics', 'Poetry', 'Piano'],
        address: { '@type': 'PostalAddress', addressLocality: 'Abakaliki', addressRegion: 'Ebonyi State', addressCountry: 'NG' },
        email: 'hi@kutimfire.com',
        award: credentials.map((c) => c.title),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'About', item: `${SITE_URL}/about` },
        ],
      },
    ],
  };

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="page-hero">
        <span className="hero-art-line" aria-hidden="true" />
        <div className="shell two-col wide-right" style={{ alignItems: 'center', gap: 'clamp(28px,5vw,70px)' }}>
          <Reveal>
            <div className="photo-card" style={{ maxHeight: 640 }}>
              <Image
                src="/images/about/about-hero.webp"
                alt="TIMFIRE smiling in a burnt-orange jacket"
                width={1200}
                height={1400}
                priority
                sizes="(max-width: 860px) 92vw, 44vw"
                style={{ maxHeight: 640, objectFit: 'cover', objectPosition: 'center 20%' }}
              />
            </div>
          </Reveal>
          <div>
            <Reveal>
              <span className="eyebrow">The person</span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 style={{ fontSize: 'clamp(2.4rem,5vw,4.4rem)', margin: '14px 0 20px' }}>
                Kenneth Timothy Iziogo. <em>Everyone calls me Timfire.</em>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="page-lead">
                I build websites and AI agents from Abakaliki, in Ebonyi State, Nigeria. I run a studio called KR8
                DIGITALS. I study Linguistics. I write poems and play piano badly enough to keep practising.
              </p>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="cluster" style={{ marginTop: 26, gap: 8 }}>
                <span className="badge orange">
                  <Code2 size={13} aria-hidden="true" /> Website developer
                </span>
                <span className="badge outline">
                  <Bot size={13} aria-hidden="true" /> AI agent developer
                </span>
                <span className="badge outline">
                  <GraduationCap size={13} aria-hidden="true" /> Linguistics, EBSU
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section">
        <div className="shell two-col" style={{ alignItems: 'start', gap: 'clamp(28px,5vw,80px)' }}>
          <Reveal>
            <div style={{ position: 'sticky', top: 100 }}>
              <span className="eyebrow">The story</span>
              <h2 style={{ margin: '14px 0 0' }}>
                Not a straight <em>line.</em>
              </h2>
            </div>
          </Reveal>
          <div>
            <Reveal>
              <p className="lede" style={{ color: 'var(--paper)' }}>
                I started building websites in 2023. Not because it was the plan, but because it was the thing I could
                not stop doing once I understood it was possible.
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="muted">
                I finished secondary school at Nnodo in 2024. In 2023 I had been a finalist in the Coal City University
                essay competition on drug abuse — an early sign that writing was going to matter as much as the code.
                In 2025 I completed a thirty-day Consistency Drill with David Ochulade, hosted by Chichi Chukwuka. A
                certificate for showing up, thirty days in a row. I keep it because the habit mattered more than the
                paper.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="muted">
                I founded KR8 DIGITALS because I kept meeting people who wanted to learn this work and could not
                afford the entry. The studio is the answer I could actually build: client work pays for free cohorts,
                and the cohorts produce people who get hired. That model is the most useful thing I have made so far.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="muted">
                In 2026 I sat the JAMB UTME and was admitted to study Linguistics at Ebonyi State University. People
                ask why. The honest answer is that I build things out of language — copy, arguments, instructions,
                poems — and I wanted to understand it properly rather than by instinct.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="muted">
                Everything else on this site is downstream of those four things: building websites, building agents,
                running a studio that teaches, and studying the language that makes all of it work.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* What I actually do */}
      <section className="section section-ruled">
        <div className="shell">
          <Reveal>
            <div className="sectionhead stackhead">
              <span className="eyebrow">In practice</span>
              <h2>
                Four things, <em>most days.</em>
              </h2>
            </div>
          </Reveal>
          <Stagger className="page-grid four" gap={0.05}>
            {[
              { icon: Code2, title: 'Building websites', body: 'Custom, mobile-first sites for businesses and institutions. Fast, clear, and built around an outcome.' },
              { icon: Bot, title: 'Building AI agents', body: 'Domain-grounded assistants that answer from approved content and hand over to a human when it matters.' },
              { icon: GraduationCap, title: 'Running KR8 DIGITALS', body: 'Client work, plus free eight-week cohorts through KR8 Academy and the KR8 Tribe community.' },
              { icon: BookOpen, title: 'Studying Linguistics', body: 'First year at Ebonyi State University. The study of how language actually works, which turns out to be most of the job.' },
            ].map((item) => (
              <StaggerItem key={item.title}>
                <div className="card flat" style={{ height: '100%', display: 'grid', gap: 10, alignContent: 'start' }}>
                  <span
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: '#f27a1a1a',
                      color: 'var(--orange)',
                      display: 'grid',
                      placeItems: 'center',
                      border: '1px solid #f27a1a33',
                    }}
                  >
                    <item.icon size={19} aria-hidden="true" />
                  </span>
                  <h3 style={{ margin: 0, fontSize: '1.02rem' }}>{item.title}</h3>
                  <p className="muted" style={{ margin: 0, fontSize: '.9rem' }}>{item.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Beyond */}
      <section className="section section-ruled">
        <div className="shell two-col" style={{ alignItems: 'center', gap: 'clamp(24px,5vw,64px)' }}>
          <Reveal>
            <div className="photo-card" style={{ maxHeight: 560 }}>
              <Image
                src="/images/about/traditional.webp"
                alt="TIMFIRE in white traditional Igbo attire with coral beads"
                width={1000}
                height={1400}
                sizes="(max-width: 860px) 92vw, 44vw"
                style={{ maxHeight: 560, objectFit: 'cover', objectPosition: 'center 20%' }}
              />
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div>
              <span className="eyebrow">Beyond technology</span>
              <h2 style={{ margin: '14px 0 18px' }}>
                Poetry, piano and <em>a lot of church.</em>
              </h2>
              <p className="muted">
                I write poems. Some are finished. Some live in a notebook and should probably stay there. The ones I am
                willing to publish are on the{' '}
                <Link href="/creative" style={{ color: 'var(--orange)' }}>
                  creative page
                </Link>
                .
              </p>
              <p className="muted">
                I play piano — not to performance standard, but well enough that it is a real part of my life rather
                than a hobby I mention. The neon MUSIC sign in one of the portraits was not chosen at random.
              </p>
              <p className="muted">
                And church. Most of the confidence I have now came from there before there was any work to be confident
                about. Several of the photographs in the{' '}
                <Link href="/gallery" style={{ color: 'var(--orange)' }}>
                  gallery
                </Link>{' '}
                are from that part of life.
              </p>
              <div className="cluster" style={{ gap: 8, marginTop: 6 }}>
                <span className="badge outline">
                  <Music size={12} aria-hidden="true" /> Piano
                </span>
                <span className="badge outline">Poetry</span>
                <span className="badge outline">Spoken word</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Credentials — verified only */}
      {credentials.length > 0 && (
        <section className="section section-ruled">
          <div className="shell">
            <Reveal>
              <div className="sectionhead stackhead">
                <span className="eyebrow">Credentials</span>
                <h2>
                  Papers I can <em>actually show.</em>
                </h2>
                <p>Only things with a document behind them. No invented awards.</p>
              </div>
            </Reveal>
            <div className="stack">
              {credentials.map((credential) => (
                <Reveal key={credential.id}>
                  <article className="card" style={{ display: 'grid', gridTemplateColumns: credential.image ? 'minmax(0,.8fr) minmax(0,1.2fr)' : '1fr', gap: 'clamp(20px,3vw,36px)', alignItems: 'center' }}>
                    {credential.image && (
                      <div style={{ borderRadius: 14, overflow: 'hidden', background: '#fff' }}>
                        <Image
                          src={credential.image}
                          alt={`${credential.title} certificate awarded to Kenneth Timothy Iziogo`}
                          width={1000}
                          height={760}
                          sizes="(max-width: 860px) 92vw, 36vw"
                          style={{ width: '100%', height: 'auto', maxHeight: 380, objectFit: 'contain' }}
                        />
                      </div>
                    )}
                    <div>
                      <span className="badge orange" style={{ marginBottom: 12 }}>
                        <Award size={13} aria-hidden="true" /> Certificate
                      </span>
                      <h3 style={{ fontSize: 'clamp(1.3rem,2.3vw,1.7rem)', margin: '4px 0 10px' }}>{credential.title}</h3>
                      <p className="muted" style={{ marginBottom: 8 }}>{credential.description}</p>
                      <p className="small" style={{ color: 'var(--muted-2)', margin: 0 }}>
                        {credential.issuer} · {credential.date}
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent timeline */}
      <section className="section section-ruled">
        <div className="shell two-col" style={{ alignItems: 'start', gap: 'clamp(28px,5vw,72px)' }}>
          <Reveal>
            <div>
              <span className="eyebrow">The road so far</span>
              <h2 style={{ margin: '14px 0 16px' }}>
                A short <em>timeline.</em>
              </h2>
              <p className="muted">
                Not every year has a milestone. These are the ones that actually changed something.
              </p>
              <div className="actions">
                <Link href="/timeline" className="text-link">
                  The full timeline <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
                <Link href="/now" className="text-link">
                  What I am doing now <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </Reveal>
          <div className="timeline">
            {timeline.map((item) => (
              <div className="timeline-item" key={item.id}>
                <time>{item.year}</time>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABlock
        eyebrow="Work with me"
        title="If any of that"
        accent="is relevant."
        lead="Most people arrive here because they need a website or an agent. Some arrive because they want to learn. Both are fine — start with a message."
        primary={{ href: '/contact', label: 'Send a message' }}
        secondary={{ href: '/ventures', label: 'About KR8 DIGITALS' }}
      />

      <div className="shell">
        <Related links={[['/work', 'Work'], ['/timeline', 'Timeline'], ['/gallery', 'Gallery']]} />
      </div>
    </main>
  );
}
