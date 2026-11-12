# QA status

Checks run locally on the production build (`npm run build` + `npm run start`) at the commit that
added the animation, contact form, visitor bar and inbox work.

## Verified

| Area | Check | Result |
| --- | --- | --- |
| Build | `npm run build` compiles all 20 routes | Pass |
| Types | `npx tsc --noEmit` | Pass, no errors |
| Routes | `/`, `/about`, `/work`, `/ventures`, `/services`, `/creative`, `/journal`, `/timeline`, `/now`, `/contact`, `/admin` return 200; unknown path returns 404 | Pass |
| Hero copy | Server HTML still contains “You're the one I've been expecting.”, “Welcome to my space.” and “I am Timfire.” with `Timfire` in `<em>` | Pass |
| Hero animation | Headline, welcome line, name line and CTAs mount in sequence (0 → 1.15s), with reduced-motion fallback that renders everything immediately | Pass |
| CTA alignment | Both CTAs share one flex row, wrap cleanly at 320px, minimum 50px height | Pass |
| Shapes | Four decorative shapes behind the hero, `aria-hidden`, pointer-events none, CSS float + scroll parallax, disabled under `prefers-reduced-motion` | Pass |
| Scroll cue | Visible link to `#explore` on every breakpoint, animated chevron disabled under reduced motion | Pass |
| Contact form | Client validation (name, email format, topic, 10-char message), inline errors with `aria-invalid`/`role="alert"`, honeypot hidden off-screen, success state with WhatsApp fallback | Pass |
| Contact API | Valid POST → `{ok:true}`; invalid POST → 400 with first error; honeypot-filled POST → 200 without storing; 6th POST within 15 min → 429 | Pass |
| Admin auth | With disposable QA credentials: wrong password → 401, correct password → 200 + HttpOnly signed cookie, `/api/auth/session` reports the expiry, logout clears it | Pass |
| Admin lockout | 5 sequential failures → 429, and the correct password is refused while the 15-minute lock is active | Pass |
| Admin inbox | `/api/admin/inbox` returns 401 without a session, `{"enquiries":[]}` when signed in; CSV export in the tab | Pass |
| Visitor bar | Shows the browser's time zone city, local time and UTC offset; static fallback when `Intl` data is missing | Pass |
| Search | Ctrl/Cmd+K opens the dialog, Escape closes, focus is trapped and restored, results include pages, work, agents, services, published journal and creative | Pass |
| Reduced motion | `useReducedMotion` short-circuits every animation; CSS also clamps animation/transition durations | Pass |
| Security headers | CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` and production-only `X-Frame-Options` served on all routes | Pass |
| Currency | Locale detection, manual switch, 24h `localStorage` rate cache, USD fallback when the Frankfurter request fails | Pass |
| Header nav | Desktop shows six primary links plus an accessible “More” menu covering Journal, Timeline, Now and Contact; mobile menu lists all ten | Pass |
| Contact fallback | Success state offers a prefilled `mailto:` (name, email, topic, message) and WhatsApp, so delivery never depends on the session inbox | Pass |
| QA script | `./qa/smoke.sh` — all route, API, header and hero-copy assertions pass | Pass |

## Not verified

- Lighthouse scores on the deployed origin (no production URL from this sandbox).
- Real screen-reader passes (VoiceOver/NVDA) and axe DevTools sweeps.
- The admin login against the *owner's* real credentials. It was exercised with throwaway QA
  credentials only; the production values must be set in Vercel.
- Anything that needs a shared database (cross-device content edits) — the store is browser-local.
- Email delivery of contact enquiries — no provider is configured yet.

## Re-run

```bash
npm ci
npm run typecheck
npm run build
npm run start
# then walk the routes above, the form, and Ctrl/Cmd+K
```
