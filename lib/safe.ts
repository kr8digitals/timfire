/** Only allow http(s) URLs out of stored content, so a bad field cannot inject a javascript: link. */
export function safeUrl(url: string | undefined | null): string {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.href : '';
  } catch {
    return '';
  }
}

/** Allow only in-site image paths or data URLs from the trusted prefixes. */
export function safeImage(src: string | undefined | null): string {
  if (!src) return '';
  if (src.startsWith('/images/') || src.startsWith('/uploads/')) return src;
  if (src.startsWith('https://')) return src;
  return '';
}

export function displayHost(url: string): string {
  return safeUrl(url).replace(/^https?:\/\//, '').replace(/\/$/, '');
}
