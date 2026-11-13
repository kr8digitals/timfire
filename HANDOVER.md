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
a two-step admin sign-in whose state lives in the database, a Contact page that keeps its machinery
private, a deliberate mobile pass, one public inbox (`hello@`) replacing the dead `hi@`, and a
subscription band that gives the list a permanent home at the foot of every page, directly above the footer — never a badge at the top. The old stats line and the "Explore my world" cards stay removed, per your instruction. No
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
(4), `enquiries`, `subscribers`, `email_log`, `email_templates` (8 rows) and `admin_signins` (the
sign-in code and its rate-limit windows, section 7). Row Level Security is on every table with **no
public policies** — the site reads and writes through the service-role key held in
`SUPABASE_SERVICE_ROLE_KEY`, server-side only.

**`supabase/schema.sql` is the record of that shape — columns, CHECK constraints and indexes — and
`qa/schema-contract.mjs` checks the code against it on every run.** It exists because of two bugs of
the same family, both invisible at the call site:

1. `subscribers.name` was missing from the live table while the code wrote it, so every subscription
   failed with a 503 and the visitor was told "the list is unavailable".
2. `email_log.purpose` carried a CHECK constraint allowing only `form_notice`, `welcome`,
   `publish_notice` and `broadcast`, while the code logged six other purposes. **Every log insert was
   rejected (23514), the error was discarded, and the table stayed empty** through two real enquiries
   and every sign-in code. The column existed; the *value* was refused. That is why `email_log` had
   never shown a row while the site was plainly being used.

So the guard checks values as well as names, in both directions: every literal the code writes to a
constrained column must be one the database accepts, and the purposes `email_log` accepts must be
exactly the `TemplateSlug` union in `lib/email.ts`. The mock database in `qa/mock-services.mjs` reads
the same file and refuses the same writes, so the end-to-end harness fails too — wound back to the
constraint that shipped, it reports "the code email is logged — expected 1, got 0".

After any migration, update that file. `npm run qa:schema` fails loudly if the code and the schema
disagree; `supabase.execute_query` with `select conname, pg_get_constraintdef(oid) from pg_constraint
where connamespace='public'::regnamespace and contype='c'` is how to read what the live database
actually enforces. `lib/db.ts` is the connection,
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

`lib/email.ts` sends through Resend from two addresses on the verified domain.
`enquiries@kutimfire.com` is transactional: a new enquiry is forwarded to the owner's gmail with the
visitor set as Reply-To, the visitor gets an acknowledgement, and the admin sign-in code arrives from
here. `hello@kutimfire.com` is the relationship voice: the welcome letter, the "something new is
published" notice and the three broadcast purposes — **and it is now the one public inbox**, the
address printed in the footer, on the contact page, under every form and in every "email me instead"
link. `hi@kutimfire.com` is retired: it was not receiving, so nothing on the site mentions it any
more (`qa/smoke.sh` fails the build if it comes back). Both addresses are declared once, in
`lib/site.ts`, so a page and a template can never disagree about where mail goes.

**Receiving needs DNS, and that is still an open action (section 11).** Resend only *sends*. For
`hello@kutimfire.com` to actually land in the owner's gmail, the domain needs MX records; until they
exist, mail addressed to hello@ bounces. The site is not broken meanwhile: every form delivers
through Resend straight to the gmail inbox, and WhatsApp works. Outgoing mail is unaffected — and
every message now carries `Reply-To: hello@kutimfire.com` unless a better address is known (a
visitor's own, on a forward), so a reply to any letter follows the same path home.

Every template lives in `email_templates` and is editable in `/admin → Emails`, with the variables
it accepts listed beside the field (`{{name}} {{title}} {{category}} {{summary_line}} {{link}}
{{body}} {{offer_title}} {{form_title}} {{email}} {{answers_block}} {{code}}`). `DEFAULT_TEMPLATES`
in code is only the fallback if a row goes missing. Every mail greets the recipient by name and
stays short — including the welcome letter, which carries its own one-click unsubscribe like every
other mail on the list. Publishing anything from the dashboard announces it to every active
subscriber (`announceFreshlyPublished` in `app/api/admin/content/route.ts`). Every send is logged in
`email_log` (queued → sent/failed, Resend id, error) and no mail failure can break a page — but a
failure now also writes to the server log, because "the list is unavailable" with nothing in any log
is how the subscription bug below stayed invisible.

**The log is now trustworthy.** A send is written to `email_log` before it goes out and updated to
`sent` or `failed` after, and a logging failure is written to the server log rather than dropped —
but it never stops the mail, because a missing audit row is a smaller problem than an unsent letter.
Until the `purpose` constraint was fixed (section 3) that log was empty no matter what happened,
which is exactly why nobody could say whether mail was going out.

The subscription has two doors, and one form behind both: a band of its own between the page and the
footer on every page (section 8), and the intentional pop-up that waits for real scrolling. The
footer no longer carries a subscribe button of its own — one invitation per page, in the place a
convinced reader actually reaches.

## 7. Admin access: password, then a code that proves the mailbox

Sign in at `/admin` as **`kutimfire001@gmail.com`** (`ADMIN_EMAIL` on Vercel; the code is emailed
there). The password is held by the owner and lives nowhere but the Vercel environment as a bcrypt
hash. Two steps, by design:

1. `POST /api/auth/login` checks the password. On success **no cookie is issued** — a six-digit code
   is emailed through Resend. It expires in ten minutes, allows three wrong guesses, and only its
   sha256 hash is ever stored. Code requests are limited to three per fifteen minutes per address, so
   a genuine "send a new code" a minute later works while a script does not.
2. `POST /api/auth/verify` checks the code and only then sets the `timfire_admin` httpOnly cookie.

The cookie is signed with HMAC-SHA256 keyed by the password hash, and `session()` re-issues it on
every authenticated request: **the browser remembers you for five days, and every visit starts those
five days again.** Five days of silence ends the session by itself; the dashboard also signs you out
client-side the moment it expires. Signing out revokes the cookie's nonce in the database, so a
cookie replayed after logout is refused rather than staying valid until it expires. Failed passwords
only count inside a fifteen-minute window, so an honest typo today and another next month never add
up to a lockout; a burst of five locks that address for fifteen minutes.

**All of that state lives in the `admin_signins` table, not in process memory.** A serverless
function is many short-lived instances: a code held in the memory of the instance that emailed it is
invisible to the instance that receives the verify request, and every counter resets when an instance
is recycled. Process memory is kept only as a same-instance fast path and as the fallback if the
database is unreachable.

**If sign-in ever says "Email or password is incorrect" and you are sure both are right, check the
address first** — that message covers both halves, deliberately. One exception is built in: if the
password is right but the address is not, the reply names the address the dashboard uses, because the
password has already proved who is asking. That is exactly the mistake this section exists to
prevent, and it cost four attempts and a lockout before it was diagnosed.

**Password format:** Next's `.env` parser expands the `$` characters inside a raw bcrypt hash and
truncates it, which made logins impossible even with the right password. Hashes travel base64:
generate one with `npm run make-admin-password -- "your password"`. `lib/auth.ts` accepts both
base64 and raw `$2…` values.

**Where the hash lives:** the `admin_credentials` table (row `key = 'password_hash'`) is the source
of truth; `ADMIN_PASSWORD_HASH` in the Vercel environment is only the bootstrap fallback for the
moment the database is unreachable or the row does not exist yet. Vercel treats it as a sensitive
variable, which cannot be edited in place (or read back) — delete it and create it again.

**Changing it:** the dashboard's Security tab is the intended route — `POST /api/admin/password`
with `{ current, next }`, signed in only. It checks the current password, refuses anything under
eight characters or equal to the current one, hashes the new one into the database, clears the
failed-attempt windows, and hands back a cookie signed with the new hash so the browser that made
the change stays signed in. Every other session dies with the old hash, because the cookie
signature is keyed by it. The sign-in form and the Security form both have an eye toggle: a
password you can look at is a password you can type correctly.

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

The subscription band (section 6) is built for the phone first: under 800px the two columns stack —
copy first, then a full-width button — so the tap target is never squeezed beside the words. It is
not dismissible on purpose: it is a section of the page, not an overlay, and it sits where a reader
looks last rather than where they look first. It retires itself the moment anyone subscribes, and
it never renders on `/admin` or `/unsubscribe`. `qa/smoke.sh` fails the build if a subscription
surface ever appears above the header again, or if the band lands anywhere but between the header
and the footer.

## 9. QA suite and results

Six suites, all offline except the route crawler, which needs a running server:

| Suite | Command | What it proves |
| --- | --- | --- |
| Types | `npx tsc --noEmit` | no type errors |
| Build | `npm run build` | 34 routes — 21 pages, 13 API |
| Routes + behaviour | `./qa/smoke.sh http://127.0.0.1:3100` | 119 checks: routes, per-form validation, honeypot, subscription surfaces and their position between header and footer, two-step sign-in refusals, contact-page secrecy, one public inbox, footer wording, no role badges, sounds-and-music wording, hero photographs, the mobile zoom fixes |
| Links | `node qa/link-audit.mjs <url>` | every internal CTA resolves; every referenced image exists |
| SEO | `node qa/seo-probe.mjs <url>` | titles, descriptions, canonicals, OG, `/admin` noindex |
| Schema contract | `npm run qa:schema` | every column the code names exists in `supabase/schema.sql`, every value it writes is one the database accepts, and the loggable purposes are exactly `TemplateSlug` |
| Email contract | `npm run qa:email` | the body Resend actually receives carries sender, recipient, subject, html and `reply_to` |
| Sign-in + subscribe | `npm run qa:auth` | 71 checks through the real built server against a mock Resend and a mock Supabase that refuses what the real database refuses — including changing the password from the dashboard and watching every older session die |

`npm run qa` runs the three contracts. To run the whole thing:

```bash
npm run build
npx next start -p 3100 &
./qa/smoke.sh http://127.0.0.1:3100 && node qa/link-audit.mjs http://127.0.0.1:3100 \
  && node qa/seo-probe.mjs http://127.0.0.1:3100 && npm run qa
```

`qa/auth-flow.mjs` is the one that matters most and the one that was missing: it generates a
throwaway password at runtime (no secret is ever committed), starts the built server against
`qa/mock-services.mjs` — an in-memory PostgREST and a Resend that captures instead of sends — and
walks the whole journey: wrong password refused with no cookie; right password at the wrong address
told which address to use; right password emails a six-digit code that is stored only as a hash and
still grants nothing; wrong code counted; right code sets the five-day cookie; the cookie opens an
admin route, is re-issued on every visit, and is refused once forged or replayed after logout; five
wrong passwords lock the address out even for the right one; subscribing saves the name and sends a
welcome letter that greets the subscriber and carries their own unsubscribe link.

The email contract exists because of a silent bug: the Resend SDK maps its camelCase options onto the
API's snake_case body and **drops anything it does not recognise**, so passing `reply_to` — the name
the HTTP API itself uses — type-checked (it hid inside a spread) and then vanished. Every forwarded
enquiry was going out with no Reply-To, meaning "reply" answered a mailbox that receives nothing.

The sandbox cannot reach `supabase.co` or `api.resend.com`, so against the live network the database
writes answer 503 and a real code cannot be emailed — correct behaviour, and the smoke suite says so
out loud. **Real sends can only be confirmed on production.** Left for a human eye: sign in at
`/admin`, save once from the dashboard, click "Send test email", and do a breakpoint sweep on real
devices.

## 10. Deploys

Pushes to a working branch create private SSO-protected **preview** deployments; production follows
`main`. Preview environments are `noindex` via `VERCEL_ENV`. Environment changes on Vercel need a
**new deployment** to take effect — rotating `ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH` alone changes
nothing until `main` is deployed again.

## 11. Open items for you

**The one that needs you, in DNS:** `hello@kutimfire.com` sends but cannot yet receive, because the
domain has no MX records. DNS for kutimfire.com is hosted at Vercel (`ns1/ns2.vercel-dns.com`), and
the tooling here cannot add DNS records — so this is a dashboard job, Vercel → Domains →
kutimfire.com → Add record. The cheapest route is a free forwarder such as ImprovMX (create the alias
`hello@` → `kutimfire001@gmail.com`, then add the records it gives you, which look like):

| Type | Name | Value | Priority |
| --- | --- | --- | --- |
| MX | `hello` | `mx1.improvmx.com` | 10 |
| MX | `hello` | `mx2.improvmx.com` | 20 |
| TXT | `hello` | `v=spf1 include:spf.improvmx.com ~all` | — |

Scoped to the `hello` host on purpose: **do not edit the root TXT records**, which carry Resend's SPF
and DKIM and are what makes sending work. If you would rather have a real mailbox than a forward,
Zoho Mail's free tier or Google Workspace do the same job with more setup. Until something is in
place, mail sent to hello@ bounces — the forms and WhatsApp are unaffected, they deliver through
Resend straight to your gmail.

- `[ADD: …]` markers: certificate scan (+ result verification) on About; first journal articles;
  timeline founding year.
- Rotate `RESEND_API_KEY` after go-live, since it was pasted into a chat once.
- Monthly: refresh the rate table (section 5) and publish whatever the journal holds.
- After any database migration, update `supabase/schema.sql` so `npm run qa:schema` keeps telling the
  truth (section 3).
