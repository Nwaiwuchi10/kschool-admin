'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { lessonService } from '@/services/lesson.service';
import { useResponseModal } from '@/context/ModalContext';
import { Plus, GripVertical, Volume2, FileText, Loader2 } from 'lucide-react';

export default function LessonsPage() {
  const { showError } = useResponseModal();
  const [lessons, setLessons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLessons = async () => {
    try {
      setIsLoading(true);
      const data = await lessonService.getAllLessons();
      setLessons(data || []);
    } catch (err: any) {
      showError('Failed to Load', err?.message || 'Could not fetch lessons from backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const totalLessons = lessons.length;
  const publishedCount = lessons.filter((l) => l.status === 'published').length;
  const draftCount = lessons.filter((l) => l.status === 'draft').length;

  return (
    <AdminLayout
      activeNav="Lessons"
      breadcrumbs={[{ label: 'Management', href: '/classes' }, { label: 'Lessons' }]}
    >
      <div className="space-y-6 max-w-6xl">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Curriculum Lessons
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Organize lesson content, sync audio speech narration, and manage reading materials.
            </p>
          </div>

          <Link href="/lessons/new">
            <PrimaryButton className="gap-2">
              <Plus className="w-4 h-4" />
              <span>Create Lesson</span>
            </PrimaryButton>
          </Link>
        </div>

        {/* Status Metrics Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">{totalLessons}</div>
            <div className="text-xs font-semibold text-gray-500 mt-1">Total Lessons</div>
          </div>
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {publishedCount}
            </div>
            <div className="text-xs font-semibold text-gray-500 mt-1">Published & Live</div>
          </div>
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">{draftCount}</div>
            <div className="text-xs font-semibold text-gray-500 mt-1">Drafts in Progress</div>
          </div>
        </div>

        {/* Lessons List */}
        <div className="bg-white border border-gray-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">All Lessons</h3>
            <span className="text-xs text-gray-400 font-medium">{totalLessons} items loaded</span>
          </div>

          {isLoading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#0D6D62]" />
            </div>
          ) : lessons.length === 0 ? (
            <div className="py-16 text-center text-xs text-gray-400 p-8">
              No lessons found in database. Click &ldquo;Create Lesson&rdquo; to add one.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {lessons.map((lesson) => (
                <div
                  key={lesson._id}
                  className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#F9FBFA] transition-colors group"
                >
                  <div className="flex items-center gap-3.5">
                    <GripVertical className="w-4 h-4 text-gray-300 group-hover:text-gray-500 cursor-grab shrink-0" />
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0D6D62] flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{lesson.title}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            lesson.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {lesson.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                        <span>{lesson.readTime || 5} min read</span>
                        {lesson.audioUrl && (
                          <span className="inline-flex items-center gap-1 text-teal-600 font-medium">
                            <Volume2 className="w-3.5 h-3.5" /> Audio Ready
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/lessons/${lesson._id}/edit`}
                    className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:border-[#0D6D62] hover:text-[#0D6D62] transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
