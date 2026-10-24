'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { dashboardService } from '@/services/dashboard.service';
import {
  TrendingUp,
  Users,
  BookOpen,
  CheckCircle2,
  Download,
  Loader2,
} from 'lucide-react';

function ReportsContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as any) || 'students';
  const [activeTab, setActiveTab] = useState<'students' | 'classes' | 'subjects' | 'quizzes'>(
    initialTab
  );

  const [reportsData, setReportsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        setIsLoading(true);
        const data = await dashboardService.getReports();
        setReportsData(data);
      } catch (err) {
        console.error('Failed to load reports from backend:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadReports();
  }, []);

  return (
    <AdminLayout
      activeNav="Reports"
      breadcrumbs={[{ label: 'Management', href: '/dashboard' }, { label: 'Reports' }]}
    >
      <div className="space-y-6 max-w-6xl">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Reports & Academic Analytics
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Gain curriculum insights, track student retention, and monitor database metrics.
            </p>
          </div>

          <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm font-semibold transition-colors">
            <Download className="w-4 h-4" />
            <span>Export Analytics CSV</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'students', label: 'Student Performance', icon: TrendingUp },
            { id: 'classes', label: 'Class Performance', icon: Users },
            { id: 'subjects', label: 'Subject Progress', icon: BookOpen },
            { id: 'quizzes', label: 'Quiz Results', icon: CheckCircle2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#0D6D62] text-[#0D6D62]'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#0D6D62]" />
          </div>
        ) : (
          <>
            {/* Dynamic Tab Body */}
            {activeTab === 'students' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs">
                    <div className="text-xs font-semibold text-gray-400 uppercase">Average GPA</div>
                    <div className="text-3xl font-extrabold text-gray-900 mt-1">
                      {reportsData?.overview?.averageGpa || 0} / 4.0
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Based on enrolled student data</div>
                  </div>
                  <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs">
                    <div className="text-xs font-semibold text-gray-400 uppercase">
                      Attendance Rate
                    </div>
                    <div className="text-3xl font-extrabold text-[#0D6D62] mt-1">
                      {reportsData?.overview?.attendanceRate || '0%'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {reportsData?.overview?.totalStudents || 0} students tracked
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs">
                    <div className="text-xs font-semibold text-gray-400 uppercase">
                      Honor Roll Students
                    </div>
                    <div className="text-3xl font-extrabold text-amber-600 mt-1">
                      {reportsData?.overview?.honorRollCount || 0}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Verified evaluations</div>
                  </div>
                </div>

                {/* Performance Roster */}
                <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs">
                  <h3 className="text-base font-bold text-gray-900 mb-4">Top Performing Students</h3>
                  {reportsData?.topStudents?.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400">
                      No student records found in database.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {reportsData?.topStudents?.map((st: any, i: number) => (
                        <div key={st.id || i} className="py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#0D6D62] font-extrabold text-xs flex items-center justify-center">
                              {st.rank}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900">{st.name}</div>
                              <div className="text-xs text-gray-400">{st.class}</div>
                            </div>
                          </div>
                          <span className="text-sm font-extrabold text-[#0D6D62]">{st.score}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'classes' && (
              <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-gray-900">Class Overall Progression</h3>
                {reportsData?.classesProgression?.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    No active classes registered in database.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reportsData?.classesProgression?.map((c: any) => (
                      <div key={c.name} className="p-4 rounded-xl border border-gray-100 bg-[#FAFAFA]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-900 text-sm">{c.name}</span>
                          <span className="text-xs font-bold text-[#0D6D62]">{c.passRate}% Pass Rate</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[#0D6D62] h-2 rounded-full"
                            style={{ width: `${c.passRate}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2">
                          <span>{c.lessonsCompleted} Lessons completed</span>
                          <span>{c.teachers} Assigned instructors</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'subjects' && (
              <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-gray-900">Curriculum Completion by Subject</h3>
                {reportsData?.subjectsCoverage?.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    No subjects found in database.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {reportsData?.subjectsCoverage?.map((sub: any) => (
                      <div key={sub.name} className="p-4 rounded-xl border border-gray-100 bg-[#FAFBFB]">
                        <h4 className="font-bold text-gray-900 text-sm">{sub.name}</h4>
                        <div className="text-2xl font-extrabold text-[#0D6D62] mt-1">{sub.coverage}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {sub.hours} classroom lecture hours logged
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'quizzes' && (
              <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-gray-900">Quiz & Test Outcomes</h3>
                {reportsData?.quizzesOutcomes?.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    No quiz tests found in database.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {reportsData?.quizzesOutcomes?.map((q: any) => (
                      <div key={q.id} className="py-3.5 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-gray-900 text-sm">{q.quiz}</span>
                          <div className="text-xs text-gray-400 mt-0.5">{q.taken} Pupils took exam</div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-extrabold text-[#0D6D62]">{q.pass} pass</span>
                          <div className="text-xs text-gray-500">Avg {q.avgScore}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <div className="w-8 h-8 border-4 border-[#0D6D62] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ReportsContent />
    </Suspense>
  );
}
