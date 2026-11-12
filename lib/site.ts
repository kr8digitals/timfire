/** Single canonical origin for metadata, sitemaps, feeds and structured data. */
export const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL || 'https://kutimfire.com').replace(/\/$/, '');
