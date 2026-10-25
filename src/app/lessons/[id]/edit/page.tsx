'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import InputField from '@/components/ui/InputField';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { lessonService } from '@/services/lesson.service';
import { uploadService } from '@/services/upload.service';
import { quizService } from '@/services/quiz.service';
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
  Image as ImageIcon,
  Mic,
  Square,
  Upload,
  HelpCircle,
  AlertCircle,
  Loader2,
  Target,
  ListChecks,
  Plus,
} from 'lucide-react';
import { FormulaToolbar } from '@/components/FormulaToolbar';
import { MathRenderer } from '@/components/MathRenderer';
import { WordPressEditor } from '@/components/WordPressEditor';

function EditLessonContent() {
  const params = useParams();
  const router = useRouter();
  const lessonId = Array.isArray(params?.id) ? params.id[0] : params?.id || '';

  const { showSuccess, showError, showModal } = useResponseModal();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Optional Lesson Learning Objectives
  const [objectives, setObjectives] = useState<string[]>([]);
  const [newObjective, setNewObjective] = useState('');

  // Optional Lesson Outlines / Agenda
  const [outlines, setOutlines] = useState<string[]>([]);
  const [newOutline, setNewOutline] = useState('');

  // Multiple Cloudinary Images (Max 10MB)
  const [images, setImages] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Voice Note per lesson (Cloudinary upload, Max 10MB)
  const [voiceNoteUrl, setVoiceNoteUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isUploadingVoiceNote, setIsUploadingVoiceNote] = useState(false);
  const [isPlayingVoiceNote, setIsPlayingVoiceNote] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const voiceNoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // Attached Quiz / Assessment
  const [availableQuizzes, setAvailableQuizzes] = useState<any[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>('');

  useEffect(() => {
    async function loadLessonAndQuizzes() {
      try {
        setIsLoading(true);
        const [lessonData, quizzesData] = await Promise.all([
          lessonService.getLessonById(lessonId),
          quizService.getAllQuizzes(),
        ]);
        setAvailableQuizzes(quizzesData || []);
        if (lessonData) {
          setTitle(lessonData.title || '');
          setContent(lessonData.content || '');
          setObjectives(lessonData.objectives || []);
          setOutlines(lessonData.outlines || []);
          setAudioUrl(lessonData.audioUrl || null);
          setImages(lessonData.images || []);
          setVoiceNoteUrl(lessonData.voiceNoteUrl || null);
          setRecordingSeconds(lessonData.voiceNoteDuration || 0);
          setSelectedQuizId(lessonData.quiz?._id || lessonData.quiz || '');
        }
      } catch (err: any) {
        showError('Load Error', err?.message || 'Failed to load lesson details.');
      } finally {
        setIsLoading(false);
      }
    }
    if (lessonId) {
      loadLessonAndQuizzes();
    }
  }, [lessonId]);

  // Multiple Image Upload to Cloudinary (Max 10MB each)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const MAX_SIZE = 10 * 1024 * 1024;
    const oversized = fileList.filter((f) => f.size > MAX_SIZE);
    if (oversized.length > 0) {
      showError(
        'File Size Exceeded',
        `Some files exceed the maximum 10MB limit (${oversized.map((f) => f.name).join(', ')}). Please select files under 10MB.`
      );
      return;
    }

    try {
      setIsUploadingImages(true);
      const res = await uploadService.uploadMultipleFiles(fileList, 'kschoolmate/lessons');
      const uploadedUrls = res.files.map((f) => f.url);
      setImages((prev) => [...prev, ...uploadedUrls]);

      // Automatically embed uploaded images directly inside the lesson content
      const imagesHtml = uploadedUrls
        .map(
          (url) =>
            `<p><img src="${url}" alt="Lesson diagram" style="max-width: 100%; height: auto; border-radius: 12px; margin: 16px 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" /></p>`
        )
        .join('\n');
      setContent((prev) => (prev ? prev + '\n' + imagesHtml : imagesHtml));

      showSuccess(
        'Images Inserted into Lesson',
        `Successfully uploaded ${res.count} image(s) to Cloudinary and inserted them directly into lesson notes.`
      );
    } catch (err: any) {
      showError('Upload Failed', err?.message || 'Failed to upload images to Cloudinary.');
    } finally {
      setIsUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Upload MP3 or Audio file for Teacher Explanation (Max 100MB)
  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (100MB Cloudinary media limit)
    const MAX_AUDIO_SIZE = 100 * 1024 * 1024; // 100MB
    if (file.size > MAX_AUDIO_SIZE) {
      showError(
        'Audio File Too Large',
        `The selected audio file (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the maximum 100MB limit.`
      );
      return;
    }

    try {
      setIsUploadingVoiceNote(true);
      const uploadRes = await uploadService.uploadFile(file, 'kschoolmate/audio');
      setVoiceNoteUrl(uploadRes.url);
      showSuccess(
        'Teacher Explanation Uploaded',
        `MP3/Audio explanation "${file.name}" uploaded successfully to Cloudinary.`
      );
    } catch (err: any) {
      showError('Audio Upload Failed', err?.message || 'Failed to upload MP3 file to Cloudinary.');
    } finally {
      setIsUploadingVoiceNote(false);
      e.target.value = '';
    }
  };

  // Voice Note Recording for Teacher Explanation
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size > 100 * 1024 * 1024) {
          showError('Voice Note Too Large', 'Voice note exceeds 100MB limit.');
          return;
        }

        try {
          setIsUploadingVoiceNote(true);
          const uploadRes = await uploadService.uploadVoiceNote(audioBlob);
          setVoiceNoteUrl(uploadRes.url);
          showSuccess('Teacher Explanation Saved', 'Teacher explanation recorded and uploaded to Cloudinary.');
        } catch (err: any) {
          showError('Voice Upload Failed', err?.message || 'Failed to upload voice note to Cloudinary.');
        } finally {
          setIsUploadingVoiceNote(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      showError('Microphone Access Error', 'Unable to access microphone. Please grant permission in browser settings.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const togglePlayVoiceNote = () => {
    if (!voiceNoteUrl) return;
    if (!voiceNoteAudioRef.current) {
      voiceNoteAudioRef.current = new Audio(voiceNoteUrl);
      voiceNoteAudioRef.current.onended = () => setIsPlayingVoiceNote(false);
    }

    if (isPlayingVoiceNote) {
      voiceNoteAudioRef.current.pause();
      setIsPlayingVoiceNote(false);
    } else {
      voiceNoteAudioRef.current.play();
      setIsPlayingVoiceNote(true);
    }
  };

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
      message: 'Are you sure you want to permanently delete this lesson and its media files?',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await lessonService.deleteLesson(lessonId);
          showSuccess('Lesson Deleted', 'The lesson has been removed from the curriculum.', () =>
            router.push('/lessons')
          );
        } catch (err: any) {
          showError('Delete Failed', err?.message || 'Failed to delete lesson.');
        }
      },
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showError('Validation Error', 'Lesson title is required.');
      return;
    }

    setIsSaving(true);
    try {
      await lessonService.updateLesson(lessonId, {
        title: title.trim(),
        content: content.trim(),
        objectives,
        outlines,
        audioUrl: audioUrl || undefined,
        images,
        voiceNoteUrl: voiceNoteUrl || undefined,
        voiceNoteDuration: recordingSeconds || undefined,
        quiz: selectedQuizId || undefined,
      });
      showSuccess('Changes Saved', 'Lesson content, Cloudinary media, and attached quiz updated successfully.', () =>
        router.push('/lessons')
      );
    } catch (err: any) {
      showError('Save Error', err?.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout
        activeNav="Lessons"
        breadcrumbs={[
          { label: 'Management', href: '/classes' },
          { label: 'Lessons', href: '/lessons' },
          { label: 'Loading Lesson...' },
        ]}
      >
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 text-[#0D6D62] animate-spin" />
          <span className="text-xs font-semibold text-gray-500">Loading lesson and assessment details...</span>
        </div>
      </AdminLayout>
    );
  }

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

            {/* Optional Lesson Objectives & Outlines Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Learning Objectives */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-[#0D6D62]" />
                    <span>Learning Objectives <span className="text-gray-400 font-normal">(Optional)</span></span>
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#0D6D62]">
                    {objectives.length} Added
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">
                  By the end of the lesson, students should be able to:
                </p>

                {/* Add Objective Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newObjective}
                    placeholder="e.g. Define a verb, Identify verbs in sentences..."
                    onChange={(e) => setNewObjective(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newObjective.trim()) {
                          setObjectives((prev) => [...prev, newObjective.trim()]);
                          setNewObjective('');
                        }
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0D6D62] bg-gray-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newObjective.trim()) {
                        setObjectives((prev) => [...prev, newObjective.trim()]);
                        setNewObjective('');
                      }
                    }}
                    className="p-2 rounded-xl bg-[#0D6D62] hover:bg-[#0A5A51] text-white text-xs font-bold transition-colors cursor-pointer"
                    title="Add Objective"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Objectives List */}
                {objectives.length > 0 ? (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pt-1">
                    {objectives.map((obj, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-gray-50 text-xs text-gray-800 border border-gray-100 group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#0D6D62] text-[10px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span>{obj}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setObjectives((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-gray-400 italic bg-gray-50 p-2.5 rounded-xl border border-dashed border-gray-200">
                    Example: 1. Define a verb • 2. Identify verbs in sentences • 3. Mention different types of verbs
                  </div>
                )}
              </div>

              {/* 2. Lesson Outlines / Agenda */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <ListChecks className="w-4 h-4 text-[#0D6D62]" />
                    <span>Lesson Outlines <span className="text-gray-400 font-normal">(Optional)</span></span>
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                    {outlines.length} Added
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Topic flow and pedagogical breakdown covered in this lesson:
                </p>

                {/* Add Outline Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newOutline}
                    placeholder="e.g. Introduction & Definition, Types of Verbs, Practice Drills..."
                    onChange={(e) => setNewOutline(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newOutline.trim()) {
                          setOutlines((prev) => [...prev, newOutline.trim()]);
                          setNewOutline('');
                        }
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0D6D62] bg-gray-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newOutline.trim()) {
                        setOutlines((prev) => [...prev, newOutline.trim()]);
                        setNewOutline('');
                      }
                    }}
                    className="p-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-colors cursor-pointer"
                    title="Add Outline"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Outlines List */}
                {outlines.length > 0 ? (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pt-1">
                    {outlines.map((otl, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-gray-50 text-xs text-gray-800 border border-gray-100 group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span>{otl}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setOutlines((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-gray-400 italic bg-gray-50 p-2.5 rounded-xl border border-dashed border-gray-200">
                    Example: Step 1: Definition • Step 2: Action vs Helping Verbs • Step 3: Sentence Formation
                  </div>
                )}
              </div>
            </div>

            {/* WordPress TinyMCE-Style Rich Editor matching provided screenshot */}
            <div className="flex flex-col gap-1.5 text-left">
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-semibold text-gray-800">
                  Lesson Content <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-gray-400">
                  Visual WYSIWYG / Text HTML & KaTeX formulas enabled
                </span>
              </div>

              <WordPressEditor
                value={content}
                onChange={(val) => setContent(val)}
                placeholder="Lesson content with rich styling and formulas..."
                onAddMedia={() => {
                  imageInputRef.current?.click();
                }}
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

            {/* Audio Management Player Card (Commented out)
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
            */}

            {/* 1. Multiple Images Upload (Cloudinary - Max 10MB each) */}
            <div className="p-5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#0D6D62]" />
                    <span>Lesson Visuals & Diagram Images ({images.length})</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Upload illustrations, chalkboard captures, or figures via Cloudinary.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-[#0D6D62] self-start sm:self-auto">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Max 10MB per file</span>
                </div>
              </div>

              {/* Upload Drop Zone */}
              <label className="border-2 border-dashed border-gray-300 hover:border-[#0D6D62] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-gray-50/50 hover:bg-emerald-50/30 transition-all">
                <input
                  ref={imageInputRef}
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleImageUpload}
                  disabled={isUploadingImages}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#0D6D62] flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-800">
                  {isUploadingImages ? 'Uploading to Cloudinary...' : 'Click or Drag images here to upload'}
                </span>
                <span className="text-[11px] text-gray-400">
                  Supported formats: PNG, JPG, WEBP, GIF (Maximum 10MB per image)
                </span>
              </label>

              {/* Uploaded Images Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {images.map((url, idx) => (
                    <div
                      key={idx}
                      className="group relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50 aspect-video flex items-center justify-center shadow-2xs"
                    >
                      <img
                        src={url}
                        alt={`Lesson visual ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                        <button
                          type="button"
                          onClick={() => {
                            const imgSnippet = `<p><img src="${url}" alt="Lesson diagram" style="max-width: 100%; height: auto; border-radius: 12px; margin: 16px 0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" /></p><p></p>`;
                            setContent((prev) => (prev ? prev + '\n' + imgSnippet : imgSnippet));
                            showSuccess('Image Inserted', 'Diagram added to lesson content.');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#0D6D62] hover:bg-[#0A5A51] text-white text-[11px] font-bold shadow-xs cursor-pointer"
                          title="Insert image into lesson content"
                        >
                          Insert
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-1 rounded-lg bg-red-600/90 hover:bg-red-700 text-white shadow-xs cursor-pointer"
                          title="Remove image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-bold text-white group-hover:hidden">
                        Cloudinary #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Teacher Explanation (Live Recording or MP3 Upload - Max 100MB) */}
            <div className="p-5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Mic className="w-4 h-4 text-[#0D6D62]" />
                    <span>Teacher Explanation</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Record live voice explanations or upload an MP3 audio file for students.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-xs font-bold text-purple-700 self-start sm:self-auto">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Max 100MB per audio file</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    disabled={isUploadingVoiceNote}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60"
                  >
                    <Mic className="w-4 h-4" />
                    <span>{voiceNoteUrl ? 'Re-record Explanation' : 'Record Explanation'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all animate-pulse cursor-pointer"
                  >
                    <Square className="w-4 h-4 text-red-400" />
                    <span>Stop Recording ({recordingSeconds}s)</span>
                  </button>
                )}

                {/* Upload MP3 File Button */}
                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 text-xs font-bold transition-colors cursor-pointer shadow-xs">
                  <Upload className="w-4 h-4 text-[#0D6D62]" />
                  <span>Upload MP3 File</span>
                  <input
                    type="file"
                    accept="audio/mp3,audio/mpeg,audio/wav,audio/m4a,audio/webm"
                    onChange={handleAudioFileUpload}
                    disabled={isUploadingVoiceNote}
                    className="hidden"
                  />
                </label>

                {isUploadingVoiceNote && (
                  <span className="text-xs font-semibold text-[#0D6D62] flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#0D6D62] border-t-transparent rounded-full animate-spin"></div>
                    Uploading Teacher Explanation to Cloudinary...
                  </span>
                )}

                {voiceNoteUrl && !isUploadingVoiceNote && (
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={togglePlayVoiceNote}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-[#0D6D62] text-xs font-bold transition-colors cursor-pointer"
                    >
                      {isPlayingVoiceNote ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      <span>{isPlayingVoiceNote ? 'Pause' : 'Listen to Teacher Explanation'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVoiceNoteUrl(null)}
                      className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Teacher Explanation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Attach Quiz / Exercise to Lesson */}
            <div className="p-5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#0D6D62]" />
                    <span>Attach Quiz / Assessment to Lesson</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Attach an interactive quiz or assessment that students take after completing this lesson.
                  </p>
                </div>
                <Link
                  href="/quizzes/new"
                  target="_blank"
                  className="text-xs font-bold text-[#0D6D62] hover:underline"
                >
                  + Create New Quiz
                </Link>
              </div>

              <select
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold text-gray-800 bg-[#FAFAFA] focus:outline-none focus:border-[#0D6D62] cursor-pointer"
              >
                <option value="">No Quiz Attached (Optional)</option>
                {availableQuizzes.map((quiz) => (
                  <option key={quiz._id} value={quiz._id}>
                    {quiz.title} ({quiz.questions?.length || 0} questions)
                  </option>
                ))}
              </select>
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
