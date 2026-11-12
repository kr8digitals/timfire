# QA status

Measured against the current production build (`npx next build`, 44 routes) and
the running dev server, on a Linux sandbox with Node 20.

**Environment limitation:** there is no headless browser here (Chromium could not
be downloaded), so every visual check below was performed against
server-rendered HTML and the compiled CSS, not against pixels. Layout and motion
were reasoned about from the DOM and stylesheet; nothing here is a substitute for
a pass on a real phone and a real laptop. That pass is still owed.

## Automated

| Check | Command | Result |
| --- | --- | --- |
| Types | `npx tsc --noEmit` | Pass, 0 errors |
| Build | `npx next build` | Pass, 44/44 pages, 103 kB shared JS |
| Smoke | `./qa/smoke.sh` | Pass, all checks |

`qa/smoke.sh` asserts, on a running server:

* every public route returns 200, including the nine service pages and the work
  and journal detail pages;
* an unknown path returns 404;
* `/api/cms/content`, `/api/cms/enquiries` and `/api/cms/status` return 401
  without a session;
* a wrong password returns 401 (the account is not enumerated: the message is
  the same for a wrong email and a wrong password);
* an enquiry missing fields, or with a malformed email, returns 400; a honeypot
  submission returns 200 and is not stored;
* CSP, `X-Content-Type-Options` and `Referrer-Policy` are served;
* `robots.txt` disallows `/admin`, and `/admin` itself carries `noindex`;
* the hero copy is present in the server HTML with JavaScript disabled;
* no page renders an `[ADD: …]` placeholder;
* the sitemap and feed use the canonical `https://kutimfire.com` origin.

## Admin, verified by hand with a disposable password

| Check | Result |
| --- | --- |
| Sign-in with the correct password | 200, `HttpOnly` cookie set, 30-minute expiry |
| Sign-in with a wrong password | 401 |
| Five failures in a row | 429, and the correct password is refused while locked |
| `GET /api/cms/content` when signed in | 200 with the full document and its SHA |
| `PUT /api/cms/content` | 200; the document is written and a SHA is returned |
| `GET /api/cms/enquiries` | 200, `{enquiries, inbox}` |
| `PUT /api/cms/enquiries` (status change) | 200; the new status survives a re-read |

## Enquiry inbox, verified by hand

* A submission through `/api/enquiry` is accepted and stored.
* The stored record on disk is ciphertext only: `{v, iv, tag, data}`, no plaintext
  name, email, phone or message anywhere in the file.
* The admin reads it back decrypted and correctly, including the structured
  `details` fields that the service-specific form posted.
* A record with a corrupted tag is dropped rather than rendered, because GCM
  authenticates it.

## Content and copy

| Check | Result |
| --- | --- |
| Placeholders | No `[ADD: …]` or `TODO:` in rendered pages |
| Statistics | Replaced with sourced, countable figures: 9 built sites, since 2023, 5 agents, 8-week cohort. Each carries a `source` note. The owner's earlier 50+ clients / 5,000+ students / 15 mentees are **not** used, because they are unverifiable |
| Prices | Unchanged from the brief: website ₦150k, AI ₦200k, SEO ₦80k, graphic ₦20k, branding ₦100k, mentorship ₦2,500/hr; video, redesign and audit are quote-only |
| Currency | Naira is the base; every other figure is derived from it |
| Palette | `#0b0706`, `#f27a1a`, `#8e1b3a`, `#f9f9f9`. No new brand colours |

## Known gaps

* **No email delivery.** Enquiries live in the admin inbox only. Email and
  WhatsApp are presented as the guaranteed routes; see
  `docs/KNOWN-LIMITATIONS.md`.
* **No visual regression.** No browser in this environment; see the note above.
* **No real-device pass.** Owed before launch.
* **No load test.** The site is static, so this is mostly about the enquiry
  endpoint and the admin.
