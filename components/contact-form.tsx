'use client';
import { useEffect, useState } from 'react';
import { ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';

const TOPICS = [
  'Website design & development',
  'AI agent development',
  'SEO optimisation',
  'Graphic design',
  'Branding',
  'Video editing',
  'One-on-one mentorship',
  'Something else',
];

type Errors = Partial<Record<'name' | 'email' | 'topic' | 'message', string>>;

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot — must stay empty
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [serverMessage, setServerMessage] = useState('');

  // Pre-select topic from ?service=... (e.g. Work page "Request one" CTA).
  useEffect(() => {
    try {
      const param = new URLSearchParams(window.location.search).get('service');
      if (param && TOPICS.includes(param)) setTopic(param);
    } catch {
      /* ignore */
    }
  }, []);

  function validate(): Errors {
    const e: Errors = {};
    if (!name.trim()) e.name = 'Please enter your name.';
    if (!email.trim()) e.email = 'Please enter your email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Please enter a valid email address.';
    if (!topic) e.topic = 'Please choose a topic.';
    if (!message.trim()) e.message = 'Please write a message.';
    else if (message.trim().length < 10) e.message = 'Please add a little more detail (at least 10 characters).';
    return e;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setStatus('sending');
    setServerMessage('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), topic, message: message.trim(), website }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus('sent');
        setName('');
        setEmail('');
        setMessage('');
        setErrors({});
      } else {
        setStatus('error');
        setServerMessage(data.message || 'Something went wrong. Please try again or use email / WhatsApp below.');
      }
    } catch {
      setStatus('error');
      setServerMessage('Could not send. Please check your connection and try again, or use email / WhatsApp below.');
    }
  }

  if (status === 'sent') {
    return (
      <div className="card light contact-success" role="status">
        <CheckCircle2 size={28} aria-hidden="true" />
        <h3>Message received.</h3>
        <p>
          Thank you — your message has been saved. For a guaranteed reply, email <a href="mailto:hi@kutimfire.com">hi@kutimfire.com</a> or
          send a WhatsApp message.
        </p>
        <a className="text-link" style={{ color: '#842e00' }} href="https://wa.me/2348166552758" target="_blank" rel="noopener noreferrer">
          Open WhatsApp <ArrowUpRight size={18} />
        </a>
        <div className="actions" style={{ marginTop: 18 }}>
          <button type="button" className="button ghost" onClick={() => setStatus('idle')}>
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="card contact-form" onSubmit={onSubmit} noValidate>
      <span className="eyebrow">Send a message</span>
      <h3 style={{ margin: '10px 0 4px' }}>Tell me what you are building.</h3>
      <p className="muted" style={{ marginTop: 0 }}>Fields marked * are required. I reply by email.</p>

      <label className="form-label" htmlFor="contact-name">Your name *</label>
      <input id="contact-name" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'contact-name-error' : undefined} />
      {errors.name && <p className="error-text" id="contact-name-error" role="alert">{errors.name}</p>}

      <label className="form-label" htmlFor="contact-email">Your email *</label>
      <input id="contact-email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'contact-email-error' : undefined} />
      {errors.email && <p className="error-text" id="contact-email-error" role="alert">{errors.email}</p>}

      <label className="form-label" htmlFor="contact-topic">Topic *</label>
      <select id="contact-topic" name="topic" value={topic} onChange={(e) => setTopic(e.target.value)} aria-invalid={!!errors.topic}>
        {TOPICS.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      {errors.topic && <p className="error-text" role="alert">{errors.topic}</p>}

      <label className="form-label" htmlFor="contact-message">Message *</label>
      <textarea id="contact-message" name="message" rows={6} value={message} onChange={(e) => setMessage(e.target.value)} aria-invalid={!!errors.message} aria-describedby={errors.message ? 'contact-message-error' : undefined} />
      {errors.message && <p className="error-text" id="contact-message-error" role="alert">{errors.message}</p>}

      {/* Honeypot: hidden from people, filled by bots. */}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input id="contact-website" name="website" type="text" autoComplete="off" tabIndex={-1} value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>

      {status === 'error' && (
        <p className="error-text" role="alert" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <AlertCircle size={18} aria-hidden="true" /> {serverMessage}
        </p>
      )}

      <div className="actions" style={{ marginTop: 22 }}>
        <button className="button primary" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>
        <a className="button ghost" href="mailto:hi@kutimfire.com">Email instead</a>
      </div>
    </form>
  );
}
