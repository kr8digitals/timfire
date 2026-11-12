# TIMFIRE rebuild — handover report

Branch `arena/42f61ac6-timfire`, merged to `main` November 2026. Production deploys from `main`
on Vercel (project `timfire`, domains kutimfire.com / www.kutimfire.com).

## 1. What changed, and what was deliberately kept

The site was rebuilt on the approved pre-development base (`cfc7a83`), not from scratch: the
palette, type stack, header/footer chrome, Ctrl+K search, admin dashboard, seed content and every
approved photograph were kept. What changed: the homepage hero (visitor badge deleted, grid
background removed, evolving canvas scene system added), a new Work hero, an education-first
Services index, a full Creative rebuild, a new Gallery page, a Ventures hero that carries the brand
promise, an About hero, a Timeline polish, and a Contact page reorganised as a directory of
purpose-built forms. The old stats line and the "Explore my world" cards stay removed, per your
instruction. No statistics were invented anywhere; unknown facts remain visible `[ADD: …]` markers.

## 2. Page map and CTA routing

Order: Home → Work → Services → Creative → Ventures → Journal → Gallery → About → Timeline →
Contact, plus seven service landing pages (`/services/<slug>`) and four collaboration pages
(`/collaborate/<kind>`). Every CTA resolves through one routing table, enforced by
`qa/link-audit.mjs`: website work → `/services/website-design-development`; AI →
`/services/ai-agent-development`; SEO, graphic, branding, video, mentorship → their own pages;
music, spoken word, poetry, speaking → their collaboration pages; anything else → `/contact`.

## 3. Enquiry system: twelve purpose-built forms

`lib/forms.ts` defines all twelve (7 services + 4 creative + 1 general); `components/enquiry-form.tsx`
renders any of them; `POST /api/contact` validates the kind and each form's required fields
(honeypot + 5-per-15-minutes IP limit included). Enquiries land in the session inbox, readable in
`/admin → Inbox` with kind badge and every answer, exportable as CSV. The general form is linked
last on `/contact`, on purpose.

## 4. Money: naira base, monthly refresh

`lib/currency.ts` holds the rate table and the "updated" label; the admin dashboard
(Settings & rates) edits the same table, guards `NGN = 1`, and stamps the label shown under the
currency switcher. Conversion is instant and client-side everywhere a price appears. No rate is
fetched at runtime and none was invented: update the table once a month from your bank's figures.

## 5. Publishing infrastructure (Journal and Creative)

Draft / scheduled / published statuses with revisions already existed in the admin dashboard and
remain; public list pages show search, category and tag filters; detail routes carry per-post
titles, descriptions, canonicals and OpenGraph article tags; unpublished items stay `noindex`.
`/sitemap.xml` and `/robots.txt` now include services, collaborations and every published post.
Content itself is still yours to write — the shelf is ready.

## 6. Gallery

`/gallery` (also in the nav) presents 27 curated frames from the committed Drive photographs in an
editorial masonry that never crops a frame, with true captions, descriptive alt text, lazy loading
and a lightbox dialog: arrow keys walk the set, Escape closes, focus returns to the thumbnail.
Three near-identical classroom selfies existed; the sharpest (`25-dreams`) carries that moment and
the duplication is recorded in `lib/gallery.ts`.

## 7. Admin access and the password fix

Sign in at `/admin`. **Important:** Next's `.env` parser expands the `$` characters inside a raw
bcrypt hash and truncates it, which made logins impossible even with the right password. Hashes now
travel base64: generate with `npm run make-admin-password -- "your password"` and store the printed
value in `ADMIN_PASSWORD_HASH` (Vercel environment variables included — update the existing one
there with the base64 form). `lib/auth.ts` accepts both base64 and raw `$2…` values, so the current
Vercel secret keeps working until you rotate it.

## 8. QA suite and results

`qa/smoke.sh` (37 behaviour checks), `qa/link-audit.mjs` (every internal CTA + every referenced
image), `qa/seo-probe.mjs` (titles, descriptions, canonicals, OG, admin noindex). All pass against
the production build; `npx tsc --noEmit` and `npm run build` are clean. `qa/QA-STATUS.md` holds the
matrix. Left for a human eye: a breakpoint sweep on real devices, the canvas scene on low-end
hardware, and the lightbox on touch screens.

## 9. Deploys and the database seam

During implementation, pushes created private SSO-protected **preview** deployments only; the
production target stayed on the pre-development commit until this merge, and the project's
retention (10 deployments / 30 days) caps build spend. Preview environments are `noindex` via
`VERCEL_ENV`. Storage remains local by your decision (seed + localStorage admin, session inbox);
`lib/store.tsx` is the single seam — when you connect the Supabase org, swap its persistence layer
and everything above keeps working.

## 10. Open items for you

- `[ADD: …]` markers: certificate scan (+ result verification) on About; first journal articles.
- Rotate `ADMIN_PASSWORD_HASH` on Vercel to the base64 format when convenient (section 7).
- Unused legacy Vercel variables `INBOX_KEY` and `ADMIN_SESSION_SECRET` can be deleted.
- Monthly: refresh the rate table (section 4) and publish whatever the journal holds.
- Consider disabling branch preview builds in Vercel → Settings → Git if build minutes ever matter.
