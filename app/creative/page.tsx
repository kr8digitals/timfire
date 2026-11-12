import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Music, Mic, PenLine } from 'lucide-react';
import { getContent } from '@/lib/cms/store';
import { isLive, formatDate } from '@/lib/cms/types';
import { firstSentence } from '@/lib/markdown';
import { PageHero, Related, CTABlock, SectionHead } from '@/components/site/ui';
import { Reveal, Stagger, StaggerItem } from '@/components/site/motion';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Creative — poetry, spoken word & piano',
  description:
    'Poems, spoken word and piano from TIMFIRE. Written for the page, sometimes for a stage — published as they are ready.',
  alternates: { canonical: '/creative' },
  openGraph: {
    title: 'Creative work | TIMFIRE',
    description: 'Poetry, spoken word and music.',
    images: ['/images/creative/poetry-candle.webp'],
  },
};

const CATEGORY_META = {
  Poetry: { icon: PenLine, blurb: 'Written first for the page. Some of it never leaves.' },
  'Spoken word': { icon: Mic, blurb: 'Written for breath and timing, meant to be heard.' },
  'Music & piano': { icon: Music, blurb: 'The oldest habit. Keys before keyboards.' },
} as const;

export default async function CreativePage() {
  const content = await getContent();
  const all = content.creative.filter(isLive);
  const byCategory = Object.keys(CATEGORY_META).map((category) => ({
    category: category as keyof typeof CATEGORY_META,
    items: all.filter((p) => p.category === category),
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: 'Creative work by TIMFIRE',
        url: `${SITE_URL}/creative`,
        description: 'Poetry, spoken word and music.',
        hasPart: all.map((piece) => ({
          '@type': 'CreativeWork',
          name: piece.title,
          url: `${SITE_URL}/creative/${piece.slug}`,
          genre: piece.category,
          creator: { '@type': 'Person', name: 'Kenneth Timothy Iziogo' },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Creative', item: `${SITE_URL}/creative` },
        ],
      },
    ],
  };

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageHero
        eyebrow="The other half"
        title="Words, sound"
        accent="and silence."
        lead="The technical work is one thing. This is the other: poems written by hand in a notebook, pieces timed for a stage, and the piano that came before any of it."
      >
        <div className="cluster" style={{ marginTop: 24 }}>
          {Object.entries(CATEGORY_META).map(([name]) => (
            <span className="badge outline" key={name}>
              {name}
            </span>
          ))}
        </div>
      </PageHero>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          <Reveal>
            <div className="frame" style={{ marginBottom: 'clamp(34px,5vw,60px)' }}>
              <Image
                src="/images/creative/writing-desk.webp"
                alt="TIMFIRE writing in a notebook on the floor of a library, by candlelight"
                width={1300}
                height={800}
                priority
                sizes="(max-width: 900px) 94vw, 1200px"
                style={{ width: '100%', maxHeight: 460, objectFit: 'cover', objectPosition: 'center 40%' }}
              />
            </div>
          </Reveal>

          {byCategory.map(({ category, items }) => {
            const meta = CATEGORY_META[category];
            const Icon = meta.icon;
            if (!items.length) {
              return (
                <div key={category} style={{ marginBottom: 46 }}>
                  <SectionHead title={category} lead={meta.blurb} />
                  <div className="empty">
                    <Icon size={22} aria-hidden="true" style={{ marginBottom: 10, color: 'var(--orange)' }} />
                    <p style={{ margin: 0 }}>
                      Nothing published in {category.toLowerCase()} yet. {meta.blurb} Work in progress — not padded
                      with placeholders.
                    </p>
                  </div>
                </div>
              );
            }
            return (
              <div key={category} style={{ marginBottom: 56 }}>
                <Reveal>
                  <div className="sectionhead">
                    <div className="inner">
                      <span className="eyebrow">
                        <Icon size={13} aria-hidden="true" /> {category}
                      </span>
                      <h2 style={{ fontSize: 'clamp(1.7rem,3vw,2.4rem)' }}>{meta.blurb}</h2>
                    </div>
                  </div>
                </Reveal>
                <Stagger className="page-grid three" gap={0.06}>
                  {items.map((piece) => (
                    <StaggerItem key={piece.id}>
                      <Link href={`/creative/${piece.slug}`} className="card hoverable" style={{ padding: 0, overflow: 'hidden', display: 'grid', alignContent: 'start', height: '100%' }}>
                        <Image
                          src={piece.cover}
                          alt={piece.coverAlt}
                          width={900}
                          height={620}
                          sizes="(max-width: 860px) 92vw, 30vw"
                          style={{ width: '100%', height: 210, objectFit: 'cover' }}
                        />
                        <div style={{ padding: '20px 22px 24px', display: 'grid', gap: 8 }}>
                          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{piece.title}</h3>
                          <p className="muted" style={{ margin: 0, fontSize: '.9rem' }}>
                            {piece.lede || firstSentence(piece.body)}
                          </p>
                          <span className="small" style={{ color: 'var(--muted-2)', fontSize: '.76rem', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                            {formatDate(piece.publishedAt, 'short')}
                          </span>
                        </div>
                      </Link>
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section section-ruled">
        <div className="shell two-col" style={{ alignItems: 'center', gap: 'clamp(24px,5vw,64px)' }}>
          <Reveal>
            <div className="photo-card" style={{ maxHeight: 480 }}>
              <Image
                src="/images/creative/music-studio.webp"
                alt="A keyboard and studio monitors beneath a neon MUSIC sign"
                width={1200}
                height={900}
                sizes="(max-width: 860px) 92vw, 44vw"
                style={{ maxHeight: 480, objectFit: 'cover' }}
              />
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div>
              <span className="eyebrow">Not a portfolio</span>
              <h2 style={{ margin: '14px 0 18px' }}>
                Published as it is <em>ready.</em>
              </h2>
              <p className="muted">
                This page grows slowly on purpose. A poem is not published here until it is finished, which for some of
                them means never. Nothing is added to make the page look fuller.
              </p>
              <p className="muted">
                If you want to know when something new appears, the{' '}
                <Link href="/journal" style={{ color: 'var(--orange)' }}>
                  journal
                </Link>{' '}
                is where the announcements go.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <CTABlock
        eyebrow="Something else entirely"
        title="Looking for the technical"
        accent="side?"
        lead="Websites, AI agents, branding and the rest all live under services — with prices you do not have to ask for."
        primary={{ href: '/services', label: 'Services & pricing' }}
        secondary={{ href: '/gallery', label: 'See the gallery' }}
      />

      <div className="shell">
        <Related links={[['/gallery', 'Gallery'], ['/journal', 'Journal'], ['/about', 'About']]} />
      </div>
    </main>
  );
}
