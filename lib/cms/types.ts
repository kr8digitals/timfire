/**
 * Content types for the TIMFIRE site.
 *
 * These interfaces are the single source of truth for both the public site and
 * the admin CMS. Public pages are rendered on the server from the content store
 * (see `lib/cms/store.ts`), so every route is statically generated and fully
 * indexable — no client-side content loading.
 */

export type Status = 'draft' | 'scheduled' | 'published';
export type Visibility = 'public' | 'private';

export interface Entry {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/* ── Writing ─────────────────────────────────────────────────────────────── */

export interface Post extends Entry {
  title: string;
  slug: string;
  category: string;
  tags: string[];
  summary: string;
  /** Markdown-ish body: blank-line paragraphs, ## headings, - lists, **bold**, *italic*, > quotes, [text](url) */
  body: string;
  cover: string;
  coverAlt: string;
  status: Status;
  visibility: Visibility;
  publishedAt: string;
  featured: boolean;
  readingMinutes: number;
}

export interface CreativePiece extends Entry {
  title: string;
  slug: string;
  category: 'Poetry' | 'Spoken word' | 'Music & piano';
  /** Short line shown on the card */
  lede: string;
  body: string;
  cover: string;
  coverAlt: string;
  mediaType: 'none' | 'audio' | 'video' | 'external';
  mediaUrl: string;
  captionUrl: string;
  status: Status;
  visibility: Visibility;
  publishedAt: string;
  featured: boolean;
}

/* ── Photography ─────────────────────────────────────────────────────────── */

export interface GalleryItem extends Entry {
  src: string;
  alt: string;
  title: string;
  caption: string;
  collection: string;
  year: string;
  orientation: 'portrait' | 'landscape' | 'square';
  featured: boolean;
  visibility: Visibility;
  order: number;
}

/* ── Work ────────────────────────────────────────────────────────────────── */

export interface Project extends Entry {
  name: string;
  slug: string;
  url: string;
  /** Omit the protocol in display, keep it here */
  summary: string;
  description: string[];
  role: string;
  year: string;
  image: string;
  imageAlt: string;
  kind: 'Website' | 'Website redesign' | 'AI agent' | 'KR8 studio build';
  stack: string[];
  highlights: string[];
  status: 'Live' | 'In development' | 'Private build';
  isPublic: boolean;
  order: number;
}

/* ── Ventures ────────────────────────────────────────────────────────────── */

export interface Venture extends Entry {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  url: string;
  image: string;
  imageAlt: string;
  facts: { label: string; value: string }[];
  isPublic: boolean;
  order: number;
}

/* ── About ───────────────────────────────────────────────────────────────── */

export interface TimelineItem extends Entry {
  year: string;
  title: string;
  description: string;
  kind: 'milestone' | 'learning' | 'recognition' | 'building';
  isPublic: boolean;
}

export interface Credential extends Entry {
  title: string;
  issuer: string;
  date: string;
  description: string;
  image: string;
  isPublic: boolean;
}

export interface NowItem extends Entry {
  label: string;
  body: string;
  isPublic: boolean;
  order: number;
}

/* ── Services & enquiries ────────────────────────────────────────────────── */

export interface ServiceOverride {
  /** ServiceKey from lib/services.ts */
  key: string;
  enabled: boolean;
  /** NGN base price. null keeps the default from lib/services.ts */
  ngn: number | null;
  priceNote: string;
}

export interface Enquiry extends Entry {
  service: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  budget: string;
  timeline: string;
  message: string;
  /** Extra answers, keyed by the field label used on that landing page */
  details: Record<string, string>;
  status: 'new' | 'read' | 'replied' | 'archived';
  source: string;
  userAgent: string;
}

/* ── Site settings ───────────────────────────────────────────────────────── */

export interface Stat {
  id: string;
  value: string;
  label: string;
  /** Where the number comes from. Shown as a footnote; keeps us honest. */
  source: string;
  isPublic: boolean;
}

export interface SiteSettings {
  name: string;
  role: string;
  base: string;
  email: string;
  whatsapp: string;
  heroWelcome: string;
  heroLine: string;
  heroName: string;
  stats: Stat[];
  socials: { id: string; name: string; url: string; isPublic: boolean }[];
  ratesUpdated: string;
  rates: Record<string, number>;
}

/* ── Aggregate document ──────────────────────────────────────────────────── */

export interface SiteContent {
  version: 2;
  settings: SiteSettings;
  posts: Post[];
  creative: CreativePiece[];
  gallery: GalleryItem[];
  projects: Project[];
  ventures: Venture[];
  timeline: TimelineItem[];
  credentials: Credential[];
  now: NowItem[];
  serviceOverrides: ServiceOverride[];
}

export const CONTENT_VERSION = 2;

export function isLive(item: { status: Status; visibility: Visibility; publishedAt?: string }): boolean {
  if (item.visibility !== 'public') return false;
  if (item.status === 'published') return true;
  if (item.status === 'scheduled' && item.publishedAt) {
    return new Date(item.publishedAt).getTime() <= Date.now();
  }
  return false;
}

export function readingMinutes(body: string): number {
  return Math.max(1, Math.ceil(body.trim().split(/\s+/).length / 210));
}

export function formatDate(iso: string, style: 'long' | 'short' = 'long'): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
