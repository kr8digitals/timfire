import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import EnquiryForm from '@/components/enquiry-form';
import { FORMS } from '@/lib/forms';
import { SITE_ORIGIN } from '@/lib/site';

type Collab = {
  kind: string;
  eyebrow: string;
  title: string;
  accent: string;
  lead: string;
  what: string[];
  next: string;
};

const COLLABS: Collab[] = [
  {
    kind: 'music',
    eyebrow: 'Collaboration · Music',
    title: 'Let’s make something',
    accent: 'worth hearing.',
    lead: 'Singing, songwriting, playing, performing — one practice, many doors. Tell me which one you are knocking on.',
    what: [
      'Features and collaborations on your record or mine',
      'Songwriting: lyrics, melody, or the whole song',
      'Sessions on your project, whatever it needs played',
      'Live performance where the room deserves it',
    ],
    next: 'I reply personally, usually within a day. If the fit is right we set up a call or a studio session, and you get a written scope before anything is scheduled.',
  },
  {
    kind: 'spoken-word',
    eyebrow: 'Collaboration · Spoken word',
    title: 'Words that land',
    accent: 'out loud.',
    lead: 'Spoken word is writing with a pulse: the piece is not finished until it survives a room. Tell me the room.',
    what: [
      'A performance at your event, school, church or conference',
      'A commissioned piece for an occasion or a campaign',
      'A recording for release or broadcast',
      'A workshop for writers who want to perform',
    ],
    next: 'Send the occasion, the theme and the date. I will tell you honestly whether I am the right voice for it, and what the piece would need to be.',
  },
  {
    kind: 'poetry',
    eyebrow: 'Collaboration · Poetry',
    title: 'The quietest',
    accent: 'loud page.',
    lead: 'Poems are compression: the most feeling in the fewest words. Commissions, publication and joint work all start the same way — with the subject.',
    what: [
      'A commissioned poem: dedication, anniversary, memorial, launch',
      'Publication in an anthology, magazine or collection',
      'A performance piece written for a specific voice',
      'Joint work with another writer',
    ],
    next: 'Tell me the subject and the deadline. Published and forthcoming pieces live in the Journal, so you can read the voice before you commission it.',
  },
  {
    kind: 'speaking',
    eyebrow: 'Collaboration · Public speaking',
    title: 'A room, and',
    accent: 'something to say.',
    lead: 'I speak on discipline, building in public, digital skills and the language behind good work — to students, creators, churches and companies.',
    what: [
      'Schools and universities: study, discipline, building early',
      'Conferences and creator events: craft and building in public',
      'Church and community: purpose, service and consistency',
      'Corporate teams: plain language, ownership and follow-through',
    ],
    next: 'Send the event, the date and what the audience should leave with. You get a straight answer on fit, a title and outline, and one page of what I need from the organisers.',
  },
];

export function generateStaticParams() {
  return COLLABS.map((c) => ({ kind: c.kind }));
}

export async function generateMetadata({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  const c = COLLABS.find((x) => x.kind === kind);
  if (!c) return {};
  return {
    title: `${c.eyebrow.replace('Collaboration · ', '')} collaboration with TIMFIRE`,
    description: c.lead,
    alternates: { canonical: `/collaborate/${c.kind}` },
    openGraph: { title: `${c.eyebrow} | TIMFIRE`, description: c.lead, url: `${SITE_ORIGIN}/collaborate/${c.kind}` },
  };
}

export default async function CollaboratePage({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  const c = COLLABS.find((x) => x.kind === kind);
  if (!c) notFound();
  const form = FORMS[c.kind];

  return (
    <main id="main">
      <section className="shell page-hero">
        <span className="eyebrow">{c.eyebrow}</span>
        <h1>
          {c.title}
          <br />
          <em>{c.accent}</em>
        </h1>
        <p className="page-lead">{c.lead}</p>
      </section>

      <div className="shell">
        <div className="two-col" style={{ alignItems: 'start' }}>
          <div>
            <h2>What this can be</h2>
            <ul className="outcomes">
              {c.what.map((w) => (
                <li key={w}>
                  <ArrowUpRight size={16} aria-hidden="true" /> {w}
                </li>
              ))}
            </ul>
            <h2 style={{ marginTop: 34 }}>What happens next</h2>
            <p className="muted" style={{ maxWidth: '60ch' }}>{c.next}</p>
            <nav className="related" aria-label="Related pages" style={{ marginTop: 34 }}>
              <strong>Keep exploring</strong>
              <Link href="/creative">The creative space ↗</Link>
              <Link href="/journal">The Journal ↗</Link>
              <Link href="/work">Selected work ↗</Link>
            </nav>
          </div>
          <div className="form-panel" id="form">
            <div className="form-panel-head">
              <span className="eyebrow">Enquiry</span>
              <h2>{form.title}</h2>
              <p className="muted">{form.intro}</p>
            </div>
            <EnquiryForm kind={c.kind} />
          </div>
        </div>
      </div>
    </main>
  );
}
