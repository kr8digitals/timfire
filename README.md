# TIMFIRE website

Next.js 15 App Router, TypeScript and React site for TIMFIRE. The public site is complete; the admin area is a **browser-local prototype, not a production-ready shared CMS**. See `docs/KNOWN-LIMITATIONS.md` before use.

## Run locally

Install Node.js 20 or later, then `npm ci`, `npm run build`, and `npm run start`. The server binds to all interfaces on port 3000; restrict access appropriately. The public pages work without administrator credentials. The login is intentionally unavailable unless the server has `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` set. These credentials have not been configured for a real deployment.

`npm run typecheck` checks TypeScript; `npm run build` compiles and type-checks. Local QA records live in `qa/QA-STATUS.md`; never use a real password in test scripts.

## Project map

- `app/`: routes, metadata, auth endpoints and global styles.
- `components/`: public sections, navigation, contact form, motion primitives, detail pages and the admin prototype.
- `lib/content.ts`: initial content and types. `lib/store.tsx`: browser-local content provider and validation. `lib/auth.ts`: prototype cookie authentication.
- `public/images/`: selected visual assets. `docs/`: handoff and migration notes.
- `qa/QA-STATUS.md`: measured checks, failures and remaining risks.

`POST /api/contact` validates and rate-limits enquiries and holds them in a session inbox at `/admin → Inbox`. No email provider is configured yet, so email and WhatsApp remain the guaranteed contact routes.

The website and these files do not automatically connect to a database. The selected portraits include owner-provided images and AI-generated assets; see the image index and project log.
