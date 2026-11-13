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

## Admin sign-in, contact secrecy and the mobile pass — branch `arena/6e17201a-timfire` (2026-11-12)

Run against the **production build** (`npm run build` + `next start -p 3100`):

| Suite | Command | Result |
| --- | --- | --- |
| Type safety | `npx tsc --noEmit` | Pass, no errors |
| Production build | `npm run build` | Pass — 23 page routes + 6 API routes (adds `POST /api/auth/verify`) |
| Route + behaviour smoke | `./qa/smoke.sh http://127.0.0.1:3100` | Pass — 62/62 checks |
| Link crawler | `node qa/link-audit.mjs http://127.0.0.1:3100` | Pass — 22 routes crawled, 23 internal targets resolve, 30 images exist |
| SEO probe | `node qa/seo-probe.mjs http://127.0.0.1:3100` | Pass — 22 unique titles, descriptions, canonicals, OG, `/admin` noindex |

New smoke coverage in this pass:

- **Two-step sign-in:** wrong password → 401 with **no** `set-cookie: timfire_admin` (the password
  alone never grants a session); a second wrong password stays 401 rather than locking;
  `POST /api/auth/verify` with no live code → 401; malformed verify body → 400;
  `/api/auth/session` reports `authenticated:false` for an anonymous visitor. QA sends its failures
  from `203.0.113.7` (documentation range) so repeated runs never spend the owner's attempt budget.
- **Contact secrecy:** `/contact` renders the general form and a reason to write, and must **not**
  contain `Open the form`, `dir-card`, or any `/services/<slug>#form` or `/collaborate/<kind>#form`
  link; the pages that own those forms must still host their `id="form"` anchor.
- **Mobile zoom fixes:** the built stylesheet must contain `touch-action:manipulation`,
  `text-size-adjust:100%` and `overflow-x:clip`; the homepage must carry `hero-lead-short`.

Not provable in the sandbox: the sandbox cannot reach `api.resend.com` or `supabase.co`, so the
sign-in code email, the database writes and every real send must be confirmed on production
(sign in at `/admin`, then "Send test email" in the Emails tab).

## Debugging the live reports — branch `arena/c8d298c9-timfire` (2026-11-13)

Three things were reported broken on production. All three are diagnosed, fixed and now covered by a
check that fails if they regress.

| Report | Root cause | Proof |
| --- | --- | --- |
| "The list is unavailable right now" | `subscribers.name` did not exist in the live table while `addSubscriber()` wrote it, so every insert errored and the route answered 503. Nothing logged it. | Reproduced the exact error against the database (`42703: column "name" of relation "subscribers" does not exist`), added the column by migration, then inserted and removed a probe row using the code's own shape. `npm run qa:schema` now fails if code and schema disagree. |
| "Email or password is incorrect" ×4, then a lockout | The dashboard was configured for `kutimfire001@mail.com` and the owner typed `kutimfire001@gmail.com`. One message covered both halves, so nothing distinguished them. `ADMIN_EMAIL` is now the gmail address. | `qa/auth-flow.mjs` asserts a wrong password is refused silently, and that a right password at the wrong address names the address the dashboard uses. |
| "I haven't confirmed the other ones are sending" | Never tested: no email had ever left production (`email_log` was empty). Two real bugs were sitting in that path — the Resend SDK drops `reply_to`, so forwarded enquiries went out with no Reply-To, and the welcome letter had no unsubscribe link. | `npm run qa:email` drives the real SDK with HTTP stubbed and asserts the body it would send, including that snake_case `reply_to` is dropped and `replyTo` is not. `npm run qa:auth` asserts the welcome letter greets the subscriber by name and carries their own token. |

Also found and fixed while in there:

- **Sign-in state lived in process memory.** A serverless function is many short-lived instances, so
  the code emailed by one instance was invisible to the instance that received the verify request, and
  the rate-limit counters reset whenever an instance was recycled. State now lives in `admin_signins`
  (the code as a sha256 hash, never plaintext), with memory as a same-instance fast path and as the
  fallback if the database is unreachable.
- **Logout did not end the session.** A signed stateless cookie stays valid until it expires; deleting
  it client-side was the only thing happening. The nonce is now written to a revocation list that
  `session()` checks, and `qa/auth-flow.mjs` proves a replayed cookie is refused after logout.
- Database failures in the mail and subscriber paths were silent; they now write to the server log.

### Results, against the production build

| Suite | Command | Result |
| --- | --- | --- |
| Type safety | `npx tsc --noEmit` | Pass |
| Build | `npm run build` | Pass |
| Routes + behaviour | `./qa/smoke.sh http://127.0.0.1:3100` | **91/91** |
| Link crawler | `node qa/link-audit.mjs http://127.0.0.1:3100` | Pass — every internal CTA resolves; all 30 referenced images exist |
| SEO probe | `node qa/seo-probe.mjs http://127.0.0.1:3100` | Pass — titles unique, descriptions present, canonicals correct, OG set, `/admin` noindex |
| Schema contract | `npm run qa:schema` | Pass — 7 tables, 33 columns the code names |
| Email contract | `npm run qa:email` | Pass — 7 checks |
| Sign-in + subscribe | `npm run qa:auth` | **55/55** — real built server, mock Resend, mock Supabase |

Still only provable on production: a real Resend delivery (sign in at `/admin` and the code arrives in
the gmail inbox), and mail arriving *at* `hello@kutimfire.com`, which needs the MX records in
`HANDOVER.md` section 11 before anything can receive there.
