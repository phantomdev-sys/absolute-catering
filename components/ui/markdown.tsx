import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';

/**
 * Safe markdown renderer.
 *
 * Deliberately does not use `dangerouslySetInnerHTML`, and deliberately does
 * not pull in a full markdown library. It renders React elements directly from
 * a small, well-understood subset, so there is no HTML-injection surface at
 * all — which matters because this content often comes from a database that a
 * client edits, and "the client pasted something from Word" is a normal
 * Tuesday.
 *
 * Supported: headings (## ###), paragraphs, unordered and ordered lists,
 * blockquotes, horizontal rules, bold, italic, inline code, and links.
 * Raw HTML in the source is rendered as literal text, never parsed.
 *
 * If a project genuinely needs more (tables, footnotes, embeds), extend this
 * rather than swapping in a library that accepts raw HTML.
 */

type MarkdownProps = {
  children: string;
  className?: string;
};

/** Only these protocols are allowed in links. `javascript:` and `data:` are the point of this. */
function safeHref(href: string): string | null {
  const trimmed = href.trim();
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return trimmed;
  return null;
}

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(INLINE).filter(Boolean).map((token, i) => {
    const key = `${keyPrefix}-${i}`;

    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={key}>{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith('*') && token.endsWith('*')) {
      return <em key={key}>{token.slice(1, -1)}</em>;
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code key={key} className="rounded bg-ground-raised px-1 py-0.5 text-[0.9em]">
          {token.slice(1, -1)}
        </code>
      );
    }

    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
    if (link) {
      const [, label, rawHref] = link;
      const href = safeHref(rawHref ?? '');
      // An unsafe or unrecognised protocol renders as plain text rather than
      // silently dropping the words a reader was meant to see.
      if (!href) return <Fragment key={key}>{label}</Fragment>;

      const external = /^https?:/i.test(href);
      return (
        <Link
          key={key}
          href={href}
          className="text-accent underline underline-offset-2 hover:text-accent-hover"
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {label}
        </Link>
      );
    }

    return <Fragment key={key}>{token}</Fragment>;
  });
}

export function Markdown({ children, className }: MarkdownProps) {
  const lines = children.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];

  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const key = `p-${blocks.length}`;
    blocks.push(
      <p key={key} className="mb-4 leading-relaxed text-ink">
        {renderInline(paragraph.join(' '), key)}
      </p>,
    );
    paragraph = [];
  };

  const flushList = () => {
    if (!list) return;
    const key = `l-${blocks.length}`;
    const Tag = list.ordered ? 'ol' : 'ul';
    blocks.push(
      <Tag
        key={key}
        className={`mb-4 ml-5 space-y-1 ${list.ordered ? 'list-decimal' : 'list-disc'}`}
      >
        {list.items.map((item, i) => (
          <li key={`${key}-${i}`} className="leading-relaxed">
            {renderInline(item, `${key}-${i}`)}
          </li>
        ))}
      </Tag>,
    );
    list = null;
  };

  const flushAll = () => {
    flushParagraph();
    flushList();
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === '') {
      flushAll();
      continue;
    }

    if (trimmed === '---' || trimmed === '***') {
      flushAll();
      blocks.push(<hr key={`hr-${blocks.length}`} className="my-8 border-line" />);
      continue;
    }

    const heading = /^(#{2,4})\s+(.*)$/.exec(trimmed);
    if (heading) {
      flushAll();
      const level = heading[1]!.length as 2 | 3 | 4;
      const Tag = `h${level}` as const;
      const key = `h-${blocks.length}`;
      const size =
        level === 2 ? 'text-2xl md:text-3xl' : level === 3 ? 'text-xl' : 'text-lg';
      blocks.push(
        <Tag key={key} className={`mt-8 mb-3 font-semibold ${size} font-display`}>
          {renderInline(heading[2] ?? '', key)}
        </Tag>,
      );
      continue;
    }

    const quote = /^>\s?(.*)$/.exec(trimmed);
    if (quote) {
      flushAll();
      const key = `q-${blocks.length}`;
      blocks.push(
        <blockquote key={key} className="mb-4 border-l-2 border-accent pl-4 italic text-ink-muted">
          {renderInline(quote[1] ?? '', key)}
        </blockquote>,
      );
      continue;
    }

    const unordered = /^[-*+]\s+(.*)$/.exec(trimmed);
    const ordered = /^\d+[.)]\s+(.*)$/.exec(trimmed);
    if (unordered || ordered) {
      flushParagraph();
      const isOrdered = Boolean(ordered);
      if (list && list.ordered !== isOrdered) flushList();
      if (!list) list = { ordered: isOrdered, items: [] };
      list.items.push((unordered?.[1] ?? ordered?.[1]) ?? '');
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  flushAll();

  return <div className={className}>{blocks}</div>;
}
