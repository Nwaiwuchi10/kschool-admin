'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { useResponseModal } from '@/context/ModalContext';
import apiClient from '@/services/api';
import { quizService } from '@/services/quiz.service';
import { Plus, Search, CheckSquare, Loader2, Trash2 } from 'lucide-react';

interface QuizItem {
  _id: string;
  title: string;
  subject?: string;
  classLevel?: string;
  questionsCount: number;
  passingScore?: string;
  status: string;
}

export default function QuizzesPage() {
  const { showModal, showSuccess, showError } = useResponseModal();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQuizzes = async () => {
    try {
      setIsLoading(true);
      // Fetch direct quizzes from backend
      const directQuizzes = await quizService.getAllQuizzes();
      const list: QuizItem[] = [];

      if (directQuizzes && directQuizzes.length > 0) {
        directQuizzes.forEach((q: any) => {
          list.push({
            _id: q._id,
            title: q.title || 'Curriculum Quiz',
            subject: q.topic?.subject?.name || q.topic?.title || 'General',
            classLevel: q.topic?.subject?.classLevel || '',
            questionsCount: q.questions?.length || 0,
            passingScore: '70%',
            status: 'active',
          });
        });
      } else {
        // Also check populated subjects topics quizzes
        const subjectsRes = await apiClient.get<any[]>('/subjects');
        const subjects = subjectsRes.data || [];

        subjects.forEach((sub: any) => {
          if (sub.topics && Array.isArray(sub.topics)) {
            sub.topics.forEach((t: any) => {
              if (t.quizzes && Array.isArray(t.quizzes)) {
                t.quizzes.forEach((q: any) => {
                  list.push({
                    _id: q._id || String(q),
                    title: q.title || `${t.title} Quiz`,
                    subject: sub.name,
                    classLevel: sub.classLevel,
                    questionsCount: q.questions?.length || 0,
                    passingScore: '70%',
                    status: 'active',
                  });
                });
              }
            });
          }
        });
      }

      setQuizzes(list);
    } catch (err: any) {
      showError('Load Failed', err?.message || 'Could not fetch quizzes from database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const filteredQuizzes = quizzes.filter((q) => {
    const matchesSearch =
      !searchTerm.trim() ||
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.subject && q.subject.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = selectedSubject === 'All' || q.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const handleDelete = (id: string, title: string) => {
    showModal({
      type: 'warning',
      title: 'Delete Quiz?',
      message: `Are you sure you want to delete quiz "${title}" from database?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await apiClient.delete(`/quizzes/${id}`);
          showSuccess('Deleted', 'Quiz removed from database.');
          fetchQuizzes();
        } catch (err: any) {
          showError('Delete Failed', err?.message || 'Failed to delete quiz.');
        }
      },
    });
  };

  return (
    <AdminLayout
      activeNav="Quizzes"
      breadcrumbs={[{ label: 'Management', href: '/classes' }, { label: 'Quizzes' }]}
    >
      <div className="space-y-6 max-w-6xl">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Quizzes & Tests
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Create multiple-choice assessments, set passing benchmarks, and evaluate student mastery.
            </p>
          </div>

          <Link
            href="/quizzes/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D6D62] hover:bg-[#0A5A51] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs shrink-0 cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Quiz</span>
          </Link>
        </div>

        {/* Quizzes List Card */}
        <div className="bg-white border border-gray-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search quizzes by title or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA]"
              />
            </div>

            <div className="text-xs text-gray-400 font-medium">
              {filteredQuizzes.length} Quizzes active in database
            </div>
          </div>

          {isLoading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#0D6D62]" />
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="py-16 text-center text-xs text-gray-400 p-8">
              No quizzes found in database. Click &ldquo;Create Quiz&rdquo; above to add assessments.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredQuizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F9FBFA] transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0D6D62] flex items-center justify-center shrink-0">
                      <CheckSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm sm:text-base">
                          {quiz.title}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D2F4EB] text-[#0E6659]">
                          {quiz.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-0.5">
                        {quiz.subject && <span>Subject: {quiz.subject}</span>}
                        {quiz.classLevel && <span>· Level: {quiz.classLevel}</span>}
                        <span>· {quiz.questionsCount} Questions</span>
                        <span>· Pass: {quiz.passingScore}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link
                      href={`/quizzes/${quiz._id}/edit`}
                      className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:border-[#0D6D62] hover:text-[#0D6D62] transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(quiz._id, quiz.title)}
                      className="p-1.5 rounded-xl border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
