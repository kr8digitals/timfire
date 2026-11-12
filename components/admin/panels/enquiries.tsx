'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Mail, Download, Archive, CheckCircle2, Eye } from 'lucide-react';
import type { Enquiry } from '@/lib/cms/types';
import { Panel, Pill, Empty } from '../kit';

const STATUSES: Enquiry['status'][] = ['new', 'read', 'replied', 'archived'];

export default function EnquiriesPanel() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | Enquiry['status']>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/cms/enquiries', { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || 'Could not load enquiries.');
        return;
      }
      setEnquiries(data.enquiries || []);
    } catch {
      setError('Could not load enquiries. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(id: string, status: Enquiry['status']) {
    const next = enquiries.map((e) => (e.id === id ? { ...e, status, updatedAt: new Date().toISOString() } : e));
    setEnquiries(next);
    setSaving(true);
    try {
      const res = await fetch('/api/cms/enquiries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enquiries: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Could not update that enquiry.');
      }
    } catch {
      setError('Could not update that enquiry.');
    } finally {
      setSaving(false);
    }
  }

  function downloadCsv() {
    const rows = [
      ['received', 'status', 'service', 'name', 'email', 'phone', 'company', 'budget', 'timeline', 'message', 'details'],
      ...enquiries.map((e) => [
        e.createdAt,
        e.status,
        e.source,
        e.name,
        e.email,
        e.phone,
        e.company,
        e.budget,
        e.timeline,
        e.message.replace(/\s+/g, ' '),
        Object.entries(e.details || {}).map(([k, v]) => `${k}: ${v}`).join(' | '),
      ]),
    ];
    const csv = rows
      .map((row) =>
        row
          .map((cell) => {
            const raw = String(cell ?? '');
            const guarded = /^[=+@-]/.test(raw) ? `'${raw}` : raw;
            return `"${guarded.replace(/"/g, '""')}"`;
          })
          .join(','),
      )
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = `timfire-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  }

  const shown = filter === 'all' ? enquiries : enquiries.filter((e) => e.status === filter);
  const counts = STATUSES.reduce((map, s) => map.set(s, enquiries.filter((e) => e.status === s).length), new Map<Enquiry['status'], number>());

  return (
    <Panel
      title={`Enquiries (${enquiries.length})`}
      description="Every message sent through any form on the site, with the answers specific to that service."
      actions={
        <div className="admin-actions">
          <button type="button" className="button ghost small" onClick={load} disabled={loading}>
            <RefreshCw size={14} aria-hidden="true" /> {loading ? 'Loading…' : 'Refresh'}
          </button>
          <button type="button" className="button ghost small" onClick={downloadCsv} disabled={!enquiries.length}>
            <Download size={14} aria-hidden="true" /> CSV
          </button>
        </div>
      }
    >
      {error && (
        <div className="notice error" role="alert">
          {error}
        </div>
      )}
      {saving && <div className="notice">Saving…</div>}

      <div className="cluster" style={{ gap: 8, marginBottom: 16 }}>
        <button type="button" className={`tag${filter === 'all' ? ' on' : ''}`} onClick={() => setFilter('all')} style={{ cursor: 'pointer', minHeight: 38 }}>
          All {enquiries.length}
        </button>
        {STATUSES.map((status) => (
          <button key={status} type="button" className={`tag${filter === status ? ' on' : ''}`} onClick={() => setFilter(status)} style={{ cursor: 'pointer', minHeight: 38 }}>
            {status} {counts.get(status) || 0}
          </button>
        ))}
      </div>

      {loading && !enquiries.length ? (
        <p className="muted">Loading enquiries…</p>
      ) : shown.length === 0 ? (
        <Empty>{enquiries.length ? `No ${filter} enquiries.` : 'No enquiries yet. Messages sent through any form on the site appear here.'}</Empty>
      ) : (
        <div className="stack" style={{ gap: 10 }}>
          {shown.map((enquiry) => {
            const open = openId === enquiry.id;
            return (
              <article key={enquiry.id} className="admin-card" style={{ margin: 0, padding: 16 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 0, flex: '1 1 300px' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                      <Pill kind={enquiry.status}>{enquiry.status}</Pill>
                      <span className="small muted" style={{ fontSize: '.78rem' }}>{enquiry.source}</span>
                      <span className="small muted" style={{ fontSize: '.78rem' }}>
                        {new Date(enquiry.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <strong style={{ fontFamily: 'var(--font-display)', fontSize: '.98rem' }}>{enquiry.name}</strong>
                    <p className="small muted" style={{ margin: '2px 0 0', fontSize: '.84rem' }}>
                      {enquiry.email}
                      {enquiry.phone ? ` · ${enquiry.phone}` : ''}
                      {enquiry.company ? ` · ${enquiry.company}` : ''}
                    </p>
                    <p className="small" style={{ margin: '8px 0 0', fontSize: '.9rem', color: open ? 'var(--paper)' : 'var(--muted)' }}>
                      {open ? enquiry.message : enquiry.message.slice(0, 150) + (enquiry.message.length > 150 ? '…' : '')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 'none' }}>
                    <button type="button" className="button ghost small" onClick={() => setOpenId(open ? null : enquiry.id)}>
                      <Eye size={14} aria-hidden="true" /> {open ? 'Less' : 'Details'}
                    </button>
                    <a className="button ghost small" href={`mailto:${enquiry.email}?subject=${encodeURIComponent('Re: ' + enquiry.source)}`}>
                      <Mail size={14} aria-hidden="true" /> Reply
                    </a>
                    {enquiry.status !== 'replied' && (
                      <button type="button" className="button ghost small" onClick={() => setStatus(enquiry.id, 'replied')}>
                        <CheckCircle2 size={14} aria-hidden="true" /> Mark replied
                      </button>
                    )}
                    {enquiry.status !== 'archived' && (
                      <button type="button" className="icon-btn" onClick={() => setStatus(enquiry.id, 'archived')} aria-label="Archive" style={{ minWidth: 38, minHeight: 38 }}>
                        <Archive size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {open && (
                  <div style={{ marginTop: 14, borderTop: '1px solid var(--border-soft)', paddingTop: 12 }}>
                    <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 18px', margin: 0, fontSize: '.88rem' }}>
                      {enquiry.budget && (
                        <>
                          <dt className="muted">Budget</dt>
                          <dd style={{ margin: 0 }}>{enquiry.budget}</dd>
                        </>
                      )}
                      {enquiry.timeline && (
                        <>
                          <dt className="muted">Timeline</dt>
                          <dd style={{ margin: 0 }}>{enquiry.timeline}</dd>
                        </>
                      )}
                      {Object.entries(enquiry.details || {}).map(([key, value]) =>
                        value && key !== 'budget' && key !== 'timing' ? (
                          <div key={key} style={{ display: 'contents' }}>
                            <dt className="muted" style={{ textTransform: 'capitalize' }}>
                              {key.replace(/([A-Z])/g, ' $1')}
                            </dt>
                            <dd style={{ margin: 0 }}>{value}</dd>
                          </div>
                        ) : null,
                      )}
                    </dl>
                    <div className="cluster" style={{ gap: 6, marginTop: 14 }}>
                      <span className="kicker" style={{ fontSize: '.68rem' }}>Set status</span>
                      {STATUSES.map((status) => (
                        <button
                          key={status}
                          type="button"
                          className={`tag${enquiry.status === status ? ' on' : ''}`}
                          onClick={() => setStatus(enquiry.id, status)}
                          style={{ cursor: 'pointer', minHeight: 34, padding: '5px 12px', fontSize: '.78rem' }}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
