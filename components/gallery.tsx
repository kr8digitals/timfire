'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { BookOpen, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';
import { GALLERY, type GalleryShot } from '@/lib/gallery';
import { isPublished } from '@/lib/content';
import { useStore } from '@/lib/store';

export default function Gallery() {
  const [open, setOpen] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const shotBtns = useRef<(HTMLButtonElement | null)[]>([]);

  const close = useCallback(() => {
    setOpen((current) => {
      if (current !== null) shotBtns.current[current]?.focus();
      return null;
    });
  }, []);
  const step = useCallback((delta: number) => {
    setOpen((current) => (current === null ? current : (current + delta + GALLERY.length) % GALLERY.length));
  }, []);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, close, step]);

  const { data } = useStore();
  /** A frame only offers its story once the story is actually published. */
  const storyOf = (frame: GalleryShot) =>
    frame.story ? data.journal.find((x) => x.slug === frame.story && isPublished(x)) ?? null : null;

  const shot = open === null ? null : GALLERY[open];

  return (
    <>
      <div className="masonry">
        {GALLERY.map((s, i) => (
          <figure className="shot" key={s.src}>
            <button
              type="button"
              className="shot-btn"
              ref={(el) => {
                shotBtns.current[i] = el;
              }}
              onClick={() => setOpen(i)}
              aria-label={`Open image ${i + 1} of ${GALLERY.length}: ${s.caption}`}
            >
              <Image
                src={s.src}
                width={s.w}
                height={s.h}
                alt={s.alt}
                loading={i < 3 ? 'eager' : 'lazy'}
                sizes="(max-width: 680px) 100vw, (max-width: 1020px) 50vw, 33vw"
              />
            </button>
            <figcaption>
              {s.caption}
              {storyOf(s) ? (
                <Link className="shot-story" href={'/journal/' + encodeURIComponent(s.story!)}>
                  <BookOpen size={15} /> The story behind this frame
                </Link>
              ) : null}
            </figcaption>
          </figure>
        ))}
      </div>

      {shot && open !== null && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Image ${open + 1} of ${GALLERY.length}: ${shot.caption}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <button ref={closeRef} type="button" className="icon-btn lightbox-close" onClick={close} aria-label="Close image viewer">
            <X size={22} />
          </button>
          <button type="button" className="lightbox-nav prev" onClick={() => step(-1)} aria-label="Previous image (left arrow key)">
            <ChevronLeft size={26} />
          </button>
          <figure className="lightbox-figure">
            {/* eslint-disable-next-line @next/next/no-img-element -- the viewer shows the frame at its true size */}
            <img src={shot.src} alt={shot.alt} />
            <figcaption>
              <span className="lightbox-caption">{shot.caption}</span>
              <span className="lightbox-count mono">
                {open + 1} / {GALLERY.length}
              </span>
              {storyOf(shot) ? (
                <Link className="lightbox-story" href={'/journal/' + encodeURIComponent(shot.story!)}>
                  <BookOpen size={16} /> Read the story behind this frame
                </Link>
              ) : null}
            </figcaption>
          </figure>
          <button type="button" className="lightbox-nav next" onClick={() => step(1)} aria-label="Next image (right arrow key)">
            <ChevronRight size={26} />
          </button>
        </div>
      )}
    </>
  );
}
