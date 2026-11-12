// Site-wide CTA / link crawler.
//   node qa/link-audit.mjs [base-url]
// Fetches every page route, extracts every internal href, crawls each unique
// target and asserts it resolves with 200. Also asserts every /images/… file
// referenced in the served HTML exists in public/. Exit code 1 on any failure.
import fs from 'node:fs';

const BASE = process.argv[2] || 'http://127.0.0.1:3000';
const ROUTES = [
  '/', '/about', '/work', '/ventures', '/services', '/creative', '/journal', '/gallery', '/timeline', '/now', '/contact',
  '/services/website-design-development', '/services/ai-agent-development', '/services/seo-optimisation',
  '/services/graphic-design', '/services/branding', '/services/video-editing', '/services/mentorship',
  '/collaborate/music', '/collaborate/spoken-word', '/collaborate/poetry', '/collaborate/speaking',
];

const links = new Map();
const imageRefs = new Set();
const failures = [];

for (const route of ROUTES) {
  const res = await fetch(BASE + route);
  const html = await res.text();
  if (res.status !== 200) failures.push(`ROUTE ${route} -> ${res.status}`);
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const href = m[1];
    if (!href.startsWith('/') || href.startsWith('//') || href.startsWith('/_next') || href.startsWith('/api')) continue;
    const path = href.split('#')[0].split('?')[0];
    if (!path) continue;
    links.set(path, (links.get(path) || 0) + 1);
  }
  for (const m of html.matchAll(/\/images\/[A-Za-z0-9_\-./%]+/g)) imageRefs.add(decodeURIComponent(m[0]));
}

for (const path of links.keys()) {
  const res = await fetch(BASE + path, { redirect: 'manual' });
  if (res.status !== 200) failures.push(`LINK ${path} -> ${res.status}`);
}

for (const img of imageRefs) {
  if (!fs.existsSync('public' + img)) failures.push(`IMAGE ${img} referenced but missing from public/`);
}

console.log(`routes crawled: ${ROUTES.length}`);
console.log(`unique internal link targets: ${links.size} — all requested`);
console.log(`image references checked: ${imageRefs.size}`);
if (failures.length) {
  console.log('FAILURES:');
  for (const f of failures) console.log(' - ' + f);
  process.exit(1);
}
console.log('PASS: every internal CTA resolves to a real route; every referenced image exists.');
