# QA status

## Likes and comments, one description, and a clip that cannot be embedded — branch `arena/b56f4a47-timfire` (2026-11-16)

Phase two. Three of the owner's reports land here together, because they all touch the same page:
*"the description is split into two and it is vague"*, *"the TikTok video says Player authentication
failed"*, *"the alignment is not good"*, *"the preview on the /me page is not showing"* — and then
*"continue to phase two"*, which is likes and comments.

- **Readers can like and comment on every piece, with no account.** Two new tables, `post_comments`
  and `post_likes`, deliberately outside `site_content`: what readers leave must never be reachable by
  a dashboard save, which is the failure class that once deleted all 42 content rows. `auth-flow` now
  proves it by saving the whole dataset and asserting both reader tables are untouched.
- **A like is one like.** The reader's browser holds a token, `(post, token)` is unique in the
  database, and clicking twice is a like followed by not-a-like. When accounts arrive the token
  becomes the member id; nothing about the counting changes.
- **Counts are totalled in the database**, by `public.engagement_counts(text[])`, never assembled from
  a page of rows — a total built from a `limit 300` read would silently stop being true the day a post
  does well. The Me shelf asks once for all fifteen cards, not once per card.
- **Moderation is after the fact**, as the owner chose: the form's promise (*"it goes up immediately"*)
  is the true one, and the dashboard's new **Comments** tab hides, restores or deletes. Hiding is
  offered first because it can be undone. A hidden comment stops counting on the page but stays in the
  owner's tally, so he can see what he removed.
- **`ModerationOutcome` is three-valued, not boolean.** PostgREST answers 200 to an UPDATE that matched
  no rows, so a boolean would have the dashboard say "Deleted." about a comment another session had
  already removed. Asking for the affected ids back is what separates `ok` from `missing` (404, and the
  list refreshes itself) from `error` (503).
- **The writer's email is stored for the owner and never returned to a reader** — `listComments` strips
  it, `listAllComments` keeps it, and both directions are asserted.
- **Nothing emails anybody when a comment lands.** A letter per comment would spend the whole Resend
  daily allowance the first time a post does well; the cap the owner is on is counted, not guessed.
- **One description on `/me`, and a specific one.** The hero carried a description and `Journal()`
  repeated nearly the same paragraph underneath it, which is what read as one thought cut in half. The
  second is gone and the remaining one names what is there and what a reader can do: *"Poems, spoken
  word, penlight essays and Good Reports — every piece carrying the photograph or the clip it was
  posted with. Read one, like it, and tell me under the page what it did to you. One week in seven this
  page belongs to a reader instead…"* Smoke counts `page-lead` **inside the hero block only** — the
  class is shared with the weekly-feature copy, and counting the whole page blamed the wrong text.
- **A clip this site cannot host is a card that says where it goes.** TikTok's own player answers
  *"Player authentication failed — this link is invalid or has expired"* on a public video that plays
  fine in the app; `oembed` and `/embed/v2/<id>` both return HTTP 400 from here, so nothing on our side
  of the iframe can detect or repair that. The story now renders `Watch on TikTok ↗` over the poster
  still (or a play glyph where there is none), captioned exactly as before. YouTube and Vimeo *do*
  serve players that work, so those still embed — and CSP `frame-src` lists only those two now, because
  policy should name what the site actually frames. Filling in `videoSrc` with the file itself makes any
  clip play in the page, with no code change.
- **The media column is a fixed measure, not a share of the page.** `minmax(0,460px)` with everything
  inside capped to it, and a clip capped by *height* (`min(72vh,680px)`) because a 9:16 video in a
  460px column is taller than it is wide and used to tower over the title beside it. That is the
  alignment complaint. The duplicate `.story-embed` rules that argued about the same box are gone with
  the iframe.
- **A card shows a preview whenever the piece has a frame of its own:** `videoPoster` is now used by
  the Me cards, ahead of the text-only `.card-video-flag` fallback.

| Suite | Command | Result |
| --- | --- | --- |
| Type safety | `./node_modules/.bin/tsc --noEmit` | Pass, no errors |
| Production build | `npm run build` | Pass — 38 routes, adding `/api/comments`, `/api/likes`, `/api/engagement`, `/api/admin/comments` |
| Frame fidelity | `node qa/frame-fidelity.mjs http://127.0.0.1:3100` | Pass — **49/49**, 19 new: the media column's fixed measure and height-capped clip, the comment box on every story, the external-clip card, no TikTok embed left in the source, the form's post-moderation promise, the reader token, seven engagement CSS contracts, counts on every card fetched in one request, one description in the hero only, and the dashboard's Comments tab with hide-before-delete |
| Route + behaviour smoke | `./qa/smoke.sh http://127.0.0.1:3100` | Pass — **152/152**, 22 new: like raises the count by one, liking twice is still one like, a second reader is a second like, withdrawing takes it back down, malformed/unpublished/short tokens refused, empty comment refused, comment goes up immediately, writer email never returned, thread lists it with its counts, honeypot answered and never stored, thread only served for a real piece, moderation closed to readers on both GET and POST, and `frame-src` naming only the two players the site can host |
| Link crawler | `node qa/link-audit.mjs http://127.0.0.1:3100` | Pass — 22 routes, 37 internal targets, 48 images |
| SEO probe | `node qa/seo-probe.mjs http://127.0.0.1:3100` | Pass — 22 unique titles |
| Schema contract | `node qa/schema-contract.mjs` | Pass — 47 columns / 31 values, **10 of 10 tables**, `post_comments.status accepts: live, hidden` |
| Email contract | `node qa/email-contract.mjs` | Pass |
| Sign-in + subscribe + content guard + moderation | `node qa/auth-flow.mjs` | Pass — **110/110**, 26 new: a reader likes and comments with no account, the comment is live immediately, its email never reaches another reader, counts travel with the thread, moderation is 401 to a reader on read *and* write, the owner sees the email, hiding removes it from the page but not the dashboard, a hidden comment stops counting while its like survives, restoring works, a full content save leaves both reader tables alone, a status outside `live\|hidden` is refused at the table (409), and moderating a deleted comment answers 404 |

The mock database learned four things so those checks could be honest — fidelity gaps, not new
behaviour, and each one was a way for a test to pass while production failed:

1. **`post_comments` and `post_likes` joined the table registry**, with the column defaults the real
   database supplies (`status 'live'`, empty email and name, `created_at`). The `live` default is the
   reason the form's promise is a true one.
2. **`/rest/v1/rpc/<fn>` is served.** The mock only ever answered `/rest/v1/<table>`, so
   `supa.rpc('engagement_counts')` — every like button and every card count on the site — would have
   read as "unavailable" offline and the suite would have blessed a blank. It counts only `live`
   comments, exactly as the SQL does.
3. **`HEAD` and `Content-Range`.** `.select('id', { count: 'exact', head: true })` arrives as a HEAD
   request and postgrest-js reads the number out of `Content-Range`; without both, a like total reads
   back as 0 and every assertion about it still passes.
4. **`on_conflict` and `resolution=ignore-duplicates`.** Matching on the primary key alone meant a
   second like from the same browser found no existing row (a fresh id every time) and quietly became a
   second like — the exact dishonesty the unique pair exists to prevent.

Two notes on running this locally. The engagement smoke checks use a fresh reader token *and* a fresh
`203.0.113.x` address per run, because both are what the rate limits count: a second run inside 15
minutes otherwise spends the first run's allowance and inherits its likes. And `auth-flow.mjs` runs
against `.next`, so a code change needs `npm run build` before it means anything — one moderation
assertion passed against a stale bundle before that was caught.

## The journal becomes Me, and a story opens as a split — branch `arena/94fbff79-timfire` (2026-11-16)

The owner's brief was about intention, not decoration: *"Everything I'm posting is for them, not for
me."* So the address changed, the page changed who it speaks to, and the story pages changed shape.

- **`/journal` → `/me`.** The route moved (`app/me/page.tsx`, `app/me/[slug]/page.tsx`), and
  `next.config.ts` now answers the old addresses with permanent 308s — `/journal` → `/me` and
  `/journal/:path*` → `/me/:path*` — so every link already shared on Facebook and TikTok still
  lands. Canonicals, OG urls, the sitemap, the 404 list, the nav, the search index, the gallery's
  story links and the publish-notification email all say `/me`. Smoke proves the redirect, the
  followed link and the 200 at the end of it.
- **A story page opens as a split:** what the piece is (eyebrow, title, standfirst, reading time,
  tags, where it first lived) on the left, the photograph or the clip that carried it on the right,
  and the writing below both. The old layout put the title alone at the top and dumped a full-width
  photograph underneath it, which is what the owner called *"not good enough"*. One column below
  900px. `qa/frame-fidelity.mjs` now asserts the split, the single-column fallback and the phone
  stack as CSS contracts, because a regression here is invisible to every other suite.
- **The gallery viewer keeps the same rhythm:** caption, count and story link on the left, the frame
  at true size on the right, stacked on a phone — asserted the same way.
- **The musician story carries no lead photograph.** Its frame was a still from a different clip, so
  it said something the post did not. Only the TikTok player renders now, on the right, captioned
  *"This is what I can do: me singing, breaking the doubt."* Both ends were corrected — the seed
  and the live row (`data - 'image' - 'imageAlt' - 'imageWidth' - 'imageHeight' - 'videoPoster'`), so
  the fix holds whether the site is served from the database or from the shipped seed. A story whose
  media is a clip and not a photograph still gets a card face: `.card-video-flag`.
- **The page belongs to the reader.** The hero is now `Me / This page *is for you.*`, the lead says
  who it is posted for, and below it sits **Featuring this week** — one reader's story in their own
  words, their photograph on the right, their handles beside it — then the writing, then the ask.
  A new `features` collection (`lib/content.ts`, `lib/validate.ts`, `lib/db.ts`, dashboard tab
  "Featured this week") carries it; with nobody chosen yet the block says the week is open rather
  than rendering an empty hole.
- **A new collection can no longer be deleted by an old browser tab.** `features` is optional in the
  contract, `saveSiteData` skips a collection the payload does not carry at all, and the merge path in
  `lib/store.tsx` refuses to materialise one neither side has. Absence now means "this payload
  predates it"; only an explicit empty list clears a collection. That is the same failure class as the
  42-row wipe, closed before the next collection-dependent feature ships rather than after.
- **"Want to be featured?" is a real form, not a placeholder.** A `feature` enquiry kind in
  `lib/forms.ts` collects the name they want on the page (a handle is a name), where they are writing
  from, their story, their socials and an optional photograph. It travels the existing, already
  hardened pipeline — honeypot, per-IP rate limit, `enquiries` row, owner forward with Reply-To,
  named acknowledgement — and appears in the dashboard Inbox. The same ask sits under every story
  page. Accounts, likes, comments and the emailed questions build on this next.

| Suite | Command | Result |
| --- | --- | --- |
| Type safety | `./node_modules/.bin/tsc --noEmit` | Pass, no errors |
| Production build | `npm run build` | Pass — 35 pages, `/me` and `/me/[slug]` in place of the journal routes |
| Frame fidelity | `node qa/frame-fidelity.mjs http://127.0.0.1:3100` | Pass — **30/30**, 9 new: the story split, its single-column fallback, the phone stack, the gallery viewer's two columns, and the musician story carrying no photograph with the corrected caption and the right clip |
| Route + behaviour smoke | `./qa/smoke.sh http://127.0.0.1:3100` | Pass — **130/130**, 11 new: the 308 on `/journal`, an old story link following to `/me` and landing 200, the page titled and worded for the reader, and the hero statement scoped to the hero itself |
| Link crawler | `node qa/link-audit.mjs http://127.0.0.1:3100` | Pass — 22 routes, 37 internal targets, 48 images; no `/journal` href survives in any rendered page |
| SEO probe | `node qa/seo-probe.mjs http://127.0.0.1:3100` | Pass — 22 unique titles, canonicals on the new addresses |
| Schema contract | `node qa/schema-contract.mjs` | Pass — 36 columns / 28 values, 8 of 8 tables |
| Email contract | `node qa/email-contract.mjs` | Pass |
| Sign-in + subscribe + content guard | `node qa/auth-flow.mjs` | Pass — 84/84, with `features` added to the every-collection-empty payload the guard must refuse |

Two notes on running this locally. `smoke.sh` spends real sign-in attempts, and the mock Supabase
keeps them across server restarts, so a second run inside 15 minutes answers 429 — restart
`qa/run-mocks.mjs` as well as the site, not just the site. And the hero check that failed on the
first pass was the check being wrong, not the page: `Websites and AI agents built to work…` still
belongs in the footer, so the assertion is now scoped to the hero block.

## Framing, hero copy and playing the video — branch `arena/dd7534da-timfire` (2026-11-16)

The owner's report was exact: *"the images in the journal page are not positioned well, my face are
cut off from view both on mobile and other screens."* Two boxes were guessing a shape the archive
photographs do not have — a story photo forced into a 1200×800 landscape frame with `object-fit:cover`
under `max-height:650px`, and a journal card thumbnail 250px tall with a centred window. Most of these
frames are tall portraits (640×1337, 843×1765), so both sliced straight through the head.

- Articles now carry `imageWidth`/`imageHeight` (optional, so older rows still validate). The story
  photo is fitted whole — `object-fit:contain`, `max-height:min(86vh,1040px)` — and card thumbnails
  keep a taller window biased to `center 12%`, where faces are. The external-video card's poster got
  the same bias.
- New suite `qa/frame-fidelity.mjs` measures every journal photograph against the file on disk (the
  WebP header is parsed in-process, no dependencies, cross-checked against ImageMagick on all 27
  archive frames) and asserts both CSS contracts. A stale dimension, a reintroduced `cover`, or a
  centred thumbnail window fails the suite — the crop is invisible to every other check, because the
  page renders, the image loads and the link resolves.
- The homepage hero description is now the owner's own positioning statement. `.hero-lead` went from
  1.06rem/46ch to `clamp(.94rem,1.02vw,1.02rem)`/60ch so three sentences occupy the space two used
  to; the phone hero keeps a trimmed line at .98rem/56ch. `.hero{overflow:hidden}` and
  `overflow-wrap:break-word` mean it cannot overflow at any width.
- Post 2's TikTok plays **inside** the story through TikTok's own embed player (`/embed/v2/<id>`)
  instead of a poster still linking out, and CSP `frame-src` now allows `https://www.tiktok.com`.
  Anything that cannot be embedded — a Facebook share link — still renders as a card. The caption no
  longer says he is talking: he is singing the poem, and the reader judges the poem from that.
- `sourceUrl` added to the article contract, to the dashboard's Journal editor ("Original post URL —
  where readers can comment") and to the story page ("Comment on the original post ↗"), so the owner
  can attach each piece's real Facebook post himself, one field at a time, with no code change.

| Suite | Command | Result |
| --- | --- | --- |
| Type safety | `npx tsc --noEmit` | Pass, no errors |
| Production build | `npm run build` | Pass — 35 pages |
| Frame fidelity | `node qa/frame-fidelity.mjs http://127.0.0.1:3100` | **New** — Pass, 21/21: 15 story frames declare the real pixel size of their file, story photos are fitted whole, card windows are top-biased |
| Route + behaviour smoke | `./qa/smoke.sh http://127.0.0.1:3100` | Pass — 119/119, and the CSP header now carries `frame-src … https://www.tiktok.com` |
| Link crawler | `node qa/link-audit.mjs http://127.0.0.1:3100` | Pass — 22 routes, 37 internal targets, 49 images |
| SEO probe | `node qa/seo-probe.mjs http://127.0.0.1:3100` | Pass — 22 unique titles |
| Schema contract | `node qa/schema-contract.mjs` | Pass — 36 columns / 28 values, 8 of 8 tables |
| Email contract | `node qa/email-contract.mjs` | Pass |
| Sign-in + subscribe + content guard | `node qa/auth-flow.mjs` | Pass — 84/84 |

The live rows were patched to match: `imageWidth`/`imageHeight` on all 15 journal pieces and the
corrected caption on the musician piece, via one `UPDATE … FROM (VALUES …)` merging into `data`, so
nothing else in those rows moved.

## Content-loss guard — branch `arena/84fc2dd5-timfire` (2026-11-16)

The live `site_content` table was found holding **0 rows**. All 42 content rows (stats, services,
websites, agents, creative, timeline, certificates, socials) had been deleted, and because
`loadSiteData()` blanks every collection and refills it from rows, the site was one cache-miss away
from serving a homepage with no services, no work and no prices. `saveSiteData()` deletes whatever a
payload no longer carries, so a single dashboard save whose collections all arrived empty deletes the
whole table. All 42 rows were restored from the shipped seed — 57 rows in total once the 15 archive
journal pieces are counted — and both ends of the path are now guarded:

- `loadSiteData()` reads an empty `site_content` as damage, not as data: the shipped seed collections
  stay on screen and the fallback is written to the server log. `site_singletons` is a separate table
  and still applies, so live profile copy and rates are never reverted. `source` reports `seed`.
- `saveSiteData()` refuses a payload that would delete every row while the table still holds one, and
  logs the refusal. Removing items — even emptying one collection — stays an ordinary save.

| Suite | Command | Result |
| --- | --- | --- |
| Type safety | `npx tsc --noEmit` | Pass, no errors |
| Production build | `npm run build` | Pass |
| Route + behaviour smoke | `./qa/smoke.sh http://127.0.0.1:3100` | Pass — 119/119 |
| Link crawler | `node qa/link-audit.mjs http://127.0.0.1:3100` | Pass — 22 routes, 37 internal targets, 49 images |
| SEO probe | `node qa/seo-probe.mjs http://127.0.0.1:3100` | Pass — 22 unique titles |
| Schema contract | `node qa/schema-contract.mjs` | Pass — 36 columns / 28 values, 8 of 8 tables |
| Email contract | `node qa/email-contract.mjs` | Pass |
| Sign-in + subscribe + content guard | `node qa/auth-flow.mjs` | Pass — 84/84, 13 of them new: an empty content table still serves 7 services / 9 sites / 3 stats and logs the fallback; the dashboard round-trip writes all 57 rows; an all-empty save is refused with 503, deletes nothing and logs the refusal; removing one service still saves 200 and deletes exactly that row, and the public site then shows six |

The mock Supabase learned two things so those checks could be honest — fidelity gaps, not new
behaviour. `.not('id','in',…)`, the delete `saveSiteData` relies on, arrives as `id=not.in.(…)`, which
the mock parsed as an unknown operator and answered with its `default: return true` — matching every
row; and its `in` handler stripped only double quotes while the code sends `'a','b'`. Either one alone
turned that delete into a delete of the whole collection, which is how the new checks found the mock
emptying the table it had just written. Unknown operators now match nothing, both quote styles are
stripped, and `not.` negates.

## Copy, placement and admin-password batch — branch `arena/ba0afa77-timfire` (2026-11-13)

Run against the production build (`npm run build` + `next start -p 3100`) with the offline mocks
(`qa/mock-services.mjs`) standing in for Resend and Supabase:

| Suite | Command | Result |
| --- | --- | --- |
| Type safety | `npx tsc --noEmit` | Pass, no errors |
| Production build | `npm run build` | Pass — 34 routes |
| Route + behaviour smoke | `./qa/smoke.sh http://127.0.0.1:3100` | Pass — 119/119. New since last run: the subscription band sits between header and footer on every page and never above the header; the old top strip is gone; the footer carries the rewritten description, "All rights reserved" and "Built and owned by …" with no KR8 tagline; no role-badge row on `/` or `/about`; `/creative` says "Sounds and music" and no longer "Music & piano"; `/services` and `/journal` heroes carry a photograph and `/services` lost its vague first description |
| Link crawler | `node qa/link-audit.mjs http://127.0.0.1:3100` | Pass — 22 routes, 23 internal targets, 30 referenced images exist (the cropped About portrait among them) |
| SEO probe | `node qa/seo-probe.mjs http://127.0.0.1:3100` | Pass — titles unique, descriptions present, canonicals correct, OG set, `/admin` noindex |
| Schema contract | `node qa/schema-contract.mjs` | Pass — 36 columns / 28 values across all 8 tables, `admin_credentials` included |
| Email contract | `node qa/email-contract.mjs` | Pass |
| Sign-in + subscribe | `node qa/auth-flow.mjs` | Pass — 71/71, including the new Security-tab route: anonymous 401, wrong current password 401, short or unchanged next password 400, a successful change stores a base64 hash in `admin_credentials`, clears the attempt windows, re-issues the cookie for the changing browser and kills every older session |

The mock Supabase learned two things for this batch: the `admin_credentials` table (so the
password change can be exercised offline) and PostgREST's `or=(…)` filter syntax — a delete whose
filter the mock silently dropped was a delete of the whole table, which is precisely the class of
blind spot `checkViolation` was added to close.

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
check that fails if they regress. Verifying the third one against the live database turned up a
fourth cause underneath it, which is the real answer to "have the emails been sending".

| Report | Root cause | Proof |
| --- | --- | --- |
| "The list is unavailable right now" | `subscribers.name` did not exist in the live table while `addSubscriber()` wrote it, so every insert errored and the route answered 503. Nothing logged it. | Reproduced the exact error against the database (`42703: column "name" of relation "subscribers" does not exist`), added the column by migration, then inserted and removed a probe row using the code's own shape. `npm run qa:schema` now fails if code and schema disagree. |
| "Email or password is incorrect" ×4, then a lockout | The dashboard was configured for `kutimfire001@mail.com` and the owner typed `kutimfire001@gmail.com`. One message covered both halves, so nothing distinguished them. `ADMIN_EMAIL` is now the gmail address. | `qa/auth-flow.mjs` asserts a wrong password is refused silently, and that a right password at the wrong address names the address the dashboard uses. |
| "I haven't confirmed the other ones are sending" | Never tested: no email had ever left production (`email_log` was empty). Two real bugs were sitting in that path — the Resend SDK drops `reply_to`, so forwarded enquiries went out with no Reply-To, and the welcome letter had no unsubscribe link. | `npm run qa:email` drives the real SDK with HTTP stubbed and asserts the body it would send, including that snake_case `reply_to` is dropped and `replyTo` is not. `npm run qa:auth` asserts the welcome letter greets the subscriber by name and carries their own token. |
| …and the reason the log was empty | **`email_log.purpose` carried a CHECK constraint** allowing only `form_notice`, `welcome`, `publish_notice` and `broadcast`. The code logs `owner_forward`, `ack`, `admin_code` and three `broadcast_*` purposes, so **every one of those inserts was rejected with 23514** and the discarded error left no trace. Two real enquiries reached the database at 00:56 and 01:06 UTC on 2026-11-13 with nothing logged for either. | Found by reading `pg_constraint`, not the columns: `select conname, pg_get_constraintdef(oid) from pg_constraint where connamespace='public'::regnamespace and contype='c'`. Reproduced by inserting as `service_role` inside a rolled-back transaction — `purpose='rls-probe'` failed with 23514, `purpose='owner_forward'` succeeded after the migration `fix_email_log_purpose_values`. `pg_stat_user_tables` confirmed the diagnosis independently: `email_log.n_tup_ins = 0` while `enquiries.n_tup_ins = 2`. |

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
- **The mock database refused nothing.** `qa/mock-services.mjs` accepted every write, so a value the
  production database rejects looked fine offline. It now reads the CHECK constraints out of
  `supabase/schema.sql` (via `qa/schema-domains.mjs`, the same parser the schema guard uses) and
  answers 409/23514 exactly as PostgREST does. Wound back to the constraint that shipped,
  `npm run qa:auth` now fails with "the code email is logged — expected 1, got 0" — the production
  bug, reproduced offline.
- `qa/auth-flow.mjs` treats the audit trail as part of the contract: a send that is not written to
  `email_log` as `sent` with a Resend id is a failure, not a passing test with a missing row.

### Results, against the production build

| Suite | Command | Result |
| --- | --- | --- |
| Type safety | `npx tsc --noEmit` | Pass |
| Build | `npm run build` | Pass |
| Routes + behaviour | `./qa/smoke.sh http://127.0.0.1:3100` | **91/91** |
| Link crawler | `node qa/link-audit.mjs http://127.0.0.1:3100` | Pass — every internal CTA resolves; all 30 referenced images exist |
| SEO probe | `node qa/seo-probe.mjs http://127.0.0.1:3100` | Pass — titles unique, descriptions present, canonicals correct, OG set, `/admin` noindex |
| Schema contract | `npm run qa:schema` | Pass — 7 tables, 33 columns, 28 constrained values, and the loggable purposes are exactly `TemplateSlug` |
| Email contract | `npm run qa:email` | Pass — 7 checks |
| Sign-in + subscribe | `npm run qa:auth` | **60/60** — real built server, mock Resend, mock Supabase that refuses what the real database refuses |

Still only provable on production: a real Resend delivery (sign in at `/admin` and the code arrives in
the gmail inbox, then `email_log` shows a `sent` row with a Resend id), and mail arriving *at*
`hello@kutimfire.com`, which needs the MX records in `HANDOVER.md` section 11 before anything can
receive there.

One thing worth knowing about those two enquiries from 2026-11-13: the log insert failed, but the send
itself was still attempted afterwards, because a missing audit row must never stop a letter. So the
owner may well have received both forwards in his gmail with no record here. `markEmail()` had no row
to update either way, which is why nothing — success or failure — was ever recorded.
