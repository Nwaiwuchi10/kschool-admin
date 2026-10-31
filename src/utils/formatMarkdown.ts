/**
 * Converts Markdown text into clean, semantic HTML so it can be rendered
 * with high quality in both Web browsers (MathRenderer / Admin) and
 * Mobile WebViews (MathView / KSCHOOLMATE).
 *
 * Handles:
 * - Headings (#, ##, ###, ####)
 * - Bold (**text** or __text__), Italic (*text* or _text_)
 * - Unordered bullet lists (- or *), Ordered lists (1. 2. 3.)
 * - Blockquotes (> quote)
 * - Code blocks (```lang ... ```) and inline code (`code`)
 * - Horizontal rules (---)
 * - Tables (| col | col |)
 * - Preserves existing HTML and LaTeX ($...$ and $$...$$)
 */
export function formatMarkdownToHtml(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') return '';

  let text = markdown;

  // If content is already primarily full HTML (e.g. from rich TinyMCE WYSIWYG), return as is
  const hasHtmlBlocks = /<(p|div|table|ul|ol|h[1-6]|blockquote)[^>]*>/i.test(text);
  const hasMarkdownHeadingsOrBullets = /^#{1,6}\s|^\s*[-*+]\s|^\s*\d+\.\s/m.test(text);

  if (hasHtmlBlocks && !hasMarkdownHeadingsOrBullets) {
    return text;
  }

  // 1. Temporarily protect math blocks ($$...$$ and $...$) so markdown regex doesn't alter formula contents
  const mathPlaceholders: string[] = [];
  text = text.replace(/(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$)/g, (match) => {
    const idx = mathPlaceholders.length;
    mathPlaceholders.push(match);
    return `___MATH_TOKEN_${idx}___`;
  });

  // 2. Temporarily protect code blocks
  const codePlaceholders: string[] = [];
  text = text.replace(/```([a-zA-Z0-9]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codePlaceholders.length;
    codePlaceholders.push(
      `<pre class="bg-gray-900 text-gray-100 p-4 rounded-xl font-mono text-xs overflow-x-auto my-3"><code class="language-${lang || 'text'}">${code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')}</code></pre>`
    );
    return `___CODE_TOKEN_${idx}___`;
  });

  // 3. Inline code
  text = text.replace(/`([^`]+)`/g, '<code class="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded text-xs font-mono font-semibold">$1</code>');

  // 4. Headings (H1 to H6)
  text = text.replace(/^######\s+(.+)$/gm, '<h6 class="text-sm font-bold text-gray-800 mt-4 mb-2">$1</h6>');
  text = text.replace(/^#####\s+(.+)$/gm, '<h5 class="text-base font-bold text-gray-800 mt-4 mb-2">$1</h5>');
  text = text.replace(/^####\s+(.+)$/gm, '<h4 class="text-lg font-bold text-gray-900 mt-5 mb-2.5">$1</h4>');
  text = text.replace(/^###\s+(.+)$/gm, '<h3 class="text-xl font-bold text-[#0D6D62] mt-6 mb-3 border-b border-teal-100 pb-1">$1</h3>');
  text = text.replace(/^##\s+(.+)$/gm, '<h2 class="text-2xl font-extrabold text-gray-900 mt-7 mb-3">$1</h2>');
  text = text.replace(/^#\s+(.+)$/gm, '<h1 class="text-3xl font-black text-gray-900 mt-8 mb-4">$1</h1>');

  // 5. Blockquotes (> ...)
  text = text.replace(/^\s*>\s*(.+)$/gm, '<blockquote class="border-l-4 border-[#0D6D62] pl-4 py-1.5 my-3 bg-teal-50/60 rounded-r-lg italic text-gray-700">$1</blockquote>');

  // 6. Horizontal Rules (--- or ***)
  text = text.replace(/^(?:---|\*\*\*|___)\s*$/gm, '<hr class="my-6 border-t border-gray-200" />');

  // 7. Bold & Italic
  text = text.replace(/\*\*\*([^\*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
  text = text.replace(/\*\*([^\*]+)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
  text = text.replace(/__([^_]+)__/g, '<strong class="font-bold text-gray-900">$1</strong>');
  text = text.replace(/\*([^\*]+)\*/g, '<em class="italic">$1</em>');
  text = text.replace(/_([^_]+)_/g, '<em class="italic">$1</em>');

  // 8. Markdown Links [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#0D6D62] font-semibold underline hover:text-teal-700">$1</a>');

  // 9. Markdown Tables
  text = text.replace(/((?:\|[^\n]+\|\r?\n)+)/g, (tableMatch) => {
    const lines = tableMatch.trim().split(/\r?\n/).map((l) => l.trim());
    if (lines.length < 2) return tableMatch;

    // Filter out separator line (e.g. |---|---|)
    const headerLine = lines[0];
    const dataLines = lines.slice(1).filter((line) => !/^\|[\s\-:|]+\|$/.test(line));

    const parseRow = (rowStr: string) =>
      rowStr
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((cell) => cell.trim());

    const headerCells = parseRow(headerLine);
    const headerHtml = `<tr>${headerCells.map((c) => `<th class="border border-gray-200 bg-teal-50 px-3 py-2 text-left font-bold text-[#0D6D62] text-xs">${c}</th>`).join('')}</tr>`;

    const bodyHtml = dataLines
      .map(
        (dl) =>
          `<tr class="even:bg-gray-50/50">${parseRow(dl)
            .map((c) => `<td class="border border-gray-200 px-3 py-2 text-xs text-gray-700">${c}</td>`)
            .join('')}</tr>`
      )
      .join('');

    return `<div class="overflow-x-auto my-4 rounded-xl border border-gray-200"><table class="min-w-full divide-y divide-gray-200"><thead>${headerHtml}</thead><tbody>${bodyHtml}</tbody></table></div>`;
  });

  // 10. Unordered Lists (- or *)
  text = text.replace(/(?:^[ \t]*[-*+]\s+(?:.+)(?:\r?\n|$))+/gm, (listMatch) => {
    const items = listMatch
      .trim()
      .split(/\r?\n/)
      .map((item) => item.replace(/^[ \t]*[-*+]\s+/, '').trim())
      .filter(Boolean)
      .map((item) => `<li class="leading-relaxed">${item}</li>`)
      .join('');
    return `<ul class="list-disc pl-6 space-y-1.5 my-3 text-gray-800 marker:text-[#0D6D62]">${items}</ul>`;
  });

  // 11. Ordered Lists (1. 2. 3.)
  text = text.replace(/(?:^[ \t]*\d+\.\s+(?:.+)(?:\r?\n|$))+/gm, (listMatch) => {
    const items = listMatch
      .trim()
      .split(/\r?\n/)
      .map((item) => item.replace(/^[ \t]*\d+\.\s+/, '').trim())
      .filter(Boolean)
      .map((item) => `<li class="leading-relaxed">${item}</li>`)
      .join('');
    return `<ol class="list-decimal pl-6 space-y-1.5 my-3 text-gray-800 marker:font-bold marker:text-[#0D6D62]">${items}</ol>`;
  });

  // 12. Paragraphs: split by double newlines, wrap non-block segments in <p>
  const blocks = text.split(/\n{2,}/);
  text = blocks
    .map((block) => {
      const b = block.trim();
      if (!b) return '';
      if (/^<(h[1-6]|ul|ol|pre|blockquote|table|div|hr)/i.test(b)) {
        return b;
      }
      return `<p class="leading-relaxed mb-3.5 text-gray-800">${b.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('\n');

  // 13. Restore code blocks
  text = text.replace(/___CODE_TOKEN_(\d+)___/g, (_, id) => codePlaceholders[Number(id)] || '');

  // 14. Restore math blocks
  text = text.replace(/___MATH_TOKEN_(\d+)___/g, (_, id) => mathPlaceholders[Number(id)] || '');

  return text;
}

