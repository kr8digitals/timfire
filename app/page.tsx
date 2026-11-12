import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowDown,
  Code2,
  Bot,
  Search,
  PenTool,
  Sparkles,
  Clapperboard,
  GraduationCap,
  RotateCw,
  Quote,
  MapPin,
} from 'lucide-react';
import { getContent } from '@/lib/cms/store';
import { isLive, formatDate } from '@/lib/cms/types';
import { ENABLED_SERVICES } from '@/lib/services';
import { Reveal, HeroItem, HeroBackdrop, Stagger, StaggerItem } from '@/components/site/motion';
import { CurrencyProvider, PriceTag } from '@/components/site/currency';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  title: 'TIMFIRE — websites & AI agents, built to work',
  description:
    'I build websites and AI agents for people who need them to actually work: fast, clear, and built around a single outcome. Founder of KR8 DIGITALS, Abakaliki, Nigeria.',
};

const ICONS = {
  code: Code2,
  refresh: RotateCw,
  search: Search,
  bot: Bot,
  trending: Sparkles,
  pen: PenTool,
  sparkles: Sparkles,
  video: Clapperboard,
  graduation: GraduationCap,
} as const;

/* ── Section 1: Hero ─────────────────────────────────────────────────────── */

function Hero({ settings }: { settings: Awaited<ReturnType<typeof getContent>>['settings'] }) {
  return (
    <section className="hero">
      <HeroBackdrop />
      <div className="shell hero-inner">
        <div className="hero-copy">
          <HeroItem delay={0.05}>
            <span className="hero-welcome">{settings.heroWelcome}</span>
          </HeroItem>
          <HeroItem delay={0.18}>
            <h1>{settings.heroLine}</h1>
          </HeroItem>
          <HeroItem delay={0.34}>
            <p className="hero-name">{settings.heroName}</p>
          </HeroItem>
          <HeroItem delay={0.5}>
            <p className="hero-lead">
              I design and build websites and AI agents for people who need them to actually work — fast on a
              mid-range phone, clear on the first screen, and built around the one thing a visitor should do next.
            </p>
          </HeroItem>
          <HeroItem delay={0.62}>
            <div className="actions">
              <Link href="/work" className="button primary">
                See the work <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
              <Link href="/contact" className="button ghost">
                Start a project <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </HeroItem>
          <HeroItem delay={0.74}>
            <p className="small" style={{ color: 'var(--muted-2)', marginTop: 22, display: 'flex', alignItems: 'center', gap: 7 }}>
              <MapPin size={14} aria-hidden="true" /> {settings.base} · working with anyone, anywhere
            </p>
          </HeroItem>
        </div>

        <div className="hero-art">
          <Image
            src="/images/hero.webp"
            alt="TIMFIRE — Kenneth Timothy Iziogo — smiling in a burnt-orange jacket"
            width={1200}
            height={1173}
            priority
            fetchPriority="high"
            sizes="(max-width: 860px) 96vw, 46vw"
            className="hero-portrait"
          />
        </div>

        <a className="scroll-cue" href="#behind">
          <ArrowDown size={15} className="scroll-cue-icon" aria-hidden="true" /> Scroll to explore
        </a>
      </div>
    </section>
  );
}

/* ── Section 2: Behind the work ──────────────────────────────────────────── */

function Behind() {
  return (
    <section id="behind" className="section">
      <div className="shell two-col wide-right">
        <Reveal>
          <div className="photo-card" style={{ maxHeight: 620 }}>
            <Image
              src="/images/about/street-walk.webp"
              alt="TIMFIRE walking a tree-lined street in a light blue t-shirt"
              width={950}
              height={1300}
              sizes="(max-width: 860px) 92vw, 40vw"
              style={{ maxHeight: 620, objectFit: 'cover', objectPosition: 'center 25%' }}
            />
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="copy-panel">
            <span className="eyebrow">Behind the work</span>
            <h2>
              One person, <em>several disciplines.</em>
            </h2>
            <p className="lede">
              My name is Kenneth Timothy Iziogo. Most people know me as TIMFIRE. I am from Abakaliki, I study
              Linguistics at Ebonyi State University, and I build websites and AI agents for a living.
            </p>
            <p>
              The two things look unrelated until you notice they are both about being understood. Linguistics is how
              people actually use language — which is most of what good website copy is. Web development is how
              anything reaches a person at all.
            </p>
            <p>
              I started building websites in 2023. I founded KR8 DIGITALS, an agency that funds free digital-skills
              training, because the biggest barrier to learning this work where I am from is not talent. It is access.
            </p>
            <div className="role-list">
              <span className="badge">
                <Code2 size={14} aria-hidden="true" /> Website developer
              </span>
              <span className="badge">
                <Bot size={14} aria-hidden="true" /> AI agent developer
              </span>
              <span className="badge">
                <GraduationCap size={14} aria-hidden="true" /> Founder, KR8 DIGITALS
              </span>
            </div>
            <div className="actions">
              <Link href="/about" className="text-link">
                More about me <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
              <Link href="/timeline" className="text-link">
                The timeline <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Section 3: What I build ─────────────────────────────────────────────── */

function WhatIBuild({
  projects,
}: {
  projects: Awaited<ReturnType<typeof getContent>>['projects'];
}) {
  const featured = projects.filter((p) => p.isPublic).slice(0, 4);
  return (
    <section className="section section-ruled">
      <div className="shell">
        <Reveal>
          <div className="sectionhead">
            <div className="inner">
              <span className="eyebrow">What I build</span>
              <h2>
                Things that had to <em>work properly.</em>
              </h2>
            </div>
            <p>
              Live websites, redesigns and AI agents — each one built for a specific outcome rather than to exist.
            </p>
          </div>
        </Reveal>

        <Stagger className="page-grid">
          {featured.map((project) => (
            <StaggerItem key={project.id}>
              <Link href={`/work#${project.slug}`} className="card hoverable" style={{ display: 'grid', gap: 14, height: '100%', alignContent: 'start' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <span className="badge outline">{project.kind}</span>
                  <span className={`badge ${project.status === 'Live' ? 'live' : 'outline'}`}>{project.status}</span>
                </div>
                <h3 style={{ margin: 0 }}>{project.name}</h3>
                <p className="muted" style={{ margin: 0 }}>
                  {project.summary}
                </p>
                <span className="text-link" style={{ marginTop: 4 }}>
                  Look closer <ArrowUpRight size={15} aria-hidden="true" />
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.1}>
          <div className="actions">
            <Link href="/work" className="button ghost">
              All the work <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Section 4: How I can help ───────────────────────────────────────────── */

function HowIHelp() {
  const shown = ENABLED_SERVICES.slice(0, 6);
  return (
    <section className="section section-ruled">
      <div className="shell">
        <Reveal>
          <div className="sectionhead">
            <div className="inner">
              <span className="eyebrow">How I can help</span>
              <h2>
                Pick the one you <em>actually need.</em>
              </h2>
            </div>
            <p>
              Each service has its own page, its own scope and its own enquiry form — so you never have to explain
              what you want twice.
            </p>
          </div>
        </Reveal>

        <Stagger className="page-grid three">
          {shown.map((service) => {
            const Icon = ICONS[service.icon];
            return (
              <StaggerItem key={service.key}>
                <Link
                  href={`/services/${service.key}`}
                  className="card hoverable"
                  style={{ display: 'grid', gap: 12, height: '100%', alignContent: 'start' }}
                >
                  <span className="icon-badge" style={{ width: 46, height: 46, borderRadius: 14, background: '#f27a1a1a', color: 'var(--orange)', display: 'grid', placeItems: 'center', border: '1px solid #f27a1a33' }}>
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{service.name}</h3>
                  <p className="muted" style={{ margin: 0, fontSize: '.94rem' }}>
                    {service.summary}
                  </p>
                  <span className="text-link" style={{ marginTop: 'auto', paddingTop: 8 }}>
                    Details &amp; pricing <ArrowUpRight size={15} aria-hidden="true" />
                  </span>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>

        <Reveal delay={0.08}>
          <div className="actions">
            <Link href="/services" className="text-link">
              Every service, with prices <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Section 5: Beyond technology ────────────────────────────────────────── */

function Beyond() {
  return (
    <section className="section section-ruled">
      <div className="shell">
        <Reveal>
          <div className="sectionhead stackhead">
            <span className="eyebrow">Beyond technology</span>
            <h2>
              Not only screens, <em>as it turns out.</em>
            </h2>
            <p>
              The technical work pays for the rest of it. Poetry, spoken word, piano, and the long project of learning
              how language works.
            </p>
          </div>
        </Reveal>

        <div className="two-col" style={{ alignItems: 'stretch' }}>
          <Reveal>
            <Link href="/creative" className="photo-card" style={{ display: 'block', height: '100%', minHeight: 380 }}>
              <Image
                src="/images/creative/music-neon.webp"
                alt="A keyboard and studio monitors beneath a neon MUSIC sign"
                width={1300}
                height={1400}
                sizes="(max-width: 860px) 92vw, 46vw"
                style={{ height: '100%', minHeight: 380, objectFit: 'cover' }}
              />
              <figcaption>
                <strong style={{ fontFamily: 'var(--font-display)' }}>Music &amp; piano</strong>
                <span style={{ display: 'block', opacity: 0.85 }}>The oldest habit of the three.</span>
              </figcaption>
            </Link>
          </Reveal>

          <div className="stack">
            <Reveal delay={0.06}>
              <Link href="/creative" className="card hoverable" style={{ display: 'block' }}>
                <span className="eyebrow plain" style={{ fontSize: '.7rem' }}>Poetry</span>
                <h3 style={{ marginTop: 8 }}>Words arranged until they land</h3>
                <p className="muted" style={{ marginBottom: 0 }}>
                  Written first for the page, then sometimes for a stage. Published here as they are ready, drafts
                  included.
                </p>
              </Link>
            </Reveal>
            <Reveal delay={0.12}>
              <Link href="/gallery" className="card hoverable" style={{ display: 'block' }}>
                <span className="eyebrow plain" style={{ fontSize: '.7rem' }}>Photography</span>
                <h3 style={{ marginTop: 8 }}>The gallery</h3>
                <p className="muted" style={{ marginBottom: 0 }}>
                  Studio portraits, street frames, church, culture — every photograph from the archive that holds up.
                </p>
              </Link>
            </Reveal>
            <Reveal delay={0.18}>
              <Link href="/about" className="card hoverable" style={{ display: 'block' }}>
                <span className="eyebrow plain" style={{ fontSize: '.7rem' }}>Linguistics</span>
                <h3 style={{ marginTop: 8 }}>Studying how language works</h3>
                <p className="muted" style={{ marginBottom: 0 }}>
                  First year at Ebonyi State University. Turns out it is unusually useful for writing website copy.
                </p>
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Section 6: Ventures ─────────────────────────────────────────────────── */

function Ventures({
  ventures,
}: {
  ventures: Awaited<ReturnType<typeof getContent>>['ventures'];
}) {
  const live = ventures.filter((v) => v.isPublic);
  return (
    <section className="section section-ruled">
      <div className="shell">
        <div className="two-col wide-left">
          <Reveal>
            <div className="copy-panel">
              <span className="eyebrow">Ventures</span>
              <h2>
                KR8 DIGITALS, and what it <em>pays for.</em>
              </h2>
              <p className="lede">
                I founded KR8 DIGITALS in 2024. It is a studio — websites, branding, design, video, SEO and AI agents
                — and it exists for a reason beyond the invoices.
              </p>
              <p>
                The studio funds KR8 Academy: free, eight-week digital-skills cohorts with a verifiable KR8 ID at the
                end. The graduates join the KR8 Tribe, a community of over three thousand creators. Nobody pays
                tuition. The client work pays for it.
              </p>
              <div className="actions">
                <Link href="/ventures" className="button primary">
                  Inside KR8 <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
                <a href="https://kr8digitals.com" className="button ghost" target="_blank" rel="noopener noreferrer">
                  kr8digitals.com <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="photo-card" style={{ maxHeight: 600 }}>
              <Image
                src="/images/ventures/kr8-founder.webp"
                alt="TIMFIRE, founder of KR8 DIGITALS, seated in a brown suit"
                width={1000}
                height={1400}
                sizes="(max-width: 860px) 92vw, 42vw"
                style={{ maxHeight: 600, objectFit: 'cover', objectPosition: 'center 15%' }}
              />
            </div>
          </Reveal>
        </div>

        <Stagger className="page-grid three" gap={0.09}>
          {live.map((venture) => (
            <StaggerItem key={venture.id}>
              <div className="card flat" style={{ height: '100%', display: 'grid', gap: 10, alignContent: 'start' }}>
                <h3 style={{ margin: 0, fontSize: '1.06rem' }}>{venture.name}</h3>
                <p className="muted" style={{ margin: 0, fontSize: '.92rem' }}>
                  {venture.tagline}
                </p>
                {venture.url && (
                  <a href={venture.url} className="text-link" target="_blank" rel="noopener noreferrer" style={{ marginTop: 'auto' }}>
                    Visit <ArrowUpRight size={15} aria-hidden="true" />
                  </a>
                )}
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ── Section 8: Let's make something real ────────────────────────────────── */

function FinalCTA({
  posts,
}: {
  posts: Awaited<ReturnType<typeof getContent>>['posts'];
}) {
  const latest = posts.filter(isLive).slice(0, 2);
  return (
    <>
      {latest.length > 0 && (
        <section className="section section-ruled">
          <div className="shell">
            <Reveal>
              <div className="sectionhead">
                <div className="inner">
                  <span className="eyebrow">From the journal</span>
                  <h2>
                    Thinking <em>out loud.</em>
                  </h2>
                </div>
                <p>Process notes on building websites and AI agents, and on the teaching that runs alongside both.</p>
              </div>
            </Reveal>
            <Stagger className="page-grid">
              {latest.map((post) => (
                <StaggerItem key={post.id}>
                  <Link href={`/journal/${post.slug}`} className="card hoverable post-card">
                    <span className="badge outline" style={{ justifySelf: 'start' }}>{post.category}</span>
                    <h3>{post.title}</h3>
                    <p className="muted" style={{ margin: 0, fontSize: '.95rem' }}>{post.summary}</p>
                    <span className="post-card meta" style={{ marginTop: 8, color: 'var(--muted-2)', fontSize: '.78rem', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                      {formatDate(post.publishedAt, 'short')} · {post.readingMinutes} min read
                    </span>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      <section className="section" style={{ paddingBottom: 'var(--s7)' }}>
        <div className="shell">
          <Reveal>
            <div className="cta-block">
              <div>
                <span className="eyebrow">Let&apos;s make something real</span>
                <h2>
                  Tell me what you are <em>trying to build.</em>
                </h2>
                <p>
                  Every conversation starts the same way: you describe the thing, I tell you honestly whether I am
                  the right person to build it, and roughly what it would take.
                </p>
                <div className="actions">
                  <Link href="/contact" className="button primary">
                    Start a project <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                  <a
                    href="https://wa.me/2348166552758?text=Hi%20Timfire%20%E2%80%94%20I%27d%20like%20to%20talk%20about%20a%20project."
                    className="button ghost"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp instead <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                </div>
              </div>
              <div className="card flat" style={{ maxWidth: 320, background: '#ffffff08' }}>
                <Quote size={20} aria-hidden="true" style={{ color: 'var(--orange)', marginBottom: 10 }} />
                <p style={{ margin: 0, fontFamily: 'var(--font-editorial), Georgia, serif', fontSize: '1.05rem', color: 'var(--paper)' }}>
                  &ldquo;Whoever you are, whatever you do, we exist because of you.&rdquo;
                </p>
                <p className="small" style={{ color: 'var(--muted-2)', margin: '10px 0 0' }}>
                  The line KR8 DIGITALS has run on since it started.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export default async function HomePage() {
  const content = await getContent();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#person`,
        name: 'Kenneth Timothy Iziogo',
        alternateName: 'TIMFIRE',
        url: SITE_URL,
        jobTitle: 'Website and AI agent developer',
        image: `${SITE_URL}/images/hero.webp`,
        email: 'hi@kutimfire.com',
        address: { '@type': 'PostalAddress', addressLocality: 'Abakaliki', addressRegion: 'Ebonyi State', addressCountry: 'NG' },
        alumniOf: { '@type': 'CollegeOrUniversity', name: 'Ebonyi State University' },
        worksFor: { '@type': 'Organization', name: 'KR8 DIGITALS', url: 'https://kr8digitals.com' },
        sameAs: content.settings.socials.filter((s) => s.isPublic && s.url).map((s) => s.url),
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'TIMFIRE',
        publisher: { '@id': `${SITE_URL}/#person` },
        inLanguage: 'en-NG',
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/gallery?photo={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <CurrencyProvider rates={content.settings.rates}>
      <main id="main">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Hero settings={content.settings} />
        <Behind />
        <WhatIBuild projects={content.projects} />
        <HowIHelp />
        <Beyond />
        <Ventures ventures={content.ventures} />
        <FinalCTA posts={content.posts} />
      </main>
    </CurrencyProvider>
  );
}
