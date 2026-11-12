'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Eye } from 'lucide-react';
import type { CreativePiece, SiteContent } from '@/lib/cms/types';
import { Field, Panel, Toggle, ImageField, Pill, newId, nowIso, slugify, Empty, RowList } from '../kit';

const CATEGORIES: CreativePiece['category'][] = ['Poetry', 'Spoken word', 'Music & piano'];

export default function CreativePanel({
  content,
  update,
}: {
  content: SiteContent;
  update: (fn: (draft: SiteContent) => void) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = content.creative.find((p) => p.id === editingId) || null;

  function create() {
    const id = newId('creative');
    update((d) => {
      d.creative.unshift({
        id,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        title: 'Untitled piece',
        slug: `untitled-${id.slice(-4)}`,
        category: 'Poetry',
        lede: '',
        body: '',
        cover: '',
        coverAlt: '',
        mediaType: 'none',
        mediaUrl: '',
        captionUrl: '',
        status: 'draft',
        visibility: 'public',
        publishedAt: '',
        featured: false,
      });
    });
    setEditingId(id);
  }

  function patch(changes: Partial<CreativePiece>) {
    if (!editingId) return;
    update((d) => {
      const piece = d.creative.find((p) => p.id === editingId);
      if (!piece) return;
      Object.assign(piece, changes, { updatedAt: nowIso() });
      if (changes.title !== undefined && piece.slug.startsWith('untitled-')) piece.slug = slugify(changes.title) || piece.slug;
    });
  }

  if (editing) {
    return (
      <>
        <div className="admin-actions" style={{ marginBottom: 16 }}>
          <button type="button" className="button ghost small" onClick={() => setEditingId(null)}>
            ← All creative work
          </button>
          <Link href={`/creative/${editing.slug}`} className="button ghost small" target="_blank">
            <Eye size={14} aria-hidden="true" /> Preview
          </Link>
        </div>

        <Panel title="Piece" description="Poems, spoken word and music. Nothing appears publicly until it is published.">
          <div className="row-2">
            <Field label="Title" value={editing.title} onChange={(v) => patch({ title: v })} required />
            <Field label="URL slug" value={editing.slug} onChange={(v) => patch({ slug: slugify(v) })} required />
          </div>

          <div className="row-3">
            <Field label="Category" value={editing.category} onChange={(v) => patch({ category: v as CreativePiece['category'] })} type="select" options={CATEGORIES} />
            <Field label="Status" value={editing.status} onChange={(v) => patch({ status: v as CreativePiece['status'] })} type="select" options={['draft', 'scheduled', 'published']} />
            <Field
              label={editing.status === 'scheduled' ? 'Publish at' : 'Published at'}
              value={editing.publishedAt ? editing.publishedAt.slice(0, 16) : ''}
              onChange={(v) => patch({ publishedAt: v ? new Date(v).toISOString() : '' })}
              type="datetime-local"
            />
          </div>

          <Field
            label="Short description"
            value={editing.lede}
            onChange={(v) => patch({ lede: v })}
            type="textarea"
            rows={2}
            help="One line shown on the card and as the page description."
            wide
          />

          <ImageField label="Cover image" value={editing.cover} onChange={(v) => patch({ cover: v })} />
          <Field label="Cover image description (alt text)" value={editing.coverAlt} onChange={(v) => patch({ coverAlt: v })} wide />

          <Panel title="Media" description="Optional. Attach audio, video or an external link.">
            <div className="row-3">
              <Field
                label="Media type"
                value={editing.mediaType}
                onChange={(v) => patch({ mediaType: v as CreativePiece['mediaType'] })}
                type="select"
                options={['none', 'audio', 'video', 'external']}
              />
              <Field
                label="Media URL"
                value={editing.mediaUrl}
                onChange={(v) => patch({ mediaUrl: v })}
                type="url"
                help="A link to an MP3, MP4 or external page."
              />
              <Field
                label="Captions file (video)"
                value={editing.captionUrl}
                onChange={(v) => patch({ captionUrl: v })}
                type="url"
                help="Optional .vtt file for video captions."
              />
            </div>
          </Panel>

          <Toggle
            label="Publicly visible"
            checked={editing.visibility === 'public'}
            onChange={(v) => patch({ visibility: v ? 'public' : 'private' })}
          />

          <Field
            label="Text"
            value={editing.body}
            onChange={(v) => patch({ body: v })}
            type="textarea"
            rows={18}
            help="For poetry, type it exactly as it should appear. Blank lines separate stanzas."
            wide
          />
        </Panel>
      </>
    );
  }

  return (
    <Panel
      title={`Creative work (${content.creative.length})`}
      description="Poetry, spoken word and music. Keep drafts as drafts until the work is finished."
      actions={
        <button type="button" className="button primary small" onClick={create}>
          <Plus size={15} aria-hidden="true" /> New piece
        </button>
      }
    >
      {content.creative.length === 0 ? (
        <Empty>Nothing yet.</Empty>
      ) : (
        <RowList
          items={content.creative}
          onReorder={(from, direction) =>
            update((d) => {
              const target = from + direction;
              if (target < 0 || target >= d.creative.length) return;
              [d.creative[from], d.creative[target]] = [d.creative[target], d.creative[from]];
            })
          }
          onRemove={(id) =>
            update((d) => {
              d.creative = d.creative.filter((p) => p.id !== id);
            })
          }
          onEdit={(id) => setEditingId(id)}
          render={(item) => {
            const piece = content.creative.find((p) => p.id === item.id)!;
            return (
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 3 }}>
                  <Pill kind={piece.status}>{piece.status}</Pill>
                  <span className="small muted" style={{ fontSize: '.76rem' }}>{piece.category}</span>
                </div>
                <strong style={{ fontFamily: 'var(--font-display)', fontSize: '.96rem' }}>{piece.title}</strong>
                <p className="small muted" style={{ margin: '2px 0 0', fontSize: '.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {piece.lede || 'No description yet'}
                </p>
              </div>
            );
          }}
        />
      )}
    </Panel>
  );
}
