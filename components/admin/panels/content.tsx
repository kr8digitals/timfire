'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { SiteContent, TimelineItem, Venture, NowItem, Credential } from '@/lib/cms/types';
import { Field, Panel, Toggle, ImageField, Pill, newId, nowIso, slugify, Empty, RowList } from '../kit';
import { SERVICES } from '@/lib/services';
import { CURRENCIES } from '@/lib/currency';

/* ── Ventures ────────────────────────────────────────────────────────────── */

export function VenturesPanel({ content, update }: { content: SiteContent; update: (fn: (d: SiteContent) => void) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = content.ventures.find((v) => v.id === editingId) || null;

  function patch(changes: Partial<Venture>) {
    if (!editingId) return;
    update((d) => {
      const venture = d.ventures.find((v) => v.id === editingId);
      if (!venture) return;
      Object.assign(venture, changes, { updatedAt: nowIso() });
      if (changes.name !== undefined && venture.slug.startsWith('untitled-')) venture.slug = slugify(changes.name) || venture.slug;
    });
  }

  if (editing) {
    return (
      <>
        <div className="admin-actions" style={{ marginBottom: 16 }}>
          <button type="button" className="button ghost small" onClick={() => setEditingId(null)}>
            ← All ventures
          </button>
        </div>
        <Panel title="Venture">
          <div className="row-2">
            <Field label="Name" value={editing.name} onChange={(v) => patch({ name: v })} required />
            <Field label="Slug" value={editing.slug} onChange={(v) => patch({ slug: slugify(v) })} required />
          </div>
          <Field label="Tagline" value={editing.tagline} onChange={(v) => patch({ tagline: v })} wide />
          <Field label="Description" value={editing.description} onChange={(v) => patch({ description: v })} type="textarea" rows={5} wide />
          <Field label="URL" value={editing.url} onChange={(v) => patch({ url: v })} type="url" wide />
          <ImageField label="Image" value={editing.image} onChange={(v) => patch({ image: v })} />
          <Field label="Image description (alt text)" value={editing.imageAlt} onChange={(v) => patch({ imageAlt: v })} wide />

          <Field
            label="Facts"
            value={editing.facts.map((f) => `${f.label}: ${f.value}`).join('\n')}
            onChange={(v) =>
              patch({
                facts: v
                  .split('\n')
                  .map((line) => line.split(':').map((s) => s.trim()))
                  .filter((parts) => parts.length >= 2 && parts[0])
                  .map((parts) => ({ label: parts[0], value: parts.slice(1).join(': ') })),
              })
            }
            type="textarea"
            rows={4}
            help="One per line, in the form “Label: value”."
            wide
          />
          <Toggle label="Show publicly" checked={editing.isPublic} onChange={(v) => patch({ isPublic: v })} />
        </Panel>
      </>
    );
  }

  return (
    <Panel
      title={`Ventures (${content.ventures.length})`}
      description="KR8 DIGITALS and its parts, as shown on the ventures page and homepage."
      actions={
        <button
          type="button"
          className="button primary small"
          onClick={() => {
            const id = newId('venture');
            update((d) => {
              d.ventures.push({
                id,
                createdAt: nowIso(),
                updatedAt: nowIso(),
                name: 'New venture',
                slug: `new-venture-${id.slice(-4)}`,
                tagline: '',
                description: '',
                url: '',
                image: '',
                imageAlt: '',
                facts: [],
                isPublic: false,
                order: d.ventures.length + 1,
              });
            });
            setEditingId(id);
          }}
        >
          <Plus size={15} aria-hidden="true" /> Add venture
        </button>
      }
    >
      <RowList
        items={content.ventures}
        onReorder={(from, direction) =>
          update((d) => {
            const target = from + direction;
            if (target < 0 || target >= d.ventures.length) return;
            [d.ventures[from], d.ventures[target]] = [d.ventures[target], d.ventures[from]];
          })
        }
        onRemove={(id) => update((d) => { d.ventures = d.ventures.filter((v) => v.id !== id); })}
        onEdit={(id) => setEditingId(id)}
        render={(item) => {
          const venture = content.ventures.find((v) => v.id === item.id)!;
          return (
            <div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 2 }}>
                <Pill kind={venture.isPublic ? 'published' : 'private'}>{venture.isPublic ? 'public' : 'hidden'}</Pill>
              </div>
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: '.94rem' }}>{venture.name}</strong>
              <p className="small muted" style={{ margin: 0, fontSize: '.8rem' }}>{venture.tagline}</p>
            </div>
          );
        }}
      />
    </Panel>
  );
}

/* ── Timeline ────────────────────────────────────────────────────────────── */

export function TimelinePanel({ content, update }: { content: SiteContent; update: (fn: (d: SiteContent) => void) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = content.timeline.find((t) => t.id === editingId) || null;

  function patch(changes: Partial<TimelineItem>) {
    if (!editingId) return;
    update((d) => {
      const item = d.timeline.find((t) => t.id === editingId);
      if (!item) return;
      Object.assign(item, changes, { updatedAt: nowIso() });
    });
  }

  if (editing) {
    return (
      <>
        <div className="admin-actions" style={{ marginBottom: 16 }}>
          <button type="button" className="button ghost small" onClick={() => setEditingId(null)}>
            ← All milestones
          </button>
        </div>
        <Panel title="Milestone" description="Only add things that actually happened. Where a date is uncertain, say so in the description.">
          <div className="row-2">
            <Field label="Year" value={editing.year} onChange={(v) => patch({ year: v })} required />
            <Field
              label="Kind"
              value={editing.kind}
              onChange={(v) => patch({ kind: v as TimelineItem['kind'] })}
              type="select"
              options={['milestone', 'learning', 'recognition', 'building']}
            />
          </div>
          <Field label="Title" value={editing.title} onChange={(v) => patch({ title: v })} required wide />
          <Field label="Description" value={editing.description} onChange={(v) => patch({ description: v })} type="textarea" rows={4} wide />
          <Toggle label="Show publicly" checked={editing.isPublic} onChange={(v) => patch({ isPublic: v })} />
        </Panel>
      </>
    );
  }

  return (
    <Panel
      title={`Timeline (${content.timeline.length})`}
      description="Milestones in order. Nothing invented — a gap in the story is better than a false entry."
      actions={
        <button
          type="button"
          className="button primary small"
          onClick={() => {
            const id = newId('timeline');
            update((d) => {
              d.timeline.push({ id, createdAt: nowIso(), updatedAt: nowIso(), year: String(new Date().getFullYear()), title: 'New milestone', description: '', kind: 'milestone', isPublic: false });
            });
            setEditingId(id);
          }}
        >
          <Plus size={15} aria-hidden="true" /> Add milestone
        </button>
      }
    >
      <RowList
        items={content.timeline}
        onReorder={(from, direction) =>
          update((d) => {
            const target = from + direction;
            if (target < 0 || target >= d.timeline.length) return;
            [d.timeline[from], d.timeline[target]] = [d.timeline[target], d.timeline[from]];
          })
        }
        onRemove={(id) => update((d) => { d.timeline = d.timeline.filter((t) => t.id !== id); })}
        onEdit={(id) => setEditingId(id)}
        render={(item) => {
          const entry = content.timeline.find((t) => t.id === item.id)!;
          return (
            <div>
              <span className="small" style={{ color: 'var(--orange)', fontFamily: 'var(--font-display)', fontSize: '.78rem' }}>{entry.year}</span>
              <strong style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: '.94rem' }}>{entry.title}</strong>
              {!entry.isPublic && <Pill kind="private">hidden</Pill>}
            </div>
          );
        }}
      />
    </Panel>
  );
}

/* ── Now ─────────────────────────────────────────────────────────────────── */

export function NowPanel({ content, update }: { content: SiteContent; update: (fn: (d: SiteContent) => void) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = content.now.find((n) => n.id === editingId) || null;

  function patch(changes: Partial<NowItem>) {
    if (!editingId) return;
    update((d) => {
      const item = d.now.find((n) => n.id === editingId);
      if (!item) return;
      Object.assign(item, changes, { updatedAt: nowIso() });
    });
  }

  if (editing) {
    return (
      <>
        <div className="admin-actions" style={{ marginBottom: 16 }}>
          <button type="button" className="button ghost small" onClick={() => setEditingId(null)}>
            ← All items
          </button>
        </div>
        <Panel title="Now item" description="What is actually taking your attention at the moment. Keep it current or delete it.">
          <Field label="Label" value={editing.label} onChange={(v) => patch({ label: v })} placeholder="Studying" required wide />
          <Field label="Text" value={editing.body} onChange={(v) => patch({ body: v })} type="textarea" rows={4} wide />
          <Toggle label="Show publicly" checked={editing.isPublic} onChange={(v) => patch({ isPublic: v })} />
        </Panel>
      </>
    );
  }

  return (
    <Panel
      title={`Now (${content.now.length})`}
      description="A snapshot, not a feed. Update it when something changes."
      actions={
        <button
          type="button"
          className="button primary small"
          onClick={() => {
            const id = newId('now');
            update((d) => {
              d.now.push({ id, createdAt: nowIso(), updatedAt: nowIso(), label: 'New', body: '', isPublic: true, order: d.now.length + 1 });
            });
            setEditingId(id);
          }}
        >
          <Plus size={15} aria-hidden="true" /> Add item
        </button>
      }
    >
      <RowList
        items={content.now}
        onReorder={(from, direction) =>
          update((d) => {
            const target = from + direction;
            if (target < 0 || target >= d.now.length) return;
            [d.now[from], d.now[target]] = [d.now[target], d.now[from]];
          })
        }
        onRemove={(id) => update((d) => { d.now = d.now.filter((n) => n.id !== id); })}
        onEdit={(id) => setEditingId(id)}
        render={(item) => {
          const entry = content.now.find((n) => n.id === item.id)!;
          return (
            <div>
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: '.94rem', color: 'var(--orange)' }}>{entry.label}</strong>
              <p className="small muted" style={{ margin: 0, fontSize: '.82rem' }}>{entry.body}</p>
            </div>
          );
        }}
      />
    </Panel>
  );
}

/* ── Credentials ─────────────────────────────────────────────────────────── */

export function CredentialsPanel({ content, update }: { content: SiteContent; update: (fn: (d: SiteContent) => void) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = content.credentials.find((c) => c.id === editingId) || null;

  function patch(changes: Partial<Credential>) {
    if (!editingId) return;
    update((d) => {
      const item = d.credentials.find((c) => c.id === editingId);
      if (!item) return;
      Object.assign(item, changes, { updatedAt: nowIso() });
    });
  }

  if (editing) {
    return (
      <>
        <div className="admin-actions" style={{ marginBottom: 16 }}>
          <button type="button" className="button ghost small" onClick={() => setEditingId(null)}>
            ← All credentials
          </button>
        </div>
        <Panel title="Credential" description="Only list things you can actually show. A certificate scan is worth more than a claim.">
          <Field label="Title" value={editing.title} onChange={(v) => patch({ title: v })} required wide />
          <div className="row-2">
            <Field label="Issuer" value={editing.issuer} onChange={(v) => patch({ issuer: v })} />
            <Field label="Date" value={editing.date} onChange={(v) => patch({ date: v })} placeholder="2025-12" />
          </div>
          <Field label="Description" value={editing.description} onChange={(v) => patch({ description: v })} type="textarea" rows={3} wide />
          <ImageField label="Certificate image" value={editing.image} onChange={(v) => patch({ image: v })} />
          <Toggle label="Show publicly" checked={editing.isPublic} onChange={(v) => patch({ isPublic: v })} />
        </Panel>
      </>
    );
  }

  return (
    <Panel
      title={`Credentials (${content.credentials.length})`}
      description="Certificates and recognitions shown on the about page."
      actions={
        <button
          type="button"
          className="button primary small"
          onClick={() => {
            const id = newId('credential');
            update((d) => {
              d.credentials.push({ id, createdAt: nowIso(), updatedAt: nowIso(), title: 'New credential', issuer: '', date: '', description: '', image: '', isPublic: false });
            });
            setEditingId(id);
          }}
        >
          <Plus size={15} aria-hidden="true" /> Add credential
        </button>
      }
    >
      <RowList
        items={content.credentials}
        onReorder={() => {}}
        onRemove={(id) => update((d) => { d.credentials = d.credentials.filter((c) => c.id !== id); })}
        onEdit={(id) => setEditingId(id)}
        render={(item) => {
          const credential = content.credentials.find((c) => c.id === item.id)!;
          return (
            <div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 2 }}>
                <Pill kind={credential.isPublic ? 'published' : 'private'}>{credential.isPublic ? 'public' : 'hidden'}</Pill>
              </div>
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: '.94rem' }}>{credential.title}</strong>
              <p className="small muted" style={{ margin: 0, fontSize: '.8rem' }}>{credential.issuer} {credential.date}</p>
            </div>
          );
        }}
      />
    </Panel>
  );
}

/* ── Services ────────────────────────────────────────────────────────────── */

export function ServicesPanel({ content, update }: { content: SiteContent; update: (fn: (d: SiteContent) => void) => void }) {
  function override(key: string) {
    const existing = content.serviceOverrides.find((o) => o.key === key);
    if (existing) return existing;
    const base = SERVICES.find((s) => s.key === key)!;
    return { key, enabled: base.enabled, ngn: base.ngn, priceNote: base.priceNote };
  }

  function set(key: string, changes: Partial<ReturnType<typeof override>>) {
    update((d) => {
      const index = d.serviceOverrides.findIndex((o) => o.key === key);
      if (index >= 0) {
        d.serviceOverrides[index] = { ...d.serviceOverrides[index], ...changes };
      } else {
        d.serviceOverrides.push({ ...override(key), ...changes });
      }
    });
  }

  return (
    <Panel title="Services & pricing" description="Prices are set in naira (the base currency). Changing a price here updates every page at once. Currency conversions use the rates in the Currency tab.">
      <div className="stack" style={{ gap: 12 }}>
        {SERVICES.map((service) => {
          const o = override(service.key);
          return (
            <div key={service.key} className="admin-card" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
                <div>
                  <strong style={{ fontFamily: 'var(--font-display)', fontSize: '.98rem' }}>{service.name}</strong>
                  <span className="small muted" style={{ display: 'block', fontSize: '.78rem' }}>
                    /services/{service.key} · {service.unit}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <Pill kind={o.enabled ? 'published' : 'draft'}>{o.enabled ? 'live' : 'hidden'}</Pill>
                  <Toggle label="Enabled" checked={o.enabled} onChange={(v) => set(service.key, { enabled: v })} />
                </div>
              </div>
              <div className="row-2">
                <Field
                  label="Price in naira (NGN)"
                  value={o.ngn ?? ''}
                  onChange={(v) => set(service.key, { ngn: v === '' ? null : Number(v) })}
                  type="number"
                  help="Leave blank for “quoted per project”."
                />
                <Field label="Price note" value={o.priceNote} onChange={(v) => set(service.key, { priceNote: v })} />
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/* ── Currency ────────────────────────────────────────────────────────────── */

export function CurrencyPanel({ content, update }: { content: SiteContent; update: (fn: (d: SiteContent) => void) => void }) {
  const [rates, setRates] = useState<Record<string, string>>(
    Object.fromEntries(Object.entries(content.settings.rates).map(([code, rate]) => [code, String(rate)])),
  );
  const [dirty, setDirty] = useState(false);

  function set(code: string, value: string) {
    setRates((prev) => ({ ...prev, [code]: value }));
    setDirty(true);
  }

  function save() {
    const cleaned: Record<string, number> = {};
    for (const [code, value] of Object.entries(rates)) {
      const num = Number(value);
      if (Number.isFinite(num) && num > 0) cleaned[code] = num;
    }
    update((d) => {
      d.settings.rates = cleaned;
      d.settings.ratesUpdated = new Date().toISOString().slice(0, 10);
    });
    setDirty(false);
  }

  function resetToLast() {
    update((d) => {
      d.settings.rates = Object.fromEntries(CURRENCIES.map((c) => [c.code, 1]));
    });
  }

  return (
    <Panel
      title="Currency rates"
      description="Naira is the base. Each rate here is how many units of that currency equal 1 NGN. Update monthly, then save — every price on the site recalculates."
      actions={
        <div className="admin-actions">
          <button type="button" className="button ghost small" onClick={() => setDirty(true)}>
            Reload
          </button>
          <button type="button" className="button primary small" onClick={save} disabled={!dirty}>
            Save rates
          </button>
        </div>
      }
    >
      <div className="notice" style={{ marginTop: 0, marginBottom: 16 }}>
        Worked example: if 1 USD ≈ ₦1,545, then 1 NGN ≈ 0.000645 USD — enter <strong>0.000645</strong>. Rates are
        stored in the content file and shown with their effective date on the services page.
      </div>
      <div className="row-3">
        {CURRENCIES.map((currency) => (
          <Field
            key={currency.code}
            label={`${currency.code} — ${currency.name}`}
            value={rates[currency.code] ?? ''}
            onChange={(v) => set(currency.code, v)}
            type="number"
            help={`1 ${currency.code} ≈ ₦${rates[currency.code] && Number(rates[currency.code]) > 0 ? (1 / Number(rates[currency.code])).toFixed(2) : '—'}`}
          />
        ))}
      </div>
      <p className="small muted" style={{ marginTop: 12, fontSize: '.82rem' }}>
        Last updated: {content.settings.ratesUpdated || 'never'}. A blank or invalid rate is ignored rather than
        saved — the site will fall back to showing naira for that currency rather than a wrong number.
      </p>
    </Panel>
  );
}
