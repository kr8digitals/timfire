import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Bot, Globe, Layers } from 'lucide-react';
import { getContent } from '@/lib/cms/store';
import { displayHost } from '@/lib/safe';
import { PageHero, SectionHead, CTABlock, Related } from '@/components/site/ui';
import { Reveal, Stagger, StaggerItem } from '@/components/site/motion';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Work — websites & AI agents',
  description:
    'Live websites, redesigns and AI agents built by TIMFIRE: AFRISTEM Global, Prime STEM Nigeria, KR8 DIGITALS, four hotel builds through KR8 DIGITALS, and agents including RIYA.',
  alternates: { canonical: '/work' },
  openGraph: {
    title: 'Work — websites & AI agents by TIMFIRE',
    description: 'Live websites, redesigns and AI agents, with the reasoning behind each build.',
    images: ['/images/og.jpg'],
  },
};

const KIND_ICON = { Website: Globe, 'Website redesign': Layers, 'AI agent': Bot, 'KR8 studio build': Layers } as const;

export default async function WorkPage() {
  const content = await getContent();
  const projects = content.projects.filter((p) => p.isPublic).sort((a, b) => a.order - b.order);
  const live = projects.filter((p) => p.status === 'Live');
  const inProgress = projects.filter((p) => p.status !== 'Live');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Work', item: `${SITE_URL}/work` },
        ],
      },
      {
        '@type': 'CollectionPage',
        name: 'Work by TIMFIRE',
        url: `${SITE_URL}/work`,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: projects.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
              '@type': p.kind === 'AI agent' ? 'SoftwareApplication' : 'WebSite',
              name: p.name,
              description: p.summary,
              url: p.url,
              creator: { '@type': 'Person', name: 'Kenneth Timothy Iziogo', url: SITE_URL },
            },
          })),
        },
      },
    ],
  };

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageHero
        eyebrow="Selected work"
        title="Built to do"
        accent="a job."
        lead="Not a portfolio of pretty screens. These are sites and agents that had a specific outcome to hit — a booking, an application, an enquiry, a question answered at eleven at night."
      >
        <div className="cluster" style={{ marginTop: 26 }}>
          <span className="badge orange">{live.length} live</span>
          <span className="badge outline">{inProgress.length} in progress</span>
          <span className="badge outline">Websites · redesigns · AI agents</span>
        </div>
      </PageHero>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          <Stagger className="stack" gap={0.08}>
            {projects.map((project, index) => {
              const Icon = KIND_ICON[project.kind] ?? Globe;
              const flip = index % 2 === 1;
              return (
                <StaggerItem key={project.id}>
                  <article
                    id={project.slug}
                    className="card"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
                      gap: 'clamp(22px,4vw,48px)',
                      alignItems: 'center',
                      scrollMarginTop: '110px',
                      padding: 'clamp(20px,3vw,32px)',
                    }}
                  >
                    <div style={{ order: flip ? 2 : 1, borderRadius: 18, overflow: 'hidden', background: '#1a110d' }}>
                      <Image
                        src={project.image}
                        alt={project.imageAlt}
                        width={1000}
                        height={760}
                        sizes="(max-width: 860px) 92vw, 40vw"
                        style={{ width: '100%', height: '100%', maxHeight: 400, objectFit: 'cover' }}
                      />
                    </div>

                    <div style={{ order: flip ? 1 : 2 }}>
                      <div className="cluster" style={{ gap: 8, marginBottom: 14 }}>
                        <span className="badge outline">
                          <Icon size={13} aria-hidden="true" /> {project.kind}
                        </span>
                        <span className={`badge ${project.status === 'Live' ? 'live' : 'outline'}`}>{project.status}</span>
                        <span className="badge outline">{project.year}</span>
                      </div>
                      <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.3rem)', margin: '0 0 10px' }}>{project.name}</h2>
                      <p className="muted" style={{ marginBottom: 14 }}>
                        {project.summary}
                      </p>
                      <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 16px', margin: '0 0 16px', fontSize: '.9rem' }}>
                        <dt style={{ color: 'var(--muted-2)' }}>Role</dt>
                        <dd style={{ margin: 0 }}>{project.role}</dd>
                        {project.stack.length > 0 && (
                          <>
                            <dt style={{ color: 'var(--muted-2)' }}>Built with</dt>
                            <dd style={{ margin: 0 }}>{project.stack.join(' · ')}</dd>
                          </>
                        )}
                        {project.url && (
                          <>
                            <dt style={{ color: 'var(--muted-2)' }}>Address</dt>
                            <dd style={{ margin: 0 }}>
                              {project.status === 'Live' ? (
                                <a href={project.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--orange)' }}>
                                  {displayHost(project.url)} ↗
                                </a>
                              ) : (
                                <span className="muted">{displayHost(project.url)}</span>
                              )}
                            </dd>
                          </>
                        )}
                      </dl>
                      <div className="actions" style={{ marginTop: 0 }}>
                        <Link href={`/work/${project.slug}`} className="button small primary">
                          Read the full story <ArrowUpRight size={15} aria-hidden="true" />
                        </Link>
                        {project.status === 'Live' && project.url && (
                          <a href={project.url} target="_blank" rel="noopener noreferrer" className="button small ghost">
                            Visit live <ArrowUpRight size={15} aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      <section className="section section-ruled">
        <div className="shell">
          <SectionHead
            eyebrow="How the work happens"
            title="The same four questions,"
            accent="every time."
            lead="Whatever the project is, the conversation starts here."
            stack
          />
          <div className="steps">
            <div className="step">
              <div>
                <h3>What has to happen for this to be worth it?</h3>
                <p>The booking, the application, the phone call. One outcome, agreed in writing before anything is designed.</p>
              </div>
              <span className="step-when">Day 1</span>
            </div>
            <div className="step">
              <div>
                <h3>Who is actually going to use it?</h3>
                <p>A specific person on a specific phone on a specific network. Not &ldquo;users&rdquo;.</p>
              </div>
              <span className="step-when">Day 1</span>
            </div>
            <div className="step">
              <div>
                <h3>What is the smallest version that proves it?</h3>
                <p>Build the outcome first. Decorate after it works.</p>
              </div>
              <span className="step-when">Week 1</span>
            </div>
            <div className="step">
              <div>
                <h3>How will we know?</h3>
                <p>Numbers before launch, numbers after. Speed, enquiries, form completion.</p>
              </div>
              <span className="step-when">Launch</span>
            </div>
          </div>
        </div>
      </section>

      <CTABlock
        eyebrow="Your project"
        title="Tell me what it needs"
        accent="to do."
        lead="Describe the outcome and I will tell you honestly whether I am the right person to build it — and roughly what it would take."
        primary={{ href: '/contact', label: 'Start a project' }}
        secondary={{ href: '/services', label: 'See services & pricing' }}
      />

      <div className="shell">
        <Related links={[['/services', 'Services'], ['/about', 'About'], ['/gallery', 'Gallery']]} />
      </div>
    </main>
  );
}
