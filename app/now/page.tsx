import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Clock } from 'lucide-react';
import { getContent } from '@/lib/cms/store';
import { formatDate } from '@/lib/cms/types';
import { PageHero, Related, CTABlock } from '@/components/site/ui';
import { Reveal, Stagger, StaggerItem } from '@/components/site/motion';

export const metadata: Metadata = {
  title: 'Now — what I am doing at the moment',
  description:
    'A current snapshot: studying Linguistics at Ebonyi State University, running KR8 DIGITALS, building AI agents and this site.',
  alternates: { canonical: '/now' },
};

export default async function NowPage() {
  const content = await getContent();
  const items = content.now.filter((n) => n.isPublic).sort((a, b) => a.order - b.order);
  const latestUpdate = items.reduce((latest, item) => (item.updatedAt > latest ? item.updatedAt : latest), '');

  return (
    <main id="main">
      <PageHero
        eyebrow="The present chapter"
        title="What I am doing"
        accent="right now."
        lead="A static page, updated by hand, in the spirit of the /now movement: instead of a feed of everything, a snapshot of what actually has my attention."
      >
        <div className="cluster" style={{ marginTop: 24 }}>
          <span className="badge outline">
            <Clock size={12} aria-hidden="true" /> Last updated {latestUpdate ? formatDate(latestUpdate) : 'recently'}
          </span>
          <span className="badge outline">Abakaliki, Nigeria · WAT</span>
        </div>
      </PageHero>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell two-col wide-right" style={{ alignItems: 'start', gap: 'clamp(28px,5vw,64px)' }}>
          <Stagger className="stack" gap={0.06}>
            {items.map((item) => (
              <StaggerItem key={item.id}>
                <div className="card flat">
                  <span className="kicker" style={{ color: 'var(--orange)' }}>{item.label}</span>
                  <p style={{ margin: '8px 0 0', fontSize: '1.02rem', color: 'var(--paper)', lineHeight: 1.65 }}>{item.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal delay={0.08}>
            <div className="photo-card" style={{ maxHeight: 620 }}>
              <Image
                src="/images/work/workspace-neon.webp"
                alt="The desk where the work happens, lit in purple and blue"
                width={1200}
                height={1400}
                sizes="(max-width: 860px) 92vw, 40vw"
                style={{ maxHeight: 620, objectFit: 'cover' }}
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section-ruled">
        <div className="shell two-col" style={{ alignItems: 'center', gap: 'clamp(24px,5vw,64px)' }}>
          <Reveal>
            <div>
              <span className="eyebrow">Also, lately</span>
              <h2 style={{ margin: '14px 0 18px' }}>
                The things that are <em>not work.</em>
              </h2>
              <div className="stack-sm" style={{ marginTop: 20 }}>
                <p className="muted" style={{ margin: 0 }}>
                  <strong style={{ color: 'var(--paper)' }}>Reading:</strong> whatever is nearest — mostly about
                  language, systems, or how people decide to trust something.
                </p>
                <p className="muted" style={{ margin: 0 }}>
                  <strong style={{ color: 'var(--paper)' }}>Playing:</strong> piano, badly, regularly.
                </p>
                <p className="muted" style={{ margin: 0 }}>
                  <strong style={{ color: 'var(--paper)' }}>Writing:</strong> poems that mostly do not get published,
                  and the journal entries that do.
                </p>
              </div>
              <div className="actions">
                <Link href="/journal" className="text-link">
                  Read the journal <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
                <Link href="/timeline" className="text-link">
                  The timeline <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <div className="photo-card" style={{ maxHeight: 460 }}>
              <Image
                src="/images/creative/music-neon.webp"
                alt="A keyboard beneath a neon MUSIC sign"
                width={1200}
                height={900}
                sizes="(max-width: 860px) 92vw, 44vw"
                style={{ maxHeight: 460, objectFit: 'cover' }}
              />
            </div>
          </Reveal>
        </div>
      </section>

      <CTABlock
        eyebrow="Want to be part of it"
        title="There is usually room"
        accent="for one more."
        lead="Whether that means a project, a collaboration, or a conversation about the work — the door is open."
        primary={{ href: '/contact', label: 'Send a message' }}
        secondary={{ href: '/services', label: 'See services' }}
      />

      <div className="shell">
        <Related links={[['/about', 'About'], ['/timeline', 'Timeline'], ['/journal', 'Journal']]} />
      </div>
    </main>
  );
}
