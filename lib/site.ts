/**
 * The canonical origin.
 *
 * Preview deployments need absolute URLs that point at the deployment itself,
 * not at production — otherwise every Open Graph image on a preview is wrong,
 * and a preview can accidentally advertise production URLs to a crawler.
 *
 * Vercel exposes the deployment host in `VERCEL_URL`. `NEXT_PUBLIC_SITE_URL`
 * overrides everything, so a custom domain or a local tunnel can be used.
 */
const raw = (process.env.NEXT_PUBLIC_SITE_URL || '').trim();

function resolve(): string {
  if (raw) {
    try {
      return new URL(raw).origin;
    } catch {
      // A malformed value should not take the whole site down.
    }
  }
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production' && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'https://kutimfire.com';
}

export const SITE_URL = resolve();

/** Absolute URL for a path, for metadata and structured data. */
export function absolute(pathname = '/'): string {
  return new URL(pathname, SITE_URL).toString();
}
