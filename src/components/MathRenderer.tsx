'use client';

import React, { useMemo } from 'react';
import katex from 'katex';
import { formatMarkdownToHtml } from '@/utils/formatMarkdown';

interface MathRendererProps {
  content: string;
  className?: string;
  inline?: boolean;
}

/**
 * Universal Math, Physics, Chemistry & Rich HTML Content Renderer
 * - Seamlessly parses both Markdown (# headings, lists, bold, italics, tables)
 *   and rich HTML markup (colors, blockquotes, images, embedded YouTube iframes)
 *   AND LaTeX formulas ($...$ or $$...$$).
 */
export const MathRenderer: React.FC<MathRendererProps> = ({
  content = '',
  className = '',
  inline = false,
}) => {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    // First ensure markdown headings, lists, tables, bold/italics are converted to HTML
    const htmlWithMarkdown = formatMarkdownToHtml(content);

    // Replace display math $$...$$ and inline math $...$ with KaTeX rendered HTML
    return htmlWithMarkdown.replace(
      /(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$)/g,
      (match) => {
        if (match.startsWith('$$') && match.endsWith('$$')) {
          const math = match.slice(2, -2).trim();
          try {
            return katex.renderToString(math, {
              displayMode: true,
              throwOnError: false,
            });
          } catch {
            return `<code class="rounded bg-rose-50 px-2 py-1 text-sm text-rose-600 font-mono">${match}</code>`;
          }
        } else if (match.startsWith('$') && match.endsWith('$')) {
          const math = match.slice(1, -1).trim();
          try {
            return katex.renderToString(math, {
              displayMode: false,
              throwOnError: false,
            });
          } catch {
            return `<code class="rounded bg-rose-50 px-1 text-xs text-rose-600 font-mono">${match}</code>`;
          }
        }
        return match;
      }
    );
  }, [content]);

  if (!content) return null;

  if (inline) {
    return (
      <span
        className={`math-renderer inline-block align-baseline prose max-w-none ${className}`}
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    );
  }

  return (
    <div
      className={`math-renderer prose max-w-none text-gray-900 leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};

export default MathRenderer;
