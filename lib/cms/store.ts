import 'server-only';
import { cache } from 'react';
import { seedContent } from './seed';
import type { SiteContent, Enquiry } from './types';
import { CONTENT_VERSION } from './types';

/**
 * The content store.
 *
 * ── How content flows ───────────────────────────────────────────────────────
 *
 *   owner edits in /admin
 *        ↓  (GitHub API)
 *   content/site.json is committed to the repository
 *        ↓  (commit triggers a Vercel deploy)
 *   the new build reads the committed file and bakes it into static pages
 *
 * That means public pages never call a database or an API at request time.
 * They are statically generated from a file in the repo, so they are fast,
 * cheap, indexable, and impossible to break with a third-party outage.
 *
 * The admin is the only place that talks to the network, because it needs the
 * live version and a concurrency token.
 * ────────────────────────────────────────────────────────────────────────────
 */

const REPO_FILE = 'content/site.json';
const BRANCH = process.env.GITHUB_CONTENT_BRANCH || 'main';

function ghConfig() {
  const token = process.env.GITHUB_CONTENT_TOKEN;
  const repo = process.env.GITHUB_CONTENT_REPO; // "owner/name"
  if (!token || !repo || !/^[\w.-]+\/[\w.-]+$/.test(repo)) return null;
  return { token, repo };
}

export type Backend = 'github' | 'file' | 'seed';

/** Which store the admin writes to. */
export function writeBackend(): Backend {
  if (ghConfig()) return 'github';
  if (process.env.NODE_ENV === 'development') return 'file';
  return 'seed';
}

/** True when the owner has not finished configuring the deployment. */
export function needsSetup(): boolean {
  return writeBackend() === 'seed';
}

/* ── Normalisation ───────────────────────────────────────────────────────── */

/**
 * Fill in anything missing from a stored document so that a partial, hand
 * edited or older file never takes a page down. New keys get sensible defaults
 * rather than being required.
 */
function normalise(raw: unknown): SiteContent {
  const base: SiteContent = JSON.parse(JSON.stringify(seedContent));
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || !Object.keys(raw as object).length) return base;

  const input = raw as Partial<SiteContent>;
  const merged: SiteContent = {
    version: CONTENT_VERSION,
    settings: { ...base.settings, ...(input.settings || {}) },
    posts: Array.isArray(input.posts) ? input.posts : base.posts,
    creative: Array.isArray(input.creative) ? input.creative : base.creative,
    gallery: Array.isArray(input.gallery) ? input.gallery : base.gallery,
    projects: Array.isArray(input.projects) ? input.projects : base.projects,
    ventures: Array.isArray(input.ventures) ? input.ventures : base.ventures,
    timeline: Array.isArray(input.timeline) ? input.timeline : base.timeline,
    credentials: Array.isArray(input.credentials) ? input.credentials : base.credentials,
    now: Array.isArray(input.now) ? input.now : base.now,
    serviceOverrides: Array.isArray(input.serviceOverrides) ? input.serviceOverrides : [],
  };

  if (!Array.isArray(merged.settings.stats) || !merged.settings.stats.length) merged.settings.stats = base.settings.stats;
  if (!Array.isArray(merged.settings.socials) || !merged.settings.socials.length) merged.settings.socials = base.settings.socials;
  if (!merged.settings.rates || !Object.keys(merged.settings.rates).length) merged.settings.rates = base.settings.rates;
  return merged;
}

/* ── The committed file (used for every public page) ─────────────────────── */

async function readFile(): Promise<SiteContent | null> {
  try {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const raw = await fs.readFile(path.join(process.cwd(), REPO_FILE), 'utf8');
    return normalise(JSON.parse(raw));
  } catch {
    return null;
  }
}

/**
 * Public content. Memoised per request, so a page that calls it repeatedly
 * still only reads the file once.
 */
export const getContent = cache(async (): Promise<SiteContent> => {
  const fromFile = await readFile();
  return fromFile ?? normalise(null);
});

/* ── Live read for the admin (needs the version marker) ──────────────────── */

async function readGithub(): Promise<{ data: SiteContent; sha?: string } | null> {
  const cfg = ghConfig();
  if (!cfg) return null;
  try {
    const res = await fetch(
      `https://api.github.com/repos/${cfg.repo}/contents/${REPO_FILE}?ref=${encodeURIComponent(BRANCH)}&t=${Date.now()}`,
      {
        headers: {
          Authorization: `Bearer ${cfg.token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        cache: 'no-store',
      },
    );
    if (res.status === 404) return { data: normalise(null), sha: undefined };
    if (!res.ok) {
      console.error('content read failed', res.status);
      return null;
    }
    const body = (await res.json()) as { content?: string; sha?: string };
    if (!body.content) return { data: normalise(null), sha: body.sha };
    return { data: normalise(JSON.parse(Buffer.from(body.content, 'base64').toString('utf8'))), sha: body.sha };
  } catch (error) {
    console.error('content read threw', error);
    return null;
  }
}

/**
 * Admin read: the live document plus the token needed for a safe write.
 * Falls back to the committed file so the admin can still be used on a local
 * machine with no token configured.
 */
export async function getContentWithSha(): Promise<{ data: SiteContent; sha?: string }> {
  const remote = await readGithub();
  if (remote) return remote;
  const local = await readFile();
  return { data: local ?? normalise(null) };
}

/* ── Enquiries ───────────────────────────────────────────────────────────── */

/**
 * Enquiries are private, arrive continuously, and are stored encrypted on their
 * own branch (see `lib/cms/inbox.ts`). Only the admin API calls this.
 */
export async function getEnquiries(): Promise<Enquiry[]> {
  return (await import('./inbox')).listEnquiries();
}

export function inboxStatus() {
  return (async () => {
    const inbox = await import('./inbox');
    return { ready: inbox.inboxReady(), branch: inbox.INBOX_BRANCH, file: inbox.INBOX_FILE };
  })();
}

export { REPO_FILE, BRANCH };
