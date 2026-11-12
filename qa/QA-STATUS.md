# QA status

## Rebuild verification — branch `arena/42f61ac6-timfire` (2026-11-12)

Run against the **production build** (`npm run build` + `next start`) and the dev server:

| Suite | Command | Result |
| --- | --- | --- |
| Type safety | `npx tsc --noEmit` | Pass, no errors |
| Production build | `npm run build` | Pass — 22 page routes + 5 API routes; landing and collaboration pages prerendered via `generateStaticParams` |
| Route + behaviour smoke | `./qa/smoke.sh` | Pass — 37/37 checks (routes incl. `/gallery`, 7 service and 4 collaboration pages, 404 path, per-form contact API incl. honeypot and unknown-kind, inbox auth, security headers, hero copy, forbidden phrase) |
| Link crawler | `node qa/link-audit.mjs` | Pass — 22 routes crawled, 23 unique internal link targets all resolve 200, 30 referenced images all exist in `public/` |
| SEO probe | `node qa/seo-probe.mjs` | Pass — 22 unique titles, meta descriptions ≥40 chars, canonicals match routes, `og:title` everywhere, `/admin` noindex |
| Admin chain | curl | Login 200 with bcrypt hash stored base64 (see `lib/auth.ts`), structured enquiry → `/api/admin/inbox` returns kind + answers, unauthenticated inbox 401 |
| Currency | curl | SSR prices render from the naira base (`₦150,000 / ₦200,000 / ₦80,000 / ₦20,000`); client switch converts instantly from `lib/currency.ts` rates or the admin-edited table |

Manual/visual checks remain for a human pass: breakpoint sweep on real devices, canvas scene
elegance on low-end hardware, and the gallery lightbox on touch devices (keyboard paths are
implemented and labelled).

## Vercel

Production target at the time of the rebuild stayed on the pre-development base commit; pushes to
this branch created private, SSO-protected **preview** deployments only (project keeps 10
deployments / 30 days). The Vercel connector exposes no toggle for preview builds, so the remaining
pushes were limited to the final QA commit and the approved merge to `main`, which promotes the
production deployment.

## Earlier status (pre-development build)

Checks run locally on the production build at the commit that added the animation, contact form,
visitor bar and inbox work. Superseded by the matrix above; kept for history.

| Area | Check | Result |
| --- | --- | --- |
| Build | `npm run build` compiles all 20 routes | Pass |
| Types | `npx tsc --noEmit` | Pass, no errors |
| Routes | `/`, `/about`, `/work`, `/ventures`, `/services`, `/creative`, `/journal`, `/timeline`, `/now`, `/contact`, `/admin` return 200; unknown path returns 404 | Pass |
| Hero copy | Server HTML still contains “You're the one I've been expecting.”, “Welcome to my space.” and “I am Timfire.” with `Timfire` in `<em>` | Pass |
| Hero animation | Headline, welcome line, name line and CTAs mount in sequence (0 → 1.15s), with reduced-motion fallback that renders everything immediately | Pass |
| CTA alignment | Both CTAs share one flex row, wrap cleanly at 320px, minimum 50px height | Pass |
| Shapes | Four decorative shapes behind the hero, `aria-hidden`, pointer-events none, CSS float + scroll parallax, disabled under `prefers-reduced-motion` | Pass |
| Scroll cue | Visible link to `#behind` on every breakpoint, animated chevron disabled under reduced motion | Pass |
| Contact form | Client validation, inline errors with `aria-invalid`/`role="alert"`, honeypot hidden off-screen, success state with WhatsApp fallback | Pass |
| Contact API | Valid POST → `{ok:true}`; invalid POST → 400; honeypot-filled POST → 200 without storing; 6th POST within 15 min → 429 | Pass |
| Admin auth | Wrong password → 401, correct password → 200 + HttpOnly signed cookie, `/api/auth/session` reports the expiry, logout clears it | Pass |
| Admin lockout | 5 sequential failures → 429, correct password refused while the 15-minute lock is active | Pass |
| Admin inbox | `/api/admin/inbox` returns 401 without a session, enquiries when signed in; CSV export in the tab | Pass |
| Search | Ctrl/Cmd+K opens the dialog, Escape closes, focus is trapped and restored, results include pages, work, agents, services, published journal and creative | Pass |
| Reduced motion | `useReducedMotion` short-circuits every animation; CSS also clamps animation/transition durations | Pass |
| Security headers | CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` and production-only `X-Frame-Options` served on all routes | Pass |
| Header nav | Desktop primary links plus an accessible “More” menu; mobile menu lists all pages | Pass |
| Contact fallback | Success state offers a prefilled `mailto:` and WhatsApp, so delivery never depends on the session inbox | Pass |
