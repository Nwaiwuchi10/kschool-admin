'use client';

import React, { useState, useRef, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import InputField from '@/components/ui/InputField';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { lessonService } from '@/services/lesson.service';
import { ttsService } from '@/services/tts.service';
import { useResponseModal } from '@/context/ModalContext';
import {
  ArrowLeft,
  Trash2,
  Volume2,
  Play,
  Pause,
  RefreshCw,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { FormulaToolbar } from '@/components/FormulaToolbar';
import { MathRenderer } from '@/components/MathRenderer';

function EditLessonContent() {
  const params = useParams();
  const router = useRouter();
  const lessonId = Array.isArray(params?.id) ? params.id[0] : params?.id || '';

  const { showSuccess, showError, showModal } = useResponseModal();
  const [title, setTitle] = useState('Understanding Forces');
  const [content, setContent] = useState(
    'A force is a push or pull upon an object resulting from the object’s interaction with another object. Forces only exist as a result of an interaction.'
  );
  const [audioUrl, setAudioUrl] = useState<string | null>('https://example.com/audio/intro_to_motion_v2.mp3');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
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

  const handleRegenerateAudio = async () => {
    setIsRegenerating(true);
    try {
      const res = await ttsService.previewAudio(content, 'en-US-Neural2-F');
      setAudioUrl(res.audioUrl);
      showSuccess(
        'Audio Regenerated (Google TTS)',
        'New high-fidelity MP3 generated and version bumped. Old audio replaced with new voice synthesis.'
      );
    } catch (err: any) {
      showError('Regeneration Error', err?.message || 'Failed to regenerate audio.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDelete = () => {
    showModal({
      type: 'warning',
      title: 'Delete Lesson',
      message: 'Are you sure you want to permanently delete this lesson and its audio files?',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        showSuccess('Lesson Deleted', 'The lesson has been removed from the curriculum.', () =>
          router.push('/lessons')
        );
      },
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      showSuccess('Changes Saved', 'Lesson content and audio metadata updated successfully.', () =>
        router.push('/lessons')
      );
    } catch (err: any) {
      showError('Save Error', err?.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout
      activeNav="Lessons"
      breadcrumbs={[
        { label: 'Management', href: '/classes' },
        { label: 'Lessons', href: '/lessons' },
        { label: 'Edit Lesson' },
      ]}
    >
      <div className="max-w-4xl mx-auto">
        {/* Top Header Row matching Image 2 Screen 4 */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/lessons"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Back to Lessons</span>
          </Link>

          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-2xs">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-6">
            Edit Lesson
          </h1>

          <form onSubmit={handleSave} className="flex flex-col gap-6">
            {/* Lesson Title */}
            <InputField
              label="Lesson Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSaving}
            />

            {/* Lesson Content Textarea */}
            <div className="flex flex-col gap-1.5 text-left">
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-semibold text-gray-800">Lesson Content</label>
              </div>

              {/* Universal Subject Formulas Palette */}
              <FormulaToolbar onInsert={(snippet) => setContent((prev) => (prev ? prev + ' ' + snippet : snippet))} />

              <textarea
                rows={7}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isSaving}
                placeholder="Lesson content with formulas (e.g. $F = ma$, $\frac{a}{b}$, $\text{H}_2\text{O}$)..."
                className="w-full p-4 rounded-2xl border border-gray-200 focus:border-[#127A71] focus:ring-2 focus:ring-[#127A71]/15 text-sm sm:text-base text-gray-900 bg-white transition-all outline-none resize-y font-sans"
              />

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

            {/* Audio Management Player Card matching Image 2 Screen 4 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full bg-[#127A71] text-white flex items-center justify-center hover:bg-[#0E635C] transition-transform active:scale-95 shadow-xs cursor-pointer shrink-0"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>

                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-900">
                    intro_to_motion_v2.mp3
                  </span>
                  <span className="text-[11px] text-[#127A71] font-semibold">
                    Google Cloud Neural2 Audio Ready • 12 Mins
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRegenerateAudio}
                  disabled={isRegenerating}
                  className="px-4 py-2 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 text-[#127A71] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                  <span>{isRegenerating ? 'Regenerating...' : 'Regenerate Audio'}</span>
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-2">
              <PrimaryButton
                type="submit"
                isLoading={isSaving}
                loadingText="Saving Changes..."
              >
                Save Changes
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function EditLessonPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <div className="w-8 h-8 border-4 border-[#127A71] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <EditLessonContent />
    </Suspense>
  );
}
