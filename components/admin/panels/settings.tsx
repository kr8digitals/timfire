'use client';

import { useMemo, useState } from 'react';
import { Save, Plus, RotateCcw } from 'lucide-react';
import type { SiteContent, Stat } from '@/lib/cms/types';
import { Field, Panel, Toggle, Pill, newId, Empty, RowList } from '../kit';

export function SiteSettingsPanel({ content, update }: { content: SiteContent; update: (fn: (d: SiteContent) => void) => void }) {
  const settings = content.settings;

  function patch(changes: Partial<typeof settings>) {
    update((d) => {
      Object.assign(d.settings, changes);
    });
  }

  return (
    <>
      <Panel title="Identity" description="The name, role and words that appear across the site.">
        <div className="row-2">
          <Field label="Name" value={settings.name} onChange={(v) => patch({ name: v })} />
          <Field label="Base location" value={settings.base} onChange={(v) => patch({ base: v })} />
        </div>
        <Field label="Role line" value={settings.role} onChange={(v) => patch({ role: v })} help="Used in metadata and small print." wide />
        <div className="row-2">
          <Field label="Email" value={settings.email} onChange={(v) => patch({ email: v })} type="email" />
          <Field label="WhatsApp number" value={settings.whatsapp} onChange={(v) => patch({ whatsapp: v })} help="Digits only, with country code: 2348166552758" />
        </div>
      </Panel>

      <Panel title="Hero" description="The three lines at the top of the homepage, in this order.">
        <Field label="Line 1 — welcome" value={settings.heroWelcome} onChange={(v) => patch({ heroWelcome: v })} wide />
        <Field label="Line 2 — the headline" value={settings.heroLine} onChange={(v) => patch({ heroLine: v })} wide />
        <Field label="Line 3 — the name" value={settings.heroName} onChange={(v) => patch({ heroName: v })} wide />
      </Panel>

      <StatsPanel content={content} update={update} />
      <SocialsPanel content={content} update={update} />
    </>
  );
}

function StatsPanel({ content, update }: { content: SiteContent; update: (fn: (d: SiteContent) => void) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = content.settings.stats.find((s) => s.id === editingId) || null;

  function patch(changes: Partial<Stat>) {
    if (!editingId) return;
    update((d) => {
      const stat = d.settings.stats.find((s) => s.id === editingId);
      if (!stat) return;
      Object.assign(stat, changes);
    });
  }

  if (editing) {
    return (
      <>
        <div className="admin-actions" style={{ marginBottom: 16 }}>
          <button type="button" className="button ghost small" onClick={() => setEditingId(null)}>
            ← All figures
          </button>
        </div>
        <Panel title="Figure" description="The source field is shown under each number on the homepage. If you cannot fill it in honestly, the figure should not be published.">
          <div className="row-2">
            <Field label="Value" value={editing.value} onChange={(v) => patch({ value: v })} required placeholder="9" />
            <Field label="Label" value={editing.label} onChange={(v) => patch({ label: v })} required placeholder="websites built" />
          </div>
          <Field label="Source / basis" value={editing.source} onChange={(v) => patch({ source: v })} type="textarea" rows={3} help="Where this number comes from. This is published." wide />
          <Toggle label="Show publicly" checked={editing.isPublic} onChange={(v) => patch({ isPublic: v })} />
        </Panel>
      </>
    );
  }

  return (
    <Panel
      title={`Figures (${content.settings.stats.length})`}
      description="The numbers on the homepage. Verified figures only — each one shows its basis."
      actions={
        <button
          type="button"
          className="button primary small"
          onClick={() => {
            const id = newId('stat');
            update((d) => {
              d.settings.stats.push({ id, value: '', label: '', source: '', isPublic: false });
            });
            setEditingId(id);
          }}
        >
          <Plus size={15} aria-hidden="true" /> Add figure
        </button>
      }
    >
      {content.settings.stats.length === 0 ? (
        <Empty>No figures. The homepage section will not render.</Empty>
      ) : (
        <RowList
          items={content.settings.stats}
          onReorder={(from, direction) =>
            update((d) => {
              const target = from + direction;
              if (target < 0 || target >= d.settings.stats.length) return;
              [d.settings.stats[from], d.settings.stats[target]] = [d.settings.stats[target], d.settings.stats[from]];
            })
          }
          onRemove={(id) => update((d) => { d.settings.stats = d.settings.stats.filter((s) => s.id !== id); })}
          onEdit={(id) => setEditingId(id)}
          render={(item) => {
            const stat = content.settings.stats.find((s) => s.id === item.id)!;
            return (
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                  <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--orange)' }}>{stat.value || '—'}</strong>
                  <span style={{ fontSize: '.9rem' }}>{stat.label || 'no label'}</span>
                  {!stat.isPublic && <Pill kind="private">hidden</Pill>}
                </div>
                {stat.source && <p className="small muted" style={{ margin: '2px 0 0', fontSize: '.76rem' }}>{stat.source}</p>}
              </div>
            );
          }}
        />
      )}
    </Panel>
  );
}

function SocialsPanel({ content, update }: { content: SiteContent; update: (fn: (d: SiteContent) => void) => void }) {
  return (
    <Panel title="Social profiles" description="Live profiles only. A blank URL hides the link everywhere on the site.">
      <div className="stack" style={{ gap: 12 }}>
        {content.settings.socials.map((social) => (
          <div key={social.id} className="admin-card" style={{ margin: 0, padding: 14 }}>
            <div className="row-2">
              <Field
                label={`${social.name} URL`}
                value={social.url}
                onChange={(v) =>
                  update((d) => {
                    const item = d.settings.socials.find((s) => s.id === social.id);
                    if (item) item.url = v;
                  })
                }
                type="url"
                placeholder="https://…"
              />
              <Toggle
                label="Show publicly"
                checked={social.isPublic && !!social.url}
                onChange={(v) =>
                  update((d) => {
                    const item = d.settings.socials.find((s) => s.id === social.id);
                    if (item) item.isPublic = v;
                  })
                }
              />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ── Data / backup ───────────────────────────────────────────────────────── */

export function DataPanel({ content }: { content: SiteContent }) {
  const [status, setStatus] = useState('');

  const summary = useMemo(
    () => [
      ['Articles', content.posts.length],
      ['Creative pieces', content.creative.length],
      ['Photographs', content.gallery.length],
      ['Projects', content.projects.length],
      ['Ventures', content.ventures.length],
      ['Timeline entries', content.timeline.length],
      ['Credentials', content.credentials.length],
      ['Now items', content.now.length],
    ],
    [content],
  );

  function download() {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = `timfire-content-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
    setStatus('Backup downloaded.');
  }

  async function restore(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (parsed?.version !== 2 || !Array.isArray(parsed.posts)) throw new Error('Not a version 2 backup');
      const res = await fetch('/api/cms/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: parsed, sha: null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatus(data.message || 'Restore failed.');
        return;
      }
      setStatus('Restored. Reload the page to see the imported content.');
    } catch (error) {
      setStatus('That file is not a valid backup: ' + (error instanceof Error ? error.message : 'unknown error'));
    }
  }

  return (
    <>
      <Panel title="Backup & restore" description="The content file is versioned in the repository, so every save is a commit you can roll back. This is a second safety net.">
        {status && <div className="notice" role="status">{status}</div>}
        <div className="admin-actions">
          <button type="button" className="button primary small" onClick={download}>
            <Save size={15} aria-hidden="true" /> Download backup
          </button>
          <label className="button ghost small" style={{ cursor: 'pointer' }}>
            <RotateCcw size={15} aria-hidden="true" /> Restore from backup
            <input type="file" accept="application/json" hidden onChange={restore} />
          </label>
        </div>
      </Panel>

      <Panel title="Contents" description="What is currently stored.">
        <table className="admin-table">
          <tbody>
            {summary.map(([label, count]) => (
              <tr key={String(label)}>
                <td>{label}</td>
                <td style={{ textAlign: 'right' }}>{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
