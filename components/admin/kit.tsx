'use client';

import { useId, useRef, useState } from 'react';
import { Upload, X, ImagePlus } from 'lucide-react';
import type { ReactNode } from 'react';

/* ── Field primitives ────────────────────────────────────────────────────── */

export function Field({
  label,
  value,
  onChange,
  type = 'text',
  help,
  placeholder,
  required,
  rows,
  wide,
  options,
}: {
  label: string;
  value: string | number | null;
  onChange: (value: string) => void;
  type?: 'text' | 'textarea' | 'number' | 'date' | 'datetime-local' | 'url' | 'select' | 'email';
  help?: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  wide?: boolean;
  options?: string[];
}) {
  const id = useId().replace(/:/g, '');
  const hintId = help ? `${id}-help` : undefined;
  return (
    <div className="field" style={wide ? { gridColumn: '1 / -1' } : undefined}>
      <label className="form-label" htmlFor={id}>
        {label}
        {required && <span className="req"> *</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={id}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-describedby={hintId}
          rows={rows ?? 5}
        />
      ) : type === 'select' ? (
        <select id={id} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} aria-describedby={hintId}>
          {(options || []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-describedby={hintId}
        />
      )}
      {help && (
        <p className="form-hint" id={hintId}>
          {help}
        </p>
      )}
    </div>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
  help,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  help?: string;
}) {
  const id = useId().replace(/:/g, '');
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
      <input id={id} type="checkbox" className="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ marginTop: 3 }} />
      <div>
        <label htmlFor={id} className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
          {label}
        </label>
        {help && <p className="form-hint" style={{ margin: '2px 0 0' }}>{help}</p>}
      </div>
    </div>
  );
}

export function Slider({ label, value, onChange, max = 100 }: { label: string; value: number; onChange: (n: number) => void; max?: number }) {
  const id = useId().replace(/:/g, '');
  return (
    <div className="field">
      <label className="form-label" htmlFor={id}>
        {label}: {value}
      </label>
      <input id={id} type="range" min={0} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ padding: 0, minHeight: 34 }} />
    </div>
  );
}

/* ── Image picker with upload ────────────────────────────────────────────── */

export function ImageField({
  label,
  value,
  onChange,
  help,
}: {
  label: string;
  value: string;
  onChange: (path: string) => void;
  help?: string;
}) {
  const id = useId().replace(/:/g, '');
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function upload(file: File) {
    setBusy(true);
    setMessage('');
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/cms/upload', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.message || 'Upload failed.');
        return;
      }
      onChange(data.path);
      setMessage('Uploaded. It appears after the next deploy finishes.');
    } catch {
      setMessage('Upload failed. Check your connection.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="field">
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      {value && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 8 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border-soft)' }} />
          <button type="button" className="button ghost small" onClick={() => onChange('')} aria-label="Remove image">
            <X size={14} aria-hidden="true" /> Remove
          </button>
        </div>
      )}
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/images/… or /uploads/…"
        aria-describedby={help ? `${id}-help` : undefined}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        <button type="button" className="button ghost small" onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? <Upload size={14} aria-hidden="true" /> : <ImagePlus size={14} aria-hidden="true" />}
          {busy ? 'Uploading…' : 'Upload an image'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
            e.target.value = '';
          }}
        />
      </div>
      {(help || message) && (
        <p className="form-hint" id={`${id}-help`} role={message ? 'status' : undefined}>
          {message || help}
        </p>
      )}
    </div>
  );
}

/* ── Layout helpers ──────────────────────────────────────────────────────── */

export function Panel({ title, description, children, actions }: { title: string; description?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="admin-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <h3>{title}</h3>
          {description && <p className="small muted" style={{ margin: '4px 0 0', fontSize: '.88rem' }}>{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function Pill({ kind, children }: { kind: string; children: ReactNode }) {
  return <span className={`pill ${kind}`}>{children}</span>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty" style={{ padding: 30 }}>{children}</div>;
}

export function Notice({ kind, children }: { kind: 'ok' | 'error' | ''; children: ReactNode }) {
  if (!children) return null;
  return (
    <div className={`notice ${kind}`} role="status">
      {children}
    </div>
  );
}

/** Moves an item within a list, returning a new array. */
export function move<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const next = [...list];
  const target = index + direction;
  if (target < 0 || target >= next.length) return list;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** A row-style list editor used by most collections. */
export function RowList({
  items,
  onReorder,
  onRemove,
  onEdit,
  render,
  editId,
}: {
  items: { id: string }[];
  onReorder: (from: number, direction: -1 | 1) => void;
  onRemove: (id: string) => void;
  onEdit?: (id: string) => void;
  render: (item: { id: string }, index: number) => ReactNode;
  editId?: string | null;
}) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
      {items.map((item, index) => (
        <li
          key={item.id}
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            border: '1px solid var(--border-soft)',
            borderRadius: 12,
            padding: '10px 12px',
            background: editId === item.id ? '#2a1c16' : 'transparent',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: '1 1 240px', minWidth: 0 }}>{render(item, index)}</div>
          <div style={{ display: 'flex', gap: 4, flex: 'none' }}>
            <button type="button" className="icon-btn" onClick={() => onReorder(index, -1)} aria-label="Move up" style={{ minWidth: 36, minHeight: 36 }}>
              ↑
            </button>
            <button type="button" className="icon-btn" onClick={() => onReorder(index, 1)} aria-label="Move down" style={{ minWidth: 36, minHeight: 36 }}>
              ↓
            </button>
            {onEdit && (
              <button type="button" className="button ghost small" onClick={() => onEdit(item.id)} style={{ minHeight: 36, padding: '6px 12px' }}>
                Edit
              </button>
            )}
            <button
              type="button"
              className="icon-btn"
              onClick={() => {
                if (confirm('Delete this item? This cannot be undone after you save.')) onRemove(item.id);
              }}
              aria-label="Delete"
              style={{ minWidth: 36, minHeight: 36, color: '#f79bad' }}
            >
              <X size={15} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
