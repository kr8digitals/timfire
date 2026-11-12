// Per-page SEO probe.
//   node qa/seo-probe.mjs [base-url]
// Asserts every public route ships a unique <title>, a meta description, a
// canonical link and OpenGraph title; asserts /admin stays out of the index.
const BASE = process.argv[2] || 'http://127.0.0.1:3000';
const ROUTES = [
  '/', '/about', '/work', '/ventures', '/services', '/creative', '/journal', '/gallery', '/timeline', '/now', '/contact',
  '/services/website-design-development', '/services/ai-agent-development', '/services/seo-optimisation',
  '/services/graphic-design', '/services/branding', '/services/video-editing', '/services/mentorship',
  '/collaborate/music', '/collaborate/spoken-word', '/collaborate/poetry', '/collaborate/speaking',
];
const failures = [];
const titles = new Map();

const pick = (html, re) => (html.match(re) || [])[1] || '';

for (const route of ROUTES) {
  const html = await (await fetch(BASE + route)).text();
  const title = pick(html, /<title>(.*?)<\/title>/s);
  const desc = pick(html, /<meta name="description" content="([^"]*)"/);
  const canonical = pick(html, /<link rel="canonical" href="([^"]*)"/);
  const og = pick(html, /<meta property="og:title" content="([^"]*)"/);
  if (!title) failures.push(`${route}: no <title>`);
  if (title && titles.has(title)) failures.push(`${route}: duplicate title "${title}" (also ${titles.get(title)})`);
  if (title) titles.set(title, route);
  if (!desc || desc.length < 40) failures.push(`${route}: thin or missing meta description`);
  const canonicalOk = route === '/' ? /kutimfire\.com\/?$/.test(canonical) : canonical.endsWith(route);
  if (!canonical || !canonicalOk) failures.push(`${route}: canonical "${canonical}" does not match route`);
  if (!og) failures.push(`${route}: missing og:title`);
}

const admin = await (await fetch(BASE + '/admin')).text();
if (!/name="robots" content="[^"]*noindex/.test(admin)) failures.push('/admin: not noindex');

console.log(`titles checked: ${titles.size}`);
if (failures.length) {
  console.log('FAILURES:');
  for (const f of failures) console.log(' - ' + f);
  process.exit(1);
}
console.log('PASS: titles unique, descriptions present, canonicals correct, og set, admin noindex.');
