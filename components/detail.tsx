'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useStore, safeUrl, safeMedia } from '@/lib/store';
import { isPublished } from '@/lib/content';

/** The journal was renamed Me, so its stories live under /me. */
const baseOf = (kind: 'creative' | 'journal') => (kind === 'journal' ? '/me' : '/creative');

/**
 * TikTok's own player, when the external clip is a TikTok post: the video plays
 * here, in the story, instead of sending the reader off to an app they may not
 * have. Anything else — a Facebook share link, say — stays a card with the
 * poster still, because those cannot be embedded.
 */
function tiktokEmbed(url: string): string {
  const id = /tiktok\.com\/@[\w.-]+\/video\/(\d+)/.exec(url)?.[1] ?? /tiktok\.com\/embed\/v2\/(\d+)/.exec(url)?.[1] ?? '';
  return id ? 'https://www.tiktok.com/embed/v2/' + id : '';
}

/**
 * A story opens as a split: what the piece is on the left, the frame or the
 * video that carries it on the right, and the writing itself below both. The
 * owner's note on the old layout was that the title sat alone at the top and
 * the photograph was dumped full-width underneath it, so the two never met.
 */
export default function Detail({ kind, slug }: { kind: 'creative' | 'journal'; slug: string }) {
  const { data, ready } = useStore();
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState('');
  useEffect(() => setUrl(window.location.href), []);
  const item =
    kind === 'journal'
      ? data.journal.find((x) => x.slug === slug && isPublished(x))
      : data.creative.find((x) => x.slug === slug && isPublished(x));
  const base = baseOf(kind);
  if (!ready)
    return (
      <main id="main" className="shell section">
        <p>Loading…</p>
      </main>
    );
  if (!item)
    return (
      <main id="main" className="shell section">
        <span className="eyebrow">Not found</span>
        <h1>That page is not available.</h1>
        <Link href={base} className="text-link">
          Back to {kind === 'journal' ? 'Me' : 'Creative'} ↗
        </Link>
      </main>
    );

  const isJournal = kind === 'journal' && 'summary' in item;
  const c = 'mediaType' in item ? item : null;
  const media = c && c.mediaType !== 'none' ? safeMedia(c.mediaUrl) : '';
  const minRead = Math.max(1, Math.ceil(item.body.trim().split(/\s+/).length / 200));
  const external = isJournal ? safeUrl(item.videoExternal || '') : '';
  const embed = isJournal && !item.videoSrc && external ? tiktokEmbed(external) : '';
  const hasMedia = isJournal ? !!(item.image || item.videoSrc || external) : !!media;

  return (
    <main id="main" className="shell">
      <section className={hasMedia ? 'story-split' : 'story-split single'}>
        <div className="story-head">
          <span className="eyebrow">{item.category}</span>
          <h1>{item.title}</h1>
          {isJournal && (
            <>
              <p className="page-lead">{item.summary}</p>
              <p className="story-meta">{minRead} min read</p>
              <div className="story-tags">
                {item.tags.map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </>
          )}
          {isJournal && item.origin ? (
            <p className="origin-line">
              {item.origin}
              {safeUrl(item.sourceUrl || '') ? (
                <a className="source-link" href={safeUrl(item.sourceUrl || '')} target="_blank" rel="noopener noreferrer">
                  Comment on the original post &#8599;
                </a>
              ) : null}
            </p>
          ) : null}
        </div>

        {hasMedia ? (
          <div className="story-media">
            {isJournal && item.image ? (
              <div className="photo-card article-photo">
                <Image
                  src={item.image}
                  alt={item.imageAlt || item.title}
                  width={item.imageWidth || 1200}
                  height={item.imageHeight || 800}
                  sizes="(max-width: 900px) 100vw, 46vw"
                  priority
                />
              </div>
            ) : null}
            {isJournal && item.videoSrc ? (
              <video
                controls
                preload="none"
                poster={item.videoPoster || undefined}
                src={item.videoSrc}
                className="story-video"
                aria-label={'Video for ' + item.title}
              />
            ) : null}
            {isJournal && embed ? (
              <figure className="story-embed">
                <iframe
                  src={embed}
                  title={item.videoCaption || 'Video for ' + item.title}
                  loading="lazy"
                  scrolling="no"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                />
                <figcaption>{item.videoCaption || 'Watch the video'}</figcaption>
              </figure>
            ) : null}
            {isJournal && !item.videoSrc && !embed && external ? (
              <a className="video-card" href={external} target="_blank" rel="noopener noreferrer">
                {item.videoPoster ? (
                  // eslint-disable-next-line @next/next/no-img-element -- a poster still for a clip that cannot be embedded
                  <img src={item.videoPoster} alt={item.videoCaption || item.title} />
                ) : (
                  <span className="video-play" aria-hidden="true">
                    &#9654;
                  </span>
                )}
                <span>
                  <Play size={17} /> {item.videoCaption || 'Watch the video'} &#8599;
                </span>
              </a>
            ) : null}
            {media && c ? (
              <>
                {c.mediaType === 'audio' ? <audio controls preload="none" src={media} aria-label={'Audio for ' + item.title} /> : null}
                {c.mediaType === 'video' ? (
                  <video controls preload="none" src={media} aria-label={'Video for ' + item.title} className="story-video">
                    {safeUrl(c.captionUrl) && <track kind="captions" src={safeUrl(c.captionUrl)} srcLang="en" label="English" default />}
                  </video>
                ) : null}
                {c.mediaType === 'external' ? (
                  <a href={media} target="_blank" rel="noopener noreferrer" className="text-link">
                    Open media ↗
                  </a>
                ) : null}
              </>
            ) : null}
          </div>
        ) : null}
      </section>

      <div className="prose" style={{ maxWidth: 780 }}>
        {item.body}
      </div>

      {kind === 'journal' ? (
        <div className="actions">
          <button
            className="button ghost"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
              } catch {
                setCopied(false);
              }
            }}
          >
            {copied ? 'Link copied' : 'Copy link'}
          </button>
          <a
            className="button ghost"
            href={'https://wa.me/?text=' + encodeURIComponent(item.title + ' ' + url)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Share on WhatsApp ↗
          </a>
        </div>
      ) : null}

      {kind === 'journal' && isJournal ? (
        (() => {
          const related = data.journal
            .filter((x) => x.id !== item.id && isPublished(x) && x.tags.some((t) => item.tags.includes(t)))
            .slice(0, 3);
          return related.length ? (
            <section className="section">
              <h2>
                Related <em>posts.</em>
              </h2>
              <div className="list">
                {related.map((x) => (
                  <Link className="card" href={'/me/' + encodeURIComponent(x.slug)} key={x.id}>
                    {x.title} ↗
                  </Link>
                ))}
              </div>
            </section>
          ) : null;
        })()
      ) : null}

      {kind === 'journal' ? (
        <section className="feature-cta" aria-label="Want to be featured?">
          <span className="eyebrow">This page is theirs too</span>
          <h2>
            Want next week <em>to be yours?</em>
          </h2>
          <p>
            One reader a week gets this page: your story in your words, your photograph if you send one, and the
            handles you want people to find you on. Tell me who you are and what you are carrying.
          </p>
          <Link className="button primary" href="/me#apply">
            Ask to be featured <ArrowUpRight size={18} />
          </Link>
        </section>
      ) : null}

      <nav className="related" aria-label="Related pages">
        <Link href={base}>Back to {kind === 'journal' ? 'Me' : 'Creative'} ↗</Link>
        <Link href={kind === 'journal' ? '/creative' : '/me'}>{kind === 'journal' ? 'Creative' : 'Me'} ↗</Link>
        <Link href="/about">About ↗</Link>
      </nav>
    </main>
  );
}
