'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { subjectService } from '@/services/subject.service';
import { Subject, SubjectTopic } from '@/types/curriculum.types';
import { useResponseModal } from '@/context/ModalContext';
import { ArrowLeft, BookOpen, CheckCircle, ChevronDown, ChevronRight, Layers, FileText } from 'lucide-react';

function SubjectDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { showError, showSuccess } = useResponseModal();

  const id = Array.isArray(params?.id) ? params.id[0] : params?.id || '';

  const [subject, setSubject] = useState<Subject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        let subj: Subject | null = null;
        try {
          subj = await subjectService.getSubjectById(id);
        } catch {
          const all = await subjectService.getSubjects();
          subj = all.find((s) => s._id === id || s.name.toLowerCase() === id.toLowerCase()) || null;
        }

        if (subj) {
          setSubject(subj);
          if (subj.topics && subj.topics.length > 0) {
            setExpandedTopic(subj.topics[0]._id || 'topic-0');
          }
        } else {
          setSubject(null);
        }
      } catch (err: any) {
        showError('Load Error', err?.message || 'Unable to fetch subject details.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchSubject();
    }
  }, [id]);

  const topicsList = subject?.topics && subject.topics.length > 0
    ? subject.topics.map((t, idx) => {
        const totalLessons = t.lessons?.length || 0;
        return {
          _id: t._id || `topic-${idx}`,
          title: t.title,
          lessonCount: totalLessons,
          progress: 0,
          lessons: t.lessons?.map((l) => (typeof l === 'string' ? l : l.title)) || [],
        };
      })
    : [];

  if (isLoading) {
    return (
      <AdminLayout
        activeNav="Subjects"
        breadcrumbs={[
          { label: 'Management', href: '/classes' },
          { label: 'Subjects', href: '/subjects' },
          { label: 'Loading...' },
        ]}
      >
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-[#0D5C52] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-gray-500">Loading subject modules...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      activeNav="Subjects"
      breadcrumbs={[
        { label: 'Management', href: '/classes' },
        { label: 'Subjects', href: '/subjects' },
        { label: subject?.name || 'Subject Overview' },
      ]}
    >
      <div>

        {/* Back Link */}
        <div className="mb-4">
          <Link
            href="/subjects"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Back to Subjects</span>
          </Link>
        </div>

        {/* Header Title matching Screen 4 */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {subject?.name || 'Subject Overview'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
                {subject?.description || 'Curriculum Modules, Lessons, and Syllabus Progress'}
              </p>
            </div>

            {/* Linked Classes Pills */}
            <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
              <span className="text-xs font-semibold text-gray-400 mr-1">Classes:</span>
              {Array.isArray(subject?.classes) && subject.classes.length > 0 ? (
                subject.classes.map((cls) => (
                  <span
                    key={cls}
                    className="px-2.5 py-1 rounded-lg bg-[#E6F7F3] border border-[#A6E6D8] text-xs font-bold text-[#0D6D62]"
                  >
                    {cls}
                  </span>
                ))
              ) : subject?.classLevel ? (
                <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-bold text-gray-700">
                  {subject.classLevel}
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-xs font-semibold text-amber-700 border border-amber-200">
                  Standalone (Not linked to any class)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modules Cards Grid matching Screen 4 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-10">
          {topicsList.map((topic) => {
            const isExpanded = expandedTopic === topic._id;
            return (
              <div
                key={topic._id}
                className="bg-white rounded-2xl sm:rounded-3xl p-6 border border-gray-200 hover:border-[#127A71] shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Topic Title */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-lg sm:text-xl font-extrabold text-gray-900">
                      {topic.title}
                    </h3>
                    <div className="w-7 h-7 rounded-full bg-emerald-50 text-[#127A71] flex items-center justify-center shrink-0">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Subtitle matching Screen 4: e.g. "12 Lessons Completed" */}
                  <p className="text-xs text-gray-500 mb-6">
                    {topic.lessonCount} Lessons Completed
                  </p>
                </div>

                {/* Progress Bar matching Screen 4 */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                    <span className="text-gray-400">Mastery Progress</span>
                    <span className="text-[#127A71]">{topic.progress}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden mb-4">
                    <div
                      className="h-full rounded-full bg-[#127A71] transition-all duration-500"
                      style={{ width: `${topic.progress}%` }}
                    ></div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedTopic(isExpanded ? null : topic._id)}
                    className="w-full py-2 px-3 rounded-xl bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-[#127A71] text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>{isExpanded ? 'Hide Lessons' : 'View Lessons'}</span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Expandable Lessons Drawer */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2 animate-in fade-in duration-200">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Module Lessons
                    </span>
                    {topic.lessons.map((lesson, lIdx) => (
                      <div
                        key={lIdx}
                        className="flex items-center gap-2 text-xs text-gray-700 py-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#127A71] shrink-0" />
                        <span className="truncate">{lesson}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}

export default function SubjectDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <div className="w-8 h-8 border-4 border-[#127A71] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <SubjectDetailContent />
    </Suspense>
  );
}
