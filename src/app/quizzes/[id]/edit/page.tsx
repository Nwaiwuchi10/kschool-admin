'use client';

import React, { useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { useResponseModal } from '@/context/ModalContext';
import { ArrowLeft, Edit2, Trash2, Plus, HelpCircle } from 'lucide-react';

function EditQuizContent() {
  const router = useRouter();
  const { showSuccess, showError, showModal } = useResponseModal();

  const [questions, setQuestions] = useState<any[]>([
    {
      id: 1,
      qNumber: 'Q1',
      question: 'What is the unit of force?',
      correctAnswer: 'Newton (N)',
    },
    {
      id: 2,
      qNumber: 'Q2',
      question: 'Which law states that F = ma?',
      correctAnswer: "Newton's Second Law",
    },
    {
      id: 3,
      qNumber: 'Q3',
      question: 'What is acceleration?',
      correctAnswer: 'Rate of change of velocity',
    },
  ]);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDeleteQuestion = (id: number) => {
    showModal({
      type: 'warning',
      title: 'Remove Question',
      message: 'Are you sure you want to remove this question from the quiz?',
      confirmText: 'Yes, Remove',
      cancelText: 'Cancel',
      onConfirm: () => {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        showSuccess('Question Removed', 'The question has been removed.');
      },
    });
  };

  const handleUpdateQuiz = async () => {
    setIsUpdating(true);
    try {
      showSuccess(
        'Quiz Updated Successfully',
        'All quiz questions and scoring rubrics have been updated for students.',
        () => router.push('/content-status'),
        'View Content Status'
      );
    } catch (err: any) {
      showError('Update Failed', err?.message || 'Failed to update quiz.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AdminLayout
      activeNav="Quizzes"
      breadcrumbs={[
        { label: 'Management', href: '/classes' },
        { label: 'Quizzes', href: '/quizzes' },
        { label: 'Edit Quiz' },
      ]}
    >
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb matching Image 3 Screen 2 */}
        <div className="mb-4">
          <Link
            href="/quizzes"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Back to Quizzes</span>
          </Link>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-2xs">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-6">
            Edit Quiz
          </h1>

          {/* Questions List matching Mockup 3 Screen 2 */}
          <div className="flex flex-col gap-4 mb-6">
            {questions.map((q) => (
              <div
                key={q.id}
                className="p-4 sm:p-5 rounded-2xl border border-gray-200 bg-white hover:border-[#127A71] shadow-2xs transition-all flex items-start justify-between gap-4"
              >
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#127A71] bg-emerald-50 px-2 py-0.5 rounded-md">
                      {q.qNumber}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900">
                      {q.question}
                    </h3>
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    Correct: <span className="font-semibold text-[#127A71]">{q.correctAnswer}</span>
                  </p>
                </div>

                {/* Edit & Delete Action Icons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => showSuccess('Edit Question', `Editing question: ${q.question}`)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                    title="Edit Question"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* + Add Question Dashed Button */}
          <button
            type="button"
            onClick={() => router.push('/quizzes/new')}
            className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-[#127A71]/30 hover:border-[#127A71] text-[#127A71] hover:bg-emerald-50/50 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer mb-6"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Question</span>
          </button>

          {/* Update Quiz Action Button */}
          <PrimaryButton
            onClick={handleUpdateQuiz}
            isLoading={isUpdating}
            loadingText="Updating Quiz..."
          >
            Update Quiz
          </PrimaryButton>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function EditQuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <div className="w-8 h-8 border-4 border-[#127A71] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <EditQuizContent />
    </Suspense>
  );
}
