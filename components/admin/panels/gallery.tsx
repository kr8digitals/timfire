'use client';

import { useState } from 'react';
import { Plus, LayoutGrid } from 'lucide-react';
import type { GalleryItem, SiteContent } from '@/lib/cms/types';
import { Field, Panel, Toggle, ImageField, Pill, newId, nowIso, Empty, RowList } from '../kit';

const COLLECTIONS = ['Portraits', 'Street', 'Studio', 'Culture', 'Community', 'Work', 'Stage', 'Writing', 'Milestones'];

export default function GalleryPanel({
  content,
  update,
}: {
  content: SiteContent;
  update: (fn: (draft: SiteContent) => void) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const editing = content.gallery.find((g) => g.id === editingId) || null;

  function create() {
    const id = newId('photo');
    update((d) => {
      d.gallery.unshift({
        id,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        src: '',
        alt: '',
        title: 'Untitled photograph',
        caption: '',
        collection: 'Portraits',
        year: String(new Date().getFullYear()),
        orientation: 'portrait',
        featured: false,
        visibility: 'public',
        order: 0,
      });
    });
    setEditingId(id);
  }

  function patch(changes: Partial<GalleryItem>) {
    if (!editingId) return;
    update((d) => {
      const photo = d.gallery.find((g) => g.id === editingId);
      if (!photo) return;
      Object.assign(photo, changes, { updatedAt: nowIso() });
    });
  }

  if (editing) {
    return (
      <>
        <div className="admin-actions" style={{ marginBottom: 16 }}>
          <button type="button" className="button ghost small" onClick={() => setEditingId(null)}>
            ← All photographs
          </button>
        </div>

        <Panel title="Photograph" description="The alt text matters more than anything else on this form — it is what a screen reader announces and what search engines understand.">
          {editing.src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={editing.src} alt="" style={{ width: '100%', maxHeight: 340, objectFit: 'contain', background: '#120c0a', borderRadius: 14, marginBottom: 18 }} />
          )}

          <ImageField label="Image file" value={editing.src} onChange={(v) => patch({ src: v })} help="Upload a new photo or point at one already in the library." />

          <div className="row-2">
            <Field label="Title" value={editing.title} onChange={(v) => patch({ title: v })} required />
            <Field label="Collection" value={editing.collection} onChange={(v) => patch({ collection: v })} type="select" options={COLLECTIONS} />
          </div>

          <Field
            label="Alt text"
            value={editing.alt}
            onChange={(v) => patch({ alt: v })}
            help="Describe what is in the photograph for someone who cannot see it. Not “image of”."
            required
            wide
          />

          <Field label="Caption" value={editing.caption} onChange={(v) => patch({ caption: v })} type="textarea" rows={2} wide />

          <div className="row-3">
            <Field label="Year" value={editing.year} onChange={(v) => patch({ year: v })} />
            <Field
              label="Orientation"
              value={editing.orientation}
              onChange={(v) => patch({ orientation: v as GalleryItem['orientation'] })}
              type="select"
              options={['portrait', 'landscape', 'square']}
            />
            <Field
              label="Visibility"
              value={editing.visibility}
              onChange={(v) => patch({ visibility: v as GalleryItem['visibility'] })}
              type="select"
              options={['public', 'private']}
            />
          </div>

          <Toggle label="Feature this photograph" checked={editing.featured} onChange={(v) => patch({ featured: v })} help="Featured photos appear first in the gallery." />
        </Panel>
      </>
    );
  }

  const visible = showAll ? content.gallery : content.gallery.slice(0, 30);

  return (
    <Panel
      title={`Gallery (${content.gallery.length} photographs)`}
      description="Every photograph on the public gallery. Order controls the sequence within each collection."
      actions={
        <div className="admin-actions">
          <button type="button" className="button ghost small" onClick={() => setShowAll((v) => !v)}>
            <LayoutGrid size={14} aria-hidden="true" /> {showAll ? 'Show fewer' : `Show all ${content.gallery.length}`}
          </button>
          <button type="button" className="button primary small" onClick={create}>
            <Plus size={15} aria-hidden="true" /> Add photograph
          </button>
        </div>
      }
    >
      {content.gallery.length === 0 ? (
        <Empty>No photographs yet.</Empty>
      ) : (
        <RowList
          items={visible}
          onReorder={(from, direction) =>
            update((d) => {
              const target = from + direction;
              if (target < 0 || target >= d.gallery.length) return;
              [d.gallery[from], d.gallery[target]] = [d.gallery[target], d.gallery[from]];
            })
          }
          onRemove={(id) =>
            update((d) => {
              d.gallery = d.gallery.filter((g) => g.id !== id);
            })
          }
          onEdit={(id) => setEditingId(id)}
          render={(item) => {
            const photo = content.gallery.find((g) => g.id === item.id)!;
            return (
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
                {photo.src && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo.src} alt="" style={{ width: 54, height: 54, objectFit: 'cover', borderRadius: 8, flex: 'none' }} />
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 2, flexWrap: 'wrap' }}>
                    <Pill kind={photo.visibility === 'public' ? 'published' : 'private'}>{photo.visibility}</Pill>
                    <span className="small muted" style={{ fontSize: '.74rem' }}>{photo.collection} · {photo.year}</span>
                  </div>
                  <strong style={{ fontFamily: 'var(--font-display)', fontSize: '.92rem', display: 'block' }}>{photo.title}</strong>
                  <span className="small muted" style={{ fontSize: '.76rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {photo.alt || 'No alt text — needed for accessibility'}
                  </span>
                </div>
              </div>
            );
          }}
        />
      )}
    </Panel>
  );
}
