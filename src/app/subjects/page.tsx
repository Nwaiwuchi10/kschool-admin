'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { subjectService } from '@/services/subject.service';
import { classService } from '@/services/class.service';
import { Subject, SchoolClass } from '@/types/curriculum.types';
import { useResponseModal } from '@/context/ModalContext';
import { ChevronRight, BookOpen, Layers, RefreshCw, Sparkles, Filter, Plus } from 'lucide-react';

function SubjectsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialClassLevel = searchParams.get('classLevel') || 'All';

  const { showSuccess, showError } = useResponseModal();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [availableClasses, setAvailableClasses] = useState<SchoolClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedClassLevel, setSelectedClassLevel] = useState<string>(initialClassLevel);

  useEffect(() => {
    async function loadClasses() {
      try {
        const cls = await classService.getClasses();
        if (cls && cls.length > 0) {
          setAvailableClasses(cls);
        }
      } catch (err) {
        console.warn('Failed to load classes for subject filter:', err);
      }
    }
    loadClasses();
  }, []);

  const fetchSubjects = async () => {
    try {
      const data = await subjectService.getSubjects(
        selectedClassLevel === 'All' ? undefined : selectedClassLevel
      );
      setSubjects(data);
    } catch (err: any) {
      showError('Load Error', err?.message || 'Unable to fetch subjects.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [selectedClassLevel]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchSubjects();
      showSuccess('Subjects Synchronized', 'Curriculum syllabus and module counts updated.');
    } catch (err: any) {
      showError('Sync Failed', err?.message || 'Failed to refresh subjects.');
    }
  };

  // Extract lesson count helper
  const getSubjectMetrics = (s: Subject) => {
    let lessonCount = 0;
    if (s.topics && Array.isArray(s.topics)) {
      s.topics.forEach((t) => {
        lessonCount += t.lessons?.length || 0;
      });
    }

    const tag = s.name.toLowerCase().includes('science')
      ? 'Science'
      : s.name.toLowerCase().includes('math')
      ? 'Math'
      : s.name.toLowerCase().includes('english')
      ? 'English'
      : s.classLevel || 'General';

    return {
      lessonCount,
      tag,
    };
  };

  return (
    <AdminLayout
      activeNav="Subjects"
      breadcrumbs={[{ label: 'Management', href: '/classes' }, { label: 'Subjects' }]}
    >
      <div className="space-y-6 max-w-6xl">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Subject Curriculum
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Curriculum subjects, module syllabuses, and lesson topics across all grade levels.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Subjects'}</span>
            </button>
          </div>
        </div>

        {/* Filter Pills derived dynamically from classes */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {['All', ...availableClasses.map((c) => c.name)].map((level) => (
            <button
              key={level}
              onClick={() => setSelectedClassLevel(level)}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                selectedClassLevel === level
                  ? 'bg-[#127A71] text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Subject Cards Grid matching Screen 3 */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs animate-pulse flex flex-col gap-3"
              >
                <div className="h-6 bg-gray-200 rounded-md w-1/2"></div>
                <div className="h-4 bg-gray-100 rounded-md w-1/3"></div>
              </div>
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-2xs flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#127A71] flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Subjects Found</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-6 max-w-sm">
              No subjects found for class &ldquo;{selectedClassLevel}&rdquo;. Refresh or choose another class filter.
            </p>
            <PrimaryButton
              fullWidth={false}
              onClick={() => setSelectedClassLevel('All')}
              className="px-6 h-11 text-sm"
            >
              View All Subjects
            </PrimaryButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjects.map((subject, idx) => {
              const metrics = getSubjectMetrics(subject);
              return (
                <div
                  key={subject._id || idx}
                  onClick={() => router.push(`/subjects/${subject._id}`)}
                  className="group bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200 hover:border-[#127A71] shadow-2xs hover:shadow-md transition-all duration-200 flex items-center justify-between gap-4 cursor-pointer"
                >
                  {/* Left: Title & Badges */}
                  <div className="flex flex-col gap-2.5">
                    <h3 className="text-base sm:text-lg font-extrabold text-gray-900 group-hover:text-[#127A71] transition-colors leading-snug">
                      {subject.name}
                    </h3>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#127A71] border border-emerald-100">
                        {metrics.tag}
                      </span>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {metrics.lessonCount} Lessons
                      </span>
                    </div>
                  </div>

                  {/* Right Arrow Button matching Screen 3 */}
                  <div className="w-9 h-9 rounded-full bg-gray-50 group-hover:bg-emerald-50 group-hover:text-[#127A71] flex items-center justify-center text-gray-400 transition-colors shrink-0">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default function SubjectsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <div className="w-8 h-8 border-4 border-[#127A71] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <SubjectsContent />
    </Suspense>
  );
}
