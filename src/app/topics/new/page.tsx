'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import InputField from '@/components/ui/InputField';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { topicService } from '@/services/topic.service';
import { useResponseModal } from '@/context/ModalContext';
import { ArrowLeft } from 'lucide-react';

function NewTopicContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectName = searchParams.get('subject') || 'Physics';

  const { showSuccess, showError } = useResponseModal();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState('4');
  const [maxLessons, setMaxLessons] = useState('4');
  const [maxQuizQuestions, setMaxQuizQuestions] = useState('10');
  const [isPublished, setIsPublished] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string }>({});

  const validate = () => {
    const errs: { title?: string } = {};
    if (!title.trim()) {
      errs.title = 'Topic title is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      // Simulate/call backend API
      showSuccess(
        'Topic Created Successfully',
        `Topic "${title}" has been saved and registered under ${subjectName}.`,
        () => router.push(`/topics?subject=${encodeURIComponent(subjectName)}`),
        'Back to Topics'
      );
    } catch (err: any) {
      showError('Failed to Create Topic', err?.message || 'Unable to save topic.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout
      activeNav="Subjects"
      breadcrumbs={[
        { label: 'Management', href: '/classes' },
        { label: 'Subjects', href: '/subjects' },
        { label: subjectName, href: `/topics?subject=${encodeURIComponent(subjectName)}` },
        { label: 'New Topic' },
      ]}
    >
      <div className="max-w-2xl mx-auto">
        {/* Back Link matching Mockup 1 Screen 2 */}
        <div className="mb-4">
          <Link
            href={`/topics?subject=${encodeURIComponent(subjectName)}`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Back to {subjectName} Topics</span>
          </Link>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-2xs">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-6">
            New Topic
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Topic Title */}
            <InputField
              label="Topic Title"
              placeholder="e.g. Introduction to Motion"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({});
              }}
              error={errors.title}
              disabled={isLoading}
              autoFocus
            />

            {/* Topic Description */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-sm font-semibold text-gray-800">
                Topic Description
              </label>
              <textarea
                rows={4}
                placeholder="Understanding how objects move, speed and acceleration through simple everyday examples."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                className="w-full p-4 rounded-xl sm:rounded-2xl border border-gray-200 focus:border-[#127A71] focus:ring-2 focus:ring-[#127A71]/15 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 bg-white transition-all outline-none resize-none"
              />
            </div>

            {/* Order Number & Status Switch Row matching Image 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <InputField
                label="Order Number"
                type="number"
                placeholder="4"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                disabled={isLoading}
              />

              <div className="flex flex-col gap-1.5 pt-1">
                <label className="text-sm font-semibold text-gray-800">Status</label>
                <div className="flex items-center justify-between h-12 px-4 rounded-xl sm:rounded-2xl border border-gray-200 bg-white">
                  <span
                    className={`text-xs sm:text-sm font-bold ${
                      isPublished ? 'text-[#127A71]' : 'text-amber-600'
                    }`}
                  >
                    {isPublished ? 'Published' : 'Draft'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsPublished(!isPublished)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      isPublished ? 'bg-[#127A71]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        isPublished ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Curriculum Sequence Limits: Max Lessons & Max Quiz Questions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Max Lessons (Sequence Limit)"
                type="number"
                placeholder="4"
                value={maxLessons}
                onChange={(e) => setMaxLessons(e.target.value)}
                disabled={isLoading}
              />
              <InputField
                label="Max Quiz Questions"
                type="number"
                placeholder="10"
                value={maxQuizQuestions}
                onChange={(e) => setMaxQuizQuestions(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Action Button */}
            <div className="mt-4">
              <PrimaryButton
                type="submit"
                isLoading={isLoading}
                loadingText="Saving Topic..."
              >
                Save Topic
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function NewTopicPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <div className="w-8 h-8 border-4 border-[#127A71] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <NewTopicContent />
    </Suspense>
  );
}
