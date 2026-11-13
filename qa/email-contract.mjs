#!/usr/bin/env node
/**
 * Email contract — proves what actually leaves for Resend, offline.
 *
 * The Resend SDK maps its own camelCase options onto the API's snake_case body
 * and *drops anything it does not recognise*. Passing `reply_to` — the name the
 * HTTP API uses — type-checks only when it hides inside a spread, and then
 * vanishes: every forwarded enquiry was going out with no Reply-To, so hitting
 * reply answered a mailbox that receives nothing.
 *
 * This drives the real SDK with its HTTP layer stubbed, so it needs no network
 * and no API key, and asserts the body that would have been sent.
 *
 *   node qa/email-contract.mjs
 */
import { Resend } from 'resend';

let failures = 0;
const check = (label, actual, expected) => {
  if (actual === expected) console.log(`ok   ${label}`);
  else {
    console.log(`FAIL ${label} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    failures += 1;
  }
};

/** Capture the request body instead of sending it. */
function stub() {
  const resend = new Resend('re_contract_test_not_a_real_key');
  let captured = null;
  resend.post = async (url, body) => {
    captured = { url, body };
    return { data: { id: 'email_contract' }, error: null, headers: null };
  };
  return { resend, get: () => captured };
}

const FROM = 'TIMFIRE <enquiries@kutimfire.com>';

{
  const { resend, get } = stub();
  await resend.emails.send({
    from: FROM,
    to: ['kutimfire001@gmail.com'],
    subject: 'New website enquiry from Ada',
    html: '<p>Ada sent a website enquiry.</p>',
    replyTo: 'ada@example.com',
  });
  const body = get().body;
  check('posts to /emails', get().url, '/emails');
  check('from survives', body.from, FROM);
  check('recipient survives', JSON.stringify(body.to), JSON.stringify(['kutimfire001@gmail.com']));
  check('subject survives', body.subject, 'New website enquiry from Ada');
  check('html survives', body.html, '<p>Ada sent a website enquiry.</p>');
  check('replyTo becomes reply_to on the wire', body.reply_to, 'ada@example.com');
}

{
  // The regression: the API's own spelling is dropped by the SDK.
  const { resend, get } = stub();
  await resend.emails.send({
    from: FROM,
    to: ['owner@example.com'],
    subject: 'x',
    html: '<p>y</p>',
    reply_to: 'ada@example.com',
  });
  check(
    'snake_case reply_to is dropped by the SDK (this is why the code uses replyTo)',
    get().body.reply_to,
    undefined,
  );
}

if (failures) {
  console.log(`\nFAIL: ${failures} email contract checks failed.`);
  process.exit(1);
}
console.log('\nPASS: the payload Resend receives carries the sender, recipient, subject, body and Reply-To.');
