'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { ArrowLeft, Plus, GripVertical, CheckCircle, Clock } from 'lucide-react';

function TopicLessonsContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const topicId = Array.isArray(params?.id) ? params.id[0] : params?.id || '';
  const topicTitle = searchParams.get('title') || 'Intro to Motion';

  const [lessons, setLessons] = useState<any[]>([
    { _id: 'l1', title: '1. What is Motion?', status: 'published' },
    { _id: 'l2', title: '2. Types of Motion', status: 'published' },
    { _id: 'l3', title: '3. Speed versus Velocity', status: 'draft' },
  ]);

  return (
    <AdminLayout
      activeNav="Lessons"
      breadcrumbs={[
        { label: 'Management', href: '/classes' },
        { label: 'Subjects', href: '/subjects' },
        { label: 'Topics', href: '/topics' },
        { label: topicTitle },
      ]}
    >
      <div className="max-w-4xl mx-auto relative">
        {/* Breadcrumb / Back Link */}
        <div className="mb-4">
          <Link
            href="/topics"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Back to Topics</span>
          </Link>
        </div>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {topicTitle}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Lesson chapters and multimedia audio syntheses
          </p>
        </div>

        {/* Lessons List matching Image 2 Screen 2 */}
        <div className="flex flex-col gap-3.5 mb-24">
          {lessons.map((lesson) => (
            <div
              key={lesson._id}
              onClick={() => router.push(`/lessons/${lesson._id}/edit`)}
              className="group bg-white rounded-2xl p-5 border border-gray-200 hover:border-[#127A71] shadow-2xs hover:shadow-sm transition-all duration-150 flex items-center justify-between gap-4 cursor-pointer"
            >
              <div className="flex items-center gap-3 sm:gap-4 flex-1">
                <div className="text-gray-300 group-hover:text-gray-500 transition-colors cursor-grab shrink-0">
                  <GripVertical className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-gray-900 group-hover:text-[#127A71] transition-colors">
                  {lesson.title}
                </h3>
              </div>

              <div className="shrink-0">
                {lesson.status === 'published' ? (
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

        {/* Floating Action Button (+) */}
        <button
          type="button"
          onClick={() => router.push(`/lessons/new?topicId=${topicId}&topicTitle=${encodeURIComponent(topicTitle)}`)}
          aria-label="Add Lesson"
          className="fixed bottom-8 right-8 sm:bottom-12 sm:right-12 w-14 h-14 rounded-full bg-[#127A71] hover:bg-[#0E635C] active:scale-95 text-white shadow-lg flex items-center justify-center transition-all duration-200 cursor-pointer z-30"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      </div>
    </AdminLayout>
  );
}

export default function TopicLessonsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <div className="w-8 h-8 border-4 border-[#127A71] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <TopicLessonsContent />
    </Suspense>
  );
}
