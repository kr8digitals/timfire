'use client';
import { useState } from 'react';
import { ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { FORMS } from '@/lib/forms';
import { PUBLIC_EMAIL } from '@/lib/site';

/**
 * EnquiryForm — renders whichever purpose-built form definition it is given.
 * Fields, options and order come from lib/forms.ts, so every intention on the
 * site collects exactly the information the owner needs to act on it.
 */
export default function EnquiryForm({ kind }: { kind: string }) {
  const def = FORMS[kind] || FORMS.general;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [website, setWebsite] = useState(''); // honeypot — must stay empty
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [serverMessage, setServerMessage] = useState('');

  function set(name2: string, value: string) {
    setAnswers((a) => ({ ...a, [name2]: value }));
  }

  function validate(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Please enter your name.';
    if (!email.trim()) e.email = 'Please enter your email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Please enter a valid email address.';
    for (const f of def.fields) {
      const v = (answers[f.name] || '').trim();
      if (f.required && !v) e[f.name] = 'This field is needed so I can respond properly.';
      if (f.type === 'url' && v && !/^https?:\/\/.+\..+/.test(v)) e[f.name] = 'Please include a full address starting with https://';
    }
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
        body: JSON.stringify({ kind: def.kind, name: name.trim(), email: email.trim(), answers, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus('sent');
        setName('');
        setEmail('');
        setAnswers({});
        setErrors({});
      } else {
        setStatus('error');
        setServerMessage(data.message || 'Something went wrong. Please try again, or use email / WhatsApp below.');
      }
    } catch {
      setStatus('error');
      setServerMessage('Could not send. Please check your connection, or use email / WhatsApp below.');
    }
  }

  if (status === 'sent') {
    return (
      <div className="contact-success card light" role="status">
        <CheckCircle2 size={26} style={{ color: '#1c7c45' }} aria-hidden="true" />
        <h3>Received. Thank you.</h3>
        <p>
          Your {def.title.toLowerCase()} is in my inbox. I read every message myself and reply personally — usually
          within a day.
        </p>
        <p>
          If it is urgent, WhatsApp is fastest:{' '}
          <a className="text-link" style={{ color: '#842e00' }} href="https://wa.me/2348166552758" target="_blank" rel="noopener noreferrer">
            message me here <ArrowUpRight size={16} />
          </a>
        </p>
        <button className="button ghost" style={{ borderColor: '#a28a7c', color: '#23140d' }} onClick={() => setStatus('idle')}>
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form enquiry-form" onSubmit={onSubmit} noValidate>
      <div className="row-2">
        <div>
          <label className="form-label" htmlFor={`${kind}-name`}>Your name</label>
          <input id={`${kind}-name`} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          {errors.name && <p className="error-text">{errors.name}</p>}
        </div>
        <div>
          <label className="form-label" htmlFor={`${kind}-email`}>Email address</label>
          <input id={`${kind}-email`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>
      </div>

      {def.fields.map((f) => (
        <div key={f.name}>
          <label className="form-label" htmlFor={`${kind}-${f.name}`}>
            {f.label}
            {f.required ? '' : ' (optional)'}
          </label>
          {f.hint && <p className="field-hint">{f.hint}</p>}
          {f.type === 'select' ? (
            <select id={`${kind}-${f.name}`} value={answers[f.name] || ''} onChange={(e) => set(f.name, e.target.value)}>
              <option value="">Choose…</option>
              {f.options?.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          ) : f.type === 'textarea' ? (
            <textarea
              id={`${kind}-${f.name}`}
              value={answers[f.name] || ''}
              onChange={(e) => set(f.name, e.target.value)}
              placeholder={f.placeholder}
              rows={4}
            />
          ) : (
            <input
              id={`${kind}-${f.name}`}
              type={f.type === 'url' ? 'url' : 'text'}
              value={answers[f.name] || ''}
              onChange={(e) => set(f.name, e.target.value)}
              placeholder={f.placeholder}
            />
          )}
          {errors[f.name] && <p className="error-text">{errors[f.name]}</p>}
        </div>
      ))}

      <div className="honeypot" aria-hidden="true">
        <label htmlFor={`${kind}-hp`}>Leave this field empty</label>
        <input id={`${kind}-hp`} tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>

      {status === 'error' && (
        <p className="notice error" role="alert">
          <AlertCircle size={15} style={{ display: 'inline', marginRight: 8, verticalAlign: '-2px' }} aria-hidden="true" />
          {serverMessage}
        </p>
      )}

      <button className="button primary" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : def.submitLabel} <ArrowUpRight size={17} />
      </button>
      <p className="small muted" style={{ marginTop: 10 }}>
        Or skip the form: <a href={'mailto:' + PUBLIC_EMAIL}>{PUBLIC_EMAIL}</a> ·{' '}
        <a href="https://wa.me/2348166552758" target="_blank" rel="noopener noreferrer">WhatsApp</a>
      </p>
    </form>
  );
}
