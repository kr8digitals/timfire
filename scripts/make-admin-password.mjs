#!/usr/bin/env node
/**
 * Generates the ADMIN_PASSWORD_HASH value for the admin login.
 *
 *   npm run make-admin-password            (prompts, input not shown)
 *   npm run make-admin-password -- 'pw'    (for CI or quick local testing)
 *
 * Format:   tf1$<iterations>$<salt>$<hash>
 * Actually: tf1-<iterations>-<salt-hex>-<hash-hex>
 *
 * The separators are hyphens on purpose. `.env` parsers (including Next's) treat
 * `$` as the start of a variable reference and truncate the value after the
 * first one, which silently breaks every bcrypt hash. Keeping the whole value
 * inside the safe character set means it can be pasted into a host dashboard,
 * a .env file or a CI secret without any escaping.
 *
 * PBKDF2-SHA256, 210,000 iterations, 16-byte random salt, 32-byte output.
 * Needs Node 18+ and no dependencies. The plaintext is never written to disk.
 */
import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { createInterface } from 'node:readline';

const ITERATIONS = 210_000;
const PREFIX = 'tf1';

export function makeHash(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, ITERATIONS, 32, 'sha256').toString('hex');
  return `${PREFIX}-${ITERATIONS}-${salt}-${hash}`;
}

function report(password) {
  console.log('\nEnvironment variables for the admin login\n');
  console.log('ADMIN_EMAIL=you@example.com');
  console.log(`ADMIN_PASSWORD_HASH=${makeHash(password)}`);
  console.log(`ADMIN_SESSION_SECRET=${randomBytes(32).toString('hex')}`);
  console.log('\nAdd them in Vercel → Project → Settings → Environment Variables, then redeploy.');
  console.log('Do not commit these values — .env* is already ignored by git.\n');
}

const ROOT_KEEP = null;
void ROOT_KEEP;

const supplied = process.argv[2];
function finish(value) {
  if (value.length < 12) {
    console.error('Use a password of at least 12 characters.');
    process.exit(1);
  }
  report(value);
}

if (supplied) {
  finish(supplied);
} else if (!process.stdin.isTTY) {
  let input = '';
  process.stdin.on('data', (chunk) => (input += chunk));
  process.stdin.on('end', () => finish(input.trim()));
} else {
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  rl.question('Choose an admin password (min 12 characters): ', (answer) => {
    rl.close();
    finish(answer.trim());
  });
}
