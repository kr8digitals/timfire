/** Single canonical origin for metadata, sitemaps, feeds and structured data. */
export const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL || 'https://kutimfire.com').replace(/\/$/, '');

/**
 * The one public inbox. Every "email me" on the site, every mailto and the
 * Reply-To on outgoing mail all point here, and it forwards to the owner's
 * private mailbox. It is defined once so an address can never drift between
 * the footer, a form and an email template again.
 *
 * `enquiries@kutimfire.com` still *sends* transactional mail (acks, forwards,
 * sign-in codes) but receives nothing, so nothing on the site advertises it.
 */
export const PUBLIC_EMAIL = 'hello@kutimfire.com';

/** Where the owner actually reads mail. Server-side only — never rendered. */
export const OWNER_EMAIL = 'kutimfire001@gmail.com';
