import 'server-only';
import type { SiteContent, Enquiry } from './types';
import { BRANCH, writeBackend } from './store';

/**
 * Writes. Everything here requires an authenticated admin session — callers in
 * `app/api/cms/*` check the session before importing a function from this file.
 *
 * GitHub backend: each save is a commit to `content/site.json` with the SHA of
 * the version that was read, so two people editing at once get a clean conflict
 * instead of one silently overwriting the other. A Vercel production deploy is
 * triggered by the commit, which means published changes go live through the
 * same pipeline as code.
 */

function ghConfig() {
  const token = process.env.GITHUB_CONTENT_TOKEN;
  const repo = process.env.GITHUB_CONTENT_REPO;
  if (!token || !repo) return null;
  return { token, repo };
}

export type WriteResult = { ok: true; commit?: string } | { ok: false; status: number; message: string };

const MAX_BYTES = 4 * 1024 * 1024;

async function ghPut(path: string, content: string, sha: string | undefined, message: string): Promise<WriteResult> {
  const cfg = ghConfig();
  if (!cfg) return { ok: false, status: 503, message: 'Content storage is not configured.' };
  if (Buffer.byteLength(content, 'utf8') > MAX_BYTES) {
    return { ok: false, status: 413, message: 'This content is too large to save in one document.' };
  }
  const res = await fetch(`https://api.github.com/repos/${cfg.repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(content, 'utf8').toString('base64'),
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    }),
    cache: 'no-store',
  });
  if (res.status === 409 || res.status === 422) {
    return {
      ok: false,
      status: 409,
      message: 'Someone else saved a change first. Reload the page to get the latest version, then save again.',
    };
  }
  if (!res.ok) {
    console.error('github write failed', res.status, await res.text().catch(() => ''));
    return { ok: false, status: 502, message: 'The change could not be saved to storage. Please try again.' };
  }
  const body = (await res.json().catch(() => ({}))) as { commit?: { sha?: string } };
  return { ok: true, commit: body.commit?.sha };
}

async function localPut(path: string, content: string): Promise<WriteResult> {
  try {
    const fs = await import('node:fs/promises');
    const nodePath = await import('node:path');
    const file = nodePath.join(process.cwd(), path);
    await fs.mkdir(nodePath.dirname(file), { recursive: true });
    await fs.writeFile(file, content, 'utf8');
    return { ok: true };
  } catch (error) {
    console.error('local write failed', error);
    return { ok: false, status: 500, message: 'The change could not be written to disk.' };
  }
}

/**
 * Persist the whole content document.
 * `expectedSha` guards against overwriting a newer version.
 */
export async function saveContent(data: SiteContent, expectedSha: string | undefined, actor: string): Promise<WriteResult> {
  const backend = writeBackend();
  if (backend === 'github') {
    const sha = expectedSha;
    return ghPut('content/site.json', JSON.stringify(data, null, 2), sha, `content: update from ${actor}`);
  }
  if (backend === 'file') return localPut('content/site.json', JSON.stringify(data, null, 2));
  return {
    ok: false,
    status: 503,
    message: 'No content store is configured for this deployment. Set GITHUB_CONTENT_TOKEN and GITHUB_CONTENT_REPO.',
  };
}

/* ── Enquiries ───────────────────────────────────────────────────────────── */

const MAX_ENQUIRIES = 500;

/**
 * Enquiries are encrypted before they are stored and never touch the content
 * document, the production branch, or the build pipeline. See `inbox.ts`.
 */
export async function appendEnquiry(enquiry: Enquiry): Promise<WriteResult> {
  const { addEnquiry } = await import('./inbox');
  const result = await addEnquiry(enquiry);
  return result.ok ? { ok: true } : { ok: false, status: 503, message: result.message };
}

export async function saveEnquiries(list: Enquiry[]): Promise<WriteResult> {
  const { updateEnquiries } = await import('./inbox');
  const result = await updateEnquiries(list.slice(0, MAX_ENQUIRIES));
  return result.ok ? { ok: true } : { ok: false, status: 503, message: result.message };
}

/* ── Images ──────────────────────────────────────────────────────────────── */

/**
 * Upload a photo to the repo and return its public path.
 * Images are committed rather than stored in a bucket so there is one
 * deployment pipeline and no third-party account to keep alive.
 */
export async function uploadImage(
  filename: string,
  bytes: Buffer,
  contentType: string,
  actor: string,
): Promise<{ ok: true; path: string } | { ok: false; status: number; message: string }> {
  const safe = filename
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(-90);
  if (!/\.(jpe?g|png|webp|avif|gif)$/.test(safe)) {
    return { ok: false, status: 400, message: 'Only JPG, PNG, WebP, AVIF or GIF images can be uploaded.' };
  }
  if (bytes.byteLength > 8 * 1024 * 1024) {
    return { ok: false, status: 413, message: 'That image is larger than 8MB. Please compress it first.' };
  }
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const repoPath = `public/uploads/${stamp}-${safe}`;
  const backend = writeBackend();
  if (backend === 'github') {
    const cfg = ghConfig();
    if (!cfg) return { ok: false, status: 503, message: 'Image storage is not configured.' };
    const res = await fetch(`https://api.github.com/repos/${cfg.repo}/contents/${repoPath}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `media: add ${safe} (${actor})`,
        content: bytes.toString('base64'),
        branch: BRANCH,
      }),
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error('image upload failed', res.status);
      return { ok: false, status: 502, message: 'The image could not be uploaded. Please try again.' };
    }
    // A committed image is served from the next deployment; Vercel picks up the
    // commit automatically, so the path is valid once that build finishes.
    return { ok: true, path: '/' + repoPath.replace(/^public\//, '') };
  }
  if (backend === 'file') {
    try {
      const fs = await import('node:fs/promises');
      const nodePath = await import('node:path');
      const dest = nodePath.join(process.cwd(), repoPath);
      await fs.mkdir(nodePath.dirname(dest), { recursive: true });
      await fs.writeFile(dest, bytes);
      return { ok: true, path: '/' + repoPath.replace(/^public\//, '') };
    } catch (error) {
      console.error(error);
      return { ok: false, status: 500, message: 'The image could not be saved.' };
    }
  }
  return { ok: false, status: 503, message: 'Image storage is not configured.' };
}

export function allowedImageTypes() {
  return ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
}
