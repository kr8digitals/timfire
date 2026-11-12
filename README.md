# TIMFIRE

The website for **Kenneth Timothy Iziogo — TIMFIRE**, website developer and AI
agent developer, founder of KR8 DIGITALS: <https://kutimfire.com>.

Next.js 15 (App Router), React 19, TypeScript, no UI framework. Public pages are
statically generated; the only runtime work is the admin area and the enquiry
form.

---

## Running it locally

Requires Node.js 20 or later.

```bash
npm ci
cp .env.example .env.local     # then fill it in — see below
npm run dev                    # http://localhost:3000
```

```bash
npm run typecheck              # tsc --noEmit
npm run build                  # production build
npm run start                  # serve the production build
```

The public site runs without any environment variables: it reads the committed
`content/site.json`. Only the admin area and the enquiry inbox need configuration.

### Admin sign-in

```bash
npm run make-admin-password    # prints ADMIN_EMAIL / ADMIN_PASSWORD_HASH
```

Put the printed values in `.env.local`. The hash is PBKDF2-SHA256 in a
`tf1-<iterations>-<salt>-<hash>` format.

> **Why not bcrypt?** A bcrypt hash is `$2b$12$…`, and `.env` loaders — Next's
> included — treat `$` as the start of a variable reference. The value is
> truncated at the first `$`, arrives in the app as `""` or `"2b"`, and every
> login fails with *"email or password is incorrect"* even though the password
> is right. The `tf1-` format is entirely `[a-z0-9-]` and survives every parser.
> A bcrypt hash pasted into `ADMIN_PASSWORD_HASH` is still repaired at startup,
> but the generated format is the one to use.
>
> This was verified against Next 15.5: with a raw `$2b$10$…` value the runtime
> saw 6 characters, `pbkdf2`. `$$` escaping did not help (`$$` is not collapsed
> at runtime; it is passed through literally, producing a 63-character hash).

### Environment variables

Full annotated list in [`.env.example`](.env.example). Summary:

| Variable | Required | Purpose |
| --- | --- | --- |
| `ADMIN_EMAIL` | for admin | The address typed on the sign-in screen. |
| `ADMIN_PASSWORD_HASH` | for admin | `tf1-…` hash from `npm run make-admin-password`. |
| `ADMIN_SESSION_SECRET` | recommended | Signs the session cookie. Changing it signs everyone out. |
| `GITHUB_CONTENT_TOKEN` | for editing | Fine-grained token, **Contents: read and write**. |
| `GITHUB_CONTENT_REPO` | for editing | `owner/name` of this repository. |
| `GITHUB_CONTENT_BRANCH` | no | Branch edits commit to. Default `main`. |
| `GITHUB_INBOX_BRANCH` | no | Branch the encrypted inbox lives on. Default `admin-inbox`. |
| `INBOX_KEY` | for enquiries | AES-256 key material for the inbox. Falls back to `ADMIN_SESSION_SECRET`. |
| `NEXT_PUBLIC_SITE_URL` | no | Canonical origin. Defaults to `https://kutimfire.com`. |

Without the three `GITHUB_CONTENT_*` values the public site still builds and
serves normally; the admin's save buttons report that storage is not configured.

---

## How content works

```
owner edits in /admin
      ↓  GitHub Contents API, with the SHA of the version that was read
content/site.json committed to the repository
      ↓  the commit triggers a Vercel production deploy
the build reads the file and bakes it into static pages
```

Public pages never call a database or API at request time. They are built from a
file in the repository, so they stay fast, cheap and indexable, and a third-party
outage cannot break them. The admin is the only part that talks to the network.

Writing with the SHA that was read means two people editing at once get a visible
conflict instead of one silently overwriting the other.

`lib/cms/store.ts` normalises whatever it reads: a missing file, an empty object
or a partial document is deep-merged over the seed defaults, so a hand-edited or
truncated `site.json` degrades gracefully instead of crashing a page.

### The enquiry inbox

Enquiries hold personal data, so they are handled differently from content:

* each record is encrypted with **AES-256-GCM** before it is stored;
* ciphertext is committed to a **separate branch** (`admin-inbox`), so the
  repository — public or not — only ever contains encrypted records, and a new
  message never triggers a deploy;
* the key lives only in the environment, never in the repository;
* a record cannot be altered undetected, because GCM authenticates it;
* if the key or storage is missing, the form says so and points the visitor to
  email and WhatsApp rather than pretending the message was received.

`content/site.json` is the only content artifact in git; `content/inbox.enc.json`
is the local-development fallback and is ignored.

---

## Project map

| Path | What lives there |
| --- | --- |
| `app/` | Routes, metadata, sitemap, RSS, robots, API endpoints. |
| `app/admin/` | The admin shell, its layout and its `noindex` metadata. |
| `components/site/` | Public sections, navigation, forms, motion primitives. |
| `components/admin/` | Admin shell, panels, shared form controls. |
| `lib/cms/` | Store, types, seed defaults, write path, encrypted inbox. |
| `lib/services.ts` | The nine service definitions and the currency logic. |
| `lib/auth.ts` | Session cookies, PBKDF2/bcrypt verification, rate limiting. |
| `content/site.json` | The committed content document. |
| `public/images/` | Photography and artwork used by the site. |
| `docs/` | Handoff notes. |
| `qa/` | QA records. |

---

## Design and content rules

* The palette is fixed: `#0b0706` ink, `#f27a1a` orange, `#8e1b3a` wine,
  `#f9f9f9` paper. No new brand colours.
* Prices are seeded and must not drift: website ₦150,000, AI agents ₦200,000,
  SEO ₦80,000, graphic design ₦20,000, branding ₦100,000, mentorship ₦2,500/hour.
  Video, redesign and audit are quote-only.
* Currency switching converts from the naira base; the naira figure is the
  source of truth.
* Facts that are not known are marked `[ADD: …]` or `TODO:` in the content, never
  replaced with something plausible. Any statistic must carry a visible source
  note; the owner-supplied figures (50+ clients, 5,000+ students, 15 mentees)
  remain unverified and must be confirmed or removed before launch.

---

## Known limitations

* No email provider is connected. Enquiries reach the inbox in `/admin`; email
  and WhatsApp remain the guaranteed contact routes, and the form says so.
* Image uploads are committed to the repository, so the practical ceiling is a
  few hundred images before clone size becomes annoying. Move to object storage
  if that is reached.
* Rate limiting is in-memory, so it resets on deploy and is per-instance. It
  stops casual abuse, not a distributed attack.
* Anyone with the admin password can edit content. There is one account and no
  audit log beyond the git history, which is itself the audit log.
