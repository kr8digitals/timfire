import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getContent } from '@/lib/cms/store';
import { PageHero, Related, CTABlock } from '@/components/site/ui';
import { Reveal } from '@/components/site/motion';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Timeline — the road so far',
  description:
    'Nnodo Secondary School, the Coal City University essay competition, founding KR8 DIGITALS, the 30 Days Consistency Drill, JAMB and admission to Ebonyi State University.',
  alternates: { canonical: '/timeline' },
};

const KIND_LABEL = {
  milestone: 'Milestone',
  learning: 'Learning',
  recognition: 'Recognition',
  building: 'Building',
} as const;

export default async function TimelinePage() {
  const content = await getContent();
  const items = content.timeline
    .filter((t) => t.isPublic)
    .slice()
    .sort((a, b) => Number(a.year) - Number(b.year));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Timeline', item: `${SITE_URL}/timeline` },
    ],
  };

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageHero
        eyebrow="The journey"
        title="One chapter"
        accent="at a time."
        lead="Secondary school, a national essay competition, a studio founded from a bedroom, a thirty-day drill, and a university admission. In that order, roughly."
      />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          <div className="timeline" style={{ maxWidth: 820 }}>
            {items.map((item, index) => (
              <Reveal key={item.id} delay={Math.min(index * 0.04, 0.2)}>
                <div className="timeline-item">
                  <time>{item.year}</time>
                  <h2>
                    {item.title}{' '}
                    <span className="badge outline" style={{ fontSize: '.66rem', verticalAlign: 'middle', marginLeft: 6 }}>
                      {KIND_LABEL[item.kind]}
                    </span>
                  </h2>
                  <p>{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="card flat" style={{ marginTop: 44, maxWidth: 820 }}>
              <span className="kicker">A note on dates</span>
              <p className="muted" style={{ margin: '8px 0 0' }}>
                Where a date is uncertain, this timeline says so rather than guessing. Nothing is added here to make
                the story look more impressive than it is — the years with nothing in them are simply not listed.
              </p>
              <div className="actions">
                <Link href="/about" className="text-link">
                  More about me <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
                <Link href="/now" className="text-link">
                  What I am doing now <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <CTABlock
        eyebrow="Coming next"
        title="The next entry is"
        accent="being written."
        lead="This page is updated when something real happens — not on a schedule."
        primary={{ href: '/now', label: 'What I am doing now' }}
        secondary={{ href: '/work', label: 'See the work' }}
      />

      <div className="shell">
        <Related links={[['/about', 'About'], ['/ventures', 'Ventures'], ['/contact', 'Contact']]} />
      </div>
    </main>
  );
}
