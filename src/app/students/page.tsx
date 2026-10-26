'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { studentService } from '@/services/student.service';
import { classService } from '@/services/class.service';
import { SchoolClass } from '@/types/curriculum.types';
import { StudentOverviewItem, StudentStatus } from '@/types/student.types';
import {
  Search,
  ChevronDown,
  Users,
  CheckCircle2,
  Award,
  Radio,
  BookOpen,
  ArrowRight,
  Filter,
  UserCheck,
} from 'lucide-react';

function StudentsOverviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialClass = searchParams.get('class') || 'all';

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>(initialClass);
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'attention' | 'completed' | 'on_track'>('all');

  const [isLoading, setIsLoading] = useState(true);
  const [overviewData, setOverviewData] = useState<{
    totalStudents: number;
    activeNow: number;
    completedTopics: number;
    avgQuizScore: number;
    students: StudentOverviewItem[];
  }>({
    totalStudents: 0,
    activeNow: 0,
    completedTopics: 0,
    avgQuizScore: 0,
    students: [],
  });

  // Load available classes for dropdown
  useEffect(() => {
    async function fetchClasses() {
      try {
        const clsList = await classService.getClasses();
        if (clsList && clsList.length > 0) {
          setClasses(clsList);
        }
      } catch (err) {
        console.warn('Could not load classes list for filter:', err);
      }
    }
    fetchClasses();
  }, []);

  // Fetch overview whenever selected class changes
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const classArg = selectedClass === 'all' ? undefined : selectedClass;
        const res = await studentService.getClassOverview(classArg);
        setOverviewData({
          totalStudents: res?.totalStudents ?? 0,
          activeNow: res?.activeNow ?? 0,
          completedTopics: res?.completedTopics ?? 0,
          avgQuizScore: res?.avgQuizScore ?? 0,
          students: res?.students || [],
        });
      } catch (err) {
        console.error('Failed to load students overview:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [selectedClass]);

  // Filter students based on search and selected filter tab
  const filteredStudents = useMemo(() => {
    let list = overviewData.students;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.currentTopic.toLowerCase().includes(q) ||
          s.rollNumber.toLowerCase().includes(q)
      );
    }

    if (activeFilter === 'attention') {
      list = list.filter((s) => s.status === 'falling_behind');
    } else if (activeFilter === 'completed') {
      list = list.filter((s) => s.status === 'completed');
    } else if (activeFilter === 'on_track') {
      list = list.filter((s) => s.status === 'on_track');
    }

    return list;
  }, [overviewData.students, searchQuery, activeFilter]);

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
            Needs Attention
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
      activeNav="Students"
      breadcrumbs={[
        { label: 'Management', href: '/classes' },
        { label: 'Students' },
      ]}
    >
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* =========================================================================
            TOP BAR: Class Overview Title + Class Selector Dropdown
            ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Class Overview
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Real-time student syllabus completion and performance analytics.
            </p>
          </div>

          {/* Class Dropdown Switcher */}
          <div className="relative shrink-0">
            <button
              onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
              className="inline-flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer min-w-[180px]"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Class:</span>
                <span className="font-bold text-[#0D6D62]">
                  {selectedClass === 'all' ? 'All Classes' : selectedClass}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {isClassDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  Select Curriculum Class
                </div>
                
                {/* All Classes Option */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClass('all');
                    setIsClassDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between hover:bg-[#E6F7F2]/40 transition-colors ${
                    selectedClass === 'all' ? 'text-[#0D6D62] bg-[#E6F7F2]/60 font-bold' : 'text-gray-700'
                  }`}
                >
                  <span>All Classes</span>
                  {selectedClass === 'all' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0D6D62]" />
                  )}
                </button>

                {classes.length > 0 ? (
                  classes.map((cls) => (
                    <button
                      key={cls._id || cls.code}
                      onClick={() => {
                        setSelectedClass(cls.name);
                        setIsClassDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between hover:bg-[#E6F7F2]/40 transition-colors ${
                        selectedClass === cls.name ? 'text-[#0D6D62] bg-[#E6F7F2]/60 font-bold' : 'text-gray-700'
                      }`}
                    >
                      <span>{cls.name}</span>
                      {selectedClass === cls.name && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0D6D62]" />
                      )}
                    </button>
                  ))
                ) : (
                  ['Primary 1', 'Primary 2', 'Primary 3', 'JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'].map(
                    (name) => (
                      <button
                        key={name}
                        onClick={() => {
                          setSelectedClass(name);
                          setIsClassDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between hover:bg-[#E6F7F2]/40 transition-colors ${
                          selectedClass === name ? 'text-[#0D6D62] bg-[#E6F7F2]/60 font-bold' : 'text-gray-700'
                        }`}
                      >
                        <span>{name}</span>
                        {selectedClass === name && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0D6D62]" />
                        )}
                      </button>
                    )
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            4 STAT CARDS (Figma Match: Total Students, Active Now, Completed Topics, Avg Quiz Score)
            ========================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Students */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="text-[11px] sm:text-xs font-medium text-gray-500">
              Total Students
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1.5 tracking-tight">
              {overviewData.totalStudents}
            </div>
          </div>

          {/* Card 2: Active Now */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-gray-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Active Now</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1.5 tracking-tight">
              {overviewData.activeNow}
            </div>
          </div>

          {/* Card 3: Completed Topics */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="text-[11px] sm:text-xs font-medium text-gray-500">
              Completed Topics
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1.5 tracking-tight">
              {overviewData.completedTopics}
            </div>
          </div>

          {/* Card 4: Avg Quiz Score */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="text-[11px] sm:text-xs font-medium text-gray-500">
              Avg Quiz Score
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1.5 tracking-tight">
              {overviewData.avgQuizScore}%
            </div>
          </div>
        </div>

        {/* =========================================================================
            STUDENTS SECTION HEADER + SEARCH BAR + FILTER TABS
            ========================================================================= */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">Students</h2>

            {/* Search Input */}
            <div className="relative w-full sm:w-64 md:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0D6D62] focus:border-transparent transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Filter Chips */}
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
              onClick={() => setActiveFilter('attention')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeFilter === 'attention'
                  ? 'bg-[#0D6D62] text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Attention
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeFilter === 'completed'
                  ? 'bg-[#0D6D62] text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* =========================================================================
            STUDENT CARDS GRID (Figma Match: 2 cols on Desktop, 1 col on Mobile)
            ========================================================================= */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white border border-gray-200/80 rounded-2xl p-5 animate-pulse space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full w-full"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white border border-gray-200/90 rounded-2xl p-10 text-center space-y-3">
            <Users className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-900">No students found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              No students matched your search criteria or filter for {selectedClass}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStudents.map((student) => (
              <Link
                key={student.id}
                href={`/students/${student.id}`}
                className="group bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-[#0D6D62]/40 transition-all flex flex-col justify-between gap-3.5 cursor-pointer block"
              >
                {/* Top Row: Avatar + Name + Grade/Score + Status Badge */}
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
                        {student.grade || selectedClass} • Score: {student.score}%
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">{getStatusBadge(student.status)}</div>
                </div>

                {/* Middle Row: Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-gray-600">
                    <span>Progress</span>
                    <span className="font-bold text-gray-900">{Math.min(100, Math.max(0, student.progress))}%</span>
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
                      style={{ width: `${Math.min(100, Math.max(0, student.progress))}%` }}
                    ></div>
                  </div>
                </div>

                {/* Bottom Row: Current Topic */}
                <div className="text-[11px] sm:text-xs text-gray-500 font-medium truncate pt-0.5 flex items-center justify-between">
                  <span>Topic: {student.currentTopic}</span>
                  <span className="text-gray-400 group-hover:text-[#0D6D62] transition-colors text-xs flex items-center gap-1 font-semibold">
                    View Insights <ArrowRight className="w-3.5 h-3.5" />
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

export default function StudentsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <div className="w-8 h-8 border-4 border-[#127A71] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <StudentsOverviewContent />
    </Suspense>
  );
}
