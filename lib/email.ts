import { Resend } from 'resend';
import { db } from './db';
import { SITE_ORIGIN } from './site';

/**
 * The email engine. Two professional voices on the verified domain:
 *   enquiries@kutimfire.com — transactional: form forwards to the owner and
 *                             instant acknowledgements to visitors
 *   hello@kutimfire.com     — relationship: welcome, publish notices, broadcasts
 * Every message is rendered from an editable template (email_templates table,
 * admin dashboard) into the branded shell below, and every recipient is
 * addressed by name. All sends are logged to email_log and every failure is
 * swallowed by design: mail must never break the site.
 */
export const OWNER_EMAIL = 'kutimfire001@gmail.com';
const ADDRESSES: Record<string, string> = {
  hello: 'hello@kutimfire.com',
  enquiries: 'enquiries@kutimfire.com',
};
const FROM_NAME = 'TIMFIRE';

export type TemplateSlug =
  | 'welcome'
  | 'ack'
  | 'owner_forward'
  | 'publish_notice'
  | 'broadcast_newsletter'
  | 'broadcast_new_work'
  | 'broadcast_offer';

const DEFAULT_TEMPLATES: Record<TemplateSlug, { sender: 'hello' | 'enquiries'; subject: string; body: string }> = {
  welcome: {
    sender: 'hello',
    subject: 'You are on the list, {{name}}.',
    body: '{{name}}, welcome — you will hear it here first.\n\nWhen a new poem, spoken word piece or article goes public, it lands in your inbox the same day. When new work ships or a limited-time offer opens, you know before anyone else.\n\nOne short email at a time, always addressed to you. Never a wall of text.\n\n— Timfire',
  },
  ack: {
    sender: 'enquiries',
    subject: 'I received your {{form_title}}, {{name}}.',
    body: '{{name}}, thank you — your {{form_title}} reached me.\n\nI read every message myself and answer from hi@kutimfire.com, usually within a day or two. If yours is urgent, WhatsApp reaches me fastest.\n\n— Timfire',
  },
  owner_forward: {
    sender: 'enquiries',
    subject: 'New {{form_title}} from {{name}}',
    body: '{{name}} <{{email}}> sent a {{form_title}}.\n\n{{answers_block}}\nReply-To is set to their address, so answering goes straight to them.',
  },
  publish_notice: {
    sender: 'hello',
    subject: '{{title}} — new on the site, {{name}}.',
    body: '{{name}}, a new {{category}} is live on the site.\n\n{{summary_line}}\n\nRead it here: {{link}}\n\n— Timfire',
  },
  broadcast_newsletter: {
    sender: 'hello',
    subject: 'A short letter for you, {{name}}.',
    body: '{{name}},\n\n{{body}}\n\n— Timfire',
  },
  broadcast_new_work: {
    sender: 'hello',
    subject: 'I finished something, {{name}} — come look.',
    body: '{{name}}, new work is up and I would rather hear your honest comment than a polite one.\n\n{{body}}\n\nSee it here: {{link}}\n\n— Timfire',
  },
  broadcast_offer: {
    sender: 'hello',
    subject: 'For a limited time, {{name}}: {{offer_title}}.',
    body: '{{name}}, this one has a deadline, so I will keep it short.\n\n{{body}}\n\nClaim it here: {{link}}\n\n— Timfire',
  },
};

export function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? '');
}

export async function templateFor(slug: TemplateSlug) {
  const supa = db();
  if (supa) {
    const { data } = await supa.from('email_templates').select('sender,subject,body').eq('slug', slug).maybeSingle();
    if (data) return { sender: data.sender as 'hello' | 'enquiries', subject: data.subject as string, body: data.body as string };
  }
  return DEFAULT_TEMPLATES[slug];
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function shell(paragraphs: string[], preview: string, unsubToken?: string): string {
  const body = paragraphs
    .map((p) => `<p style="margin:0 0 18px;font-size:17px;line-height:1.65;color:#241a15;">${esc(p).replace(/\n/g, '<br/>')}</p>`)
    .join('');
  const unsub = unsubToken
    ? `<p style="margin:26px 0 0;font-size:13px;line-height:1.6;color:#8a7a6f;">You receive this because you asked for updates from TIMFIRE. <a href="${SITE_ORIGIN}/unsubscribe?token=${unsubToken}" style="color:#8e1b3a;">Unsubscribe in one click</a> — no hard feelings, door stays open.</p>`
    : '';
  return `<!doctype html><html><body style="margin:0;background:#f9f9f9;padding:34px 16px;font-family:Georgia,'Times New Roman',serif;">
<div style="max-width:620px;margin:0 auto;background:#fffdf9;border:1px solid #eadfd2;border-radius:18px;overflow:hidden;">
<div style="background:#0b0706;padding:26px 30px;">
  <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:24px;letter-spacing:-0.04em;color:#f9f9f9;font-weight:700;">TIMFIRE<span style="color:#f27a1a;">.</span></p>
  <p style="margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#f27a1a;">${esc(preview)}</p>
</div>
<div style="padding:30px 30px 8px;">${body}</div>
<div style="padding:0 30px 30px;">
  <div style="height:3px;width:54px;background:#f27a1a;border-radius:2px;margin:6px 0 14px;"></div>
  <p style="margin:0;font-size:13px;line-height:1.6;color:#8a7a6f;">Kenneth Timothy Iziogo · KR8 DIGITALS · Abakaliki, Nigeria<br/>Think it. KR8 it.</p>
  ${unsub}
</div>
</div></body></html>`;
}

async function logEmail(row: { purpose: string; recipient: string; subject: string; status: string; resend_id?: string; error?: string; meta?: Record<string, unknown> }) {
  const supa = db();
  if (!supa) return null;
  const { data } = await supa.from('email_log').insert({ ...row, meta: row.meta ?? {} }).select('id').single();
  return data?.id as string | undefined;
}

async function markEmail(id: string | null, patch: { status: string; resend_id?: string; error?: string }) {
  const supa = db();
  if (!supa || !id) return;
  await supa.from('email_log').update(patch).eq('id', id);
}

export type SendInput = {
  purpose: string;
  sender: 'hello' | 'enquiries';
  to: string;
  subject: string;
  text: string;
  preview: string;
  replyTo?: string;
  unsubToken?: string;
  meta?: Record<string, unknown>;
};

/** Sends one branded email. Never throws: failures are logged and reported. */
export async function sendEmail(input: SendInput): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const id = await logEmail({ purpose: input.purpose, recipient: input.to, subject: input.subject, status: 'queued', meta: input.meta });
  if (!key) {
    await markEmail(id ?? null, { status: 'failed', error: 'RESEND_API_KEY not configured' });
    return false;
  }
  try {
    const resend = new Resend(key);
    const result = await resend.emails.send({
      from: `${FROM_NAME} <${ADDRESSES[input.sender]}>`,
      to: [input.to],
      subject: input.subject,
      html: shell(input.text.split('\n\n'), input.preview, input.unsubToken),
      ...(input.replyTo ? { reply_to: input.replyTo } : {}),
    });
    if (result.error) {
      await markEmail(id ?? null, { status: 'failed', error: result.error.message });
      return false;
    }
    await markEmail(id ?? null, { status: 'sent', resend_id: result.data?.id });
    return true;
  } catch (e) {
    await markEmail(id ?? null, { status: 'failed', error: e instanceof Error ? e.message : 'send error' });
    return false;
  }
}

/** Template-driven send: loads the editable template, fills variables, sends. */
export async function sendTemplated(slug: TemplateSlug, to: string, vars: Record<string, string>, extra?: { replyTo?: string; unsubToken?: string; meta?: Record<string, unknown> }) {
  const t = await templateFor(slug);
  return sendEmail({
    purpose: slug,
    sender: t.sender,
    to,
    subject: fill(t.subject, vars),
    text: fill(t.body, vars),
    preview: slug === 'owner_forward' ? 'New enquiry' : slug === 'ack' ? 'Message received' : slug === 'welcome' ? 'Welcome to the list' : 'An update for you',
    ...extra,
  });
}

/* ---------------- subscribers ---------------- */

export type Subscriber = { id: string; name: string; email: string; status: string; unsub_token: string; created_at: string };

export async function addSubscriber(name: string, email: string): Promise<Subscriber | null> {
  const supa = db();
  if (!supa) return null;
  const existing = await supa.from('subscribers').select('*').ilike('email', email).maybeSingle();
  if (existing.data) {
    const row = existing.data as Subscriber;
    if (row.status !== 'active' || row.name !== name) {
      await supa.from('subscribers').update({ status: 'active', name, unsubscribed_at: null }).eq('id', row.id);
      return { ...row, status: 'active', name };
    }
    return row;
  }
  const created = await supa.from('subscribers').insert({ name, email: email.toLowerCase() }).select('*').single();
  return (created.data as Subscriber) ?? null;
}

export async function activeSubscribers(sinceDays?: number): Promise<Subscriber[]> {
  const supa = db();
  if (!supa) return [];
  let query = supa.from('subscribers').select('*').eq('status', 'active').order('created_at', { ascending: true });
  if (sinceDays) {
    const cutoff = new Date(Date.now() - sinceDays * 86400000).toISOString();
    query = query.gte('created_at', cutoff);
  }
  const { data } = await query;
  return (data ?? []) as Subscriber[];
}

export async function allSubscribers(): Promise<Subscriber[]> {
  const supa = db();
  if (!supa) return [];
  const { data } = await supa.from('subscribers').select('*').order('created_at', { ascending: false }).limit(500);
  return (data ?? []) as Subscriber[];
}

export async function unsubscribeByToken(token: string): Promise<boolean> {
  const supa = db();
  if (!supa || !token) return false;
  const { data } = await supa
    .from('subscribers')
    .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() })
    .eq('unsub_token', token)
    .select('id');
  return !!data?.length;
}
