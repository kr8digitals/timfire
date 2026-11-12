import type { Metadata } from 'next';
import { getContent } from '@/lib/cms/store';
import GalleryGrid from '@/components/site/gallery';
import { PageHero, Related, CTABlock } from '@/components/site/ui';
import { Reveal } from '@/components/site/motion';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Gallery — photographs',
  description:
    'Studio portraits, street frames, church, culture and the workspace — the photographs of TIMFIRE, Kenneth Timothy Iziogo, from Abakaliki, Nigeria.',
  alternates: { canonical: '/gallery' },
  openGraph: {
    title: 'Gallery | TIMFIRE',
    description: 'Portraits, street frames and the places in between.',
    images: ['/images/gallery/01-orange-suit.webp'],
  },
};

export default async function GalleryPage() {
  const content = await getContent();
  const items = content.gallery
    .filter((g) => g.visibility === 'public')
    .sort((a, b) => a.order - b.order);

  const collections = Array.from(new Set(items.map((i) => i.collection)));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ImageGallery',
        name: 'TIMFIRE — photographs',
        description: 'Studio portraits, street photography and archive frames of Kenneth Timothy Iziogo.',
        url: `${SITE_URL}/gallery`,
        about: { '@type': 'Person', name: 'Kenneth Timothy Iziogo', alternateName: 'TIMFIRE' },
        image: items.slice(0, 12).map((item) => ({
          '@type': 'ImageObject',
          contentUrl: `${SITE_URL}${item.src}`,
          name: item.title,
          description: item.caption,
          caption: item.alt,
          creator: { '@type': 'Person', name: 'Kenneth Timothy Iziogo' },
          datePublished: item.year,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Gallery', item: `${SITE_URL}/gallery` },
        ],
      },
    ],
  };

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageHero
        eyebrow="Photographs"
        title="Every frame"
        accent="that holds up."
        lead="Studio sessions, street walks, church, traditional dress, and the desk where the websites get built. Everything from the archive worth keeping — not a curated handful."
      >
        <div className="cluster" style={{ marginTop: 24 }}>
          <span className="badge orange">{items.length} photographs</span>
          {collections.map((name) => (
            <span className="badge outline" key={name}>
              {name}
            </span>
          ))}
        </div>
      </PageHero>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          <Reveal>
            <GalleryGrid items={items} />
          </Reveal>
        </div>
      </section>

      <section className="section section-ruled">
        <div className="shell two-col" style={{ alignItems: 'center', gap: 'clamp(24px,5vw,64px)' }}>
          <Reveal>
            <div>
              <span className="eyebrow">About the archive</span>
              <h2 style={{ margin: '14px 0 18px' }}>
                No studio budget, <em>no problem.</em>
              </h2>
              <p className="muted">
                Most of these were shot with friends, in borrowed rooms, on phones and borrowed cameras. A few came out
                of formal sessions with a photographer and a lighting setup. The difference shows, and it is kept
                deliberately — a portrait gallery that only contains studio work is not an honest archive.
              </p>
              <p className="muted">
                Frames that cut someone&apos;s face awkwardly, or were too dark to recover, are not here. Everything
                else that was usable is.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="card flat">
              <span className="kicker">Using a photograph</span>
              <p className="muted" style={{ margin: '8px 0 14px' }}>
                Press, event organisers and collaborators are welcome to use these images for editorial coverage with
                credit. Commercial use needs a conversation first.
              </p>
              <a href="mailto:hi@kutimfire.com?subject=Photograph%20usage" className="text-link">
                Ask about usage
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <CTABlock
        eyebrow="Need photographs"
        title="I shoot with a camera"
        accent="in my hand."
        lead="Not a photography business, but I do shoot for the projects I build — hotel galleries, team photos, event coverage. Ask if that is useful."
        primary={{ href: '/contact', label: 'Ask about a shoot' }}
        secondary={{ href: '/work', label: 'See the projects' }}
      />

      <div className="shell">
        <Related links={[['/about', 'About'], ['/creative', 'Creative work'], ['/work', 'Work']]} />
      </div>
    </main>
  );
}
