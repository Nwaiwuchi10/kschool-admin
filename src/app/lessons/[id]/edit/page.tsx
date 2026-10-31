'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import InputField from '@/components/ui/InputField';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { lessonService } from '@/services/lesson.service';
import { uploadService } from '@/services/upload.service';
import { exerciseService, Exercise } from '@/services/exercise.service';
import { subjectService } from '@/services/subject.service';
import { classService } from '@/services/class.service';
import { Subject, SchoolClass } from '@/types/curriculum.types';
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
  BookOpen,
  GraduationCap,
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

  // Attached Exercises / Quizzes for this lesson (multi-select list)
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);

  // Curriculum Linking: Subjects, Topics & Classes
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [availableClasses, setAvailableClasses] = useState<SchoolClass[]>([]);
  const [subjectTopics, setSubjectTopics] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  const toggleClass = (className: string) => {
    setSelectedClasses((prev) =>
      prev.includes(className) ? prev.filter((c) => c !== className) : [...prev, className]
    );
  };

  useEffect(() => {
    async function loadLessonAndFilters() {
      try {
        setIsLoading(true);
        const [lessonData, exercisesData, subList, clsList] = await Promise.all([
          lessonService.getLessonById(lessonId),
          exerciseService.getAllExercises(),
          subjectService.getSubjects(),
          classService.getClasses(),
        ]);
        setAvailableExercises(exercisesData || []);
        setAvailableSubjects(subList || []);
        setAvailableClasses(clsList || []);

        if (lessonData) {
          setTitle(lessonData.title || '');
          setContent(lessonData.content || '');
          setObjectives(lessonData.objectives || []);
          setOutlines(lessonData.outlines || []);
          setAudioUrl(lessonData.audioUrl || null);
          setImages(lessonData.images || []);
          setVoiceNoteUrl(lessonData.voiceNoteUrl || null);
          setRecordingSeconds(lessonData.voiceNoteDuration || 0);

          // Extract existing linked subject and topic
          const firstSubj = Array.isArray(lessonData.subjects) && lessonData.subjects.length > 0
            ? lessonData.subjects[0]
            : lessonData.subject;
          const subjId = firstSubj?._id || firstSubj || '';
          const cleanSubjId = typeof subjId === 'string' ? subjId : String(subjId);
          setSelectedSubjectId(cleanSubjId);

          const existingTopic = lessonData.topic?._id || lessonData.topic || '';
          setSelectedTopicId(typeof existingTopic === 'string' ? existingTopic : String(existingTopic));

          if (cleanSubjId) {
            try {
              const fullSubj = await subjectService.getSubjectById(cleanSubjId);
              if (fullSubj && Array.isArray(fullSubj.topics)) {
                setSubjectTopics(fullSubj.topics);
              }
            } catch (e) {
              console.warn('Could not load subject topics', e);
            }
          }

          // Extract existing linked classes
          if (Array.isArray(lessonData.classes) && lessonData.classes.length > 0) {
            setSelectedClasses(lessonData.classes);
          } else if (lessonData.classLevel) {
            setSelectedClasses([lessonData.classLevel]);
          }

          // Extract existing attached exercises or fallback to single quiz
          const existingIds: string[] = [];
          if (Array.isArray(lessonData.exercises) && lessonData.exercises.length > 0) {
            lessonData.exercises.forEach((ex: any) => {
              const id = ex?._id || ex;
              if (id) existingIds.push(id.toString());
            });
          }
          if (lessonData.quiz) {
            const qId = (lessonData.quiz?._id || lessonData.quiz).toString();
            if (!existingIds.includes(qId)) {
              existingIds.push(qId);
            }
          }
          setSelectedExerciseIds(existingIds);
        }
      } catch (err: any) {
        showError('Load Error', err?.message || 'Failed to load lesson details.');
      } finally {
        setIsLoading(false);
      }
    }
    if (lessonId) {
      loadLessonAndFilters();
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

      // Automatically embed uploaded images directly inside the lesson content as compact cards with delete button
      const imagesHtml = uploadedUrls
        .map(
          (url) =>
            `<span class="lesson-inline-img-wrapper" contenteditable="false" style="display: inline-block; position: relative; margin: 8px 10px 8px 0; vertical-align: top; max-width: 200px; border-radius: 10px; overflow: hidden; border: 1px solid #E5E7EB; box-shadow: 0 1px 3px rgba(0,0,0,0.08); background: #FAFAFA;"><img src="${url}" alt="Lesson diagram" style="display: block; width: 100%; max-height: 140px; object-fit: contain; background: #FFF;" /><button type="button" class="img-delete-btn" title="Delete image from content" style="position: absolute; top: 4px; right: 4px; width: 22px; height: 22px; background: rgba(220,38,38,0.9); color: white; border-radius: 9999px; border: none; font-size: 13px; font-weight: bold; line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.25);">✕</button></span> `
        )
        .join(' ');
      setContent((prev) => (prev ? prev + ' ' + imagesHtml : imagesHtml));

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
        subjectId: selectedSubjectId || undefined,
        subjects: selectedSubjectId ? [selectedSubjectId] : [],
        topicId: selectedTopicId || undefined,
        classes: selectedClasses,
        objectives,
        outlines,
        audioUrl: audioUrl || undefined,
        images,
        voiceNoteUrl: voiceNoteUrl || undefined,
        voiceNoteDuration: recordingSeconds || undefined,
        exercises: selectedExerciseIds,
        quiz: selectedExerciseIds.length > 0 ? selectedExerciseIds[0] : undefined,
      });
      showSuccess('Changes Saved', 'Lesson content, curriculum links, Cloudinary media, and attached exercises updated successfully.', () =>
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

            {/* Curriculum Linking: Subject, Topic & Classes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200/80">
              {/* Linked Subject */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#0D6D62]" />
                  <span>Curriculum Subject (Optional)</span>
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={async (e) => {
                    const subId = e.target.value;
                    setSelectedSubjectId(subId);
                    setSelectedTopicId('');
                    const found = availableSubjects.find((s) => s._id === subId);
                    if (found && found.classes && found.classes.length > 0) {
                      // Automatically inherit linked classes from the subject if not set
                      setSelectedClasses(found.classes);
                    }
                    if (subId) {
                      try {
                        const full = await subjectService.getSubjectById(subId);
                        setSubjectTopics(full?.topics || []);
                      } catch {
                        setSubjectTopics([]);
                      }
                    } else {
                      setSubjectTopics([]);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-[#0D6D62] bg-white cursor-pointer"
                >
                  <option value="">Standalone Lesson (Not tied to a specific subject)</option>
                  {availableSubjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} {s.classLevel ? `(${s.classLevel})` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400">
                  Select a subject to catalog this lesson under its syllabus.
                </p>
              </div>

              {/* Linked Topic under selected subject */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#0D6D62]" />
                  <span>Syllabus Topic (Included Lessons)</span>
                </label>
                <select
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                  disabled={!selectedSubjectId}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-[#0D6D62] bg-white cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!selectedSubjectId
                      ? 'Select a subject first...'
                      : subjectTopics.length === 0
                      ? 'Default (Auto-linked to General Topic)'
                      : 'Choose specific syllabus topic...'}
                  </option>
                  {subjectTopics.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.title}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400">
                  Select the exact topic where this lesson appears in the mobile app.
                </p>
              </div>

              {/* Linked Classes Multi-select */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#0D6D62]" />
                    <span>Target Classes ({selectedClasses.length})</span>
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedClasses(availableClasses.map((c) => c.name))}
                      className="text-[11px] font-bold text-[#0D6D62] hover:underline cursor-pointer"
                    >
                      All
                    </button>
                    <span className="text-gray-300">•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedClasses([])}
                      className="text-[11px] font-bold text-gray-500 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl p-2.5 bg-white max-h-36 overflow-y-auto space-y-1.5">
                  {availableClasses.length === 0 ? (
                    <span className="text-xs text-gray-400">No classes registered</span>
                  ) : (
                    availableClasses.map((cls) => {
                      const isChecked = selectedClasses.includes(cls.name);
                      return (
                        <label
                          key={cls._id}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-[#E6F7F3] text-[#0D6D62] border border-[#A6E6D8]'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleClass(cls.name)}
                            className="w-3.5 h-3.5 text-[#0D6D62] rounded border-gray-300 focus:ring-[#0D6D62] cursor-pointer"
                          />
                          <span>{cls.name}</span>
                        </label>
                      );
                    })
                  )}
                </div>
                <p className="text-[11px] text-gray-400">
                  Select which grades or classes can view and study this lesson.
                </p>
              </div>
            </div>

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

              {/* Universal Formatted Lesson Live Preview */}
              {content && (
                <div className="mt-4 p-5 bg-gradient-to-b from-teal-50/40 to-slate-50 border border-teal-200/80 rounded-2xl text-xs sm:text-sm text-slate-800 shadow-xs">
                  <div className="text-[12px] font-bold text-[#0D6D62] uppercase tracking-wider mb-3 flex items-center justify-between pb-2 border-b border-teal-100">
                    <span className="flex items-center gap-1.5">
                      <span>✨ Formatted Lesson Preview (Mobile & Web View)</span>
                    </span>
                    <span className="text-[11px] text-teal-600 font-medium bg-teal-100/70 px-2 py-0.5 rounded-full">
                      Auto-styled Rich Text & Formulas
                    </span>
                  </div>
                  <div className="p-4 sm:p-6 bg-white border border-gray-100 rounded-xl text-gray-900 leading-relaxed shadow-xs overflow-x-auto">
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
                            const imgSnippet = `<span class="lesson-inline-img-wrapper" contenteditable="false" style="display: inline-block; position: relative; margin: 8px 10px 8px 0; vertical-align: top; max-width: 200px; border-radius: 10px; overflow: hidden; border: 1px solid #E5E7EB; box-shadow: 0 1px 3px rgba(0,0,0,0.08); background: #FAFAFA;"><img src="${url}" alt="Lesson diagram" style="display: block; width: 100%; max-height: 140px; object-fit: contain; background: #FFF;" /><button type="button" class="img-delete-btn" title="Delete image from content" style="position: absolute; top: 4px; right: 4px; width: 22px; height: 22px; background: rgba(220,38,38,0.9); color: white; border-radius: 9999px; border: none; font-size: 13px; font-weight: bold; line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.25);">✕</button></span> `;
                            setContent((prev) => (prev ? prev + ' ' + imgSnippet : imgSnippet));
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

            {/* 3. Attach Exercises / Quizzes to Lesson */}
            <div className="p-5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#0D6D62]" />
                    <span>Attach Exercises / Quizzes to Lesson</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Select one or more practice exercises to attach to this lesson. Students can solve them to test their understanding.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#E6F7F3] text-[#0D6D62]">
                    {selectedExerciseIds.length} Attached
                  </span>
                  <Link
                    href="/exercises/new"
                    target="_blank"
                    className="text-xs font-bold text-[#0D6D62] hover:underline"
                  >
                    + Create Exercise
                  </Link>
                </div>
              </div>

              {availableExercises.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 text-center text-xs text-gray-500">
                  No exercises created yet.{' '}
                  <Link href="/exercises/new" target="_blank" className="text-[#0D6D62] font-bold underline">
                    Create an exercise
                  </Link>{' '}
                  to attach to this lesson.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto p-1">
                  {availableExercises.map((exercise) => {
                    const isSelected = selectedExerciseIds.includes(exercise._id || '');
                    return (
                      <div
                        key={exercise._id}
                        onClick={() => {
                          if (!exercise._id) return;
                          if (isSelected) {
                            setSelectedExerciseIds((prev) => prev.filter((id) => id !== exercise._id));
                          } else {
                            setSelectedExerciseIds((prev) => [...prev, exercise._id!]);
                          }
                        }}
                        className={`flex items-start gap-2.5 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#E6F7F3] border-[#0D6D62] shadow-2xs'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // handled by parent div
                          className="mt-0.5 w-4 h-4 rounded text-[#0D6D62] focus:ring-[#0D6D62] cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{exercise.title}</p>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                            <span className="font-medium text-[#0D6D62]">
                              {exercise.questions?.length || 0} Questions
                            </span>
                            <span>•</span>
                            <span>{exercise.classLevel || 'General'}</span>
                            {exercise.subject && (
                              <>
                                <span>•</span>
                                <span className="truncate">{exercise.subject}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
