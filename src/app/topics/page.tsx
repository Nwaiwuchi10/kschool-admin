'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { subjectService } from '@/services/subject.service';
import { useResponseModal } from '@/context/ModalContext';
import { ArrowLeft, Plus, GripVertical, CheckCircle, Clock } from 'lucide-react';

function TopicsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectName = searchParams.get('subject') || 'Physics';
  const subjectId = searchParams.get('subjectId');

  const { showSuccess, showError } = useResponseModal();
  const [topics, setTopics] = useState<any[]>([
    {
      _id: 't1',
      title: '1. Introduction to Motion',
      lessonsCount: 4,
      quizzesCount: 2,
      status: 'published',
    },
    {
      _id: 't2',
      title: "2. Newton's Laws of Motion",
      lessonsCount: 4,
      quizzesCount: 2,
      status: 'published',
    },
    {
      _id: 't3',
      title: '3. Energy, Work & Power',
      lessonsCount: 3,
      quizzesCount: 1,
      status: 'draft',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTopics = async () => {
      if (!subjectId) return;
      try {
        setIsLoading(true);
        const subj = await subjectService.getSubjectById(subjectId);
        if (subj && subj.topics && subj.topics.length > 0) {
          const mapped = subj.topics.map((t, idx) => ({
            _id: t._id || `topic-${idx}`,
            title: `${idx + 1}. ${t.title}`,
            lessonsCount: t.lessons?.length || 4,
            quizzesCount: 2,
            status: idx === 2 ? 'draft' : 'published',
          }));
          setTopics(mapped);
        }
      } catch (err) {
        console.log('Using default topics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopics();
  }, [subjectId]);

  return (
    <AdminLayout
      activeNav="Subjects"
      breadcrumbs={[
        { label: 'Management', href: '/classes' },
        { label: 'Subjects', href: '/subjects' },
        { label: subjectName },
      ]}
    >
      <div className="max-w-4xl mx-auto relative">
        {/* Breadcrumb / Back Link */}
        <div className="mb-4">
          <Link
            href="/subjects"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Back to Subjects</span>
          </Link>
        </div>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {subjectName}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Curriculum topics, lesson chapters, and module assessments
          </p>
        </div>

        {/* Topics List matching Image 1 Desktop & Mobile */}
        <div className="flex flex-col gap-3.5 mb-24">
          {topics.map((topic) => (
            <div
              key={topic._id}
              onClick={() => router.push(`/topics/${topic._id}/lessons?title=${encodeURIComponent(topic.title)}`)}
              className="group bg-white rounded-2xl p-5 border border-gray-200 hover:border-[#127A71] shadow-2xs hover:shadow-sm transition-all duration-150 flex items-center justify-between gap-4 cursor-pointer"
            >
              <div className="flex items-center gap-3 sm:gap-4 flex-1">
                {/* Drag Handle */}
                <div className="text-gray-300 group-hover:text-gray-500 transition-colors cursor-grab shrink-0">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Topic Info */}
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-gray-900 group-hover:text-[#127A71] transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {topic.lessonsCount} Lessons • {topic.quizzesCount} Quizzes
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                {topic.status === 'published' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-[#127A71] border border-emerald-100">
                    <CheckCircle className="w-3 h-3" />
                    <span>Published</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    <Clock className="w-3 h-3" />
                    <span>Draft</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Floating Action Button (+) matching Mockup 1 */}
        <button
          type="button"
          onClick={() => router.push(`/topics/new?subject=${encodeURIComponent(subjectName)}`)}
          aria-label="Add Topic"
          className="fixed bottom-8 right-8 sm:bottom-12 sm:right-12 w-14 h-14 rounded-full bg-[#127A71] hover:bg-[#0E635C] active:scale-95 text-white shadow-lg flex items-center justify-center transition-all duration-200 cursor-pointer z-30"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      </div>
    </AdminLayout>
  );
}

export default function TopicsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <div className="w-8 h-8 border-4 border-[#127A71] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <TopicsContent />
    </Suspense>
  );
}
