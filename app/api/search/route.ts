import { NextResponse } from 'next/server';
import { getContent } from '@/lib/cms/store';
import { isLive } from '@/lib/cms/types';
import { ENABLED_SERVICES } from '@/lib/services';
import { NAV_MORE } from '@/components/site/nav';

/**
 * Builds the search index on the client's behalf from the live content, so the
 * dialog never has to ship the whole content document to the browser.
 */
export const dynamic = 'force-static';
export const revalidate = 300;

type Entry = { title: string; href: string; type: string; terms: string };

export async function GET() {
  const content = await getContent();
  const entries: Entry[] = [];

  const staticPages: [string, string, string][] = [
    ['/', 'Home', 'Welcome, what I do, and where to start'],
    ['/work', 'Work', 'Websites, AI agents and studio builds'],
    ['/services', 'Services & pricing', 'What each service costs and what is included'],
    ['/about', 'About', 'The person, the story, the credentials'],
    ['/gallery', 'Gallery', 'Photographs and portraits'],
    ['/journal', 'Journal', 'Writing on process, AI and building'],
    ['/creative', 'Creative', 'Poetry, spoken word, music and piano'],
    ['/ventures', 'Ventures', 'KR8 DIGITALS, KR8 Academy and KR8 Tribe'],
    ['/timeline', 'Timeline', 'Milestones so far'],
    ['/now', 'Now', 'What I am doing at the moment'],
    ['/contact', 'Contact', 'Reach me by email or WhatsApp'],
  ];
  for (const [href, title, desc] of staticPages) {
    entries.push({ href, title, type: 'Page', terms: `${title} ${desc} ${href}` });
  }

  for (const nav of NAV_MORE) entries.push({ href: nav.href, title: nav.label, type: 'Page', terms: `${nav.label} ${nav.desc || ''}` });

  for (const service of ENABLED_SERVICES) {
    entries.push({
      href: `/services/${service.key}`,
      title: service.name,
      type: 'Service',
      terms: `${service.name} ${service.eyebrow} ${service.summary} ${service.heroLead} price cost hire`,
    });
  }

  for (const project of content.projects.filter((p) => p.isPublic)) {
    entries.push({
      href: `/work#${project.slug}`,
      title: project.name,
      type: project.kind,
      terms: `${project.name} ${project.summary} ${project.stack.join(' ')} ${project.role}`,
    });
  }

  for (const post of content.posts.filter(isLive)) {
    entries.push({
      href: `/journal/${post.slug}`,
      title: post.title,
      type: 'Journal',
      terms: `${post.title} ${post.summary} ${post.category} ${post.tags.join(' ')} ${post.body}`,
    });
  }

  for (const piece of content.creative.filter(isLive)) {
    entries.push({
      href: `/creative/${piece.slug}`,
      title: piece.title,
      type: piece.category,
      terms: `${piece.title} ${piece.lede} ${piece.body} ${piece.category}`,
    });
  }

  for (const venture of content.ventures.filter((v) => v.isPublic)) {
    entries.push({
      href: `/ventures#${venture.slug}`,
      title: venture.name,
      type: 'Venture',
      terms: `${venture.name} ${venture.tagline} ${venture.description}`,
    });
  }

  for (const item of content.timeline.filter((t) => t.isPublic)) {
    entries.push({
      href: '/timeline',
      title: `${item.year} — ${item.title}`,
      type: 'Timeline',
      terms: `${item.year} ${item.title} ${item.description}`,
    });
  }

  for (const photo of content.gallery.filter((g) => g.visibility === 'public')) {
    entries.push({
      href: `/gallery?photo=${photo.id}`,
      title: photo.title,
      type: 'Photograph',
      terms: `${photo.title} ${photo.caption} ${photo.collection} ${photo.alt}`,
    });
  }

  return NextResponse.json({ entries }, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } });
}
