import 'server-only';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import type { Enquiry } from './types';

/** Enquiries live on their own branch so they never trigger a deploy. */
export const INBOX_BRANCH = process.env.GITHUB_INBOX_BRANCH?.trim() || 'admin-inbox';
export const INBOX_FILE = 'inbox.json';
const BRANCH = process.env.GITHUB_CONTENT_BRANCH?.trim() || 'main';

/** Same repository and token the content store uses. */
function repoConfig(): { repo: string; token: string } | null {
  const repo = process.env.GITHUB_CONTENT_REPO?.trim();
  const token = process.env.GITHUB_CONTENT_TOKEN?.trim();
  if (!repo || !token || !/^[\w.-]+\/[\w.-]+$/.test(repo)) return null;
  return { repo, token };
}

/**
 * The enquiry inbox.
 *
 * Enquiries contain personal data — names, email addresses, phone numbers,
 * whatever the visitor wrote. They must not sit in plaintext anywhere that can
 * be read by someone who is not the owner.
 *
 * So each record is encrypted with AES-256-GCM before it is stored, and the
 * ciphertext is committed to a **separate branch** of the content repository
 * (`arena inbox data`). That means:
 *
 *   • the repository — which may be public — only ever contains ciphertext;
 *   • the production branch and the deployed site are untouched, so an enquiry
 *     never triggers a rebuild;
 *   • the key lives only in the deployment environment, never in the repo;
 *   • a record cannot be silently altered, because GCM authenticates it.
 *
 * The key is `INBOX_KEY` if set, otherwise it is derived from
 * `ADMIN_SESSION_SECRET`. If neither exists the inbox reports that it cannot
 * store anything, and the form falls back to email and WhatsApp — a loud,
 * honest failure rather than a silent loss.
 */

const KEY_INFO = 'timfire-inbox-v1';

function encryptionKey(): Buffer | null {
  const material = process.env.INBOX_KEY?.trim() || process.env.ADMIN_SESSION_SECRET?.trim();
  if (!material) return null;
  // Stretch whatever the owner supplied into exactly 32 bytes.
  return createHash('sha256').update(`${KEY_INFO}:${material}`).digest();
}

export function inboxReady(): boolean {
  if (encryptionKey() === null) return false;
  return repoConfig() !== null || process.env.NODE_ENV !== 'production';
}

type Sealed = { v: 1; iv: string; tag: string; data: string };

function seal(record: Enquiry, key: Buffer): Sealed {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(record), 'utf8'), cipher.final()]);
  return {
    v: 1,
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    data: encrypted.toString('base64'),
  };
}

function open(sealed: Sealed, key: Buffer): Enquiry | null {
  try {
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(sealed.iv, 'base64'));
    decipher.setAuthTag(Buffer.from(sealed.tag, 'base64'));
    const plain = Buffer.concat([decipher.update(Buffer.from(sealed.data, 'base64')), decipher.final()]).toString('utf8');
    return JSON.parse(plain) as Enquiry;
  } catch {
    // Tampered, wrong key, or a record from a different deployment.
    return null;
  }
}

/* ── GitHub plumbing ─────────────────────────────────────────────────────── */

type GhMeta = { sha?: string; records: Sealed[] };

async function ghHeaders(): Promise<{ headers: Record<string, string>; repo: string } | null> {
  const cfg = repoConfig();
  if (!cfg) return null;
  return {
    repo: cfg.repo,
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  };
}

async function ensureBranch(repo: string, headers: Record<string, string>): Promise<boolean> {
  const check = await fetch(`https://api.github.com/repos/${repo}/branches/${encodeURIComponent(INBOX_BRANCH)}`, {
    headers,
    cache: 'no-store',
  });
  if (check.ok) return true;
  // Branch does not exist yet: create it from the production branch head.
  const base = await fetch(`https://api.github.com/repos/${repo}/git/ref/heads/${encodeURIComponent(BRANCH)}`, {
    headers,
    cache: 'no-store',
  });
  if (!base.ok) return false;
  const baseRef = (await base.json()) as { object?: { sha?: string } };
  if (!baseRef.object?.sha) return false;
  const created = await fetch(`https://api.github.com/repos/${repo}/git/refs`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ref: `refs/heads/${INBOX_BRANCH}`, sha: baseRef.object.sha }),
  });
  return created.status === 201;
}

async function readInbox(repo: string, headers: Record<string, string>): Promise<GhMeta> {
  const res = await fetch(
    `https://api.github.com/repos/${repo}/contents/${INBOX_FILE}?ref=${encodeURIComponent(INBOX_BRANCH)}`,
    { headers, cache: 'no-store' },
  );
  if (res.status === 404) return { records: [] };
  if (!res.ok) return { records: [] };
  const body = (await res.json()) as { content?: string; sha?: string };
  if (!body.content) return { records: [], sha: body.sha };
  try {
    const parsed = JSON.parse(Buffer.from(body.content, 'base64').toString('utf8'));
    return { records: Array.isArray(parsed) ? (parsed as Sealed[]) : [], sha: body.sha };
  } catch {
    return { records: [], sha: body.sha };
  }
}

async function writeInbox(
  repo: string,
  headers: Record<string, string>,
  records: Sealed[],
  sha: string | undefined,
  message: string,
): Promise<boolean> {
  const body: Record<string, unknown> = {
    message,
    content: Buffer.from(JSON.stringify(records, null, 2), 'utf8').toString('base64'),
    branch: INBOX_BRANCH,
  };
  if (sha) body.sha = sha;
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${INBOX_FILE}`, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) console.error('inbox write failed', res.status, await res.text().catch(() => ''));
  return res.ok;
}

/* ── Local development fallback ──────────────────────────────────────────── */

const LOCAL_FILE = 'content/inbox.enc.json';

async function readLocal(): Promise<{ records: Sealed[] }> {
  try {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const text = await fs.readFile(path.join(process.cwd(), LOCAL_FILE), 'utf8');
    const parsed = JSON.parse(text);
    return { records: Array.isArray(parsed) ? parsed : [] };
  } catch {
    return { records: [] };
  }
}

async function writeLocal(records: Sealed[]): Promise<boolean> {
  try {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const file = path.join(process.cwd(), LOCAL_FILE);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(records, null, 2), 'utf8');
    return true;
  } catch {
    return false;
  }
}

/* ── Public API ──────────────────────────────────────────────────────────── */

const MAX_RECORDS = 500;

export type InboxResult = { ok: true } | { ok: false; message: string };

export async function addEnquiry(enquiry: Enquiry): Promise<InboxResult> {
  const key = encryptionKey();
  if (!key) {
    return { ok: false, message: 'The inbox encryption key is not configured.' };
  }
  const sealed = seal(enquiry, key);
  const gh = await ghHeaders();

  if (!gh) {
    if (process.env.NODE_ENV === 'production') {
      return { ok: false, message: 'The inbox storage is not configured.' };
    }
    const { records } = await readLocal();
    const written = await writeLocal([sealed, ...records].slice(0, MAX_RECORDS));
    return written ? { ok: true } : { ok: false, message: 'The local inbox could not be written.' };
  }

  if (!(await ensureBranch(gh.repo, gh.headers))) {
    return { ok: false, message: 'The inbox branch could not be created.' };
  }
  const { records, sha } = await readInbox(gh.repo, gh.headers);
  // Retry once on a conflict: two visitors can submit at the same moment.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const current = attempt === 0 ? { records, sha } : await readInbox(gh.repo, gh.headers);
    const ok = await writeInbox(gh.repo, gh.headers, [sealed, ...current.records].slice(0, MAX_RECORDS), current.sha, 'inbox: new enquiry');
    if (ok) return { ok: true };
  }
  return { ok: false, message: 'The enquiry could not be stored. Please use email or WhatsApp.' };
}

export async function listEnquiries(): Promise<Enquiry[]> {
  const key = encryptionKey();
  if (!key) return [];
  const gh = await ghHeaders();
  const records = gh ? (await readInbox(gh.repo, gh.headers)).records : (await readLocal()).records;
  return records
    .map((sealed) => open(sealed, key))
    .filter((item): item is Enquiry => Boolean(item))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function updateEnquiries(next: Enquiry[]): Promise<InboxResult> {
  const key = encryptionKey();
  if (!key) return { ok: false, message: 'The inbox encryption key is not configured.' };
  const sealed = next.map((record) => seal(record, key));
  const gh = await ghHeaders();

  if (!gh) {
    const written = await writeLocal(sealed);
    return written ? { ok: true } : { ok: false, message: 'The local inbox could not be written.' };
  }
  if (!(await ensureBranch(gh.repo, gh.headers))) return { ok: false, message: 'The inbox branch is unavailable.' };
  const { sha } = await readInbox(gh.repo, gh.headers);
  const ok = await writeInbox(gh.repo, gh.headers, sealed, sha, 'inbox: update statuses');
  return ok ? { ok: true } : { ok: false, message: 'That change could not be saved.' };
}

