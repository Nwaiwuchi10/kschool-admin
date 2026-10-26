'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { exerciseService, Exercise } from '@/services/exercise.service';
import { lessonService } from '@/services/lesson.service';
import { useResponseModal } from '@/context/ModalContext';
import { MathRenderer } from '@/components/MathRenderer';
import {
  ArrowLeft,
  FileEdit,
  Edit,
  Trash2,
  Clock,
  Award,
  BookOpen,
  GraduationCap,
  Layers,
  HelpCircle,
  CheckCircle2,
  Circle,
  Loader2,
} from 'lucide-react';

function ViewExerciseContent() {
  const params = useParams();
  const router = useRouter();
  const exerciseId = Array.isArray(params?.id) ? params.id[0] : params?.id || '';
  const { showSuccess, showError, showModal } = useResponseModal();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadExercise() {
      try {
        setIsLoading(true);
        const data = await exerciseService.getExerciseById(exerciseId);
        if (data && data.lesson && /^[a-fA-F0-9]{24}$/.test(data.lesson.trim())) {
          try {
            const lessonObj = await lessonService.getLessonById(data.lesson.trim());
            if (lessonObj?.title) {
              data.lesson = lessonObj.title;
            }
          } catch {
            // Keep original if lookup fails
          }
        }
        setExercise(data);
      } catch (err: any) {
        showError('Load Error', err?.message || 'Failed to fetch exercise details.');
      } finally {
        setIsLoading(false);
      }
    }
    if (exerciseId) {
      loadExercise();
    }
  }, [exerciseId]);

  const handleDelete = () => {
    if (!exercise) return;
    showModal({
      type: 'warning',
      title: 'Delete Exercise',
      message: `Are you sure you want to permanently delete "${exercise.title}"? This action cannot be undone.`,
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await exerciseService.deleteExercise(exerciseId);
          showSuccess('Exercise Deleted', 'The practice sheet was removed successfully.', () => {
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
          { label: 'Loading Exercise...' },
        ]}
      >
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 text-[#0D6D62] animate-spin" />
          <span className="text-xs font-semibold text-gray-500">Loading exercise details...</span>
        </div>
      </AdminLayout>
    );
  }

  if (!exercise) {
    return (
      <AdminLayout
        activeNav="Exercises"
        breadcrumbs={[
          { label: 'Management', href: '/classes' },
          { label: 'Exercises', href: '/exercises' },
          { label: 'Not Found' },
        ]}
      >
        <div className="p-8 text-center space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Exercise Not Found</h2>
          <Link
            href="/exercises"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D6D62] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Exercises</span>
          </Link>
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
        { label: exercise.title },
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Link & Action Buttons */}
        <div className="flex items-center justify-between">
          <Link
            href="/exercises"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Back to Exercises</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={`/exercises/${exerciseId}/edit`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:border-[#0D6D62] text-gray-700 hover:text-[#0D6D62] text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Exercise</span>
            </Link>

            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Overview Header Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    exercise.status === 'published'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {exercise.status.toUpperCase()}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {exercise.questions?.length || 0} Questions
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {exercise.title}
              </h1>
              {exercise.description && (
                <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
                  {exercise.description}
                </p>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                <Award className="w-4 h-4" />
                <span>{exercise.points || 10} Points</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                <Clock className="w-4 h-4" />
                <span>{exercise.estimatedMinutes || 15} Mins</span>
              </div>
            </div>
          </div>

          {/* Curriculum Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100 text-xs font-semibold">
            {exercise.classLevel && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Class: {exercise.classLevel}</span>
              </span>
            )}
            {exercise.subject && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E6F7F3] text-[#0D6D62] border border-[#A6E6D8]">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Subject: {exercise.subject}</span>
              </span>
            )}
            {exercise.topic && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700">
                <Layers className="w-3.5 h-3.5" />
                <span>Topic: {exercise.topic}</span>
              </span>
            )}
            {exercise.lesson && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Lesson: {exercise.lesson}</span>
              </span>
            )}
          </div>
        </div>

        {/* Questions Breakdown */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center justify-between">
            <span>Practice Questions ({exercise.questions?.length || 0})</span>
          </h2>

          <div className="space-y-4">
            {exercise.questions?.map((q, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/90 shadow-2xs space-y-4"
              >
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-xl bg-teal-50 text-[#0D6D62] text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1 font-semibold text-gray-900 text-sm sm:text-base leading-relaxed">
                    <MathRenderer content={q.questionText} />
                  </div>
                </div>

                {/* Options List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {q.options.map((opt, oIdx) => {
                    const isCorrect = q.correctOptionIndex === oIdx;
                    return (
                      <div
                        key={oIdx}
                        className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-medium transition-all ${
                          isCorrect
                            ? 'bg-[#E6F7F3] border-[#127A71] text-[#0D6D62] font-bold shadow-2xs'
                            : 'bg-gray-50 border-gray-200 text-gray-700'
                        }`}
                      >
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-[#127A71] shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-300 shrink-0" />
                        )}
                        <span className="text-gray-400 font-bold mr-1">
                          {String.fromCharCode(65 + oIdx)}.
                        </span>
                        <div className="flex-1">
                          <MathRenderer content={opt} />
                        </div>
                        {isCorrect && (
                          <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-[#0D6D62]">
                            Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Hint & Explanation */}
                {(q.hint || q.explanation) && (
                  <div className="pt-3 border-t border-gray-100 flex flex-col gap-2 text-xs">
                    {q.hint && (
                      <div className="p-2.5 rounded-lg bg-amber-50/70 text-amber-800 flex items-start gap-2">
                        <span className="font-bold text-amber-900">💡 Hint:</span>
                        <span>{q.hint}</span>
                      </div>
                    )}
                    {q.explanation && (
                      <div className="p-2.5 rounded-lg bg-blue-50/70 text-blue-800 flex items-start gap-2">
                        <span className="font-bold text-blue-900">📖 Explanation:</span>
                        <div className="flex-1">
                          <MathRenderer content={q.explanation} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function ViewExercisePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <Loader2 className="w-8 h-8 text-[#0D6D62] animate-spin" />
        </div>
      }
    >
      <ViewExerciseContent />
    </Suspense>
  );
}
