import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { getContent } from '@/lib/cms/store';
import { displayHost } from '@/lib/safe';
import { Related } from '@/components/site/ui';
import { Reveal } from '@/components/site/motion';
import { SITE_URL } from '@/lib/site';

export async function generateStaticParams() {
  const content = await getContent();
  return content.projects.filter((p) => p.isPublic).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContent();
  const project = content.projects.find((p) => p.slug === slug && p.isPublic);
  if (!project) return { title: 'Project not found', robots: { index: false, follow: false } };
  return {
    title: `${project.name} — ${project.kind}`,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      type: 'article',
      title: `${project.name} — ${project.kind} by TIMFIRE`,
      description: project.summary,
      images: [{ url: project.image, alt: project.imageAlt }],
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getContent();
  const project = content.projects.find((p) => p.slug === slug && p.isPublic);
  if (!project) notFound();

  const others = content.projects
    .filter((p) => p.isPublic && p.id !== project.id)
    .slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Work', item: `${SITE_URL}/work` },
          { '@type': 'ListItem', position: 3, name: project.name, item: `${SITE_URL}/work/${project.slug}` },
        ],
      },
      {
        '@type': 'CreativeWork',
        name: project.name,
        description: project.summary,
        url: project.url,
        dateCreated: project.year,
        creator: { '@type': 'Person', name: 'Kenneth Timothy Iziogo', url: SITE_URL },
        image: `${SITE_URL}${project.image}`,
      },
    ],
  };

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="page-hero">
        <span className="hero-art-line" aria-hidden="true" />
        <div className="shell">
          <Link href="/work" className="text-link" style={{ marginBottom: 22 }}>
            <ArrowLeft size={16} aria-hidden="true" /> All work
          </Link>
          <div className="cluster" style={{ gap: 8, marginBottom: 16 }}>
            <span className="badge outline">{project.kind}</span>
            <span className={`badge ${project.status === 'Live' ? 'live' : 'outline'}`}>{project.status}</span>
            <span className="badge outline">{project.year}</span>
          </div>
          <h1>{project.name}</h1>
          <p className="page-lead">{project.summary}</p>
          <div className="actions">
            {project.status === 'Live' && project.url ? (
              <a href={project.url} className="button primary" target="_blank" rel="noopener noreferrer">
                Visit the live site <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            ) : (
              <span className="badge outline">Not public yet</span>
            )}
            <Link href="/contact" className="button ghost">
              Start something like this <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          <Reveal>
            <div className="frame" style={{ maxHeight: 620 }}>
              <Image
                src={project.image}
                alt={project.imageAlt}
                width={1400}
                height={900}
                priority
                sizes="(max-width: 900px) 94vw, 1200px"
                style={{ width: '100%', maxHeight: 620, objectFit: 'cover' }}
              />
            </div>
          </Reveal>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,.8fr)',
              gap: 'clamp(28px,5vw,64px)',
              marginTop: 'clamp(34px,5vw,64px)',
              alignItems: 'start',
            }}
            className="two-col"
          >
            <div>
              {project.description.map((para) => (
                <Reveal key={para.slice(0, 24)}>
                  <p style={{ fontSize: 'clamp(1.02rem,1.5vw,1.14rem)', lineHeight: 1.72, color: '#e9dfd8' }}>{para}</p>
                </Reveal>
              ))}

              {project.highlights.length > 0 && (
                <Reveal>
                  <h2 style={{ fontSize: 'clamp(1.4rem,2.4vw,1.9rem)', marginTop: 40 }}>What it actually does</h2>
                  <ul className="list" style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
                    {project.highlights.map((item) => (
                      <li key={item} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <CheckCircle2 size={18} aria-hidden="true" style={{ color: 'var(--orange)', flex: 'none', marginTop: 3 }} />
                        <span style={{ color: 'var(--muted)' }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )}
            </div>

            <aside className="card flat stack-sm" style={{ position: 'sticky', top: 100 }}>
              <div>
                <span className="kicker">Role</span>
                <p style={{ margin: '4px 0 0', fontSize: '.96rem' }}>{project.role}</p>
              </div>
              <div>
                <span className="kicker">Year</span>
                <p style={{ margin: '4px 0 0', fontSize: '.96rem' }}>{project.year}</p>
              </div>
              {project.stack.length > 0 && (
                <div>
                  <span className="kicker">Built with</span>
                  <ul style={{ margin: '6px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {project.stack.map((s) => (
                      <li key={s} className="tag" style={{ margin: 0 }}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {project.url && (
                <div>
                  <span className="kicker">Address</span>
                  <p style={{ margin: '4px 0 0', fontSize: '.94rem', wordBreak: 'break-word' }}>
                    {project.status === 'Live' ? (
                      <a href={project.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--orange)' }}>
                        {displayHost(project.url)} ↗
                      </a>
                    ) : (
                      <span className="muted">{displayHost(project.url)}</span>
                    )}
                  </p>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      {others.length > 0 && (
        <section className="section section-ruled">
          <div className="shell">
            <h2 style={{ fontSize: 'clamp(1.5rem,2.6vw,2rem)', marginBottom: 20 }}>Also worth a look</h2>
            <div className="page-grid three">
              {others.map((p) => (
                <Link key={p.id} href={`/work/${p.slug}`} className="card hoverable" style={{ display: 'grid', gap: 8, alignContent: 'start' }}>
                  <span className="badge outline" style={{ justifySelf: 'start' }}>{p.kind}</span>
                  <h3 style={{ margin: 0, fontSize: '1.06rem' }}>{p.name}</h3>
                  <p className="muted" style={{ margin: 0, fontSize: '.9rem' }}>{p.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="shell">
        <Related
          back={{ href: '/work', label: 'All work' }}
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
