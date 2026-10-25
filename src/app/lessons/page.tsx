'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { lessonService } from '@/services/lesson.service';
import { subjectService } from '@/services/subject.service';
import { classService } from '@/services/class.service';
import { Subject, SchoolClass } from '@/types/curriculum.types';
import { useResponseModal } from '@/context/ModalContext';
import {
  Plus,
  GripVertical,
  Volume2,
  FileText,
  Loader2,
  BookOpen,
  GraduationCap,
  Filter,
  Mic,
  Image as ImageIcon,
  HelpCircle,
} from 'lucide-react';

export default function LessonsPage() {
  const { showError } = useResponseModal();
  const [lessons, setLessons] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchFilters = async () => {
    try {
      const [subData, clsData] = await Promise.all([
        subjectService.getSubjects(),
        classService.getClasses(),
      ]);
      setSubjects(subData || []);
      setClasses(clsData || []);
    } catch (err) {
      console.warn('Could not load filters:', err);
    }
  };

  const fetchLessons = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (selectedSubject !== 'all') params.subjectId = selectedSubject;
      if (selectedClass !== 'all') params.classLevel = selectedClass;
      const data = await lessonService.getAllLessons(params);
      setLessons(data || []);
    } catch (err: any) {
      showError('Failed to Load', err?.message || 'Could not fetch lessons from backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchLessons();
  }, [selectedSubject, selectedClass]);

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
              Standalone lessons and inter-related curriculum lessons linked to school subjects and classes.
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

        {/* Filter Controls */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
            <Filter className="w-4 h-4 text-[#0D6D62]" />
            <span>Filter Lessons By:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Subject Filter */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-600">Subject:</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold bg-gray-50 focus:outline-none focus:border-[#0D6D62]"
              >
                <option value="all">All Subjects</option>
                {subjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name} {sub.classLevel ? `(${sub.classLevel})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Class Filter */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-600">Class:</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold bg-gray-50 focus:outline-none focus:border-[#0D6D62]"
              >
                <option value="all">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls.name}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
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
              No lessons match the selected filters. Click &ldquo;Create Lesson&rdquo; to add one.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {lessons.map((lesson) => {
                const lessonSubjects = Array.isArray(lesson.subjects) && lesson.subjects.length > 0
                  ? lesson.subjects
                  : lesson.subject ? [lesson.subject] : [];
                const lessonClasses = Array.isArray(lesson.classes) && lesson.classes.length > 0
                  ? lesson.classes
                  : lesson.classLevel ? [lesson.classLevel] : [];

                return (
                  <div
                    key={lesson._id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F9FBFA] transition-colors group"
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <GripVertical className="w-4 h-4 text-gray-300 group-hover:text-gray-500 cursor-grab shrink-0 mt-1 sm:mt-0" />
                      <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0D6D62] flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
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

                        {/* Badges for Inter-related Subjects & Classes */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {lessonSubjects.length > 0 ? (
                            lessonSubjects.map((s: any, idx: number) => {
                              const sName = typeof s === 'string' ? s : s?.name || 'Subject';
                              return (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E6F7F3] text-[10px] font-bold text-[#0D6D62] border border-[#A6E6D8]"
                                >
                                  <BookOpen className="w-2.5 h-2.5" />
                                  <span>{sName}</span>
                                </span>
                              );
                            })
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-medium text-gray-500">
                              Standalone Lesson
                            </span>
                          )}

                          {lessonClasses.length > 0 &&
                            lessonClasses.map((cls: string, idx: number) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-[10px] font-bold text-purple-700 border border-purple-200"
                              >
                                <GraduationCap className="w-2.5 h-2.5" />
                                <span>{cls}</span>
                              </span>
                            ))}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                          <span>{lesson.readTime || 5} min read</span>
                          {/* {lesson.audioUrl && (
                            <span className="inline-flex items-center gap-1 text-teal-600 font-medium">
                              <Volume2 className="w-3.5 h-3.5" /> TTS Ready
                            </span>
                          )} */}
                          {lesson.voiceNoteUrl && (
                            <span className="inline-flex items-center gap-1 text-purple-600 font-medium">
                              <Mic className="w-3.5 h-3.5" /> Teacher Explanation
                            </span>
                          )}
                          {Array.isArray(lesson.images) && lesson.images.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                              <ImageIcon className="w-3.5 h-3.5" /> {lesson.images.length} Image{lesson.images.length > 1 ? 's' : ''}
                            </span>
                          )}
                          {((Array.isArray(lesson.exercises) && lesson.exercises.length > 0) || lesson.quiz) && (
                            <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                              <HelpCircle className="w-3.5 h-3.5" />{' '}
                              {Array.isArray(lesson.exercises) && lesson.exercises.length > 1
                                ? `${lesson.exercises.length} Exercises Attached`
                                : 'Exercise Attached'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/lessons/${lesson._id}/edit`}
                      className="self-end sm:self-center px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:border-[#0D6D62] hover:text-[#0D6D62] transition-colors"
                    >
                      Edit
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
