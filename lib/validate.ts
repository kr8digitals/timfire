import { z } from 'zod';
import type { SiteData } from './content';

const status = z.enum(['draft', 'scheduled', 'published']);
const visibility = z.enum(['public', 'private']);
const s = z.string();
const b = z.boolean();
const service = z.object({ id: s, name: s, ngn: z.number().nullable(), usd: z.number().nullable(), unit: s, note: s, enabled: b });
const website = z.object({ id: s, name: s, url: s, description: s, image: s, isPublic: b, live: b, kind: s });
const agent = z.object({ id: s, name: s, description: s, buildType: z.enum(['Live', 'Private build']), url: s });
const creative = z.object({ id: s, title: s, slug: s, category: z.enum(['Poetry', 'Spoken word', 'Music & piano']), body: s, mediaUrl: s, captionUrl: s.default(''), mediaType: z.enum(['none', 'audio', 'video', 'external']), status, visibility, publishAt: s });
const article = z.object({ id: s, title: s, slug: s, category: s, tags: z.array(s), summary: s, body: s, status, visibility, publishAt: s });

export const schema = z.object({
  version: z.literal(1),
  profile: z.object({ name: s, location: s, intro: s, heroLine: s, heroWelcome: s, heroName: s, about: s }),
  stats: z.array(z.object({ id: s, value: s, label: s, isPublic: b })),
  services: z.array(service),
  websites: z.array(website),
  agents: z.array(agent),
  creative: z.array(creative),
  journal: z.array(article),
  timeline: z.array(z.object({ id: s, year: s, title: s, description: s, isPublic: b })),
  certificates: z.array(z.object({ id: s, title: s, description: s, image: s, isPublic: b })),
  testimonials: z.array(z.object({ id: s, quote: s, name: s, isPublic: b })),
  now: z.object({ items: z.array(s), updated: s }),
  socials: z.array(z.object({ id: s, name: s, url: s, isPublic: b })),
  settings: z.object({ jambScore: s, showJambScore: b, rates: z.record(z.number().positive()), ratesUpdated: s.default('') }),
  media: z.array(z.object({ id: s, src: s, alt: s })),
  revisions: z.record(z.array(z.object({ time: s, value: z.unknown() }))),
});

export const validate = (data: unknown): SiteData => schema.parse(data) as SiteData;
