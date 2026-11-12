import type { Metadata } from 'next';

/**
 * The admin area is a private tool, not a page of the website.
 *
 * It is deliberately excluded from search engines three ways — the metadata
 * here, `robots.txt`, and `X-Robots-Tag` — because a login screen is not
 * something anyone should find in a search result, and a crawler should not
 * spend the owner's bandwidth on it.
 */
export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Admin · TIMFIRE' },
  description: 'Private content management area. Not part of the published site.',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  referrer: 'no-referrer',
};

export const viewport = {
  themeColor: '#0b0706',
  width: 'device-width',
  initialScale: 1,
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-root">{children}</div>;
}
