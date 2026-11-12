import type { Metadata } from 'next';
import Gallery from '@/components/gallery';
import { GALLERY } from '@/lib/gallery';
import { SITE_ORIGIN } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Gallery',
  description:
    'Portraits, stages, studios, classrooms and street light — the photographed record of TIMFIRE’s work and the life around it.',
  alternates: { canonical: '/gallery' },
  openGraph: {
    title: 'Gallery | TIMFIRE',
    description: 'The photographed record of the work and the life around it.',
    images: ['/images/og.jpg'],
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ImageGallery',
            name: 'TIMFIRE Gallery',
            url: `${SITE_ORIGIN}/gallery`,
            image: GALLERY.map((s) => ({
              '@type': 'ImageObject',
              contentUrl: SITE_ORIGIN + s.src,
              caption: s.caption,
              description: s.alt,
            })),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN },
              { '@type': 'ListItem', position: 2, name: 'Gallery', item: `${SITE_ORIGIN}/gallery` },
            ],
          }),
        }}
      />
      <section className="shell page-hero">
        <span className="eyebrow">The gallery</span>
        <h1>
          Every frame,
          <br />
          <em>as it happened.</em>
        </h1>
        <p className="page-lead">
          Portraits, stages, studios, classrooms and street light — the photographed record of the work and the life
          around it. Open any frame to see it full size; the arrow keys walk you through the set.
        </p>
      </section>
      <section className="shell" style={{ paddingBottom: 90 }}>
        <Gallery />
      </section>
    </>
  );
}
