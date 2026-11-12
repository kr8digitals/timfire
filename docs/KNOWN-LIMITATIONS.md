# Known limitations

Read this before treating the site as a finished, fully-managed publication.

## Content is browser-local

Public pages read from `lib/content.ts` (`seed`) through `lib/store.tsx`. The store persists
edits to `localStorage`, so changes made in `/admin` are visible **only in the browser that made
them**. There is no shared database yet. Until one is added:

- Content changes must be made in `lib/content.ts` and deployed, or
- The JSON exported from `/admin → Import & export` must be imported in each browser that needs it.

## Contact form delivery

`POST /api/contact` validates input (zod), rejects honeypot hits silently, and rate-limits to
5 submissions per IP per 15 minutes. Enquiries are held in a session inbox that is readable from
`/admin → Inbox` and can be exported as CSV. That inbox lives in server memory and is cleared on
redeploy or when the server instance changes. **A transactional email provider (Resend, Postmark,
SES, etc.) is still required for guaranteed delivery.** Email and WhatsApp links on `/contact`
remain the dependable routes.

## Admin authentication

Login requires `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` (bcrypt) in the deployment environment.
Set the hash with:

```bash
node -e "console.log(require('bcryptjs').hashSync('your-password', 12))"
```

Without those variables `/admin` shows the login form but accepts no credentials. Cookie sessions
are HMAC-signed, HttpOnly, `SameSite=Lax`, expire after 30 minutes, and lock the IP out for 15
minutes after 5 failed attempts.

## Placeholders in content

Items marked `[ADD: …]` are deliberately unfilled: certificate scans, the KR8 founding date, two
project descriptions (Chitom Rhaphah Hospital, Consistency Drill) and the creative works. They are
visible in the UI so they are not shipped unnoticed.

## Not implemented

- No email sending, no database, no server-side media uploads (admin media is compressed to WebP
  in the browser and stored in `localStorage`).
- Journal and creative detail routes are `noindex` until real, publishable work exists.
- Automated tests are limited to the checked flows in `qa/QA-STATUS.md`.
