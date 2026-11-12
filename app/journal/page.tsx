import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Rss } from 'lucide-react';
import { getContent } from '@/lib/cms/store';
import { isLive, formatDate } from '@/lib/cms/types';
import { PageHero, Related, CTABlock } from '@/components/site/ui';
import { Reveal, Stagger, StaggerItem } from '@/components/site/motion';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Journal — building websites, agents and a studio',
  description:
    'Notes on building websites that work, AI agents that do not invent things, and the free training that runs alongside both.',
  alternates: { canonical: '/journal' },
  openGraph: {
    title: 'Journal | TIMFIRE',
    description: 'Process notes on websites, AI agents and the teaching that runs alongside them.',
    images: ['/images/og.jpg'],
  },
};

type SearchParams = Promise<{ category?: string; tag?: string }>;

export default async function JournalPage({ searchParams }: { searchParams: SearchParams }) {
  const { category, tag } = await searchParams;
  const content = await getContent();
  const live = content.posts.filter(isLive).sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

  const catMap = live.reduce((map, post) => map.set(post.category, (map.get(post.category) || 0) + 1), new Map<string, number>());
  const tagMap = live.reduce((map, post) => {
    post.tags.forEach((t) => map.set(t, (map.get(t) || 0) + 1));
    return map;
  }, new Map<string, number>());
  const categories = Array.from(catMap.entries());
  const tags = Array.from(tagMap.entries());

  const filtered = live.filter((post) => {
    if (category && post.category !== category) return false;
    if (tag && !post.tags.includes(tag)) return false;
    return true;
  });

  const featured = !category && !tag ? filtered.find((p) => p.featured) : undefined;
  const rest = featured ? filtered.filter((p) => p.id !== featured.id) : filtered;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Blog',
        name: 'TIMFIRE Journal',
        url: `${SITE_URL}/journal`,
        description: 'Notes on building websites and AI agents, and on the free training that runs alongside them.',
        author: { '@type': 'Person', name: 'Kenneth Timothy Iziogo', alternateName: 'TIMFIRE' },
        blogPost: live.slice(0, 10).map((post) => ({
          '@type': 'BlogPosting',
          headline: post.title,
          url: `${SITE_URL}/journal/${post.slug}`,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt || post.publishedAt,
          author: { '@type': 'Person', name: 'Kenneth Timothy Iziogo' },
          description: post.summary,
          image: `${SITE_URL}${post.cover}`,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Journal', item: `${SITE_URL}/journal` },
        ],
      },
    ],
  };

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageHero
        eyebrow="The journal"
        title="Thinking,"
        accent="written down."
        lead="Process notes: what I check before agreeing to build a site, how an AI agent is kept from inventing things, and why the free training exists at all. Written when there is something worth saying."
      />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          {live.length === 0 ? (
            <div className="empty">
              <p style={{ margin: 0 }}>Nothing published yet. The first pieces are being written.</p>
            </div>
          ) : (
            <>
              {/* Filters */}
              <div className="cluster" style={{ gap: 8, marginBottom: 10 }} role="group" aria-label="Filter by category">
                <Link href="/journal" className={`tag${!category && !tag ? ' on' : ''}`} style={{ minHeight: 40, padding: '8px 16px' }}>
                  All {live.length}
                </Link>
                {categories.map(([name, count]) => (
                  <Link
                    key={name}
                    href={`/journal?category=${encodeURIComponent(name)}`}
                    className={`tag${category === name ? ' on' : ''}`}
                    style={{ minHeight: 40, padding: '8px 16px' }}
                  >
                    {name} {count}
                  </Link>
                ))}
              </div>

              {tags.length > 0 && (
                <div className="cluster" style={{ gap: 6, marginBottom: 26 }} role="group" aria-label="Filter by tag">
                  <span className="kicker" style={{ fontSize: '.7rem', marginRight: 4 }}>Tags</span>
                  {tags.map(([name, count]) => (
                    <Link
                      key={name}
                      href={`/journal?tag=${encodeURIComponent(name)}`}
                      className={`tag${tag === name ? ' on' : ''}`}
                      style={{ minHeight: 34, padding: '5px 12px', fontSize: '.78rem' }}
                    >
                      {name}
                      <span className="sr-only"> ({count} articles)</span>
                    </Link>
                  ))}
                </div>
              )}

              {(category || tag) && (
                <p className="small muted" style={{ marginBottom: 22 }}>
                  {filtered.length} {filtered.length === 1 ? 'article' : 'articles'}
                  {category ? ` in ${category}` : ''}
                  {tag ? ` tagged “${tag}”` : ''}.{' '}
                  <Link href="/journal" style={{ color: 'var(--orange)' }}>
                    Clear filter
                  </Link>
                </p>
              )}

              {filtered.length === 0 && (
                <div className="empty">
                  <p style={{ margin: 0 }}>
                    No articles match that yet. <Link href="/journal" style={{ color: 'var(--orange)' }}>See everything</Link>.
                  </p>
                </div>
              )}

              {/* Featured */}
              {featured && (
                <Reveal>
                  <Link
                    href={`/journal/${featured.slug}`}
                    className="card hoverable"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1fr)',
                      gap: 'clamp(20px,4vw,44px)',
                      alignItems: 'center',
                      marginBottom: 30,
                      padding: 'clamp(18px,2.6vw,26px)',
                    }}
                  >
                    <div style={{ borderRadius: 18, overflow: 'hidden' }}>
                      <Image
                        src={featured.cover}
                        alt={featured.coverAlt}
                        width={1200}
                        height={800}
                        sizes="(max-width: 860px) 92vw, 44vw"
                        priority
                        style={{ width: '100%', height: '100%', maxHeight: 340, objectFit: 'cover' }}
                      />
                    </div>
                    <div>
                      <div className="cluster" style={{ gap: 8, marginBottom: 12 }}>
                        <span className="badge orange">Featured</span>
                        <span className="badge outline">{featured.category}</span>
                      </div>
                      <h2 style={{ fontSize: 'clamp(1.5rem,2.8vw,2.1rem)', margin: '0 0 12px' }}>{featured.title}</h2>
                      <p className="muted" style={{ marginBottom: 16 }}>{featured.summary}</p>
                      <p className="small" style={{ color: 'var(--muted-2)', margin: 0, fontSize: '.8rem', letterSpacing: '.06em', textTransform: 'uppercase' }}>
                        {formatDate(featured.publishedAt, 'short')} · {featured.readingMinutes} min read
                      </p>
                    </div>
                  </Link>
                </Reveal>
              )}

              {/* Grid */}
              {rest.length > 0 && (
                <Stagger className="page-grid" gap={0.06}>
                  {rest.map((post) => (
                    <StaggerItem key={post.id}>
                      <article className="card hoverable post-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <Link href={`/journal/${post.slug}`} style={{ display: 'grid', gap: 0, height: '100%' }}>
                          <Image
                            src={post.cover}
                            alt={post.coverAlt}
                            width={1000}
                            height={625}
                            sizes="(max-width: 860px) 92vw, 45vw"
                            style={{ width: '100%', height: 220, objectFit: 'cover' }}
                          />
                          <div style={{ padding: '22px clamp(18px,2.4vw,26px) 26px', display: 'grid', gap: 10, alignContent: 'start' }}>
                            <div className="cluster" style={{ gap: 8 }}>
                              <span className="badge outline">{post.category}</span>
                              <span className="small" style={{ color: 'var(--muted-2)', fontSize: '.78rem' }}>
                                {post.readingMinutes} min read
                              </span>
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{post.title}</h3>
                            <p className="muted" style={{ margin: 0, fontSize: '.93rem' }}>{post.summary}</p>
                            <span className="small" style={{ color: 'var(--muted-2)', fontSize: '.78rem', letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 2 }}>
                              {formatDate(post.publishedAt, 'short')}
                            </span>
                          </div>
                        </Link>
                      </article>
                    </StaggerItem>
                  ))}
                </Stagger>
              )}

              <div className="actions" style={{ marginTop: 30 }}>
                <a href="/feed.xml" className="button ghost small">
                  <Rss size={15} aria-hidden="true" /> RSS feed
                </a>
                <Link href="/creative" className="text-link">
                  Creative work <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <CTABlock
        eyebrow="More than writing"
        title="The work the notes"
        accent="come from."
        lead="These pieces are written from live projects, not theory. If you want the same thinking applied to something you are building, start here."
        primary={{ href: '/work', label: 'See the work' }}
        secondary={{ href: '/services', label: 'Services & pricing' }}
      />

      <div className="shell">
        <Related links={[['/creative', 'Creative'], ['/about', 'About'], ['/contact', 'Contact']]} />
      </div>
    </main>
  );
}
