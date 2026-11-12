'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Eye, CalendarClock } from 'lucide-react';
import type { Post, SiteContent } from '@/lib/cms/types';
import { readingMinutes } from '@/lib/cms/types';
import { Field, Panel, Toggle, ImageField, Pill, newId, nowIso, slugify, Empty, RowList } from '../kit';

export default function PostsPanel({
  content,
  update,
  notify,
}: {
  content: SiteContent;
  update: (fn: (draft: SiteContent) => void) => void;
  notify: (message: string, kind?: 'ok' | 'error') => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = content.posts.find((p) => p.id === editingId) || null;

  function create() {
    const id = newId('post');
    const draft: Post = {
      id,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      title: 'Untitled article',
      slug: `untitled-${id.slice(-4)}`,
      category: 'Process',
      tags: [],
      summary: '',
      body: '',
      cover: '',
      coverAlt: '',
      status: 'draft',
      visibility: 'public',
      publishedAt: '',
      featured: false,
      readingMinutes: 1,
    };
    update((d) => {
      d.posts.unshift(draft);
    });
    setEditingId(id);
  }

  function patch(changes: Partial<Post>) {
    if (!editingId) return;
    update((d) => {
      const post = d.posts.find((p) => p.id === editingId);
      if (!post) return;
      Object.assign(post, changes, { updatedAt: nowIso() });
      if (changes.body !== undefined) post.readingMinutes = readingMinutes(changes.body);
      if (changes.title !== undefined && post.slug.startsWith('untitled-')) post.slug = slugify(changes.title) || post.slug;
    });
  }

  const categories = ['Process', 'AI agents', 'KR8', 'Web development', 'Design', 'Learning', 'Notes'];

  if (editing) {
    return (
      <>
        <div className="admin-actions" style={{ marginBottom: 16 }}>
          <button type="button" className="button ghost small" onClick={() => setEditingId(null)}>
            ← All articles
          </button>
          {editing.status !== 'published' && (
            <Link href={`/journal/${editing.slug}`} className="button ghost small" target="_blank">
              <Eye size={14} aria-hidden="true" /> Preview
            </Link>
          )}
          <span className="small muted" style={{ marginLeft: 'auto', fontSize: '.8rem' }}>
            Reading time: {editing.readingMinutes} min
          </span>
        </div>

        <Panel title="Article" description="Everything here is editable. Changes are saved when you press Save changes at the bottom of the screen.">
          <div className="row-2">
            <Field label="Title" value={editing.title} onChange={(v) => patch({ title: v })} required placeholder="What I check before I agree to build a website" />
            <Field
              label="URL slug"
              value={editing.slug}
              onChange={(v) => patch({ slug: slugify(v) })}
              help="Letters, numbers and hyphens. Changing this breaks existing links unless you redirect them."
              required
            />
          </div>

          <div className="row-3">
            <Field label="Category" value={editing.category} onChange={(v) => patch({ category: v })} type="select" options={categories} />
            <Field label="Status" value={editing.status} onChange={(v) => patch({ status: v as Post['status'] })} type="select" options={['draft', 'scheduled', 'published']} />
            <Field
              label={editing.status === 'scheduled' ? 'Publish at' : 'Published at'}
              value={editing.publishedAt ? editing.publishedAt.slice(0, 16) : ''}
              onChange={(v) => patch({ publishedAt: v ? new Date(v).toISOString() : '' })}
              type="datetime-local"
              help={editing.status === 'scheduled' ? 'Goes live automatically at this time.' : ''}
            />
          </div>

          <Field
            label="Tags"
            value={editing.tags.join(', ')}
            onChange={(v) => patch({ tags: v.split(',').map((t) => t.trim()).filter(Boolean) })}
            help="Comma separated. Used for related articles and filtering."
            wide
          />

          <Field
            label="Summary"
            value={editing.summary}
            onChange={(v) => patch({ summary: v })}
            type="textarea"
            rows={3}
            help="One or two sentences. Used on cards, in search results and as the meta description."
            wide
          />

          <ImageField label="Cover image" value={editing.cover} onChange={(v) => patch({ cover: v })} help="Wide images work best — around 1600×900." />
          <Field label="Cover image description (alt text)" value={editing.coverAlt} onChange={(v) => patch({ coverAlt: v })} help="Describe the image for someone who cannot see it, and for search engines." wide />

          <Toggle
            label="Feature this article"
            checked={editing.featured}
            onChange={(v) => patch({ featured: v })}
            help="Appears as the large card at the top of the journal."
          />
          <Toggle
            label="Publicly visible"
            checked={editing.visibility === 'public'}
            onChange={(v) => patch({ visibility: v ? 'public' : 'private' })}
            help="Turn this off to keep the article off the public site entirely."
          />

          <Panel title="Body" description="Markdown-lite: blank line for a new paragraph, ## for a heading, - for a list, > for a quote, **bold**, *italic*, [text](url)." actions={null}>
            <Field
              label="Article body"
              value={editing.body}
              onChange={(v) => patch({ body: v })}
              type="textarea"
              rows={22}
              wide
            />
          </Panel>
        </Panel>
      </>
    );
  }

  return (
    <Panel
      title={`Articles (${content.posts.length})`}
      description="Drafts are invisible to the public. Scheduled articles go live automatically at their publish time."
      actions={
        <button type="button" className="button primary small" onClick={create}>
          <Plus size={15} aria-hidden="true" /> New article
        </button>
      }
    >
      {content.posts.length === 0 ? (
        <Empty>No articles yet. Write the first one.</Empty>
      ) : (
        <RowList
          items={content.posts}
          editId={editingId}
          onReorder={(from, direction) =>
            update((d) => {
              const target = from + direction;
              if (target < 0 || target >= d.posts.length) return;
              [d.posts[from], d.posts[target]] = [d.posts[target], d.posts[from]];
            })
          }
          onRemove={(id) =>
            update((d) => {
              d.posts = d.posts.filter((p) => p.id !== id);
            })
          }
          onEdit={(id) => setEditingId(id)}
          render={(item) => {
            const post = content.posts.find((p) => p.id === item.id)!;
            return (
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 3 }}>
                  <Pill kind={post.status}>{post.status}</Pill>
                  {post.featured && <Pill kind="new">featured</Pill>}
                  {post.visibility === 'private' && <Pill kind="private">hidden</Pill>}
                  <span className="small muted" style={{ fontSize: '.76rem' }}>{post.category}</span>
                </div>
                <strong style={{ fontFamily: 'var(--font-display)', display: 'block', fontSize: '.96rem' }}>{post.title}</strong>
                <span className="small muted" style={{ fontSize: '.76rem' }}>
                  /journal/{post.slug}
                  {post.publishedAt ? ` · ${new Date(post.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : ' · not dated'}
                </span>
              </div>
            );
          }}
        />
      )}

      <div className="notice" style={{ marginTop: 18 }}>
        <strong style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <CalendarClock size={15} aria-hidden="true" /> Scheduling
        </strong>
        Set status to <em>scheduled</em> and choose a publish time. The site is generated on each visit, so the article
        appears automatically once that time passes — no extra step needed.
      </div>
    </Panel>
  );
}
