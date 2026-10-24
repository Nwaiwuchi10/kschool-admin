'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { useResponseModal } from '@/context/ModalContext';
import { Plus, Search, FileEdit, Loader2 } from 'lucide-react';
import { exerciseService, Exercise } from '@/services/exercise.service';

export default function ExercisesPage() {
  const { showError } = useResponseModal();
  const [searchTerm, setSearchTerm] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchExercises = async () => {
    try {
      setIsLoading(true);
      const data = await exerciseService.getAllExercises();
      setExercises(data || []);
    } catch (err: any) {
      showError('Load Error', err?.message || 'Unable to fetch exercises from backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const filteredExercises = exercises.filter(
    (ex) =>
      ex.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ex.subject && ex.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AdminLayout
      activeNav="Exercises"
      breadcrumbs={[{ label: 'Management', href: '/classes' }, { label: 'Exercises' }]}
    >
      <div className="space-y-6 max-w-6xl">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Exercises & Practice Sheets
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Create homework assignments, practice worksheets, and problem sets.
            </p>
          </div>

          <Link
            href="/exercises/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D6D62] hover:bg-[#0A5A51] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs shrink-0 cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Exercise</span>
          </Link>
        </div>

        {/* Exercises List Card */}
        <div className="bg-white border border-gray-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search exercises by title or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA]"
              />
            </div>
            <span className="text-xs text-gray-400 font-medium">
              {filteredExercises.length} Exercises found
            </span>
          </div>

          {isLoading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#0D6D62]" />
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="py-16 text-center text-xs text-gray-400 p-8">
              No exercises found in database. Create curriculum lessons and practice sheets to populate this section.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredExercises.map((ex) => (
                <div
                  key={ex._id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F9FBFA] transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <FileEdit className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm sm:text-base">
                          {ex.title}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D2F4EB] text-[#0E6659]">
                          {ex.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-0.5">
                        {ex.subject && <span>Subject: {ex.subject}</span>}
                        {ex.lesson && <span>· Lesson: {ex.lesson}</span>}
                        {ex.classLevel && <span>· Level: {ex.classLevel}</span>}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/exercises/${ex._id}`}
                    className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:border-[#0D6D62] hover:text-[#0D6D62] transition-colors"
                  >
                    View
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
