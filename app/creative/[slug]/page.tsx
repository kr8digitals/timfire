import type { Metadata } from 'next';
import Detail from '@/components/detail';
import { seed, isPublished } from '@/lib/content';
import { SITE_ORIGIN } from '@/lib/site';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const piece = seed.creative.find((x) => x.slug === decodeURIComponent(slug) && isPublished(x));
  if (!piece) return { title: 'Creative', robots: { index: false, follow: false } };
  return {
    title: piece.title,
    description: `${piece.category} by TIMFIRE.`,
    alternates: { canonical: `/creative/${piece.slug}` },
    openGraph: {
      title: `${piece.title} | TIMFIRE`,
      description: `${piece.category} by TIMFIRE.`,
      url: `${SITE_ORIGIN}/creative/${piece.slug}`,
    },
    robots: { index: true, follow: true },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Detail kind="creative" slug={decodeURIComponent(slug)} />;
}
