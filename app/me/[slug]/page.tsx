import type { Metadata } from 'next';
import Detail from '@/components/detail';
import { publicView } from '@/lib/content';
import { loadSiteData } from '@/lib/db';
import { SITE_ORIGIN } from '@/lib/site';

/**
 * Committed-or-published posts get full metadata and are indexable. Posts that
 * exist only as drafts still render for an authenticated preview but stay out
 * of the index until they are published.
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data } = await loadSiteData();
  const post = publicView(data).journal.find((x) => x.slug === decodeURIComponent(slug));
  if (!post) return { title: 'Me', robots: { index: false, follow: false } };
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/me/${post.slug}` },
    openGraph: {
      type: 'article',
      title: `${post.title} | TIMFIRE`,
      description: post.summary,
      url: `${SITE_ORIGIN}/me/${post.slug}`,
      tags: post.tags,
    },
    robots: { index: true, follow: true },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Detail kind="journal" slug={decodeURIComponent(slug)} />;
}
