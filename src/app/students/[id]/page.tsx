'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { studentService } from '@/services/student.service';
import { StudentDetails } from '@/types/student.types';
import { useResponseModal } from '@/context/ModalContext';
import {
  ChevronLeft,
  Sparkles,
  Award,
  AlertCircle,
  Flame,
  Clock,
  BookOpen,
  Send,
  PlusCircle,
  CheckCircle2,
  X,
} from 'lucide-react';

function StudentDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const { showModal, showSuccess, showError } = useResponseModal();
  const studentIdParam = Array.isArray(params?.id) ? params.id[0] : params?.id || 'stu_amara';

  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Encouragement modal
  const [isEncourageModalOpen, setIsEncourageModalOpen] = useState(false);
  const [encouragementMessage, setEncouragementMessage] = useState(
    'Keep up the exceptional performance! You are leading your class with dedication.'
  );
  const [isSendingEncouragement, setIsSendingEncouragement] = useState(false);

  // Assign practice modal
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [selectedPracticeSubject, setSelectedPracticeSubject] = useState('Science');
  const [practiceTopic, setPracticeTopic] = useState('Periodic Table Mastery');
  const [practiceQuestionCount, setPracticeQuestionCount] = useState('10');
  const [isAssigningPractice, setIsAssigningPractice] = useState(false);

  useEffect(() => {
    async function loadStudent() {
      try {
        setIsLoading(true);
        const data = await studentService.getStudentDetails(studentIdParam);
        setStudent(data);
      } catch (err) {
        console.error('Failed to load student details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStudent();
  }, [studentIdParam]);

  const handleSendEncouragement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    try {
      setIsSendingEncouragement(true);
      await studentService.encourageStudent(student.id, encouragementMessage);
      setIsEncourageModalOpen(false);
      showSuccess(
        'Encouragement Sent!',
        `Your personalized note was delivered to ${student.name}.`,
        undefined,
        'Great!'
      );
    } catch (err: any) {
      showError('Error', err?.message || 'Failed to send encouragement.');
    } finally {
      setIsSendingEncouragement(false);
    }
  };

  const handleAssignPractice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    try {
      setIsAssigningPractice(true);
      await studentService.assignPractice(student.id, {
        subject: selectedPracticeSubject,
        topic: practiceTopic,
        questionsCount: parseInt(practiceQuestionCount, 10) || 10,
      });
      setIsPracticeModalOpen(false);
      showSuccess(
        'Practice Assigned!',
        `${practiceQuestionCount} questions on "${practiceTopic}" assigned to ${student.name}.`,
        undefined,
        'Done'
      );
    } catch (err: any) {
      showError('Error', err?.message || 'Failed to assign practice.');
    } finally {
      setIsAssigningPractice(false);
    }
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return 'text-[#0D6D62] font-bold';
    if (score >= 70) return 'text-[#D97706] font-bold';
    return 'text-[#DC2626] font-bold';
  };

  if (isLoading) {
    return (
      <AdminLayout
        activeNav="Students"
        breadcrumbs={[
          { label: 'Management', href: '/classes' },
          { label: 'Students', href: '/students' },
          { label: 'Loading...' },
        ]}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 h-40 animate-pulse"></div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 h-60 animate-pulse"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!student) {
    return (
      <AdminLayout
        activeNav="Students"
        breadcrumbs={[
          { label: 'Management', href: '/classes' },
          { label: 'Students', href: '/students' },
          { label: 'Not Found' },
        ]}
      >
        <div className="max-w-4xl mx-auto text-center py-20 bg-white border border-gray-200 rounded-2xl p-8">
          <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Student Not Found</h2>
          <p className="text-xs text-gray-500 mt-1 mb-5">
            The requested student profile could not be found or has not yet enrolled.
          </p>
          <Link
            href="/students"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D6D62] text-white text-xs font-bold"
          >
            Back to Student Directory
          </Link>
        </div>
      </AdminLayout>
    );
  }

  // Circular progress calculations
  const progressVal =
    typeof student.overallProgress === 'number'
      ? student.overallProgress
      : typeof student.progress === 'number'
      ? student.progress
      : 0;
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressVal / 100) * circumference;

  return (
    <AdminLayout
      activeNav="Students"
      breadcrumbs={[
        { label: 'Management', href: '/classes' },
        { label: 'Students', href: '/students' },
        { label: student.name },
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* =========================================================================
            TOP NAV: Back Link + Student Profile Header
            ========================================================================= */}
        <div>
          <Link
            href="/students"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0D6D62] hover:underline cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Students</span>
          </Link>
        </div>

        {/* Student Avatar & Identification */}
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-gray-100 relative">
            {student.avatar ? (
              <img
                src={student.avatar}
                alt={student.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 text-sm">
                {student.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              {student.name}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              Class {student.className || 'JSS 1'} • Roll {student.rollNumber || '#14'}
            </p>
          </div>
        </div>

        {/* =========================================================================
            OVERALL SYLLABUS PROGRESS CARD (Figma Match: Circular Ring + Text)
            ========================================================================= */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex items-center gap-5 sm:gap-6">
          {/* Circular SVG Gauge */}
          <div className="relative w-20 h-20 sm:w-22 sm:h-22 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-gray-100"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-[#0D6D62] transition-all duration-1000 ease-out"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-sm sm:text-base font-extrabold text-[#0D6D62]">
              {progressVal}%
            </span>
          </div>

          {/* Details */}
          <div className="space-y-1">
            <h2 className="text-sm sm:text-base font-extrabold text-gray-900">
              Overall Syllabus Progress
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
              {student.milestoneSummary || 'Consistently ahead of average class milestones.'}
            </p>
          </div>
        </div>

        {/* =========================================================================
            4 QUICK STAT PILLS (Figma Match: 8 Subjects, 14 Completed, 4 In Progress, 88% Avg Score)
            ========================================================================= */}
        <div className="bg-[#E6F7F2]/70 border border-[#0D6D62]/15 rounded-2xl p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center">
          <div className="bg-white/80 rounded-xl py-2 px-3">
            <div className="text-sm sm:text-base font-extrabold text-gray-900">
              {student.stats.subjectsCount}
            </div>
            <div className="text-[10px] sm:text-xs font-semibold text-gray-500">Subjects</div>
          </div>
          <div className="bg-white/80 rounded-xl py-2 px-3">
            <div className="text-sm sm:text-base font-extrabold text-gray-900">
              {student.stats.completedCount}
            </div>
            <div className="text-[10px] sm:text-xs font-semibold text-gray-500">Completed</div>
          </div>
          <div className="bg-white/80 rounded-xl py-2 px-3">
            <div className="text-sm sm:text-base font-extrabold text-gray-900">
              {student.stats.inProgressCount}
            </div>
            <div className="text-[10px] sm:text-xs font-semibold text-gray-500">In Progress</div>
          </div>
          <div className="bg-white/80 rounded-xl py-2 px-3">
            <div className="text-sm sm:text-base font-extrabold text-[#0D6D62]">
              {student.stats.avgScore}%
            </div>
            <div className="text-[10px] sm:text-xs font-semibold text-gray-500">Avg Score</div>
          </div>
        </div>

        {/* =========================================================================
            SUBJECT BREAKDOWN (Figma Match: Science, Mathematics, English)
            ========================================================================= */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-sm sm:text-base font-extrabold text-gray-900">
            Subject Breakdown
          </h2>

          <div className="space-y-4">
            {student.subjectBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-extrabold text-gray-900">{item.subject}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[#0D6D62]">{item.scoreAvg}% Avg</span>
                    <span className="text-[11px] text-gray-400">
                      {item.completedTopics}/{item.totalTopics} Topics
                    </span>
                  </div>
                </div>

                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#0D6D62] transition-all duration-500"
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================================
            RECENT QUIZ SCORES (Figma Match: Chemical Reactions, Quadratic Equations, Cell Division)
            ========================================================================= */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3.5">
          <h2 className="text-sm sm:text-base font-extrabold text-gray-900">
            Recent Quiz Scores
          </h2>

          <div className="divide-y divide-gray-100">
            {student.recentQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
              >
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-gray-900">
                    {quiz.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                    {quiz.subject} • {quiz.timestamp}
                  </p>
                </div>
                <div className={`text-sm sm:text-base ${getScoreBadgeColor(quiz.score)}`}>
                  {quiz.score}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================================
            INSIGHTS & ACTIVITY SECTION (Figma Match: Study Duration Chart, Insights, Buttons)
            ========================================================================= */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          {/* Header & Total Hours */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-gray-900">
                Study Duration
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
                Weekly active learning time
              </p>
            </div>
            <div className="text-sm sm:text-base font-extrabold text-[#0D6D62]">
              {student.studyDuration.totalHours}h Total
            </div>
          </div>

          {/* MTWTFSS Weekly Bar Chart */}
          <div className="pt-2 pb-1">
            <div className="h-28 sm:h-32 flex items-end justify-between gap-2 px-2 sm:px-6">
              {student.studyDuration.weekly.map((dayItem, index) => {
                // Height percentage relative to 2.0 max hours
                const maxHours = 2.0;
                const heightPct = Math.min(100, Math.max(15, (dayItem.hours / maxHours) * 100));

                return (
                  <div key={index} className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-full flex items-end justify-center h-20 sm:h-24">
                      <div
                        className={`w-3 sm:w-4 rounded-full transition-all duration-500 ${
                          dayItem.active
                            ? 'bg-[#0D6D62] shadow-xs'
                            : 'bg-gray-200/90 hover:bg-gray-300'
                        }`}
                        style={{ height: `${heightPct}%` }}
                        title={`${dayItem.day}: ${dayItem.hours}h`}
                      ></div>
                    </div>
                    <span
                      className={`text-[11px] sm:text-xs font-bold ${
                        dayItem.active ? 'text-[#0D6D62]' : 'text-gray-400'
                      }`}
                    >
                      {dayItem.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Performance Insights Cards */}
          <div className="space-y-2.5 pt-2">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Performance Insights
            </div>

            {/* 1. Strongest Subject */}
            <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/70">
              <div className="w-8 h-8 rounded-full bg-[#E6F7F2] text-[#0D6D62] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="text-gray-500 font-medium">Strongest Subject</div>
                <div className="font-extrabold text-gray-900">
                  {student.performanceInsights.strongestSubject.title} (
                  {student.performanceInsights.strongestSubject.score}% Avg)
                </div>
              </div>
            </div>

            {/* 2. Needs Improvement */}
            <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/70">
              <div className="w-8 h-8 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="text-gray-500 font-medium">Needs Improvement</div>
                <div className="font-extrabold text-gray-900">
                  {student.performanceInsights.needsImprovement.title} (
                  {student.performanceInsights.needsImprovement.score}% Avg)
                </div>
              </div>
            </div>

            {/* 3. Learning Streak */}
            <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/70">
              <div className="w-8 h-8 rounded-full bg-[#CCFBF1] text-[#0F766E] flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="text-gray-500 font-medium">Current Learning Streak</div>
                <div className="font-extrabold text-gray-900">
                  {student.performanceInsights.learningStreak} Days
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons: Send Encouragement & Assign Extra Practice */}
          <div className="flex flex-col sm:flex-row gap-3 pt-3">
            <button
              onClick={() => setIsEncourageModalOpen(true)}
              className="flex-1 py-3 px-4 rounded-xl bg-[#0D6D62] hover:bg-[#0A5A51] text-white text-xs sm:text-sm font-extrabold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send Encouragement</span>
            </button>

            <button
              onClick={() => setIsPracticeModalOpen(true)}
              className="flex-1 py-3 px-4 rounded-xl border-2 border-[#0D6D62] text-[#0D6D62] hover:bg-[#E6F7F2]/60 text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Assign Extra Practice</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: SEND ENCOURAGEMENT
          ========================================================================= */}
      {isEncourageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E6F7F2] text-[#0D6D62] flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-gray-900">Send Encouragement</h3>
              </div>
              <button
                onClick={() => setIsEncourageModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Personalized praise sent directly to {student.name}&apos;s mobile dashboard notification
              feed.
            </p>

            <form onSubmit={handleSendEncouragement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Encouragement Message
                </label>
                <textarea
                  rows={3}
                  value={encouragementMessage}
                  onChange={(e) => setEncouragementMessage(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0D6D62]"
                  placeholder="Type an uplifting message..."
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEncourageModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingEncouragement}
                  className="px-4 py-2 rounded-xl bg-[#0D6D62] hover:bg-[#0A5A51] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {isSendingEncouragement ? 'Sending...' : 'Send Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ASSIGN EXTRA PRACTICE
          ========================================================================= */}
      {isPracticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E6F7F2] text-[#0D6D62] flex items-center justify-center">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-gray-900">Assign Extra Practice</h3>
              </div>
              <button
                onClick={() => setIsPracticeModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Assign targeted practice exercises for {student.name} to reinforce weak topic areas.
            </p>

            <form onSubmit={handleAssignPractice} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Subject</label>
                <select
                  value={selectedPracticeSubject}
                  onChange={(e) => setSelectedPracticeSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0D6D62]"
                >
                  <option value="Science">Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="English">English</option>
                  <option value="History">History</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Target Topic</label>
                <input
                  type="text"
                  value={practiceTopic}
                  onChange={(e) => setPracticeTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0D6D62]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Number of Practice Questions
                </label>
                <select
                  value={practiceQuestionCount}
                  onChange={(e) => setPracticeQuestionCount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0D6D62]"
                >
                  <option value="5">5 Questions (Quick Review)</option>
                  <option value="10">10 Questions (Standard Practice)</option>
                  <option value="15">15 Questions (Deep Drill)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPracticeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigningPractice}
                  className="px-4 py-2 rounded-xl bg-[#0D6D62] hover:bg-[#0A5A51] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {isAssigningPractice ? 'Assigning...' : 'Assign Practice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default function StudentDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <div className="w-8 h-8 border-4 border-[#127A71] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <StudentDetailsContent />
    </Suspense>
  );
}
