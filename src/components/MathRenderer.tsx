'use client';

import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
  inline?: boolean;
}

/**
 * Universal Math, Physics, Chemistry & Quantitative Reasoning Renderer
 * Automatically detects and formats LaTeX math ($...$ or $$...$$),
 * fractions, chemical equations, and formulas alongside regular text.
 */
export const MathRenderer: React.FC<MathRendererProps> = ({
  content = '',
  className = '',
  inline = false,
}) => {
  const renderedElements = useMemo(() => {
    if (!content) return null;

    // Split text by display math $$...$$ and inline math $...$
    // Pattern matches $$...$$ or $...$
    const mathRegex = /(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$)/g;
    const parts = content.split(mathRegex);

    return parts.map((part, index) => {
      if (!part) return null;

      // Block / Display Math ($$...$$)
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const math = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: true,
            throwOnError: false,
          });
          return (
            <div
              key={index}
              className="my-3 overflow-x-auto py-1 text-center"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch (e) {
          return (
            <code key={index} className="rounded bg-rose-50 px-2 py-1 text-sm text-rose-600 font-mono">
              {part}
            </code>
          );
        }
      }

      // Inline Math ($...$)
      if (part.startsWith('$') && part.endsWith('$')) {
        const math = part.slice(1, -1).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: false,
            throwOnError: false,
          });
          return (
            <span
              key={index}
              className="inline-block px-1 align-baseline"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch (e) {
          return (
            <code key={index} className="rounded bg-rose-50 px-1 text-xs text-rose-600 font-mono">
              {part}
            </code>
          );
        }
      }

      // Regular text (handles newlines)
      return (
        <span key={index} className="whitespace-pre-wrap">
          {part}
        </span>
      );
    });
  }, [content]);

  if (inline) {
    return <span className={`math-renderer ${className}`}>{renderedElements}</span>;
  }

  return <div className={`math-renderer ${className}`}>{renderedElements}</div>;
};

export default MathRenderer;
