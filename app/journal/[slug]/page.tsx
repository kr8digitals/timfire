import type { Metadata } from 'next';
import Detail from '@/components/detail';
import { seed, isPublished } from '@/lib/content';
import { SITE_ORIGIN } from '@/lib/site';

/**
 * Committed, published posts get full metadata and are indexable. Posts that
 * exist only in the owner's browser-local draft store still render for preview
 * but stay out of the index until they are committed (or, later, published
 * through the database).
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = seed.journal.find((x) => x.slug === decodeURIComponent(slug) && isPublished(x));
  if (!post) return { title: 'Journal', robots: { index: false, follow: false } };
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/journal/${post.slug}` },
    openGraph: {
      type: 'article',
      title: `${post.title} | TIMFIRE`,
      description: post.summary,
      url: `${SITE_ORIGIN}/journal/${post.slug}`,
      tags: post.tags,
    },
    robots: { index: true, follow: true },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Detail kind="journal" slug={decodeURIComponent(slug)} />;
}
