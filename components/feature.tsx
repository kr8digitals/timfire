'use client';
import Link from 'next/link';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useStore, safeMedia, safeUrl } from '@/lib/store';
import type { Feature } from '@/lib/content';
import { Reveal } from '@/components/motion';
import EnquiryForm from '@/components/enquiry-form';

/**
 * One reader a week gets the Me page.
 *
 * The owner picks who goes up from the people who asked, emails them the
 * questions, and publishes their answers here — so this block is the reason the
 * page belongs to the reader and not to the writer. It keeps the rhythm of a
 * story page: who they are on the left, their photograph on the right, their
 * own words below both.
 */

/** The Monday of the week a date falls in, so "this week" means one thing. */
function weekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - day + 1);
  return d.toISOString().slice(0, 10);
}

/** A feature is up when it is public and its week has arrived (or no week was set). */
function isLive(x: Feature, now: Date): boolean {
  if (x.isPublic === false) return false;
  if (!x.weekOf) return true;
  const when = new Date(x.weekOf);
  return !Number.isNaN(when.getTime()) && when.getTime() <= now.getTime();
}

/** The newest feature that is due, so the block changes over on its own. */
export function currentFeature(features: Feature[], now = new Date()): Feature | null {
  const live = features.filter((x) => isLive(x, now));
  if (!live.length) return null;
  return live.slice().sort((a, b) => (b.weekOf || '').localeCompare(a.weekOf || ''))[0] ?? null;
}

/** "Instagram" from https://instagram.com/ada, so a pasted link reads as a name. */
function socialLabel(entry: string): { label: string; href: string } {
  const href = safeUrl(entry);
  if (!href) return { label: entry.replace(/^@/, '@'), href: '' };
  const host = href.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  const name = host.split('.').slice(-2, -1)[0] || host;
  return { label: name.charAt(0).toUpperCase() + name.slice(1), href };
}

export function FeaturedThisWeek() {
  const { data } = useStore();
  const person = currentFeature(data.features ?? []);

  return (
    <section className="section feature-band" id="featured" aria-label="Who we are featuring this week">
      <span className="eyebrow">Featuring this week</span>
      {person ? (
        <>
          <div className="story-split feature-split">
            <div className="story-head">
              <h2>
                {person.name}
                {person.handle ? <em> {person.handle.startsWith('@') ? person.handle : '@' + person.handle}</em> : null}
              </h2>
              {person.blurb ? <p className="page-lead">{person.blurb}</p> : null}
              {person.weekOf ? (
                <p className="story-meta">Up for the week of {new Date(person.weekOf).toDateString().slice(4)}</p>
              ) : null}
              {person.socials?.length ? (
                <div className="story-tags">
                  {person.socials.filter(Boolean).map((entry) => {
                    const s = socialLabel(entry);
                    return s.href ? (
                      <a className="tag" key={entry} href={s.href} target="_blank" rel="noopener noreferrer">
                        {s.label} <ArrowUpRight size={13} />
                      </a>
                    ) : (
                      <span className="tag" key={entry}>
                        {s.label}
                      </span>
                    );
                  })}
                </div>
              ) : null}
              <p className="feature-ask">
                This page carries one reader a week. <Link href="#apply">Ask for next week to be yours ↗</Link>
              </p>
            </div>
            {safeMedia(person.image || '') ? (
              <div className="story-media">
                <div className="photo-card article-photo">
                  {/* eslint-disable-next-line @next/next/no-img-element -- a reader's own photograph, sent in or uploaded later */}
                  <img src={safeMedia(person.image)} alt={person.imageAlt || person.name} loading="lazy" />
                </div>
              </div>
            ) : null}
          </div>
          {person.story ? (
            <div className="prose feature-story" style={{ maxWidth: 780 }}>
              {person.story}
            </div>
          ) : null}
        </>
      ) : (
        <Reveal>
          <div className="feature-empty">
            <span className="icon-badge" aria-hidden="true">
              <Sparkles size={20} />
            </span>
            <h2>Nobody&rsquo;s story is up this week.</h2>
            <p className="page-lead">
              This page is mine on the days I publish, and somebody else&rsquo;s for one week at a time: their story, in
              their words, with the handles they want people to find them on. The week is open right now.
            </p>
            <p className="feature-ask">
              <Link href="#apply">Ask to be featured ↗</Link>
            </p>
          </div>
        </Reveal>
      )}
    </section>
  );
}

/** The application itself: a real form, a real inbox, no account needed yet. */
export function FeatureApplication() {
  return (
    <section className="section feature-apply" id="apply" aria-label="Ask to be featured">
      <span className="eyebrow">Want to be featured?</span>
      <h2>
        Tell me who you are, <em>and what you are carrying.</em>
      </h2>
      <p className="page-lead" style={{ maxWidth: 720 }}>
        Every week I pick one reader and put their story on this page. If I pick you, I email you the questions, you
        answer them in your own words, and that is what goes up — beside your photograph if you send one, and the
        handles you want people to find you on.
      </p>
      <EnquiryForm kind="feature" />
    </section>
  );
}
