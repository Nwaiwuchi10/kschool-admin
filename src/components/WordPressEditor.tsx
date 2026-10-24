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
  Code,
  Table,
  ChevronDown,
  Palette,
  FileText,
  CornerDownLeft,
  X,
  Plus,
} from 'lucide-react';
import { FormulaToolbar } from './FormulaToolbar';
import { MathRenderer } from './MathRenderer';

interface WordPressEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  onAddMedia?: () => void;
}

export const WordPressEditor: React.FC<WordPressEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write or paste lesson content here...',
  onAddMedia,
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
  const [textColor, setTextColor] = useState('#000000');

  const visualEditorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync value into visual contentEditable div when value changes externally
  useEffect(() => {
    if (visualEditorRef.current && activeTab === 'visual') {
      if (visualEditorRef.current.innerHTML !== value) {
        visualEditorRef.current.innerHTML = value || '';
      }
    }
  }, [value, activeTab]);

  const handleVisualInput = () => {
    if (visualEditorRef.current) {
      onChange(visualEditorRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    if (activeTab === 'visual') {
      document.execCommand(command, false, arg);
      if (visualEditorRef.current) {
        onChange(visualEditorRef.current.innerHTML);
      }
    } else if (textareaRef.current) {
      // In text mode, wrap selected text
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
      else if (command === 'insertHorizontalRule') replacement = `\n<hr />\n`;
      else replacement = selectedText;

      const newContent =
        textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
      onChange(newContent);
    }
  };

  const handleInsertYoutube = (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;

    // Extract video ID
    let embedUrl = youtubeUrl.trim();
    const match = youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1]) {
      embedUrl = `https://www.youtube.com/embed/${match[1]}`;
    }

    const iframeHtml = `
<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 16px 0; border-radius: 12px;">
  <iframe src="${embedUrl}" frameborder="0" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 12px;"></iframe>
</div>
<p></p>
`;

    if (activeTab === 'visual') {
      document.execCommand('insertHTML', false, iframeHtml);
      if (visualEditorRef.current) {
        onChange(visualEditorRef.current.innerHTML);
      }
    } else {
      onChange((value || '') + '\n' + iframeHtml);
    }

    setYoutubeUrl('');
    setShowYoutubeModal(false);
  };

  const handleInsertLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;

    const linkHtml = `<a href="${linkUrl.trim()}" target="_blank" rel="noopener noreferrer" style="color: #0D6D62; text-decoration: underline;">${linkText.trim() || linkUrl.trim()}</a>`;

    if (activeTab === 'visual') {
      document.execCommand('insertHTML', false, linkHtml);
      if (visualEditorRef.current) {
        onChange(visualEditorRef.current.innerHTML);
      }
    } else {
      onChange((value || '') + ' ' + linkHtml);
    }

    setLinkUrl('');
    setLinkText('');
    setShowLinkModal(false);
  };

  const insertShortcode = (code: string) => {
    if (activeTab === 'visual') {
      document.execCommand('insertHTML', false, `<span>${code}</span> `);
      if (visualEditorRef.current) onChange(visualEditorRef.current.innerHTML);
    } else {
      onChange((value || '') + ' ' + code);
    }
    setShowShortcodeMenu(false);
  };

  const insertFormula = (snippet: string) => {
    if (activeTab === 'visual') {
      document.execCommand('insertHTML', false, `<span>${snippet}</span> `);
      if (visualEditorRef.current) onChange(visualEditorRef.current.innerHTML);
    } else {
      onChange((value || '') + (value ? ' ' : '') + snippet);
    }
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
            onClick={() => {
              if (onAddMedia) {
                onAddMedia();
              } else {
                const url = prompt('Enter Image URL to insert:');
                if (url) {
                  const imgHtml = `<p><img src="${url}" alt="Lesson diagram" style="max-width: 100%; height: auto; border-radius: 8px; margin: 12px 0;" /></p>`;
                  executeCommand('insertHTML', imgHtml);
                }
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 active:bg-gray-100 shadow-2xs transition-colors cursor-pointer"
            title="Upload and insert media files"
          >
            <span className="text-[#0D6D62] text-sm">🎵</span>
            <ImageIcon className="w-3.5 h-3.5 text-gray-600" />
            <span>Add Media</span>
          </button>

          {/* Add Contact / Practice Form Shortcode */}
          <button
            type="button"
            onClick={() => insertShortcode('[practice_worksheet class="active"]')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 active:bg-gray-100 shadow-2xs transition-colors cursor-pointer"
            title="Insert practice interactive activity form"
          >
            <span className="text-amber-600 font-bold">🔘</span>
            <span>Add Practice Form</span>
          </button>

          {/* YouTube Embed Button */}
          <button
            type="button"
            onClick={() => setShowYoutubeModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 active:bg-gray-100 shadow-2xs transition-colors cursor-pointer"
            title="Embed YouTube video player"
          >
            <Video className="w-3.5 h-3.5 text-red-600" />
            <span>YouTube</span>
          </button>

          {/* Universal Math & Science Formulas Palette Toggle */}
          <button
            type="button"
            onClick={() => setShowFormulaToolbar(!showFormulaToolbar)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
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
        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden bg-gray-200/80 p-0.5">
          <button
            type="button"
            onClick={() => setActiveTab('visual')}
            className={`px-3 py-1 text-xs font-bold rounded transition-colors cursor-pointer ${
              activeTab === 'visual'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`px-3 py-1 text-xs font-bold rounded transition-colors cursor-pointer ${
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
            onClick={() => setShowFormatDropdown(!showFormatDropdown)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-800 font-semibold cursor-pointer"
          >
            <span>Paragraph</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </button>

          {showFormatDropdown && (
            <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-xl z-30 py-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  executeCommand('formatBlock', 'p');
                  setShowFormatDropdown(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-gray-100"
              >
                Paragraph
              </button>
              <button
                type="button"
                onClick={() => {
                  executeCommand('formatBlock', 'h1');
                  setShowFormatDropdown(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-gray-100 font-bold text-base"
              >
                Heading 1
              </button>
              <button
                type="button"
                onClick={() => {
                  executeCommand('formatBlock', 'h2');
                  setShowFormatDropdown(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-gray-100 font-bold text-sm"
              >
                Heading 2
              </button>
              <button
                type="button"
                onClick={() => {
                  executeCommand('formatBlock', 'h3');
                  setShowFormatDropdown(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-gray-100 font-bold text-xs"
              >
                Heading 3
              </button>
              <button
                type="button"
                onClick={() => {
                  executeCommand('formatBlock', 'pre');
                  setShowFormatDropdown(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-gray-100 font-mono text-[11px]"
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
          onClick={() => executeCommand('bold')}
          className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer"
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => executeCommand('italic')}
          className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer"
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        {/* Bullet List */}
        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer"
          title="Bulleted List"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        {/* Numbered List */}
        <button
          type="button"
          onClick={() => executeCommand('insertOrderedList')}
          className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer"
          title="Numbered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        {/* Blockquote */}
        <button
          type="button"
          onClick={() => executeCommand('formatBlock', 'blockquote')}
          className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer"
          title="Blockquote"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-5 bg-gray-300 mx-0.5" />

        {/* Align Left */}
        <button
          type="button"
          onClick={() => executeCommand('justifyLeft')}
          className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer"
          title="Align Left"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>

        {/* Align Center */}
        <button
          type="button"
          onClick={() => executeCommand('justifyCenter')}
          className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer"
          title="Align Center"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>

        {/* Align Right */}
        <button
          type="button"
          onClick={() => executeCommand('justifyRight')}
          className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer"
          title="Align Right"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-5 bg-gray-300 mx-0.5" />

        {/* Insert Link */}
        <button
          type="button"
          onClick={() => setShowLinkModal(true)}
          className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer"
          title="Insert/edit link"
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </button>

        {/* Remove Link */}
        <button
          type="button"
          onClick={() => executeCommand('unlink')}
          className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer"
          title="Remove link"
        >
          <Unlink className="w-3.5 h-3.5" />
        </button>

        {/* Read More tag */}
        <button
          type="button"
          onClick={() => executeCommand('insertHTML', '<!--more--><hr style="border-style: dashed; border-color: #9CA3AF;" />')}
          className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer font-mono font-bold text-[10px]"
          title="Insert Read More tag"
        >
          more
        </button>

        {/* Kitchen Sink Toggle */}
        <button
          type="button"
          onClick={() => setShowKitchenSink(!showKitchenSink)}
          className={`p-1.5 border rounded cursor-pointer ${
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
            onClick={() => setShowShortcodeMenu(!showShortcodeMenu)}
            className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-800 font-semibold cursor-pointer"
          >
            <span>Shortcodes</span>
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </button>

          {showShortcodeMenu && (
            <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-30 py-1 text-xs">
              <button
                type="button"
                onClick={() => insertShortcode('[highlight color="yellow"]text[/highlight]')}
                className="w-full text-left px-3 py-1.5 hover:bg-gray-100"
              >
                Highlight Note
              </button>
              <button
                type="button"
                onClick={() => insertShortcode('[alert type="tip"]Important Tip[/alert]')}
                className="w-full text-left px-3 py-1.5 hover:bg-gray-100"
              >
                Notice / Alert Box
              </button>
              <button
                type="button"
                onClick={() => insertShortcode('[quiz_reference id="1"]')}
                className="w-full text-left px-3 py-1.5 hover:bg-gray-100"
              >
                Quiz Reference
              </button>
              <button
                type="button"
                onClick={() => insertShortcode('[audio_narration timestamp="02:15"]')}
                className="w-full text-left px-3 py-1.5 hover:bg-gray-100"
              >
                Audio Timestamp Note
              </button>
            </div>
          )}
        </div>

        {/* Fullscreen */}
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1.5 ml-auto bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer"
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
            onClick={() => executeCommand('strikeThrough')}
            className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer"
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          {/* Underline */}
          <button
            type="button"
            onClick={() => executeCommand('underline')}
            className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer"
            title="Underline"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>

          {/* Justify / Full Align */}
          <button
            type="button"
            onClick={() => executeCommand('justifyFull')}
            className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer"
            title="Justify"
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </button>

          {/* Horizontal Line */}
          <button
            type="button"
            onClick={() => executeCommand('insertHorizontalRule')}
            className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer"
            title="Horizontal Line"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-5 bg-gray-300 mx-0.5" />

          {/* Text Color Picker */}
          <div className="flex items-center gap-1 bg-white border border-gray-300 rounded px-1.5 py-1">
            <span className="font-bold underline text-xs" style={{ color: textColor }}>
              A
            </span>
            <input
              type="color"
              value={textColor}
              onChange={(e) => {
                setTextColor(e.target.value);
                executeCommand('foreColor', e.target.value);
              }}
              className="w-4 h-4 p-0 border-0 cursor-pointer bg-transparent"
              title="Text Color"
            />
          </div>

          {/* Background Highlight Color */}
          <div className="flex items-center gap-1 bg-white border border-gray-300 rounded px-1.5 py-1">
            <Palette className="w-3 h-3 text-amber-600" />
            <input
              type="color"
              defaultValue="#FEF08A"
              onChange={(e) => {
                executeCommand('hiliteColor', e.target.value);
              }}
              className="w-4 h-4 p-0 border-0 cursor-pointer bg-transparent"
              title="Highlight Background Color"
            />
          </div>

          {/* Clear Formatting */}
          <button
            type="button"
            onClick={() => executeCommand('removeFormat')}
            className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer"
            title="Clear Formatting"
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-5 bg-gray-300 mx-0.5" />

          {/* Special Character Omega Ω */}
          <button
            type="button"
            onClick={() => executeCommand('insertText', 'Ω')}
            className="p-1.5 px-2 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 font-bold cursor-pointer"
            title="Insert Special Character (Ω)"
          >
            Ω
          </button>

          {/* Outdent */}
          <button
            type="button"
            onClick={() => executeCommand('outdent')}
            className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer"
            title="Decrease Indent"
          >
            <span className="text-[10px] font-bold">⇤</span>
          </button>

          {/* Indent */}
          <button
            type="button"
            onClick={() => executeCommand('indent')}
            className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer"
            title="Increase Indent"
          >
            <span className="text-[10px] font-bold">⇥</span>
          </button>

          <span className="w-px h-5 bg-gray-300 mx-0.5" />

          {/* Undo */}
          <button
            type="button"
            onClick={() => executeCommand('undo')}
            className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>

          {/* Redo */}
          <button
            type="button"
            onClick={() => executeCommand('redo')}
            className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>

          {/* Help */}
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="p-1.5 ml-auto bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-800 cursor-pointer"
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
        <div className="text-gray-400">Press Shift+Alt+Z to toggle kitchen sink</div>
      </div>

      {/* =========================================================================
          MODALS: YOUTUBE, LINK, HELP
          ========================================================================= */}
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
                className="text-gray-400 hover:text-gray-600 p-1"
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
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowYoutubeModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs"
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
                className="text-gray-400 hover:text-gray-600 p-1"
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
                  className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0D6D62] hover:bg-[#0A5A51] text-white text-xs font-bold shadow-xs"
                >
                  Insert Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-sm font-bold text-gray-900">Editor Keyboard Shortcuts</h4>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
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
                <span>Math & Formulas</span>
                <kbd className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-mono">$...$</kbd>
              </div>
            </div>
            <div className="text-right pt-2">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-1.5 rounded-lg bg-[#0D6D62] text-white text-xs font-bold"
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
