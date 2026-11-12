import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, ArrowLeft, Clock } from 'lucide-react';
import { getContent } from '@/lib/cms/store';
import { isLive, formatDate } from '@/lib/cms/types';
import { renderMarkdown } from '@/lib/markdown';
import { ReadingProgress } from '@/components/site/motion';
import ShareRow from '@/components/site/share';
import { Related } from '@/components/site/ui';
import { SITE_URL } from '@/lib/site';

export async function generateStaticParams() {
  const content = await getContent();
  return content.posts.filter(isLive).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContent();
  const post = content.posts.find((p) => p.slug === slug && isLive(p));
  if (!post) return { title: 'Article not found', robots: { index: false, follow: false } };
  return {
    title: post.title,
    description: post.summary,
    keywords: post.tags,
    alternates: { canonical: `/journal/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.summary,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: ['Kenneth Timothy Iziogo'],
      tags: post.tags,
      images: [{ url: post.cover, alt: post.coverAlt }],
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.summary, images: [post.cover] },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getContent();
  const post = content.posts.find((p) => p.slug === slug && isLive(p));
  if (!post) notFound();

  const related = content.posts
    .filter((p) => p.id !== post.id && isLive(p) && (p.category === post.category || p.tags.some((t) => post.tags.includes(t))))
    .slice(0, 2);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.summary,
        image: `${SITE_URL}${post.cover}`,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt || post.publishedAt,
        wordCount: post.body.trim().split(/\s+/).length,
        keywords: post.tags.join(', '),
        articleSection: post.category,
        inLanguage: 'en-NG',
        author: { '@type': 'Person', name: 'Kenneth Timothy Iziogo', alternateName: 'TIMFIRE', url: `${SITE_URL}/about` },
        publisher: { '@type': 'Person', name: 'Kenneth Timothy Iziogo', url: SITE_URL },
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/journal/${post.slug}` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Journal', item: `${SITE_URL}/journal` },
          { '@type': 'ListItem', position: 3, name: post.title, item: `${SITE_URL}/journal/${post.slug}` },
        ],
      },
    ],
  };

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ReadingProgress />

      <article>
        <header className="shell article-head">
          <Link href="/journal" className="text-link" style={{ marginBottom: 20 }}>
            <ArrowLeft size={15} aria-hidden="true" /> All writing
          </Link>
          <div className="cluster" style={{ gap: 8, marginBottom: 18 }}>
            <span className="badge orange">{post.category}</span>
            {post.tags.slice(0, 3).map((t) => (
              <Link key={t} href={`/journal?tag=${encodeURIComponent(t)}`} className="badge outline">
                {t}
              </Link>
            ))}
          </div>
          <h1 style={{ fontSize: 'clamp(2rem,4.4vw,3.6rem)', maxWidth: '22ch', margin: '0 0 20px' }}>{post.title}</h1>
          <p className="lede" style={{ marginBottom: 24 }}>{post.summary}</p>
          <div className="byline">
            <span>
              By <strong>Kenneth Timothy Iziogo</strong>
            </span>
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
              <Clock size={14} aria-hidden="true" /> {post.readingMinutes} min read
            </span>
          </div>
        </header>

        <div className="shell">
          <Image
            src={post.cover}
            alt={post.coverAlt}
            width={1600}
            height={900}
            priority
            sizes="(max-width: 900px) 94vw, 1200px"
            className="article-cover"
            style={{ width: '100%', maxHeight: 520, objectFit: 'cover' }}
          />
        </div>

        <div className="shell" style={{ marginTop: 'clamp(34px,5vw,64px)' }}>
          <div className="article-body">
            <div className="prose">{renderMarkdown(post.body)}</div>

            <aside className="article-aside">
              <div className="card flat">
                <h2>Written by</h2>
                <p style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', color: 'var(--paper)' }}>Kenneth Timothy Iziogo</p>
                <p className="muted" style={{ margin: 0, fontSize: '.88rem' }}>
                  Website and AI agent developer. Founder of KR8 DIGITALS. Studying Linguistics at Ebonyi State
                  University.
                </p>
                <Link href="/about" className="text-link" style={{ fontSize: '.88rem', marginTop: 10 }}>
                  About me <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              </div>

              {post.tags.length > 0 && (
                <div className="card flat">
                  <h2>Tags</h2>
                  <div>
                    {post.tags.map((t) => (
                      <Link key={t} href={`/journal?tag=${encodeURIComponent(t)}`} className="tag">
                        {t}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="card flat">
                <h2>Share</h2>
                <ShareRow title={post.title} path={`/journal/${post.slug}`} />
              </div>
            </aside>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="section section-ruled">
          <div className="shell">
            <h2 style={{ fontSize: 'clamp(1.4rem,2.4vw,1.9rem)', marginBottom: 20 }}>Keep reading</h2>
            <div className="page-grid">
              {related.map((item) => (
                <Link key={item.id} href={`/journal/${item.slug}`} className="card hoverable post-card">
                  <span className="badge outline" style={{ justifySelf: 'start' }}>{item.category}</span>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{item.title}</h3>
                  <p className="muted" style={{ margin: 0, fontSize: '.92rem' }}>{item.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="shell">
        <Related
          back={{ href: '/journal', label: 'All writing' }}
          links={[
            ['/services/website', 'Website development'],
            ['/services/ai', 'AI agents'],
            ['/contact', 'Start a project'],
          ]}
        />
      </div>
    </main>
  );
}
