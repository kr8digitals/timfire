'use client';

import { useId, useState } from 'react';
import { ArrowUpRight, AlertCircle, CheckCircle2, Mail, MessageCircle } from 'lucide-react';
import type { ServiceForm, FormField } from '@/lib/forms';

/**
 * A single form engine, driven by the per-service field definitions in
 * `lib/forms.ts`. Validation is announced properly, errors are tied to their
 * inputs, the honeypot is hidden from assistive tech, and a failed submission
 * always offers the two guaranteed routes (email and WhatsApp) rather than
 * losing the message.
 */

type Values = Record<string, string>;
type Errors = Record<string, string>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EnquiryForm({
  service,
  form,
  serviceName,
  fallbackWhatsApp,
}: {
  service: string;
  form: ServiceForm;
  serviceName: string;
  fallbackWhatsApp: string;
}) {
  const uid = useId().replace(/:/g, '');
  const [values, setValues] = useState<Values>({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [serverError, setServerError] = useState('');
  const [sentSummary, setSentSummary] = useState({ name: '', service: '', message: '' });

  function set(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  }

  function validate(): Errors {
    const next: Errors = {};
    if (!name.trim()) next.name = 'Please enter your name.';
    if (!email.trim()) next.email = 'Please enter your email address.';
    else if (!EMAIL.test(email.trim())) next.email = 'That email address does not look right.';
    if (!message.trim()) next.message = 'Please add a short message.';
    else if (message.trim().length < 20) next.message = 'A sentence or two, so I can reply usefully.';
    for (const field of form.fields) {
      if (field.required && !String(values[field.name] || '').trim()) {
        next[field.name] = `${field.label.replace(/\?$/, '')} is needed.`;
      }
    }
    return next;
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      const first = document.getElementById(`ef-${uid}-${Object.keys(found)[0]}`);
      first?.focus();
      return;
    }
    setStatus('sending');
    setServerError('');
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          company: company.trim(),
          budget: values.budget || '',
          timeline: values.timing || values.schedule || '',
          message: message.trim(),
          details: values,
          website: honeypot,
          source: typeof window !== 'undefined' ? window.location.pathname : '',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSentSummary({ name: name.trim(), service: serviceName, message: message.trim() });
        setStatus('sent');
      } else {
        setStatus('error');
        setServerError(data.message || 'That did not send. Please try email or WhatsApp below.');
      }
    } catch {
      setStatus('error');
      setServerError('Could not reach the server. Check your connection, or use email and WhatsApp below.');
    }
  }

  if (status === 'sent') {
    const mailto =
      'mailto:hi@kutimfire.com?subject=' +
      encodeURIComponent(`${sentSummary.service} — enquiry from ${sentSummary.name}`) +
      '&body=' +
      encodeURIComponent(sentSummary.message);
    return (
      <div
        className="card light form-success"
        role="status"
        aria-live="polite"
        id="enquiry-form"
        style={{ borderTop: '3px solid var(--orange)' }}
      >
        <CheckCircle2 size={30} aria-hidden="true" style={{ color: '#1f7a44' }} />
        <h3>Received, {sentSummary.name.split(' ')[0]}.</h3>
        <p>
          Your enquiry about <strong>{sentSummary.service}</strong> has been saved. I read these myself and usually
          reply within two working days.
        </p>
        <p className="small" style={{ color: '#5a4436' }}>
          Want a faster answer? Send the same message by email or WhatsApp — both come straight to my phone.
        </p>
        <div className="actions" style={{ marginTop: 0 }}>
          <a className="button primary small" href={mailto}>
            <Mail size={16} aria-hidden="true" /> Send by email
          </a>
          <a className="button ghost small" href={fallbackWhatsApp} target="_blank" rel="noopener noreferrer" style={{ borderColor: '#8a6a54', color: '#2b1d15' }}>
            <MessageCircle size={16} aria-hidden="true" /> WhatsApp
          </a>
        </div>
        <button type="button" className="text-link" style={{ color: '#7d3d0d' }} onClick={() => setStatus('idle')}>
          Send another message
        </button>
      </div>
    );
  }

  const renderField = (field: FormField) => {
    const id = `ef-${uid}-${field.name}`;
    const error = errors[field.name];
    const describedBy = [field.help ? `${id}-help` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;
    const value = values[field.name] || '';

    if (field.type === 'chips') {
      const chosen = value ? value.split(' | ').filter(Boolean) : [];
      return (
        <fieldset key={field.name} className="field" style={{ padding: '14px 16px' }}>
          <legend>
            {field.label}
            {field.required && <span className="req"> *</span>}
          </legend>
          {field.help && <p className="form-hint" id={`${id}-help`}>{field.help}</p>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
            {(field.options || []).map((option) => {
              const on = chosen.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  className={`tag${on ? ' on' : ''}`}
                  aria-pressed={on}
                  onClick={() => {
                    const next = on ? chosen.filter((c) => c !== option) : [...chosen, option];
                    set(field.name, next.join(' | '));
                  }}
                  style={{ cursor: 'pointer', minHeight: 38, padding: '7px 14px', fontSize: '.86rem' }}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {error && (
            <p className="error-text" id={`${id}-error`} role="alert">
              {error}
            </p>
          )}
        </fieldset>
      );
    }

    if (field.type === 'radio') {
      return (
        <fieldset key={field.name} className="field" style={{ padding: '14px 16px' }}>
          <legend>
            {field.label}
            {field.required && <span className="req"> *</span>}
          </legend>
          <div className="radio-row" style={{ marginTop: 8 }}>
            {(field.options || []).map((option) => (
              <label className="radio-pill" key={option}>
                <input type="radio" name={`${uid}-${field.name}`} value={option} checked={value === option} onChange={() => set(field.name, option)} />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {error && (
            <p className="error-text" id={`${id}-error`} role="alert">
              {error}
            </p>
          )}
        </fieldset>
      );
    }

    return (
      <div className="field" key={field.name}>
        <label className="form-label" htmlFor={id}>
          {field.label}
          {field.required && <span className="req"> *</span>}
        </label>
        {field.help && (
          <p className="form-hint" id={`${id}-help`}>
            {field.help}
          </p>
        )}
        {field.type === 'textarea' ? (
          <textarea
            id={id}
            value={value}
            placeholder={field.placeholder}
            onChange={(e) => set(field.name, e.target.value)}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            rows={4}
          />
        ) : field.type === 'select' ? (
          <select
            id={id}
            value={value}
            onChange={(e) => set(field.name, e.target.value)}
            aria-invalid={!!error}
            aria-describedby={describedBy}
          >
            <option value="">Please choose…</option>
            {(field.options || []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={id}
            type={field.type === 'url' ? 'text' : 'text'}
            inputMode={field.type === 'url' ? 'url' : undefined}
            value={value}
            placeholder={field.placeholder}
            onChange={(e) => set(field.name, e.target.value)}
            aria-invalid={!!error}
            aria-describedby={describedBy}
          />
        )}
        {error && (
          <p className="error-text" id={`${id}-error`} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <form className="card contact-form" onSubmit={onSubmit} noValidate id="enquiry-form" aria-labelledby={`${uid}-heading`}>
      <span className="eyebrow plain">Enquiry · {serviceName}</span>
      <h2 id={`${uid}-heading`} style={{ fontSize: 'clamp(1.4rem,2.4vw,1.85rem)', margin: '10px 0 8px' }}>
        {form.heading}
      </h2>
      <p className="muted small" style={{ marginBottom: 22 }}>
        {form.intro} Fields marked <span className="req">*</span> are required.
      </p>

      <div className="row-2">
        <div className="field">
          <label className="form-label" htmlFor={`ef-${uid}-name`}>
            Your name <span className="req">*</span>
          </label>
          <input
            id={`ef-${uid}-name`}
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((p) => ({ ...p, name: '' }));
            }}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `ef-${uid}-name-error` : undefined}
          />
          {errors.name && (
            <p className="error-text" id={`ef-${uid}-name-error`} role="alert">
              {errors.name}
            </p>
          )}
        </div>

        <div className="field">
          <label className="form-label" htmlFor={`ef-${uid}-email`}>
            Email <span className="req">*</span>
          </label>
          <input
            id={`ef-${uid}-email`}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((p) => ({ ...p, email: '' }));
            }}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? `ef-${uid}-email-error` : undefined}
          />
          {errors.email && (
            <p className="error-text" id={`ef-${uid}-email-error`} role="alert">
              {errors.email}
            </p>
          )}
        </div>

        <div className="field">
          <label className="form-label" htmlFor={`ef-${uid}-phone`}>
            Phone or WhatsApp
          </label>
          <input id={`ef-${uid}-phone`} name="phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div className="field">
          <label className="form-label" htmlFor={`ef-${uid}-company`}>
            Business or organisation
          </label>
          <input id={`ef-${uid}-company`} name="company" autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
      </div>

      {form.fields.map(renderField)}

      <div className="field">
        <label className="form-label" htmlFor={`ef-${uid}-message`}>
          Anything else I should know? <span className="req">*</span>
        </label>
        <p className="form-hint" id={`ef-${uid}-message-help`}>
          A few sentences is plenty. Links are welcome.
        </p>
        <textarea
          id={`ef-${uid}-message`}
          name="message"
          rows={5}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (errors.message) setErrors((p) => ({ ...p, message: '' }));
          }}
          aria-invalid={!!errors.message}
          aria-describedby={['ef-' + uid + '-message-help', errors.message ? `ef-${uid}-message-error` : ''].filter(Boolean).join(' ')}
        />
        {errors.message && (
          <p className="error-text" id={`ef-${uid}-message-error`} role="alert">
            {errors.message}
          </p>
        )}
      </div>

      <div className="honeypot" aria-hidden="true">
        <label htmlFor={`ef-${uid}-website`}>Leave this empty</label>
        <input id={`ef-${uid}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>

      {status === 'error' && (
        <p className="error-text" role="alert" style={{ margin: '10px 0 0', fontSize: '.92rem' }}>
          <AlertCircle size={17} aria-hidden="true" /> {serverError}
        </p>
      )}

      <div className="actions" style={{ marginTop: 24 }}>
        <button className="button primary" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : form.submit}
          {status !== 'sending' && <ArrowUpRight size={16} aria-hidden="true" />}
        </button>
        <a className="button ghost" href="mailto:hi@kutimfire.com">
          <Mail size={16} aria-hidden="true" /> Email instead
        </a>
        <a className="button ghost" href={fallbackWhatsApp} target="_blank" rel="noopener noreferrer">
          <MessageCircle size={16} aria-hidden="true" /> WhatsApp
        </a>
      </div>

      <p className="small muted" style={{ marginTop: 16, fontSize: '.82rem' }}>
        Your details are used to reply to this enquiry only. Nothing is sold, shared or added to a mailing list.
      </p>
    </form>
  );
}
