'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { studentService } from '@/services/student.service';
import { classService } from '@/services/class.service';
import { SchoolClass } from '@/types/curriculum.types';
import { StudentOverviewItem, StudentStatus } from '@/types/student.types';
import {
  ChevronLeft,
  Search,
  Users,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

function ClassStudentsContent() {
  const params = useParams();
  const router = useRouter();
  const idParam = Array.isArray(params?.id) ? params.id[0] : params?.id || '';

  const [classData, setClassData] = useState<SchoolClass | null>(null);
  const [students, setStudents] = useState<StudentOverviewItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'on_track' | 'behind' | 'done'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        let cls: SchoolClass | null = null;
        try {
          cls = await classService.getClassById(idParam);
        } catch {
          const all = await classService.getAllAdminClasses();
          cls =
            all.find(
              (c) =>
                c._id === idParam ||
                c.code === idParam ||
                c.name.toLowerCase() === idParam.toLowerCase() ||
                c.name.toLowerCase().replace(/\s+/g, '-') === idParam.toLowerCase()
            ) || null;
        }

        const className = cls?.name || idParam.toUpperCase().replace('-', ' ') || 'JSS 1';
        setClassData(cls || { _id: idParam, name: className } as any);

        const res = await studentService.getClassStudents(className);
        setStudents(res.students || []);
      } catch (err) {
        console.error('Error loading class students:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [idParam]);

  const classNameDisplay = classData?.name || idParam.toUpperCase().replace('-', ' ') || 'JSS 1';

  const filteredStudents = useMemo(() => {
    let list = students;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.currentTopic.toLowerCase().includes(q) ||
          s.rollNumber.toLowerCase().includes(q)
      );
    }

    if (activeFilter === 'on_track') {
      list = list.filter((s) => s.status === 'on_track');
    } else if (activeFilter === 'behind') {
      list = list.filter((s) => s.status === 'falling_behind');
    } else if (activeFilter === 'done') {
      list = list.filter((s) => s.status === 'completed');
    }

    return list;
  }, [students, searchQuery, activeFilter]);

  const getStatusBadge = (status: StudentStatus) => {
    switch (status) {
      case 'on_track':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold bg-[#E6F7F2] text-[#0D6D62]">
            On Track
          </span>
        );
      case 'falling_behind':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold bg-[#FEE2E2] text-[#DC2626]">
            Falling Behind
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold bg-[#CCFBF1] text-[#0F766E]">
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout
      activeNav="Classes"
      breadcrumbs={[
        { label: 'Management', href: '/classes' },
        { label: 'Classes', href: '/classes' },
        { label: classNameDisplay, href: `/classes/${idParam}` },
        { label: 'Students' },
      ]}
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Back Link */}
        <div>
          <Link
            href={`/classes/${idParam}`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0D6D62] hover:underline cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{classNameDisplay} Details</span>
          </Link>
        </div>

        {/* Title & Subtitle */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {classNameDisplay} — Students
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Individual performance and progress monitoring.
          </p>
        </div>

        {/* Search Bar (Matching Figma Screenshot) */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search students by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0D6D62] focus:border-transparent transition-all shadow-xs"
          />
        </div>

        {/* Filter Chips: All, On Track, Behind, Done */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeFilter === 'all'
                ? 'bg-[#0D6D62] text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('on_track')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeFilter === 'on_track'
                ? 'bg-[#0D6D62] text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            On Track
          </button>
          <button
            onClick={() => setActiveFilter('behind')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeFilter === 'behind'
                ? 'bg-[#0D6D62] text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Behind
          </button>
          <button
            onClick={() => setActiveFilter('done')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeFilter === 'done'
                ? 'bg-[#0D6D62] text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Done
          </button>
        </div>

        {/* Students List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white border border-gray-200/80 rounded-2xl p-5 animate-pulse space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/6"></div>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full w-full"></div>
              </div>
            ))}
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white border border-gray-200/90 rounded-2xl p-10 text-center space-y-3">
            <Users className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-900">No students found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              No students matched your search or filter under {classNameDisplay}.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredStudents.map((student) => (
              <Link
                key={student.id}
                href={`/students/${student.id}`}
                className="group bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-[#0D6D62]/40 transition-all flex flex-col gap-3.5 cursor-pointer block"
              >
                {/* Header row: Avatar + Name + Grade & Score + Status Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-gray-200 bg-gray-100 shrink-0 relative">
                      {student.avatar ? (
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 text-xs">
                          {student.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-extrabold text-gray-900 group-hover:text-[#0D6D62] transition-colors truncate">
                        {student.name}
                      </h3>
                      <div className="text-[11px] sm:text-xs text-gray-500 font-medium truncate mt-0.5">
                        {student.grade || classNameDisplay} • Score: {student.score}%
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">{getStatusBadge(student.status)}</div>
                </div>

                {/* Progress Row */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-gray-600">
                    <span>Progress</span>
                    <span className="font-bold text-gray-900">{student.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 sm:h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        student.status === 'falling_behind'
                          ? 'bg-[#DC2626]'
                          : student.status === 'completed'
                          ? 'bg-[#0F766E]'
                          : 'bg-[#0D6D62]'
                      }`}
                      style={{ width: `${student.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Footer Row: Topic */}
                <div className="text-[11px] sm:text-xs text-gray-500 font-medium truncate pt-0.5 flex items-center justify-between">
                  <span>Topic: {student.currentTopic}</span>
                  <span className="text-gray-400 group-hover:text-[#0D6D62] transition-colors text-xs flex items-center gap-1 font-semibold">
                    View Progress <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default function ClassStudentsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <div className="w-8 h-8 border-4 border-[#127A71] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ClassStudentsContent />
    </Suspense>
  );
}
