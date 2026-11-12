import type { ReactNode } from 'react';
import { safeUrl } from './safe';

/**
 * A deliberately small Markdown subset.
 *
 * No HTML is ever passed through, so content written in the CMS cannot inject
 * markup or scripts. Supported:
 *
 *   ## heading  /  ### heading
 *   blank-line paragraphs
 *   - bullet lists  /  1. ordered lists
 *   > blockquote
 *   **bold**  *italic*  `code`
 *   [text](https://url)
 *   --- horizontal rule
 */

function inline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-i${index++}`;

    if (token.startsWith('**')) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('`')) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith('[')) {
      const label = token.slice(1, token.indexOf(']'));
      const href = safeUrl(token.slice(token.indexOf('](') + 2, -1));
      nodes.push(
        href ? (
          <a key={key} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
            {label}
          </a>
        ) : (
          <span key={key}>{label}</span>
        ),
      );
    } else {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    }
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function renderMarkdown(source: string): ReactNode[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let key = 0;

  function flushParagraph() {
    if (!paragraph.length) return;
    const text = paragraph.join(' ').trim();
    if (text) blocks.push(<p key={`p${key++}`}>{inline(text, `p${key}`)}</p>);
    paragraph = [];
  }
  function flushList() {
    if (!list) return;
    const { ordered, items } = list;
    const children = items.map((item, i) => <li key={`li${i}`}>{inline(item, `l${key}-${i}`)}</li>);
    blocks.push(ordered ? <ol key={`ol${key++}`}>{children}</ol> : <ul key={`ul${key++}`}>{children}</ul>);
    list = null;
  }

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    if (trimmed === '---' || trimmed === '***') {
      flushParagraph();
      flushList();
      blocks.push(<hr key={`hr${key++}`} />);
      continue;
    }

    const heading = /^(#{2,4})\s+(.*)$/.exec(trimmed);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      const content = inline(heading[2], `h${key}`);
      if (level === 2) blocks.push(<h2 key={`h${key++}`}>{content}</h2>);
      else if (level === 3) blocks.push(<h3 key={`h${key++}`}>{content}</h3>);
      else blocks.push(<h4 key={`h${key++}`}>{content}</h4>);
      continue;
    }

    const quote = /^>\s?(.*)$/.exec(trimmed);
    if (quote) {
      flushParagraph();
      flushList();
      blocks.push(
        <blockquote key={`q${key++}`}>
          <p>{inline(quote[1], `q${key}`)}</p>
        </blockquote>,
      );
      continue;
    }

    const bullet = /^[-*]\s+(.*)$/.exec(trimmed);
    if (bullet) {
      flushParagraph();
      if (list && list.ordered) flushList();
      if (!list) list = { ordered: false, items: [] };
      list.items.push(bullet[1]);
      continue;
    }

    const numbered = /^\d+\.\s+(.*)$/.exec(trimmed);
    if (numbered) {
      flushParagraph();
      if (list && !list.ordered) flushList();
      if (!list) list = { ordered: true, items: [] };
      list.items.push(numbered[1]);
      continue;
    }

    if (list) flushList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  return blocks;
}

/** First sentence of a body, for cards and meta descriptions. */
export function firstSentence(text: string, max = 180): string {
  const clean = text
    .replace(/[#>*`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const stop = clean.search(/[.!?](\s|$)/);
  const cut = stop > 40 ? clean.slice(0, stop + 1) : clean.slice(0, max);
  return cut.length < clean.length ? `${cut.trim()}…` : cut.trim();
}
