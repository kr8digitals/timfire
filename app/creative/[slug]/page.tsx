import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { getContent } from '@/lib/cms/store';
import { isLive, formatDate } from '@/lib/cms/types';
import { renderMarkdown } from '@/lib/markdown';
import { safeUrl } from '@/lib/safe';
import { Related } from '@/components/site/ui';
import ShareRow from '@/components/site/share';
import { SITE_URL } from '@/lib/site';

export async function generateStaticParams() {
  const content = await getContent();
  return content.creative.filter(isLive).map((piece) => ({ slug: piece.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContent();
  const piece = content.creative.find((p) => p.slug === slug && isLive(p));
  if (!piece) return { title: 'Piece not found', robots: { index: false, follow: false } };
  return {
    title: `${piece.title} — ${piece.category}`,
    description: piece.lede,
    alternates: { canonical: `/creative/${piece.slug}` },
    openGraph: { type: 'article', title: piece.title, description: piece.lede, images: [{ url: piece.cover }] },
  };
}

export default async function PiecePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getContent();
  const piece = content.creative.find((p) => p.slug === slug && isLive(p));
  if (!piece) notFound();

  const media = safeUrl(piece.mediaUrl);
  const captions = safeUrl(piece.captionUrl);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: piece.title,
    genre: piece.category,
    abstract: piece.lede,
    text: piece.body,
    datePublished: piece.publishedAt,
    creator: { '@type': 'Person', name: 'Kenneth Timothy Iziogo', url: SITE_URL },
    image: `${SITE_URL}${piece.cover}`,
    ...(media ? { associatedMedia: { '@type': 'MediaObject', contentUrl: media } } : {}),
  };

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article>
        <header className="shell article-head">
          <Link href="/creative" className="text-link" style={{ marginBottom: 20 }}>
            <ArrowLeft size={15} aria-hidden="true" /> Creative work
          </Link>
          <span className="eyebrow">{piece.category}</span>
          <h1 style={{ fontSize: 'clamp(2rem,4.4vw,3.6rem)', margin: '12px 0 18px', maxWidth: '20ch' }}>{piece.title}</h1>
          {piece.lede && <p className="lede">{piece.lede}</p>}
          <div className="byline" style={{ marginTop: 18 }}>
            <span>
              By <strong>Kenneth Timothy Iziogo</strong>
            </span>
            {piece.publishedAt && <time dateTime={piece.publishedAt}>{formatDate(piece.publishedAt)}</time>}
          </div>
        </header>

        <div className="shell">
          <Image
            src={piece.cover}
            alt={piece.coverAlt}
            width={1500}
            height={900}
            priority
            sizes="(max-width: 900px) 94vw, 1100px"
            style={{ width: '100%', maxHeight: 460, objectFit: 'cover', borderRadius: 'var(--radius)' }}
          />
        </div>

        <div className="shell" style={{ marginTop: 'clamp(30px,4vw,52px)' }}>
          <div className="article-body">
            <div className="prose">{renderMarkdown(piece.body)}</div>
            <aside className="article-aside">
              {media && (
                <div className="card flat">
                  <h2>Listen / watch</h2>
                  {piece.mediaType === 'audio' && (
                    <audio controls preload="none" src={media} aria-label={`Audio for ${piece.title}`} style={{ width: '100%' }}>
                      Your browser cannot play this audio.
                    </audio>
                  )}
                  {piece.mediaType === 'video' && (
                    <video controls preload="none" src={media} aria-label={`Video for ${piece.title}`} style={{ width: '100%', borderRadius: 12 }}>
                      {captions && <track kind="captions" src={captions} srcLang="en" label="English" default />}
                    </video>
                  )}
                  {piece.mediaType === 'external' && (
                    <a href={media} className="text-link" target="_blank" rel="noopener noreferrer">
                      Open the piece <ArrowUpRight size={14} aria-hidden="true" />
                    </a>
                  )}
                </div>
              )}
              <div className="card flat">
                <h2>Share</h2>
                <ShareRow title={piece.title} path={`/creative/${piece.slug}`} />
              </div>
            </aside>
          </div>
        </div>
      </article>

      <div className="shell">
        <Related
          back={{ href: '/creative', label: 'Creative work' }}
          links={[
            ['/journal', 'Journal'],
            ['/gallery', 'Gallery'],
            ['/about', 'About'],
          ]}
        />
      </div>
    </main>
  );
}
