'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Camera, Download } from 'lucide-react';
import type { GalleryItem } from '@/lib/cms/types';

/**
 * Filterable photo grid + accessible lightbox.
 *
 * The lightbox is keyboard complete (arrow keys, Escape, focus trapping),
 * announces photo changes to screen readers, and links back to the same photo
 * by URL so a particular frame can be shared.
 */

type Props = { items: GalleryItem[] };

export default function GalleryGrid({ items }: Props) {
  const collections = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) counts.set(item.collection, (counts.get(item.collection) || 0) + 1);
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [items]);

  const [filter, setFilter] = useState<string>('All');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  const shown = useMemo(
    () => (filter === 'All' ? items : items.filter((i) => i.collection === filter)),
    [items, filter],
  );

  /* Deep link: /gallery?photo=g-05 */
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('photo');
    if (!param) return;
    const index = items.findIndex((i) => i.id === param);
    if (index >= 0) setOpenIndex(index);
  }, [items]);

  const close = useCallback(() => {
    setOpenIndex(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('photo');
    window.history.replaceState({}, '', url.toString());
    restoreFocus.current?.focus();
  }, []);

  const step = useCallback(
    (direction: 1 | -1) => {
      setOpenIndex((current) => {
        if (current === null) return current;
        const next = (current + direction + shown.length) % shown.length;
        const url = new URL(window.location.href);
        url.searchParams.set('photo', shown[next].id);
        window.history.replaceState({}, '', url.toString());
        return next;
      });
    },
    [shown],
  );

  useEffect(() => {
    if (openIndex === null) return;
    const node = dialogRef.current;
    document.body.classList.add('modal-open');
    node?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        step(1);
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        step(-1);
      }
      if (event.key === 'Tab') {
        const items = Array.from(node?.querySelectorAll<HTMLElement>('button, a[href]') || []);
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('modal-open');
    };
  }, [openIndex, close, step]);

  const active = openIndex === null ? null : shown[openIndex];

  return (
    <>
      <div className="cluster" style={{ marginBottom: 26, gap: 8 }} role="group" aria-label="Filter photographs by collection">
        <button
          type="button"
          className={`tag${filter === 'All' ? ' on' : ''}`}
          aria-pressed={filter === 'All'}
          onClick={() => setFilter('All')}
          style={{ cursor: 'pointer', minHeight: 40, padding: '8px 16px' }}
        >
          All {items.length}
        </button>
        {collections.map(([name, count]) => (
          <button
            key={name}
            type="button"
            className={`tag${filter === name ? ' on' : ''}`}
            aria-pressed={filter === name}
            onClick={() => setFilter(name)}
            style={{ cursor: 'pointer', minHeight: 40, padding: '8px 16px' }}
          >
            {name} {count}
          </button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {shown.length} photographs{filter === 'All' ? '' : ` in ${filter}`}.
      </p>

      <div className="masonry">
        {shown.map((item, index) => (
          <figure key={item.id}>
            <button
              type="button"
              className="shot"
              onClick={(event) => {
                restoreFocus.current = event.currentTarget;
                setOpenIndex(index);
                const url = new URL(window.location.href);
                url.searchParams.set('photo', item.id);
                window.history.replaceState({}, '', url.toString());
              }}
              aria-label={`Open ${item.title} — ${item.caption}`}
            >
              <Image
                src={item.src}
                alt={item.alt}
                width={item.orientation === 'landscape' ? 1200 : 900}
                height={item.orientation === 'landscape' ? 800 : 1300}
                sizes="(max-width: 560px) 94vw, (max-width: 900px) 46vw, 30vw"
                loading={index < 4 ? 'eager' : 'lazy'}
                style={{ width: '100%', height: 'auto' }}
              />
              <span className="shot-meta">
                <span>
                  <strong>{item.title}</strong>
                  <span>
                    {item.collection} · {item.year}
                  </span>
                </span>
                <Camera size={16} aria-hidden="true" />
              </span>
            </button>
          </figure>
        ))}
      </div>

      {active && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${active.title} — photograph ${String((openIndex ?? 0) + 1)} of ${shown.length}`}
          ref={dialogRef}
          tabIndex={-1}
        >
          <div className="lightbox-bar">
            <span className="kicker" aria-live="polite">
              {(openIndex ?? 0) + 1} / {shown.length} · {active.collection}
            </span>
            <button type="button" className="icon-btn" onClick={close} aria-label="Close photograph">
              <X size={20} />
            </button>
          </div>

          <div className="lightbox-stage">
            <Image
              key={active.id}
              src={active.src}
              alt={active.alt}
              width={active.orientation === 'landscape' ? 1400 : 1000}
              height={active.orientation === 'landscape' ? 950 : 1450}
              sizes="(max-width: 900px) 96vw, 1200px"
              priority
              style={{ maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain', borderRadius: 12 }}
            />
          </div>

          <div className="lightbox-foot">
            <div>
              <h2>{active.title}</h2>
              <p>{active.caption}</p>
            </div>
            <div className="lightbox-nav">
              <a
                href={active.src}
                download
                aria-label="Download this photograph"
                style={{ border: '1px solid #4d382d', borderRadius: '50%', width: 48, height: 48, display: 'grid', placeItems: 'center', color: 'var(--paper)' }}
              >
                <Download size={18} aria-hidden="true" />
              </a>
              <button type="button" onClick={() => step(-1)} aria-label="Previous photograph">
                <ChevronLeft size={20} />
              </button>
              <button type="button" onClick={() => step(1)} aria-label="Next photograph">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
