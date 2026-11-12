'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Eye } from 'lucide-react';
import type { Project, SiteContent } from '@/lib/cms/types';
import { Field, Panel, Toggle, ImageField, Pill, newId, nowIso, slugify, Empty, RowList } from '../kit';

const KINDS: Project['kind'][] = ['Website', 'Website redesign', 'AI agent', 'KR8 studio build'];

export default function ProjectsPanel({
  content,
  update,
}: {
  content: SiteContent;
  update: (fn: (draft: SiteContent) => void) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = content.projects.find((p) => p.id === editingId) || null;

  function create() {
    const id = newId('project');
    update((d) => {
      d.projects.unshift({
        id,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        name: 'Untitled project',
        slug: `untitled-${id.slice(-4)}`,
        url: '',
        summary: '',
        description: [''],
        role: '',
        year: String(new Date().getFullYear()),
        image: '',
        imageAlt: '',
        kind: 'Website',
        stack: [],
        highlights: [],
        status: 'Live',
        isPublic: true,
        order: 0,
      });
    });
    setEditingId(id);
  }

  function patch(changes: Partial<Project>) {
    if (!editingId) return;
    update((d) => {
      const project = d.projects.find((p) => p.id === editingId);
      if (!project) return;
      Object.assign(project, changes, { updatedAt: nowIso() });
      if (changes.name !== undefined && project.slug.startsWith('untitled-')) project.slug = slugify(changes.name) || project.slug;
    });
  }

  if (editing) {
    return (
      <>
        <div className="admin-actions" style={{ marginBottom: 16 }}>
          <button type="button" className="button ghost small" onClick={() => setEditingId(null)}>
            ← All projects
          </button>
          <Link href={`/work/${editing.slug}`} className="button ghost small" target="_blank">
            <Eye size={14} aria-hidden="true" /> Preview
          </Link>
        </div>

        <Panel title="Project">
          <div className="row-2">
            <Field label="Project name" value={editing.name} onChange={(v) => patch({ name: v })} required />
            <Field label="URL slug" value={editing.slug} onChange={(v) => patch({ slug: slugify(v) })} required />
          </div>

          <div className="row-3">
            <Field label="Type" value={editing.kind} onChange={(v) => patch({ kind: v as Project['kind'] })} type="select" options={KINDS} />
            <Field label="Status" value={editing.status} onChange={(v) => patch({ status: v as Project['status'] })} type="select" options={['Live', 'In development', 'Private build']} />
            <Field label="Year" value={editing.year} onChange={(v) => patch({ year: v })} />
          </div>

          <div className="row-2">
            <Field label="Live URL" value={editing.url} onChange={(v) => patch({ url: v })} type="url" placeholder="https://…" />
            <Field label="Your role" value={editing.role} onChange={(v) => patch({ role: v })} placeholder="Design and development" />
          </div>

          <Field label="One-line summary" value={editing.summary} onChange={(v) => patch({ summary: v })} type="textarea" rows={2} help="Shown on cards and in search results." wide />

          <Field
            label="Full description"
            value={editing.description.join('\n\n')}
            onChange={(v) => patch({ description: v.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean) })}
            type="textarea"
            rows={8}
            help="Separate paragraphs with a blank line."
            wide
          />

          <Field
            label="Tech / methods"
            value={editing.stack.join(', ')}
            onChange={(v) => patch({ stack: v.split(',').map((s) => s.trim()).filter(Boolean) })}
            help="Comma separated."
            wide
          />

          <Field
            label="Highlights"
            value={editing.highlights.join('\n')}
            onChange={(v) => patch({ highlights: v.split('\n').map((s) => s.trim()).filter(Boolean) })}
            type="textarea"
            rows={4}
            help="One per line. What the build actually does."
            wide
          />

          <ImageField label="Project image" value={editing.image} onChange={(v) => patch({ image: v })} />
          <Field label="Image description (alt text)" value={editing.imageAlt} onChange={(v) => patch({ imageAlt: v })} wide />

          <Toggle label="Show this project publicly" checked={editing.isPublic} onChange={(v) => patch({ isPublic: v })} />
        </Panel>
      </>
    );
  }

  return (
    <Panel
      title={`Projects (${content.projects.length})`}
      description="Everything on the work page and each project's own page."
      actions={
        <button type="button" className="button primary small" onClick={create}>
          <Plus size={15} aria-hidden="true" /> New project
        </button>
      }
    >
      {content.projects.length === 0 ? (
        <Empty>No projects yet.</Empty>
      ) : (
        <RowList
          items={content.projects}
          onReorder={(from, direction) =>
            update((d) => {
              const target = from + direction;
              if (target < 0 || target >= d.projects.length) return;
              [d.projects[from], d.projects[target]] = [d.projects[target], d.projects[from]];
            })
          }
          onRemove={(id) =>
            update((d) => {
              d.projects = d.projects.filter((p) => p.id !== id);
            })
          }
          onEdit={(id) => setEditingId(id)}
          render={(item) => {
            const project = content.projects.find((p) => p.id === item.id)!;
            return (
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 3, flexWrap: 'wrap' }}>
                  <Pill kind={project.status === 'Live' ? 'published' : 'draft'}>{project.status}</Pill>
                  {!project.isPublic && <Pill kind="private">hidden</Pill>}
                  <span className="small muted" style={{ fontSize: '.74rem' }}>{project.kind} · {project.year}</span>
                </div>
                <strong style={{ fontFamily: 'var(--font-display)', fontSize: '.95rem' }}>{project.name}</strong>
                <p className="small muted" style={{ margin: '2px 0 0', fontSize: '.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {project.summary || 'No summary'}
                </p>
              </div>
            );
          }}
        />
      )}
    </Panel>
  );
}
