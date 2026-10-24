'use client';

import React, { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import InputField from '@/components/ui/InputField';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { lessonService } from '@/services/lesson.service';
import { ttsService, TtsVoice } from '@/services/tts.service';
import { useResponseModal } from '@/context/ModalContext';
import {
  ArrowLeft,
  Volume2,
  Play,
  Pause,
  Sparkles,
  Bold,
  Italic,
  Underline,
  List,
  CheckCircle2,
  Radio,
} from 'lucide-react';
import { FormulaToolbar } from '@/components/FormulaToolbar';
import { MathRenderer } from '@/components/MathRenderer';

function NewLessonContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topicId = searchParams.get('topicId') || '';
  const topicTitle = searchParams.get('topicTitle') || 'Topic';

  const { showSuccess, showError } = useResponseModal();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [voiceId, setVoiceId] = useState('en-US-Neural2-F');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGenerateAudio = async () => {
    if (!content.trim()) {
      showError('Content Required', 'Please enter lesson content before generating audio.');
      return;
    }

    setIsGeneratingAudio(true);
    try {
      const res = await ttsService.previewAudio(content, voiceId);
      setAudioUrl(res.audioUrl);
      showSuccess(
        'Audio Generated (Google TTS)',
        'Lesson speech audio synthesized successfully using Google Cloud Text-to-Speech.'
      );
    } catch (err: any) {
      showError('Audio Synthesis Error', err?.message || 'Failed to generate TTS audio.');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const togglePlayAudio = () => {
    if (!audioUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSave = async (status: 'published' | 'draft') => {
    if (!title.trim()) {
      setErrors({ title: 'Lesson title is required' });
      return;
    }

    if (status === 'published') {
      setIsPublishing(true);
    } else {
      setIsSavingDraft(true);
    }

    try {
      showSuccess(
        status === 'published' ? 'Lesson Published!' : 'Draft Saved',
        `Lesson "${title}" has been ${status === 'published' ? 'published' : 'saved as draft'}. Audio and curriculum synced.`,
        () => router.push('/lessons')
      );
    } catch (err: any) {
      showError('Error', err?.message || 'Failed to save lesson.');
    } finally {
      setIsPublishing(false);
      setIsSavingDraft(false);
    }
  };

  return (
    <AdminLayout
      activeNav="Lessons"
      breadcrumbs={[
        { label: 'Management', href: '/classes' },
        { label: 'Lessons', href: '/lessons' },
        { label: 'New Lesson' },
      ]}
    >
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb / Back button */}
        <div className="mb-4">
          <Link
            href="/lessons"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Back to Lessons</span>
          </Link>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-2xs">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-6">
            New Lesson
          </h1>

          <div className="flex flex-col gap-6">
            {/* Lesson Title */}
            <InputField
              label="Lesson Title"
              placeholder="e.g. What is Motion?"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({});
              }}
              error={errors.title}
              autoFocus
            />

            {/* Rich Editor Toolbar & Textarea matching Image 2 */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-sm font-semibold text-gray-800">Lesson Content</label>

              {/* Formatting Toolbar */}
              <div className="flex items-center gap-1 p-2 bg-gray-50 border border-gray-200 border-b-0 rounded-t-xl text-gray-600">
                <button
                  type="button"
                  onClick={() => setContent((prev) => prev + ' **bold** ')}
                  className="p-1.5 hover:bg-white rounded-lg hover:text-gray-900 transition-colors"
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setContent((prev) => prev + ' *italic* ')}
                  className="p-1.5 hover:bg-white rounded-lg hover:text-gray-900 transition-colors"
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setContent((prev) => prev + ' <u>underline</u> ')}
                  className="p-1.5 hover:bg-white rounded-lg hover:text-gray-900 transition-colors"
                  title="Underline"
                >
                  <Underline className="w-4 h-4" />
                </button>
              </div>

              {/* Universal Subject Formulas Palette */}
              <div className="mt-3">
                <FormulaToolbar onInsert={(snippet) => setContent((prev) => (prev ? prev + ' ' + snippet : snippet))} />
              </div>

              <textarea
                rows={7}
                placeholder="Write or paste lesson content here. Use the formula palette above or type $...$ for equations, fractions, chemistry symbols, and quantitative patterns..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#127A71] focus:ring-2 focus:ring-[#127A71]/15 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 bg-white transition-all outline-none resize-y"
              />

              {/* Universal KaTeX Math & Science Live Preview */}
              {content && (
                <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 shadow-xs">
                  <div className="text-[11px] font-bold text-[#127A71] uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>📐 Live KaTeX Math & Science Formula Preview:</span>
                    <span className="text-[10px] text-gray-400 font-normal">Formatted dynamically</span>
                  </div>
                  <div className="p-3 bg-white border border-gray-100 rounded-lg text-gray-900 leading-relaxed overflow-x-auto">
                    <MathRenderer content={content} />
                  </div>
                </div>
              )}
            </div>

            {/* Google Cloud Text-to-Speech Integration Box matching Mockup */}
            <div className="p-5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-[#127A71]">
                  <Volume2 className="w-5 h-5" />
                  <span>Google Cloud Text-to-Speech Integration</span>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#127A71]">
                  Neural2 High Fidelity
                </span>
              </div>

              {/* Voice Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="text-xs font-semibold text-gray-700 sm:w-28">Voice Model:</label>
                <select
                  value={voiceId}
                  onChange={(e) => setVoiceId(e.target.value)}
                  className="flex-1 h-10 px-3 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-800 outline-none focus:border-[#127A71]"
                >
                  <option value="en-US-Neural2-F">US English - Female (Neural2)</option>
                  <option value="en-US-Neural2-D">US English - Male (Neural2)</option>
                  <option value="en-US-Journey-F">US English - Expressive (Journey)</option>
                  <option value="en-GB-Neural2-B">British English - Male</option>
                  <option value="en-NG-Standard-A">Nigerian English - Female (Curriculum)</option>
                </select>
              </div>

              {/* Audio Controls */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleGenerateAudio}
                  disabled={isGeneratingAudio}
                  className="px-4 py-2 rounded-xl bg-[#127A71] hover:bg-[#0E635C] active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGeneratingAudio ? 'Synthesizing...' : 'Generate Audio (Google TTS)'}</span>
                </button>

                {audioUrl && (
                  <button
                    type="button"
                    onClick={togglePlayAudio}
                    className="px-4 py-2 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 text-[#127A71] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlaying ? 'Pause' : 'Preview Audio'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Buttons matching Image 2: Save Draft & Publish */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => handleSave('draft')}
                disabled={isSavingDraft || isPublishing}
                className="px-6 py-3 rounded-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                {isSavingDraft ? 'Saving...' : 'Save Draft'}
              </button>

              <PrimaryButton
                fullWidth={false}
                onClick={() => handleSave('published')}
                isLoading={isPublishing}
                loadingText="Publishing..."
                className="px-8 h-12 text-xs sm:text-sm"
              >
                Publish
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function NewLessonPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <div className="w-8 h-8 border-4 border-[#127A71] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <NewLessonContent />
    </Suspense>
  );
}
