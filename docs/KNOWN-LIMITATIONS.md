# Known limitations

What this site does not do yet, and what to watch out for. Written to be read by
whoever picks the project up next.

## No email provider

Enquiries land in `/admin → Enquiries` and nowhere else. Nothing is forwarded to
an inbox automatically. The form therefore presents email and WhatsApp as the
guaranteed routes, and both are shown again after a successful submission.

Consequence: **someone has to open the admin and check.** If that will not
happen daily, connect a transactional email provider before launch. The place to
do it is `app/api/enquiry/route.ts`, after a successful `appendEnquiry`.

## Enquiries are single-instance in development only

In production, enquiries are written to the `admin-inbox` branch of the content
repository through the GitHub API, so they are shared across every instance.

Locally, without `GITHUB_CONTENT_TOKEN`, they go to `content/inbox.enc.json` on
disk, which is git-ignored. Two developers running the site locally will not see
each other's test enquiries. That is intended.

## The inbox key is unrecoverable

Enquiries are encrypted with AES-256-GCM. If `INBOX_KEY` (or
`ADMIN_SESSION_SECRET`, which it falls back to) is changed or lost, every
existing record becomes unreadable — permanently, by design. Keep a copy of the
key in a password manager, not only in the host's dashboard.

Also note that rotating `ADMIN_SESSION_SECRET` while the inbox relies on it
makes the inbox unreadable. Set an explicit `INBOX_KEY`.

## Editing requires a GitHub token

The admin has no database of its own. It commits to the repository, so:

* `GITHUB_CONTENT_TOKEN` must have **Contents: read and write** on the repo;
* a save is a commit, which triggers a deploy — content changes go live after
  that build finishes, not instantly;
* if the token expires, saving fails with a clear message; the public site is
  unaffected.

## Images are committed to the repository

Uploads go to `public/uploads/` and become part of the clone. This keeps the
deployment to one pipeline and one account, but it does not scale indefinitely.
At a few hundred images, move to object storage; nothing else needs to change
apart from the upload path in `lib/cms/write.ts`.

Each image should be resized and compressed before upload. The admin does not do
it for you — it validates type and size only.

## Rate limiting is per instance

Enquiry and login throttling use in-memory maps. They reset on deploy and are not
shared between serverless instances. They deter casual abuse and password
guessing against a single instance; they are not a defence against a distributed
attack. If that matters, put a WAF or a shared store in front.

## One account, no roles

There is a single admin identity from environment variables. There is no
invitation flow, no second user, and no per-field permissions. The git history of
`content/site.json` is the audit log.

## Fonts

The site self-hosts two WOFF2 files in `app/fonts/`. They are loaded through
`next/font/local`, which inlines the CSS and emits the font files as build
assets. Do not move them to `public/` without also dropping `next/font/local`,
or they will be requested twice.

## Statistics on the site are unverified

The figures carried over from the owner's brief — 50+ clients, 5,000+ students
taught, 15 mentees — have not been independently confirmed. They are marked in
the content for review. Any statistic that ships needs a visible source note;
anything that cannot be sourced should be removed rather than softened.

## Testing

There is no automated test suite. `npx tsc --noEmit` and `npx next build` are the
gates; `qa/smoke.sh` exercises the routes. Visual checks were done against
server-rendered HTML and CSS, because this environment has no headless browser.
A pass on a real device — phone, small laptop, slow connection — is still owed
before launch.
