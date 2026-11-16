'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useStore, safeUrl, safeMedia } from '@/lib/store';
import { isPublished } from '@/lib/content';
import { postKey } from '@/lib/posts';
import Engagement from '@/components/engage';

/** The journal was renamed Me, so its stories live under /me. */
const baseOf = (kind: 'creative' | 'journal') => (kind === 'journal' ? '/me' : '/creative');

/**
 * A player this site can actually host. YouTube and Vimeo serve an embed that
 * works for any public video, so those play in the story. Everything else — a
 * TikTok post, a Facebook share — becomes a card that says where it goes.
 */
function embedOf(url: string): { src: string; host: string } | null {
  const yt = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/.exec(url)?.[1] ?? '';
  if (yt) return { src: 'https://www.youtube-nocookie.com/embed/' + yt, host: 'YouTube' };
  const vm = /vimeo\.com\/(?:video\/)?(\d{6,})/.exec(url)?.[1] ?? '';
  if (vm) return { src: 'https://player.vimeo.com/video/' + vm, host: 'Vimeo' };
  return null;
}

/**
 * Which platform a clip lives on, so the card can say so instead of asking the
 * reader to guess what they are about to open.
 *
 * A third-party player is not something this site can promise. TikTok's own
 * embed answered "Player authentication failed — this link is invalid or has
 * expired" on a public video that plays fine in the app, and nothing on our side
 * of the iframe can detect or fix that. So the rule is plain: a clip that is
 * self-hosted plays here, in the story; a clip that lives on somebody else's
 * player is a card that says where it goes and opens it. When the owner hands
 * over the file, `videoSrc` is filled in and it plays here like every other.
 */
function platformOf(url: string): string {
  const host = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  if (host.includes('tiktok.com')) return 'TikTok';
  if (host.includes('facebook.com') || host === 'fb.watch') return 'Facebook';
  if (host.includes('youtube.com') || host === 'youtu.be') return 'YouTube';
  if (host.includes('instagram.com')) return 'Instagram';
  if (host.includes('x.com') || host.includes('twitter.com')) return 'X';
  return 'the original post';
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
  // A self-hosted file always wins: it is the only clip this site can promise.
  const embed = isJournal && !item.videoSrc && external ? embedOf(external) : null;
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
                  src={embed.src}
                  title={(item.videoCaption || 'Video for ' + item.title) + ' — on ' + embed.host}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                />
                {item.videoCaption ? <figcaption>{item.videoCaption}</figcaption> : null}
              </figure>
            ) : null}
            {isJournal && !item.videoSrc && !embed && external ? (
              <figure className="story-external">
                <a className="video-card" href={external} target="_blank" rel="noopener noreferrer">
                  {safeMedia(item.videoPoster || '') ? (
                    // eslint-disable-next-line @next/next/no-img-element -- a poster still for a clip that lives on another platform
                    <img src={safeMedia(item.videoPoster || '')} alt={item.videoCaption || item.title} />
                  ) : (
                    <span className="video-play" aria-hidden="true">
                      <Play size={40} />
                    </span>
                  )}
                  <span>
                    <Play size={17} /> Watch on {platformOf(external)} &#8599;
                  </span>
                </a>
                {item.videoCaption ? <figcaption>{item.videoCaption}</figcaption> : null}
              </figure>
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

      <Engagement post={postKey(kind, item.slug)} />

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
