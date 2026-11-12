import type { Metadata } from 'next';
import Detail from '@/components/detail';
import { publicView } from '@/lib/content';
import { loadSiteData } from '@/lib/db';
import { SITE_ORIGIN } from '@/lib/site';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data } = await loadSiteData();
  const piece = publicView(data).creative.find((x) => x.slug === decodeURIComponent(slug));
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
