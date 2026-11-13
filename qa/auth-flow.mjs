#!/usr/bin/env node
/**
 * The sign-in and subscription flows, end to end, offline.
 *
 * Nothing else in the QA suite could reach these: they need a mailbox and a
 * database, and the two-step sign-in only fails in production, where a code
 * emailed by one serverless instance has to be recognised by another. So this
 * script builds its own world — a throwaway password hashed at runtime (no
 * secret is ever committed), a mock Resend and a mock Supabase — starts the
 * built server against them, and walks the whole journey:
 *
 *   wrong password → refused, no cookie
 *   right password at the wrong address → told which address the dashboard uses
 *   right password → code emailed, still no cookie, code stored only as a hash
 *   wrong code → refused and counted; right code → the five-day cookie
 *   the cookie authenticates an admin route, is re-issued on every visit
 *   the code is single-use; logout ends it
 *   five wrong passwords from one address → locked out, even with the right one
 *   subscribing saves the name and sends a welcome letter that can unsubscribe
 *
 *   npm run build && node qa/auth-flow.mjs
 */
import { spawn } from 'node:child_process';
import bcrypt from 'bcryptjs';
import { startMocks } from './mock-services.mjs';

const ROOT = new URL('..', import.meta.url);
const APP_PORT = 3199;
const RESEND_PORT = 3210;
const DB_PORT = 3211;
const APP = `http://127.0.0.1:${APP_PORT}`;

const ADMIN_EMAIL = 'qa-owner@example.test';
const PASSWORD = `qa-${Math.random().toString(36).slice(2)}-${Date.now()}`;
const HASH_B64 = Buffer.from(bcrypt.hashSync(PASSWORD, 10)).toString('base64');

let failures = 0;
let checks = 0;
function check(label, condition, detail) {
  checks += 1;
  if (condition) console.log(`ok   ${label}`);
  else {
    console.log(`FAIL ${label}${detail === undefined ? '' : ` — ${detail}`}`);
    failures += 1;
  }
}
const eq = (label, actual, expected) =>
  check(label, actual === expected, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);

const cookiesOf = (res) => (res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get('set-cookie')].filter(Boolean));
const sessionCookie = (res) => cookiesOf(res).find((c) => c.startsWith('timfire_admin=')) ?? null;

async function post(path, body, headers = {}) {
  return fetch(APP + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

const mocks = await startMocks({ resendPort: RESEND_PORT, dbPort: DB_PORT });

const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '-p', String(APP_PORT)], {
  cwd: ROOT.pathname,
  stdio: ['ignore', 'pipe', 'pipe'],
  env: {
    ...process.env,
    NODE_ENV: 'production',
    ADMIN_EMAIL,
    ADMIN_PASSWORD_HASH: HASH_B64,
    RESEND_API_KEY: 're_mock_key',
    RESEND_BASE_URL: `http://127.0.0.1:${RESEND_PORT}`,
    SUPABASE_URL: `http://127.0.0.1:${DB_PORT}`,
    SUPABASE_SERVICE_ROLE_KEY: 'mock-service-role-key',
  },
});
let serverLog = '';
child.stdout.on('data', (d) => {
  serverLog += d;
});
child.stderr.on('data', (d) => {
  serverLog += d;
});

async function waitForServer(timeoutMs = 40000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(APP + '/api/auth/session');
      if (res.ok) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}

try {
  if (!(await waitForServer())) throw new Error(`the built server never answered on ${APP}\n${serverLog.slice(-2000)}`);

  /* ---------- 1. the password step ---------- */
  {
    const res = await post('/api/auth/login', { email: ADMIN_EMAIL, password: 'not-the-password' });
    eq('a wrong password is refused', res.status, 401);
    const body = await res.json();
    eq('and says so without saying which half was wrong', body.message, 'Email or password is incorrect.');
    check('and issues no session cookie', sessionCookie(res) === null, cookiesOf(res).join('; '));
    check('and emails nobody', mocks.emails.length === 0, `${mocks.emails.length} emails`);
  }

  {
    const res = await post('/api/auth/login', { email: 'someone-else@example.test', password: PASSWORD });
    eq('the right password at the wrong address is refused', res.status, 401);
    const body = await res.json();
    check(
      'but it names the address the dashboard uses, because the password already proved who is asking',
      typeof body.message === 'string' && body.message.includes(ADMIN_EMAIL),
      body.message,
    );
    check('and still issues no cookie', sessionCookie(res) === null);
  }

  /* ---------- 2. the code step ---------- */
  let code = '';
  {
    const res = await post('/api/auth/login', { email: ADMIN_EMAIL, password: PASSWORD });
    eq('the right password is accepted', res.status, 200);
    const body = await res.json();
    eq('and stops at the code step', body.step, 'code');
    check('without issuing a session cookie', sessionCookie(res) === null, cookiesOf(res).join('; '));

    const mail = mocks.lastEmail();
    check('one email went out', mocks.emails.length === 1, `${mocks.emails.length} emails`);
    eq('to the dashboard address', mail?.to?.[0], ADMIN_EMAIL);
    eq('from the transactional voice', mail?.from, 'TIMFIRE <enquiries@kutimfire.com>');
    eq('with the sign-in subject', mail?.subject, 'Your TIMFIRE sign-in code.');
    check('replies go to the public inbox', mail?.reply_to === 'hello@kutimfire.com', mail?.reply_to);
    const found = /Your code:\s*(\d{6})/.exec(mail?.html ?? '');
    check('the mail carries a six-digit code', !!found, found ? found[1] : (mail?.html ?? '').slice(0, 160));
    code = found?.[1] ?? '';

    const row = mocks.table('admin_signins').find((r) => r.key === 'code');
    check('the code is stored in the database, so any instance can verify it', !!row);
    check('and only as a sha256 hash', /^[0-9a-f]{64}$/.test(row?.code_hash ?? ''), row?.code_hash);
    check('the plaintext code is nowhere in that row', !JSON.stringify(row ?? {}).includes(code));
    const ttl = new Date(row.expires_at).getTime() - Date.now();
    check('the code expires in about ten minutes', ttl > 9 * 60_000 && ttl <= 10 * 60_000, `${Math.round(ttl / 1000)}s`);

    // The log is the only way anyone can tell a mail actually left, so it is
    // asserted as hard as the send. This was the silent one: email_log.purpose
    // carried a CHECK list without 'admin_code', every insert was rejected, the
    // error was dropped, and the table stayed empty through two real enquiries.
    const logged = mocks.table('email_log').filter((r) => r.purpose === 'admin_code');
    eq('the code email is logged', logged.length, 1);
    eq('as sent', logged[0]?.status, 'sent');
    eq('to the dashboard address', logged[0]?.recipient, ADMIN_EMAIL);
    check('with the Resend id that proves it left', !!logged[0]?.resend_id, JSON.stringify(logged[0] ?? null));
  }

  {
    const wrong = code === '000000' ? '111111' : '000000';
    const res = await post('/api/auth/verify', { email: ADMIN_EMAIL, code: wrong });
    eq('a wrong code is refused', res.status, 401);
    check('and issues no cookie', sessionCookie(res) === null);
    const row = mocks.table('admin_signins').find((r) => r.key === 'code');
    eq('and the wrong guess is counted', row?.tries, 1);
  }

  let cookie = '';
  {
    const res = await post('/api/auth/verify', { email: ADMIN_EMAIL, code });
    eq('the right code signs in', res.status, 200);
    const body = await res.json();
    const fiveDays = 5 * 24 * 60 * 60 * 1000;
    check('and remembers the browser for five days', body.expires - Date.now() > fiveDays - 60_000, `${body.expires - Date.now()}ms`);
    cookie = sessionCookie(res) ?? '';
    check('a session cookie is set', cookie.startsWith('timfire_admin='), cookie.slice(0, 60));
    check('it is httpOnly', /;\s*HttpOnly/i.test(cookie), cookie);
    check('it is SameSite=lax', /;\s*SameSite=lax/i.test(cookie), cookie);
    check('it lasts five days', /;\s*Max-Age=432000/i.test(cookie), cookie);
    check('the code row is consumed', !mocks.table('admin_signins').some((r) => r.key === 'code'));
  }

  {
    const res = await post('/api/auth/verify', { email: ADMIN_EMAIL, code });
    eq('the same code cannot be used twice', res.status, 401);
  }

  /* ---------- 3. the session ---------- */
  {
    const res = await fetch(`${APP}/api/auth/session`, { headers: { cookie } });
    const body = await res.json();
    eq('the session is authenticated', body.authenticated, true);
    check('the sliding window re-issues the cookie on every visit', sessionCookie(res) !== null, cookiesOf(res).join('; '));
  }
  {
    const res = await fetch(`${APP}/api/admin/templates`, { headers: { cookie } });
    eq('an admin route accepts the session', res.status, 200);
  }
  {
    const res = await fetch(`${APP}/api/admin/templates`);
    eq('and still refuses an anonymous visitor', res.status, 401);
  }
  {
    const res = await fetch(`${APP}/api/auth/session`, { headers: { cookie: 'timfire_admin=forged.cookie' } });
    const body = await res.json();
    eq('a forged cookie is refused', body.authenticated, false);
  }

  /* ---------- 4. the lockout ---------- */
  {
    const headers = { 'X-Forwarded-For': '203.0.113.9' };
    const statuses = [];
    for (let i = 0; i < 6; i += 1) {
      const res = await post('/api/auth/login', { email: ADMIN_EMAIL, password: `wrong-${i}` }, headers);
      statuses.push(res.status);
      await res.json();
    }
    eq('four wrong passwords stay a plain refusal', statuses.slice(0, 4).join(','), '401,401,401,401');
    eq('the fifth locks the address out', statuses[4], 429);
    eq('and the lock holds', statuses[5], 429);
    const res = await post('/api/auth/login', { email: ADMIN_EMAIL, password: PASSWORD }, headers);
    eq('even for the right password, until the window passes', res.status, 429);
    await res.json();
  }

  /* ---------- 5. subscribing ---------- */
  {
    mocks.emails.length = 0;
    const res = await post('/api/subscribe', { name: 'Ada Obi', email: 'ada@example.test' });
    eq('a subscription is accepted', res.status, 200);
    const row = mocks.table('subscribers').find((r) => r.email === 'ada@example.test');
    check('the subscriber is saved', !!row);
    eq('with the name every email greets them by', row?.name, 'Ada Obi');
    check('and an unsubscribe token of their own', !!row?.unsub_token, row?.unsub_token);
    const mail = mocks.lastEmail();
    eq('the welcome letter goes to them', mail?.to?.[0], 'ada@example.test');
    eq('from the relationship voice', mail?.from, 'TIMFIRE <hello@kutimfire.com>');
    check('it greets them by name', (mail?.html ?? '').includes('Ada Obi'), (mail?.subject ?? '') + ' / ' + (mail?.html ?? '').slice(0, 120));
    check(
      'and carries their one-click unsubscribe',
      (mail?.html ?? '').includes(`/unsubscribe?token=${row?.unsub_token}`),
    );
    const logged = mocks.table('email_log').filter((r) => r.purpose === 'welcome');
    eq('the send is logged', logged.length, 1);
    eq('as sent', logged[0]?.status, 'sent');
    check('with the Resend id that proves it left', !!logged[0]?.resend_id, JSON.stringify(logged[0] ?? null));
  }
  {
    const res = await post('/api/subscribe', { name: '', email: 'not-an-email' });
    eq('a bad subscription is still refused', res.status, 400);
  }

  /* ---------- 6. logout ---------- */
  {
    const res = await post('/api/auth/logout', {}, { cookie });
    const cleared = sessionCookie(res);
    check(
      'the browser is told to delete the cookie',
      !!cleared && (/Max-Age=0/i.test(cleared) || /Expires=Thu, 01 Jan 1970/i.test(cleared)),
      cleared ?? 'no Set-Cookie',
    );
    // A signed cookie stays valid until it expires, so deleting it client-side
    // is not enough: replaying the old value must be refused too.
    const replay = await fetch(`${APP}/api/auth/session`, { headers: { cookie } });
    eq('a replayed cookie is refused after logout', (await replay.json()).authenticated, false);
    const admin = await fetch(`${APP}/api/admin/templates`, { headers: { cookie } });
    eq('and no longer opens the admin routes', admin.status, 401);
    const again = await post('/api/auth/login', { email: ADMIN_EMAIL, password: PASSWORD }, { 'X-Forwarded-For': '203.0.113.11' });
    eq('signing in again starts from the password', again.status, 200);
    await again.json();
  }
} catch (error) {
  failures += 1;
  console.log(`FAIL the harness could not run: ${error.message}`);
  console.log(serverLog.slice(-3000));
} finally {
  child.kill('SIGTERM');
  await mocks.close();
}

console.log(`\n${checks - failures}/${checks} checks passed.`);
if (failures) {
  console.log(`FAIL: ${failures} sign-in/subscription checks failed.`);
  process.exit(1);
}
console.log('PASS: the two-step sign-in, the five-day sliding session and the subscription all work end to end.');
