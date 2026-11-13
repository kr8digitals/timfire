# TIMFIRE rebuild — handover report

Branch `arena/6e17201a-timfire`. Production deploys from `main` on Vercel (project `timfire`,
domains kutimfire.com / www.kutimfire.com). Earlier merges: the page-by-page rebuild (PR #7),
the Supabase database (PR #8) and the Resend email engine (PR #9).

## 1. What changed, and what was deliberately kept

The site was rebuilt on the approved pre-development base (`cfc7a83`), not from scratch: the
palette, type stack, header/footer chrome, Ctrl+K search, admin dashboard, seed content and every
approved photograph were kept. What changed: the homepage hero (visitor badge deleted, grid
background removed, evolving canvas scene system added), a new Work hero, an education-first
Services index, a full Creative rebuild, a new Gallery page, a Ventures hero that carries the brand
promise, an About hero, a Timeline polish, a Supabase-backed content store, a Resend email engine,
a two-step admin sign-in, a Contact page that keeps its machinery private, and a deliberate mobile
pass. The old stats line and the "Explore my world" cards stay removed, per your instruction. No
statistics were invented anywhere; unknown facts remain visible `[ADD: …]` markers.

## 2. Page map and CTA routing

Order: Home → Work → Services → Creative → Ventures → Journal → Gallery → About → Timeline →
Contact, plus seven service landing pages (`/services/<slug>`) and four collaboration pages
(`/collaborate/<kind>`). Every CTA resolves through one routing table (`FORM_ROUTES` in
`lib/forms.ts`), enforced by `qa/link-audit.mjs`: website work →
`/services/website-design-development#form`; AI → `/services/ai-agent-development#form`; SEO,
graphic, branding, video, mentorship → their own pages; music, spoken word, poetry, speaking →
their collaboration pages; anything else → `/contact#general`.

## 3. Database: Supabase is the system of record

Project `fohuipnryszzqmgrmofn` (Postgres 17). Tables: `site_content` (42 rows), `site_singletons`
(4), `enquiries`, `subscribers`, `email_log`, `email_templates` (8 rows). Row Level Security is on
every table with **no public policies** — the site reads and writes through the service-role key
held in `SUPABASE_SERVICE_ROLE_KEY`, server-side only. `lib/db.ts` is the connection,
`lib/store.tsx` the client seam, `app/api/content` the public read (drafts filtered out) and
`app/api/admin/content` the authenticated write. `supabase/seed.sql` reproduces the shipped
content; migrations were applied with the Supabase tooling and are idempotent. When the database is
unreachable the site still renders from its bundled seed — every failure is swallowed, never thrown
at a visitor.

## 4. Enquiry system: twelve purpose-built forms, one public door

`lib/forms.ts` defines all twelve (7 services + 4 creative + 1 general);
`components/enquiry-form.tsx` renders any of them; `POST /api/contact` validates the kind and each
form's required fields (honeypot + 5-per-15-minutes IP limit included), writes the enquiry to
Supabase and emails it onward (section 6). Enquiries are readable in `/admin → Inbox` with kind
badge and every answer, exportable as CSV.

**The contact page does not advertise them.** A visitor sees reasons to write, how the reply comes,
and one general form whose topic list covers every kind of work — including music, spoken word,
poetry and speaking. The purpose-built forms are reached only through the CTAs on the pages that
own them (`/services/<slug>#form`, `/collaborate/<kind>#form`), so the questions a visitor gets
still match the work they asked about, without ever learning the machinery exists.
`qa/smoke.sh` fails the build if `/contact` starts leaking a form link again.

## 5. Money: naira base, monthly refresh

`lib/currency.ts` holds the rate table and the "updated" label; the admin dashboard
(Settings & rates) edits the same table, guards `NGN = 1`, and stamps the label shown under the
currency switcher. Conversion is instant and client-side everywhere a price appears. No rate is
fetched at runtime and none was invented: update the table once a month from your bank's figures.

## 6. Email: Resend, two professional voices, every mail by name

`lib/email.ts` sends through Resend from two addresses. `enquiries@kutimfire.com` is transactional:
a new enquiry is forwarded to kutimfire001@gmail.com with the visitor set as Reply-To, the visitor
gets an acknowledgement, and the admin sign-in code arrives from here. `hello@kutimfire.com` is the
relationship voice: the welcome letter, the "something new is published" notice and the three
broadcast purposes. `hi@kutimfire.com` stays a human receiving mailbox only and is never sent from.

Every template lives in `email_templates` and is editable in `/admin → Emails`, with the variables
it accepts listed beside the field (`{{name}} {{title}} {{category}} {{summary_line}} {{link}}
{{body}} {{offer_title}} {{form_title}} {{email}} {{answers_block}} {{code}}`). `DEFAULT_TEMPLATES`
in code is only the fallback if a row goes missing. Every mail greets the recipient by name and
stays short. Publishing anything from the dashboard announces it to every active subscriber
(`announceFreshlyPublished` in `app/api/admin/content/route.ts`), and each mail carries its own
one-click unsubscribe link to `/unsubscribe?token=…`. Every send is logged in `email_log`
(queued → sent/failed, Resend id, error) and no mail failure can break a page.

The subscription moment is an intentional pop-up (`components/subscribe-popup.tsx`): it waits for
real scrolling, gives three reasons to subscribe, and can also be opened from the footer.

## 7. Admin access: password, then a code that proves the mailbox

Sign in at `/admin`. The email is `kutimfire001@mail.com`; the password is held by the owner and
lives nowhere but the Vercel environment as a bcrypt hash. Two steps, by design:

1. `POST /api/auth/login` checks the password. On success **no cookie is issued** — a six-digit
   code is emailed to that mailbox through Resend. It expires in ten minutes and allows three wrong
   guesses. Code requests are limited to three per fifteen minutes per address, so a genuine
   "send a new code" a minute later works while a script does not.
2. `POST /api/auth/verify` checks the code and only then sets the `timfire_admin` httpOnly cookie.

The cookie is signed with HMAC-SHA256 keyed by the password hash, and `session()` re-issues it on
every authenticated request: **the browser remembers you for five days, and every visit starts
those five days again**. Five days of silence ends the session by itself; the dashboard also signs
you out client-side the moment it expires. Failed passwords only count inside a fifteen-minute
window, so an honest typo today and another next month never add up to a lockout — a burst of five
locks the address for fifteen minutes.

**Password format:** Next's `.env` parser expands the `$` characters inside a raw bcrypt hash and
truncates it, which made logins impossible even with the right password. Hashes travel base64:
generate one with `npm run make-admin-password -- "your password"` and store the printed value in
`ADMIN_PASSWORD_HASH`. Vercel treats it as a sensitive variable, which cannot be edited in place —
delete it and create it again. `lib/auth.ts` accepts both base64 and raw `$2…` values. Changing the
password invalidates every existing session, because the signature is keyed by the hash.

## 8. Mobile: the phone gets its own decisions

Most visitors arrive on a phone, so the last pass was built for the thumb rather than squeezed from
the desktop. The homepage hero keeps its long description on a wide screen and swaps to one short
line under 800px, so the first screen is a face, a name and a next step; the hero art, the two
buttons and the name all get their own mobile sizing. The proof cards become a swipe rail under
680px instead of three full-width walls. Cards, the subscribe pop-up and the service rows tighten
their padding, and the footer clears the floating WhatsApp button.

**The unwanted zooming had three separate causes, and each is closed in `app/globals.css`:**

1. iOS "inflates" text and re-fits the page when it decides a page is not mobile-optimised →
   `text-size-adjust: 100%` on `html` stops it deciding anything for us.
2. A double tap on anything tappable zooms in, and every tap waits ~300 ms in case a second one is
   coming → `touch-action: manipulation` on links, buttons and form controls removes both, while
   pinch-zoom stays available for anyone who needs it.
3. Anything even one pixel wider than the screen makes the whole document pannable, which phones
   show as the page jumping out to fit. The rotated screenshots in the Work hero were doing exactly
   that; they are pulled back inside, and `body { overflow-x: clip }` now guards the whole site.
   Form controls are pinned to 16px as well, because iOS zooms the page on focus below that.

Anchor targets (`#form`, `#general`, `#behind`) carry `scroll-margin-top` so they no longer land
under the header after a jump.

## 9. QA suite and results

`qa/smoke.sh` (62 behaviour checks: routes, per-form validation, honeypot, subscription surfaces,
two-step sign-in, contact-page secrecy, the mobile zoom fixes), `qa/link-audit.mjs` (every internal
CTA + every referenced image) and `qa/seo-probe.mjs` (titles, descriptions, canonicals, OG, admin
noindex). Run them against a built server: `npm run build && npx next start -p 3100`, then
`./qa/smoke.sh http://127.0.0.1:3100`. `npx tsc --noEmit` and `npm run build` are clean.

The sandbox cannot reach `supabase.co` or `api.resend.com`, so locally the database writes answer
503 and the sign-in code cannot be emailed — both are correct behaviour and the smoke suite says so
out loud. **Real sends and real sign-in can only be proved on production.** Left for a human eye:
sign in at `/admin` with the new two-step flow, save once from the dashboard, click "Send test
email" in the Emails tab, and do a breakpoint sweep on real devices.

## 10. Deploys

Pushes to a working branch create private SSO-protected **preview** deployments; production follows
`main`. Preview environments are `noindex` via `VERCEL_ENV`. Environment changes on Vercel need a
**new deployment** to take effect — rotating `ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH` alone changes
nothing until `main` is deployed again.

## 11. Open items for you

- `[ADD: …]` markers: certificate scan (+ result verification) on About; first journal articles;
  timeline founding year.
- Unused legacy Vercel variables `INBOX_KEY` and `ADMIN_SESSION_SECRET` can be deleted — neither is
  read by any code path now that the cookie is signed with the password hash.
- Rotate `RESEND_API_KEY` after go-live, since it was pasted into a chat once.
- Monthly: refresh the rate table (section 5) and publish whatever the journal holds.
