'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Video,
  Minus,
  RemoveFormatting,
  Undo,
  Redo,
  Maximize2,
  Minimize2,
  HelpCircle,
  Table as TableIcon,
  ChevronDown,
  Palette,
  FileText,
  X,
  Highlighter,
  Plus,
} from 'lucide-react';
import { FormulaToolbar } from './FormulaToolbar';

interface WordPressEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  onAddMedia?: () => void;
  onInsertImage?: (url: string) => void;
}

// Preset colors matching WordPress TinyMCE palette
const TEXT_COLORS = [
  { name: 'Default Dark', color: '#1F2937' },
  { name: 'Odysey Teal', color: '#0D6D62' },
  { name: 'Navy Blue', color: '#1E40AF' },
  { name: 'Emerald Green', color: '#047857' },
  { name: 'Ruby Red', color: '#DC2626' },
  { name: 'Amber Orange', color: '#D97706' },
  { name: 'Royal Purple', color: '#7E22CE' },
  { name: 'Muted Gray', color: '#6B7280' },
];

const HIGHLIGHT_COLORS = [
  { name: 'Pastel Yellow', color: '#FEF08A' },
  { name: 'Light Mint', color: '#A7F3D0' },
  { name: 'Soft Sky', color: '#BAE6FD' },
  { name: 'Warm Peach', color: '#FED7AA' },
  { name: 'Lavender', color: '#E9D5FF' },
  { name: 'Soft Rose', color: '#FECDD3' },
  { name: 'None (Transparent)', color: 'transparent' },
];

export const WordPressEditor: React.FC<WordPressEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write or paste lesson content here...',
  onAddMedia,
  onInsertImage,
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'text'>('visual');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showKitchenSink, setShowKitchenSink] = useState(true);
  const [showFormulaToolbar, setShowFormulaToolbar] = useState(false);
  const [showYoutubeModal, setShowYoutubeModal] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showShortcodeMenu, setShowShortcodeMenu] = useState(false);
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [currentBlockFormat, setCurrentBlockFormat] = useState('Paragraph');
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [textColor, setTextColor] = useState('#0D6D62');
  const [highlightColor, setHighlightColor] = useState('#FEF08A');
  const [showSpecialCharModal, setShowSpecialCharModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [mediaImageUrl, setMediaImageUrl] = useState('');
  const [mediaImageCaption, setMediaImageCaption] = useState('');

  const visualEditorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const savedSelectionRange = useRef<Range | null>(null);

  // Sync external value to visual editor when not actively typing
  useEffect(() => {
    if (visualEditorRef.current && activeTab === 'visual') {
      if (visualEditorRef.current.innerHTML !== (value || '')) {
        visualEditorRef.current.innerHTML = value || '';
      }
    }
  }, [value, activeTab]);

  // Keep saved selection range so toolbar clicks don't lose the cursor/selection
  const saveSelection = () => {
    if (typeof window !== 'undefined' && window.getSelection) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        // Only save if inside visualEditorRef
        if (
          visualEditorRef.current &&
          visualEditorRef.current.contains(range.commonAncestorContainer)
        ) {
          savedSelectionRange.current = range.cloneRange();
        }
      }
    }
  };

  const restoreSelection = () => {
    if (savedSelectionRange.current && typeof window !== 'undefined' && window.getSelection) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRange.current);
      }
    }
  };

  const handleVisualInput = () => {
    if (visualEditorRef.current) {
      onChange(visualEditorRef.current.innerHTML);
      saveSelection();
    }
  };

  // Helper to insert HTML snippet safely into Visual contentEditable or Text textarea
  const insertHtmlSnippet = (html: string) => {
    if (activeTab === 'visual') {
      if (visualEditorRef.current) {
        visualEditorRef.current.focus();
        restoreSelection();
      }
      try {
        document.execCommand('insertHTML', false, html);
      } catch {
        // Fallback for document.execCommand
        if (visualEditorRef.current) {
          visualEditorRef.current.innerHTML += html;
        }
      }
      if (visualEditorRef.current) {
        onChange(visualEditorRef.current.innerHTML);
      }
    } else if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value || '';
      const newContent = val.substring(0, start) + html + val.substring(end);
      onChange(newContent);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + html.length, start + html.length);
      }, 0);
    } else {
      onChange((value || '') + '\n' + html);
    }
  };

  // Universal command executor supporting both Visual WYSIWYG & HTML Text mode
  const executeCommand = (command: string, arg?: string) => {
    if (activeTab === 'visual') {
      if (visualEditorRef.current) {
        visualEditorRef.current.focus();
        restoreSelection();
      }

      if (command === 'formatBlock' && arg) {
        // Cross-browser formatBlock support: Try standard tag name first, then <tag>
        const formatted = document.execCommand('formatBlock', false, arg);
        if (!formatted) {
          document.execCommand('formatBlock', false, `<${arg}>`);
        }
      } else if (command === 'foreColor' && arg) {
        document.execCommand('foreColor', false, arg);
      } else if (command === 'hiliteColor' && arg) {
        if (!document.execCommand('hiliteColor', false, arg)) {
          document.execCommand('backColor', false, arg);
        }
      } else if (command === 'removeFormat') {
        document.execCommand('removeFormat', false, undefined);
        document.execCommand('unlink', false, undefined);
      } else {
        document.execCommand(command, false, arg);
      }

      if (visualEditorRef.current) {
        onChange(visualEditorRef.current.innerHTML);
        saveSelection();
      }
    } else if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);

      let replacement = '';
      if (command === 'bold') replacement = `<strong>${selectedText || 'bold text'}</strong>`;
      else if (command === 'italic') replacement = `<em>${selectedText || 'italic text'}</em>`;
      else if (command === 'underline') replacement = `<u>${selectedText || 'underlined text'}</u>`;
      else if (command === 'strikeThrough') replacement = `<del>${selectedText || 'deleted text'}</del>`;
      else if (command === 'insertUnorderedList') replacement = `\n<ul>\n  <li>${selectedText || 'List item'}</li>\n</ul>\n`;
      else if (command === 'insertOrderedList') replacement = `\n<ol>\n  <li>${selectedText || 'List item'}</li>\n</ol>\n`;
      else if (command === 'formatBlock' && arg) replacement = `<${arg}>${selectedText || 'Heading'}</${arg}>`;
      else if (command === 'insertHorizontalRule') replacement = `\n<hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 20px 0;" />\n`;
      else if (command === 'justifyLeft') replacement = `<div style="text-align: left;">${selectedText || 'Left aligned text'}</div>`;
      else if (command === 'justifyCenter') replacement = `<div style="text-align: center;">${selectedText || 'Centered text'}</div>`;
      else if (command === 'justifyRight') replacement = `<div style="text-align: right;">${selectedText || 'Right aligned text'}</div>`;
      else if (command === 'justifyFull') replacement = `<div style="text-align: justify;">${selectedText || 'Justified text'}</div>`;
      else if (command === 'foreColor' && arg) replacement = `<span style="color: ${arg};">${selectedText || 'colored text'}</span>`;
      else if (command === 'hiliteColor' && arg) replacement = `<mark style="background-color: ${arg}; padding: 2px 4px; border-radius: 4px;">${selectedText || 'highlighted text'}</mark>`;
      else if (command === 'removeFormat') replacement = selectedText.replace(/<[^>]*>/g, '');
      else if (command === 'unlink') replacement = selectedText.replace(/<\/?a[^>]*>/gi, '');
      else if (command === 'indent') replacement = `<blockquote>${selectedText || 'Indented text'}</blockquote>`;
      else if (command === 'outdent') replacement = selectedText;
      else replacement = selectedText;

      const newContent =
        textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
      onChange(newContent);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + replacement.length, start + replacement.length);
      }, 0);
    }
  };

  // Embed YouTube Video Player
  const handleInsertYoutube = (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;

    let embedUrl = youtubeUrl.trim();
    const match = youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1]) {
      embedUrl = `https://www.youtube.com/embed/${match[1]}`;
    }

    const iframeHtml = `
<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 18px 0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
  <iframe src="${embedUrl}" frameborder="0" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 12px;"></iframe>
</div>
<p></p>
`;
    insertHtmlSnippet(iframeHtml);
    setYoutubeUrl('');
    setShowYoutubeModal(false);
  };

  // Embed Image into Content
  const handleInsertImageModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaImageUrl.trim()) return;

    const captionHtml = mediaImageCaption.trim()
      ? `<figcaption style="text-align: center; font-size: 12px; color: #64748B; margin-top: 6px;">${mediaImageCaption.trim()}</figcaption>`
      : '';

    const imgHtml = `
<figure style="margin: 18px 0; text-align: center;">
  <img src="${mediaImageUrl.trim()}" alt="${mediaImageCaption.trim() || 'Lesson diagram'}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin: 0 auto;" />
  ${captionHtml}
</figure>
<p></p>
`;
    insertHtmlSnippet(imgHtml);
    setMediaImageUrl('');
    setMediaImageCaption('');
    setShowImageModal(false);
  };

  // Insert Link Modal
  const handleInsertLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;

    const linkHtml = `<a href="${linkUrl.trim()}" target="_blank" rel="noopener noreferrer" style="color: #0D6D62; font-weight: 600; text-decoration: underline;">${linkText.trim() || linkUrl.trim()}</a> `;
    insertHtmlSnippet(linkHtml);
    setLinkUrl('');
    setLinkText('');
    setShowLinkModal(false);
  };

  // Insert Shortcode snippets
  const insertShortcode = (code: string) => {
    let htmlSnippet = '';
    if (code.includes('highlight')) {
      htmlSnippet = `<span style="background-color: #FEF08A; padding: 2px 6px; border-radius: 4px; font-weight: 600;">Highlighted Lesson Point</span> `;
    } else if (code.includes('alert')) {
      htmlSnippet = `<div style="background-color: #F0FDF4; border-left: 4px solid #0D6D62; padding: 14px 18px; border-radius: 8px; margin: 16px 0; color: #064E3B;"><strong>💡 Key Takeaway:</strong> Enter important summary notes here...</div><p></p>`;
    } else if (code.includes('practice_worksheet')) {
      htmlSnippet = `<div style="background-color: #F8FAFC; border: 1.5px dashed #0D6D62; border-radius: 12px; padding: 18px; margin: 20px 0; text-align: center;"><strong style="color: #0D6D62;">📝 Student Practice Drill</strong><p style="margin: 6px 0; color: #475569; font-size: 13px;">Complete the attached interactive exercises after studying this lesson topic.</p></div><p></p>`;
    } else {
      htmlSnippet = `<span>${code}</span> `;
    }

    insertHtmlSnippet(htmlSnippet);
    setShowShortcodeMenu(false);
  };

  // Insert Raw LaTeX Formula without code tag wrapper
  const insertFormula = (snippet: string) => {
    insertHtmlSnippet(` ${snippet} `);
  };

  // Insert Special Unicode Character
  const insertSpecialCharacter = (char: string) => {
    insertHtmlSnippet(char);
    setShowSpecialCharModal(false);
  };

  // Insert Standard Table
  const insertTable = () => {
    const tableHtml = `
<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
  <thead>
    <tr style="background-color: #F3F4F6;">
      <th style="border: 1px solid #D1D5DB; padding: 8px 12px; text-align: left; font-weight: 600;">Header 1</th>
      <th style="border: 1px solid #D1D5DB; padding: 8px 12px; text-align: left; font-weight: 600;">Header 2</th>
      <th style="border: 1px solid #D1D5DB; padding: 8px 12px; text-align: left; font-weight: 600;">Header 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #D1D5DB; padding: 8px 12px;">Row 1 Item</td>
      <td style="border: 1px solid #D1D5DB; padding: 8px 12px;">Description</td>
      <td style="border: 1px solid #D1D5DB; padding: 8px 12px;">Value</td>
    </tr>
    <tr>
      <td style="border: 1px solid #D1D5DB; padding: 8px 12px;">Row 2 Item</td>
      <td style="border: 1px solid #D1D5DB; padding: 8px 12px;">Description</td>
      <td style="border: 1px solid #D1D5DB; padding: 8px 12px;">Value</td>
    </tr>
  </tbody>
</table>
<p></p>
`;
    insertHtmlSnippet(tableHtml);
  };

  return (
    <div
      className={`border border-gray-300 rounded-xl bg-white shadow-xs transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none overflow-y-auto p-4 bg-gray-100 flex flex-col' : ''
      }`}
    >
      {/* =========================================================================
          ROW 1: WORDPRESS ACTION BUTTONS (Add Media, Forms, YouTube) + VISUAL/TEXT TABS
          ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-[#F9FAFB] border-b border-gray-200 rounded-t-xl">
        {/* Left Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Add Media Button */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => {
              if (onAddMedia) {
                onAddMedia();
              } else {
                saveSelection();
                setShowImageModal(true);
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 shadow-2xs transition-colors cursor-pointer"
            title="Upload and insert diagram image into lesson content"
          >
            <span className="text-[#0D6D62] text-sm">🎵</span>
            <ImageIcon className="w-3.5 h-3.5 text-gray-700" />
            <span>Add Media</span>
          </button>

          {/* Direct URL Image Embed Button */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => {
              saveSelection();
              setShowImageModal(true);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 shadow-2xs transition-colors cursor-pointer"
            title="Embed image via Web URL or diagram link"
          >
            <Plus className="w-3 h-3 text-[#0D6D62]" />
            <span>Image URL</span>
          </button>

          {/* Add Practice Form Shortcode */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => insertShortcode('[practice_worksheet class="active"]')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 shadow-2xs transition-colors cursor-pointer"
            title="Insert interactive practice drill box"
          >
            <span className="text-amber-600 font-bold">🔘</span>
            <span>Add Practice Form</span>
          </button>

          {/* YouTube Embed Button */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => {
              saveSelection();
              setShowYoutubeModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 shadow-2xs transition-colors cursor-pointer"
            title="Embed YouTube video player"
          >
            <Video className="w-3.5 h-3.5 text-red-600" />
            <span>YouTube</span>
          </button>

          {/* Universal Math & Science Formulas Palette Toggle */}
          <button
            type="button"
            onClick={() => setShowFormulaToolbar(!showFormulaToolbar)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              showFormulaToolbar
                ? 'bg-emerald-100 text-[#0D6D62] border-emerald-300 font-bold'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            title="Toggle KaTeX Math, Physics & Chemistry formula palette"
          >
            <span>∑ Formulas</span>
          </button>
        </div>

        {/* Right: Visual / Text Mode Tabs */}
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-gray-200/80 p-0.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('visual');
            }}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              activeTab === 'visual'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('text');
            }}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              activeTab === 'text'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Text
          </button>
        </div>
      </div>

      {/* =========================================================================
          ROW 2: FIRST FORMATTING TOOLBAR ROW (Paragraph, B, I, Lists, Align, Link...)
          ========================================================================= */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-[#F3F4F6] border-b border-gray-200 text-gray-700 text-xs">
        {/* Paragraph / Headings dropdown */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => setShowFormatDropdown(!showFormatDropdown)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-800 font-semibold cursor-pointer shadow-2xs"
          >
            <span>{currentBlockFormat}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </button>

          {showFormatDropdown && (
            <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-xl z-30 py-1 text-xs">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  executeCommand('formatBlock', 'p');
                  setCurrentBlockFormat('Paragraph');
                  setShowFormatDropdown(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-gray-100 font-normal cursor-pointer"
              >
                Paragraph
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  executeCommand('formatBlock', 'h1');
                  setCurrentBlockFormat('Heading 1');
                  setShowFormatDropdown(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-gray-100 font-bold text-base cursor-pointer"
              >
                Heading 1
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  executeCommand('formatBlock', 'h2');
                  setCurrentBlockFormat('Heading 2');
                  setShowFormatDropdown(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-gray-100 font-bold text-sm cursor-pointer"
              >
                Heading 2
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  executeCommand('formatBlock', 'h3');
                  setCurrentBlockFormat('Heading 3');
                  setShowFormatDropdown(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-gray-100 font-bold text-xs cursor-pointer"
              >
                Heading 3
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  executeCommand('formatBlock', 'pre');
                  setCurrentBlockFormat('Preformatted');
                  setShowFormatDropdown(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-gray-100 font-mono text-[11px] cursor-pointer"
              >
                Preformatted
              </button>
            </div>
          )}
        </div>

        <span className="w-px h-5 bg-gray-300 mx-0.5" />

        {/* Bold */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand('bold');
          }}
          className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer shadow-2xs"
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        {/* Italic */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand('italic');
          }}
          className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer shadow-2xs"
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        {/* Bullet List */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand('insertUnorderedList');
          }}
          className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer shadow-2xs"
          title="Bulleted List"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        {/* Numbered List */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand('insertOrderedList');
          }}
          className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer shadow-2xs"
          title="Numbered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        {/* Blockquote */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand('formatBlock', 'blockquote');
          }}
          className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer shadow-2xs"
          title="Blockquote"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-5 bg-gray-300 mx-0.5" />

        {/* Align Left */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand('justifyLeft');
          }}
          className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer shadow-2xs"
          title="Align Left"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>

        {/* Align Center */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand('justifyCenter');
          }}
          className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer shadow-2xs"
          title="Align Center"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>

        {/* Align Right */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand('justifyRight');
          }}
          className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer shadow-2xs"
          title="Align Right"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-5 bg-gray-300 mx-0.5" />

        {/* Insert Link */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            saveSelection();
            setShowLinkModal(true);
          }}
          className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer shadow-2xs"
          title="Insert/edit link"
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </button>

        {/* Remove Link */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand('unlink');
          }}
          className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer shadow-2xs"
          title="Remove link"
        >
          <Unlink className="w-3.5 h-3.5" />
        </button>

        {/* Read More tag */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            insertHtmlSnippet('<!--more--><hr style="border: 0; border-top: 2px dashed #9CA3AF; margin: 20px 0;" /><p></p>');
          }}
          className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer font-mono font-bold text-[10px] shadow-2xs"
          title="Insert Read More tag"
        >
          more
        </button>

        {/* Kitchen Sink Toggle */}
        <button
          type="button"
          onClick={() => setShowKitchenSink(!showKitchenSink)}
          className={`p-1.5 border rounded cursor-pointer shadow-2xs ${
            showKitchenSink
              ? 'bg-[#E6F7F3] border-[#0D6D62] text-[#0D6D62]'
              : 'bg-white border-gray-300 hover:bg-gray-100 text-gray-800'
          }`}
          title="Toolbar Toggle / Kitchen Sink (Shift+Alt+Z)"
        >
          <FileText className="w-3.5 h-3.5" />
        </button>

        {/* Shortcodes Dropdown */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => setShowShortcodeMenu(!showShortcodeMenu)}
            className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-800 font-semibold cursor-pointer shadow-2xs"
          >
            <span>Shortcodes</span>
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </button>

          {showShortcodeMenu && (
            <div className="absolute left-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-xl z-30 py-1 text-xs">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertShortcode('[highlight]');
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-gray-100 cursor-pointer"
              >
                Highlight Lesson Point
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertShortcode('[alert]');
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-gray-100 cursor-pointer"
              >
                Summary / Alert Box
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertShortcode('[practice_worksheet]');
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-gray-100 cursor-pointer"
              >
                Practice Drill Box
              </button>
            </div>
          )}
        </div>

        {/* Fullscreen */}
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1.5 ml-auto bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer shadow-2xs"
          title="Distraction-free writing mode"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* =========================================================================
          ROW 3: SECOND FORMATTING TOOLBAR ROW ("KITCHEN SINK" EXTENDED TOOLS)
          ========================================================================= */}
      {showKitchenSink && (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-[#F3F4F6] border-b border-gray-200 text-gray-700 text-xs">
          {/* Strikethrough */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('strikeThrough');
            }}
            className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer shadow-2xs"
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          {/* Underline */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('underline');
            }}
            className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer shadow-2xs"
            title="Underline"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>

          {/* Justify / Full Align */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('justifyFull');
            }}
            className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer shadow-2xs"
            title="Justify"
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </button>

          {/* Horizontal Line */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('insertHorizontalRule');
            }}
            className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer shadow-2xs"
            title="Horizontal Line"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-5 bg-gray-300 mx-0.5" />

          {/* Table Insertion */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              insertTable();
            }}
            className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer shadow-2xs"
            title="Insert Structured Table"
          >
            <TableIcon className="w-3.5 h-3.5 text-[#0D6D62]" />
          </button>

          <span className="w-px h-5 bg-gray-300 mx-0.5" />

          {/* Text Color Picker with Preset Palette Dropdown */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
                setShowTextColorPicker(!showTextColorPicker);
                setShowHighlightPicker(false);
              }}
              className="flex items-center gap-1 bg-white border border-gray-300 rounded px-2 py-1 shadow-2xs hover:bg-gray-50 cursor-pointer"
              title="Select Text Color"
            >
              <span className="font-bold underline text-xs" style={{ color: textColor }}>
                A
              </span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {showTextColorPicker && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-30 p-2.5">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Text Color Palette
                </div>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {TEXT_COLORS.map((item) => (
                    <button
                      key={item.color}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setTextColor(item.color);
                        executeCommand('foreColor', item.color);
                        setShowTextColorPicker(false);
                      }}
                      className="w-7 h-7 rounded border border-gray-300 hover:scale-110 transition-transform cursor-pointer shadow-2xs"
                      style={{ backgroundColor: item.color }}
                      title={item.name}
                    />
                  ))}
                </div>
                <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-gray-500">Custom:</span>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => {
                      setTextColor(e.target.value);
                      executeCommand('foreColor', e.target.value);
                    }}
                    className="w-6 h-6 border-0 p-0 cursor-pointer bg-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Background Highlight Color with Preset Palette Dropdown */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
                setShowHighlightPicker(!showHighlightPicker);
                setShowTextColorPicker(false);
              }}
              className="flex items-center gap-1 bg-white border border-gray-300 rounded px-2 py-1 shadow-2xs hover:bg-gray-50 cursor-pointer"
              title="Background Highlight Palette"
            >
              <Highlighter className="w-3 h-3 text-amber-600" />
              <div
                className="w-2.5 h-2.5 rounded-full border border-gray-300"
                style={{ backgroundColor: highlightColor }}
              />
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {showHighlightPicker && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-30 p-2.5">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Highlight Palette
                </div>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {HIGHLIGHT_COLORS.map((item) => (
                    <button
                      key={item.color}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setHighlightColor(item.color);
                        executeCommand('hiliteColor', item.color);
                        setShowHighlightPicker(false);
                      }}
                      className="w-7 h-7 rounded border border-gray-300 hover:scale-110 transition-transform cursor-pointer shadow-2xs flex items-center justify-center text-[9px] font-bold text-gray-600"
                      style={{ backgroundColor: item.color }}
                      title={item.name}
                    >
                      {item.color === 'transparent' ? '✕' : ''}
                    </button>
                  ))}
                </div>
                <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-gray-500">Custom:</span>
                  <input
                    type="color"
                    value={highlightColor === 'transparent' ? '#FEF08A' : highlightColor}
                    onChange={(e) => {
                      setHighlightColor(e.target.value);
                      executeCommand('hiliteColor', e.target.value);
                    }}
                    className="w-6 h-6 border-0 p-0 cursor-pointer bg-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Clear Formatting */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('removeFormat');
            }}
            className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer shadow-2xs"
            title="Clear Formatting (Eraser)"
          >
            <RemoveFormatting className="w-3.5 h-3.5 text-rose-600" />
          </button>

          <span className="w-px h-5 bg-gray-300 mx-0.5" />

          {/* Special Character Omega Ω */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
              setShowSpecialCharModal(true);
            }}
            className="p-1.5 px-2 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 font-bold cursor-pointer shadow-2xs"
            title="Insert Special Character (Ω, π, ±, ©, etc.)"
          >
            Ω
          </button>

          {/* Outdent */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('outdent');
            }}
            className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer shadow-2xs"
            title="Decrease Indent"
          >
            <span className="text-[10px] font-bold">⇤</span>
          </button>

          {/* Indent */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('indent');
            }}
            className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer shadow-2xs"
            title="Increase Indent"
          >
            <span className="text-[10px] font-bold">⇥</span>
          </button>

          <span className="w-px h-5 bg-gray-300 mx-0.5" />

          {/* Undo */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('undo');
            }}
            className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer shadow-2xs"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>

          {/* Redo */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('redo');
            }}
            className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer shadow-2xs"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>

          {/* Help */}
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="p-1.5 ml-auto bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer shadow-2xs"
            title="Keyboard Shortcuts & Help"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =========================================================================
          OPTIONAL KA-TEX FORMULA PALETTE ACCORDION
          ========================================================================= */}
      {showFormulaToolbar && (
        <div className="p-3 bg-emerald-50/50 border-b border-emerald-200">
          <FormulaToolbar onInsert={insertFormula} />
        </div>
      )}

      {/* =========================================================================
          CONTENT EDITING AREA: VISUAL (ContentEditable) VS TEXT (HTML / Markdown)
          ========================================================================= */}
      <div className={`p-4 ${isFullscreen ? 'flex-1' : 'min-h-[300px]'}`}>
        {activeTab === 'visual' ? (
          <div
            ref={visualEditorRef}
            contentEditable
            onInput={handleVisualInput}
            onBlur={handleVisualInput}
            onKeyUp={saveSelection}
            onMouseUp={saveSelection}
            data-placeholder={placeholder}
            className="w-full min-h-[280px] outline-none text-gray-900 leading-relaxed font-sans text-sm sm:text-base selection:bg-emerald-100 empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 prose max-w-none"
            style={{ minHeight: isFullscreen ? '70vh' : '280px' }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full min-h-[280px] p-3 font-mono text-xs sm:text-sm text-gray-900 bg-white border border-gray-200 rounded-lg outline-none resize-y focus:border-[#0D6D62]"
            style={{ minHeight: isFullscreen ? '70vh' : '280px' }}
          />
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-t border-gray-200 text-[11px] text-gray-500 rounded-b-xl">
        <div className="flex items-center gap-2">
          <span>
            Word count: <strong>{(value || '').replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length}</strong>
          </span>
          <span>•</span>
          <span>Mode: {activeTab === 'visual' ? 'WYSIWYG Visual' : 'HTML / Markdown'}</span>
        </div>
        <div className="text-gray-400">All tools fully functional • Visual WYSIWYG & HTML</div>
      </div>

      {/* =========================================================================
          MODALS: IMAGE URL, YOUTUBE, LINK, SPECIAL CHARACTERS, HELP
          ========================================================================= */}
      {/* Insert Image URL Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#0D6D62]" />
                <span>Insert Diagram / Media Image</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInsertImageModal} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Image Direct URL (Cloudinary / Web)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://res.cloudinary.com/... or https://example.com/diagram.png"
                  value={mediaImageUrl}
                  onChange={(e) => setMediaImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Caption / Alt Text (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Figure 1: Parts of a Plant Cell"
                  value={mediaImageCaption}
                  onChange={(e) => setMediaImageCaption(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0D6D62] hover:bg-[#0A5A51] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Insert Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* YouTube Modal */}
      {showYoutubeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Video className="w-4 h-4 text-red-600" />
                <span>Embed YouTube Video</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowYoutubeModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInsertYoutube} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  YouTube Video URL or ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowYoutubeModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Embed Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-[#0D6D62]" />
                <span>Insert Hyperlink</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInsertLink} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Link URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Anchor Text (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Click here..."
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0D6D62] hover:bg-[#0A5A51] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Insert Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Special Characters Modal */}
      {showSpecialCharModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-sm font-bold text-gray-900">Insert Special Character</h4>
              <button
                type="button"
                onClick={() => setShowSpecialCharModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5 max-h-60 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200 text-center">
              {[
                'Ω', 'π', 'θ', 'α', 'β', 'γ', 'δ', 'λ', 'μ', 'σ',
                '±', '×', '÷', '≠', '≈', '≤', '≥', '√', '∞', '∫',
                '°', '℃', '℉', '‰', '§', '¶', '©', '®', '™', '€',
                '£', '¥', '¢', '₦', '←', '↑', '→', '↓', '↔', '⇒',
                '½', '⅓', '⅔', '¼', '¾', '⅛', '⅜', '⅝', '⅞', '✓',
              ].map((char) => (
                <button
                  key={char}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    insertSpecialCharacter(char);
                  }}
                  className="p-2 rounded bg-white hover:bg-emerald-100 hover:text-[#0D6D62] border border-gray-200 font-bold text-sm transition-colors cursor-pointer"
                >
                  {char}
                </button>
              ))}
            </div>

            <div className="text-right pt-2">
              <button
                type="button"
                onClick={() => setShowSpecialCharModal(false)}
                className="px-4 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-sm font-bold text-gray-900">Editor Shortcuts & Features</h4>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-gray-600 space-y-2 max-h-60 overflow-y-auto">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Bold</span>
                <kbd className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-mono">Ctrl + B</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Italic</span>
                <kbd className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-mono">Ctrl + I</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Underline</span>
                <kbd className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-mono">Ctrl + U</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Undo</span>
                <kbd className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-mono">Ctrl + Z</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Redo</span>
                <kbd className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-mono">Ctrl + Y</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Math & Science Formulas</span>
                <kbd className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-mono">$...$ or $$...$$</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Insert Table</span>
                <kbd className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-mono">Table Icon</kbd>
              </div>
            </div>
            <div className="text-right pt-2">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-1.5 rounded-lg bg-[#0D6D62] text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordPressEditor;
