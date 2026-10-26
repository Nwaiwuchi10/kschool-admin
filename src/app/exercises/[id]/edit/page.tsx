'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { exerciseService, Exercise, ExerciseQuestion } from '@/services/exercise.service';
import { classService } from '@/services/class.service';
import { subjectService } from '@/services/subject.service';
import { lessonService } from '@/services/lesson.service';
import { SchoolClass, Subject } from '@/types/curriculum.types';
import { useResponseModal } from '@/context/ModalContext';
import { FormulaToolbar } from '@/components/FormulaToolbar';
import { MathRenderer } from '@/components/MathRenderer';
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  FileQuestion,
  HelpCircle,
  Clock,
  Award,
  Loader2,
} from 'lucide-react';

function EditExerciseContent() {
  const params = useParams();
  const router = useRouter();
  const exerciseId = Array.isArray(params?.id) ? params.id[0] : params?.id || '';
  const { showSuccess, showError, showModal } = useResponseModal();

  // Metadata state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [lesson, setLesson] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [points, setPoints] = useState(10);
  const [estimatedMinutes, setEstimatedMinutes] = useState(15);

  // Dynamic dropdown lists
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [availableLessons, setAvailableLessons] = useState<Array<{ id: string; title: string }>>([]);

  // Questions state
  const [questions, setQuestions] = useState<ExerciseQuestion[]>([
    {
      questionText: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      hint: '',
      explanation: '',
    },
  ]);

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing exercise details & classes
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [exerciseData, clsList] = await Promise.all([
          exerciseService.getExerciseById(exerciseId),
          classService.getClasses(),
        ]);
        setClasses(clsList || []);
        if (exerciseData) {
          setTitle(exerciseData.title || '');
          setDescription(exerciseData.description || '');
          setClassLevel(exerciseData.classLevel || '');
          setSubject(exerciseData.subject || '');
          setTopic(exerciseData.topic || '');
          
          let resolvedLesson = exerciseData.lesson || '';
          // If lesson was saved as a 24-character hexadecimal MongoDB ObjectId, resolve its human-readable title
          if (resolvedLesson && /^[a-fA-F0-9]{24}$/.test(resolvedLesson.trim())) {
            try {
              const lessonObj = await lessonService.getLessonById(resolvedLesson.trim());
              if (lessonObj?.title) {
                resolvedLesson = lessonObj.title;
              }
            } catch {
              // Keep original if lookup fails
            }
          }
          setLesson(resolvedLesson);
          setStatus((exerciseData.status as any) || 'published');
          setPoints(exerciseData.points || 10);
          setEstimatedMinutes(exerciseData.estimatedMinutes || 15);
          if (exerciseData.questions && exerciseData.questions.length > 0) {
            setQuestions(exerciseData.questions);
          }
        }
      } catch (err: any) {
        showError('Load Error', err?.message || 'Failed to fetch exercise for editing.');
      } finally {
        setIsLoading(false);
      }
    }
    if (exerciseId) {
      loadData();
    }
  }, [exerciseId]);

  // Load subjects when classLevel changes
  useEffect(() => {
    async function fetchSubjects() {
      if (!classLevel) return;
      try {
        const subjs = await subjectService.getSubjects(classLevel);
        setSubjects(subjs || []);
        if (subjs && subjs.length > 0) {
          const currentSub = subjs.find((s) => s.name === subject) || subjs[0];
          const topList = currentSub.topics?.map((t) => t.title) || [];
          setAvailableTopics(topList);
        }
      } catch (err) {
        console.warn('Failed to load subjects for class:', err);
      }
    }
    fetchSubjects();
  }, [classLevel, subject]);

  // Load lessons dynamically whenever classLevel or subject changes
  useEffect(() => {
    async function fetchLessons() {
      try {
        const foundSubj = subjects.find((s) => s.name === subject);
        let lessonsData: any[] = [];
        if (classLevel) {
          lessonsData = await lessonService.getAllLessons({
            classLevel,
            subjectId: foundSubj?._id,
          });
        }

        if (!Array.isArray(lessonsData) || lessonsData.length === 0) {
          lessonsData = await lessonService.getAllLessons();
        }

        const formattedMap = new Map<string, { id: string; title: string }>();

        if (Array.isArray(lessonsData)) {
          lessonsData.forEach((l: any) => {
            const id = l._id || l.id;
            const title = l.title || 'Untitled Lesson';
            if (id) {
              formattedMap.set(id, { id, title });
            }
          });
        }

        foundSubj?.topics?.forEach((t: any) => {
          t.lessons?.forEach((l: any) => {
            if (typeof l === 'string') {
              formattedMap.set(l, { id: l, title: l });
            } else if (l?.title) {
              const id = l._id || l.title;
              formattedMap.set(id, { id, title: l.title });
            }
          });
        });

        setAvailableLessons(Array.from(formattedMap.values()));
      } catch (err) {
        console.warn('Failed to load lessons for exercise:', err);
        setAvailableLessons([]);
      }
    }
    fetchLessons();
  }, [classLevel, subject, subjects]);

  const currentQ = questions[activeQuestionIndex] || questions[0];

  const updateCurrentQuestion = (field: keyof ExerciseQuestion, value: any) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[activeQuestionIndex] = { ...copy[activeQuestionIndex], [field]: value };
      return copy;
    });
  };

  const updateOptionText = (optIndex: number, text: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const newOpts = [...copy[activeQuestionIndex].options];
      newOpts[optIndex] = text;
      copy[activeQuestionIndex] = { ...copy[activeQuestionIndex], options: newOpts };
      return copy;
    });
  };

  const handleAddOption = () => {
    setQuestions((prev) => {
      const copy = [...prev];
      const cur = { ...copy[activeQuestionIndex] };
      cur.options = [...cur.options, ''];
      copy[activeQuestionIndex] = cur;
      return copy;
    });
  };

  const handleRemoveOption = (optionIndex: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const cur = { ...copy[activeQuestionIndex] };
      if (cur.options.length <= 2) {
        showError('Minimum Options', 'A question must have at least 2 options (e.g. Yes / No).');
        return prev;
      }
      const newOptions = cur.options.filter((_, idx) => idx !== optionIndex);
      let newCorrectIndex = cur.correctOptionIndex;
      if (newCorrectIndex === optionIndex) {
        newCorrectIndex = 0;
      } else if (newCorrectIndex > optionIndex) {
        newCorrectIndex -= 1;
      }
      cur.options = newOptions;
      cur.correctOptionIndex = newCorrectIndex;
      copy[activeQuestionIndex] = cur;
      return copy;
    });
  };

  const handleSetPresetOptions = (preset: 'yes_no' | 'true_false' | 'standard_4') => {
    setQuestions((prev) => {
      const copy = [...prev];
      const cur = { ...copy[activeQuestionIndex] };
      if (preset === 'yes_no') {
        cur.options = ['Yes', 'No'];
      } else if (preset === 'true_false') {
        cur.options = ['True', 'False'];
      } else if (preset === 'standard_4') {
        cur.options = ['', '', '', ''];
      }
      cur.correctOptionIndex = 0;
      copy[activeQuestionIndex] = cur;
      return copy;
    });
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        hint: '',
        explanation: '',
      },
    ]);
    setActiveQuestionIndex(questions.length);
  };

  const removeQuestion = (idx: number) => {
    if (questions.length <= 1) {
      showError('Action Denied', 'Exercise must contain at least one question.');
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
    if (activeQuestionIndex >= idx && activeQuestionIndex > 0) {
      setActiveQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showError('Validation Error', 'Exercise title is required.');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].questionText.trim()) {
        showError('Validation Error', `Question #${i + 1} is empty.`);
        setActiveQuestionIndex(i);
        return;
      }
      for (let j = 0; j < questions[i].options.length; j++) {
        if (!questions[i].options[j].trim()) {
          showError('Validation Error', `Option ${String.fromCharCode(65 + j)} in Question #${i + 1} is empty.`);
          setActiveQuestionIndex(i);
          return;
        }
      }
    }

    try {
      setIsSubmitting(true);
      await exerciseService.updateExercise(exerciseId, {
        title: title.trim(),
        description: description.trim(),
        classLevel,
        subject,
        topic: topic.trim(),
        lesson: lesson.trim(),
        status,
        points: Number(points),
        estimatedMinutes: Number(estimatedMinutes),
        questions,
      });

      showSuccess(
        'Exercise Updated!',
        `"${title}" has been updated with ${questions.length} questions.`,
        () => router.push(`/exercises/${exerciseId}`)
      );
    } catch (err: any) {
      showError('Update Failed', err?.message || 'Could not update exercise.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    showModal({
      type: 'warning',
      title: 'Delete Exercise',
      message: `Are you sure you want to delete "${title}"? This cannot be undone.`,
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await exerciseService.deleteExercise(exerciseId);
          showSuccess('Exercise Deleted', 'The exercise has been removed.', () => {
            router.push('/exercises');
          });
        } catch (err: any) {
          showError('Delete Failed', err?.message || 'Failed to delete exercise.');
        }
      },
    });
  };

  if (isLoading) {
    return (
      <AdminLayout
        activeNav="Exercises"
        breadcrumbs={[
          { label: 'Management', href: '/classes' },
          { label: 'Exercises', href: '/exercises' },
          { label: 'Loading...' },
        ]}
      >
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 text-[#0D6D62] animate-spin" />
          <span className="text-xs font-semibold text-gray-500">Loading exercise details...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      activeNav="Exercises"
      breadcrumbs={[
        { label: 'Management', href: '/classes' },
        { label: 'Exercises', href: '/exercises' },
        { label: title || 'Exercise', href: `/exercises/${exerciseId}` },
        { label: 'Edit' },
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Link & Header */}
        <div className="flex items-center justify-between">
          <Link
            href={`/exercises/${exerciseId}`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Cancel & Back</span>
          </Link>

          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-2xs space-y-5">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Edit Exercise / Worksheet
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Exercise Title <span className="text-emerald-700">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Motion and Force Practice Problems"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Instructions / Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional guidance for students taking this exercise..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA]"
                />
              </div>

              {/* Class */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Target Class</label>
                <select
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-[#0D6D62] bg-white cursor-pointer"
                >
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls.name}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-[#0D6D62] bg-white cursor-pointer"
                >
                  {subjects.map((sub) => (
                    <option key={sub._id} value={sub.name}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Topic (Optional)
                </label>
                {availableTopics.length > 0 ? (
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-[#0D6D62] bg-white cursor-pointer"
                  >
                    <option value="">-- None / General --</option>
                    {availableTopics.map((t, idx) => (
                      <option key={idx} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="e.g. Algebraic Expressions"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA]"
                  />
                )}
              </div>

              {/* Associated Lesson */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Associated Lesson (Optional)
                </label>
                <select
                  value={lesson}
                  onChange={(e) => setLesson(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-[#0D6D62] bg-white cursor-pointer"
                >
                  <option value="">-- None / Standalone Exercise --</option>
                  {availableLessons.map((l) => (
                    <option key={l.id} value={l.title}>
                      {l.title}
                    </option>
                  ))}
                  {/* Keep current custom lesson title selected if not in availableLessons list and not an ObjectId */}
                  {lesson &&
                    !/^[a-fA-F0-9]{24}$/.test(lesson.trim()) &&
                    !availableLessons.some((l) => l.title === lesson || l.id === lesson) && (
                      <option value={lesson}>{lesson}</option>
                    )}
                </select>
              </div>

              {/* Points & Time */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Total Points</label>
                  <input
                    type="number"
                    min="1"
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA]"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Minutes</label>
                  <input
                    type="number"
                    min="1"
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA]"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-[#0D6D62] bg-white cursor-pointer"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Questions Tabs & Editor Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                {questions.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveQuestionIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      activeQuestionIndex === idx
                        ? 'bg-[#0D6D62] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Q{idx + 1}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={addQuestion}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-[#0D6D62] hover:bg-emerald-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question</span>
                </button>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(activeQuestionIndex)}
                    className="p-1.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Remove Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Current Question Edit Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Question #{activeQuestionIndex + 1} Text
                </label>
                <FormulaToolbar
                  onInsert={(snippet) =>
                    updateCurrentQuestion(
                      'questionText',
                      currentQ.questionText ? currentQ.questionText + ' ' + snippet : snippet
                    )
                  }
                />
                <textarea
                  rows={3}
                  value={currentQ.questionText}
                  onChange={(e) => updateCurrentQuestion('questionText', e.target.value)}
                  placeholder="Type question text here (KaTeX $...$ supported)..."
                  className="w-full p-3.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA]"
                />
                {currentQ.questionText && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 mt-2">
                    <span className="font-bold text-[#0D6D62] mr-2">Preview:</span>
                    <MathRenderer content={currentQ.questionText} />
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700">
                      Answer Options ({currentQ.options.length} options)
                    </label>
                    <p className="text-[11px] text-gray-400">
                      Click radio button to mark correct answer. Add or remove options as needed (minimum 2 options).
                    </p>
                  </div>

                  {/* Quick Presets */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-semibold text-gray-400 mr-1">Presets:</span>
                    <button
                      type="button"
                      onClick={() => handleSetPresetOptions('yes_no')}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-teal-50 text-[#0D6D62] hover:bg-teal-100 transition-colors cursor-pointer"
                    >
                      Yes / No
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetPresetOptions('true_false')}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      True / False
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetPresetOptions('standard_4')}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      4 Options (A-D)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {currentQ.options.map((opt, oIdx) => {
                    const isCorrect = currentQ.correctOptionIndex === oIdx;
                    return (
                      <div
                        key={oIdx}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                          isCorrect
                            ? 'bg-[#E6F7F3] border-[#0D6D62]'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => updateCurrentQuestion('correctOptionIndex', oIdx)}
                          className="shrink-0 cursor-pointer"
                          title={isCorrect ? 'Correct Answer' : 'Click to mark as correct'}
                        >
                          {isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-[#0D6D62]" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300 hover:text-gray-400" />
                          )}
                        </button>
                        <span className="text-xs font-bold text-gray-500 w-4">
                          {String.fromCharCode(65 + oIdx)}.
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => updateOptionText(oIdx, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + oIdx)} (e.g. Yes, No, or Answer text)...`}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-[#0D6D62] bg-white"
                        />
                        {/* Remove Option Button (if > 2 options) */}
                        {currentQ.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(oIdx)}
                            className="text-gray-300 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer"
                            title="Remove this option"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Add Option Button */}
                <div className="flex items-center justify-start pt-1">
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-[#0D6D62] text-[#0D6D62] hover:bg-emerald-50 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Option ({String.fromCharCode(65 + currentQ.options.length)})</span>
                  </button>
                </div>
              </div>

              {/* Hint & Explanation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Student Hint (Optional)
                  </label>
                  <input
                    type="text"
                    value={currentQ.hint || ''}
                    onChange={(e) => updateCurrentQuestion('hint', e.target.value)}
                    placeholder="e.g. Recall Newton's 2nd law..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Solution Explanation (Optional)
                  </label>
                  <input
                    type="text"
                    value={currentQ.explanation || ''}
                    onChange={(e) => updateCurrentQuestion('explanation', e.target.value)}
                    placeholder="Detailed explanation displayed after answer..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href={`/exercises/${exerciseId}`}
              className="px-6 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </Link>
            <PrimaryButton
              type="submit"
              isLoading={isSubmitting}
              loadingText="Updating Exercise..."
              className="px-8"
            >
              Save Exercise Changes
            </PrimaryButton>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export default function EditExercisePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <Loader2 className="w-8 h-8 text-[#0D6D62] animate-spin" />
        </div>
      }
    >
      <EditExerciseContent />
    </Suspense>
  );
}
