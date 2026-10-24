'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useResponseModal } from '@/context/ModalContext';
import AdminLayout from '@/components/layout/AdminLayout';
import { dashboardService, AdminDashboardData, TeacherDashboardData } from '@/services/dashboard.service';
import {
  Users,
  Tv,
  Building2,
  BookOpen,
  BookMarked,
  FileEdit,
  TrendingUp,
  Bell,
  Plus,
  ChevronRight,
  School,
  CheckCircle2,
  Megaphone,
  LogOut,
  Sliders,
  User,
  Headphones,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { showModal, showSuccess, showError } = useResponseModal();

  // Role toggle: 'admin' vs 'teacher'
  const [viewMode, setViewMode] = useState<'admin' | 'teacher'>('admin');

  // Backend live state
  const [adminData, setAdminData] = useState<AdminDashboardData | null>(null);
  const [teacherData, setTeacherData] = useState<TeacherDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Announcement modal
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [isSubmittingAnnouncement, setIsSubmittingAnnouncement] = useState(false);

  // Fetch all dashboard data from ody-backend
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const [adminRes, teacherRes] = await Promise.all([
        dashboardService.getAdminDashboard(),
        dashboardService.getTeacherDashboard(user ? `${user.firstName} ${user.lastName}`.trim() : undefined),
      ]);
      setAdminData(adminRes);
      setTeacherData(teacherRes);
    } catch (err: any) {
      console.error('Failed to fetch dashboard data from ody-backend:', err);
      setFetchError(err?.message || 'Could not connect to ody-backend. Please verify the server is running.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleLogout = () => {
    showModal({
      type: 'warning',
      title: 'Confirm Logout',
      message: 'Are you sure you want to log out of the KSchoolmate Back Office Portal?',
      confirmText: 'Yes, Log Out',
      cancelText: 'Cancel',
      onConfirm: () => {
        logout();
      },
    });
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim()) return;

    setIsSubmittingAnnouncement(true);
    try {
      await dashboardService.createAnnouncement({
        title: announcementTitle.trim(),
        content: announcementContent.trim(),
        audience: 'All Students & Guardians',
        pinned: true,
      });

      setIsAnnouncementModalOpen(false);
      showSuccess(
        'Announcement Published',
        `"${announcementTitle.trim()}" has been broadcast to all staff and students via ody-backend.`
      );
      setAnnouncementTitle('');
      setAnnouncementContent('');
      // Refresh dashboard live data
      fetchDashboardData();
    } catch (err: any) {
      showError('Failed to Create Announcement', err?.message || 'Error communicating with backend.');
    } finally {
      setIsSubmittingAnnouncement(false);
    }
  };

  return (
    <AdminLayout
      activeNav="Dashboard"
      breadcrumbs={[{ label: 'Management', href: '/dashboard' }, { label: 'Dashboard' }]}
    >
      <div className="space-y-6 max-w-6xl pb-8">
        {/* =========================================================================
            PORTAL VIEW SWITCHER
            ========================================================================= */}
        <div className="flex items-center justify-between bg-white border border-gray-200/80 rounded-2xl p-2.5 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2">
              View Mode:
            </span>
            <button
              onClick={() => setViewMode('admin')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'admin'
                  ? 'bg-[#0D6D62] text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              School Administrator {adminData?.adminProfile.name ? `(${adminData.adminProfile.name})` : ''}
            </button>
            <button
              onClick={() => setViewMode('teacher')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'teacher'
                  ? 'bg-[#0D6D62] text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Instructor / Teacher {teacherData?.teacherProfile.name ? `(${teacherData.teacherProfile.name})` : ''}
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 font-medium pr-2">
            <button
              onClick={fetchDashboardData}
              title="Refresh live data from backend"
              className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#0D6D62] transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#0D6D62]' : ''}`} />
            </button>
            <span>Academic Session:</span>
            <strong className="text-gray-700">{adminData?.session || ''}</strong>
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading && !adminData && (
          <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white border border-gray-200/80 rounded-2xl">
            <Loader2 className="w-8 h-8 text-[#0D6D62] animate-spin" />
            <p className="text-sm font-semibold text-gray-600">Loading live dashboard data from ody-backend...</p>
          </div>
        )}

        {/* Error Notice */}
        {fetchError && !adminData && (
          <div className="p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div className="text-sm">
                <span className="font-bold">Failed to load data:</span> {fetchError}
              </div>
            </div>
            <button
              onClick={fetchDashboardData}
              className="px-3.5 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {viewMode === 'admin' && adminData && (
          /* =========================================================================
             1. SCHOOL ADMINISTRATOR DASHBOARD (100% Live from ody-backend)
             ========================================================================= */
          <div className="space-y-6">
            {/* Header Hero Banner */}
            <div className="bg-[#0D5C52] text-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full ring-2 ring-white/50 overflow-hidden shrink-0 bg-white/20 flex items-center justify-center font-bold text-lg text-white">
                  {adminData.adminProfile.avatar ? (
                    <Image
                      src={adminData.adminProfile.avatar}
                      alt={adminData.adminProfile.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <span>
                      {adminData.adminProfile.name
                        ? adminData.adminProfile.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                        : 'AD'}
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-xs text-[#9CD6CE] font-medium">Welcome back,</div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    {adminData.adminProfile.name || 'Administrator'}
                  </h1>
                  <div className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-0.5 rounded-full bg-white/15 border border-white/20 text-xs font-medium text-white">
                    <School className="w-3.5 h-3.5 text-[#9CD6CE]" />
                    <span>{adminData.adminProfile.role || 'Admin'}{adminData.adminProfile.school ? ` · ${adminData.adminProfile.school}` : ''}</span>
                  </div>
                </div>
              </div>

              {/* Notification Bell Badge */}
              <div className="self-end sm:self-center">
                <button
                  onClick={() => router.push('/announce')}
                  className="relative p-2.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white transition-colors cursor-pointer"
                  aria-label="View notifications"
                >
                  <Bell className="w-5 h-5" />
                  {adminData.adminProfile.unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-[#0D5C52]">
                      {adminData.adminProfile.unreadNotifications}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* 4 Overview Metric Cards - Pure live counts from Database */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: Total Students */}
              <Link
                href="/students"
                className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-[#0D6D62] transition-colors group flex flex-col justify-between"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E6F7F3] text-[#0D6D62] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    {adminData.stats.totalStudents.toLocaleString()}
                  </div>
                  <div className="text-xs font-semibold text-gray-500 mt-0.5">Total Students</div>
                </div>
              </Link>

              {/* Card 2: Total Teachers */}
              <Link
                href="/teachers"
                className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-[#0D6D62] transition-colors group flex flex-col justify-between"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E6F7F3] text-[#0D6D62] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Tv className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    {adminData.stats.totalTeachers.toLocaleString()}
                  </div>
                  <div className="text-xs font-semibold text-gray-500 mt-0.5">Total Teachers</div>
                </div>
              </Link>

              {/* Card 3: Total Classes */}
              <Link
                href="/classes"
                className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-[#0D6D62] transition-colors group flex flex-col justify-between"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E6F7F3] text-[#0D6D62] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    {adminData.stats.totalClasses.toLocaleString()}
                  </div>
                  <div className="text-xs font-semibold text-gray-500 mt-0.5">Total Classes</div>
                </div>
              </Link>

              {/* Card 4: Total Subjects */}
              <Link
                href="/subjects"
                className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-[#0D6D62] transition-colors group flex flex-col justify-between"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E6F7F3] text-[#0D6D62] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    {adminData.stats.totalSubjects.toLocaleString()}
                  </div>
                  <div className="text-xs font-semibold text-gray-500 mt-0.5">Total Subjects</div>
                </div>
              </Link>
            </div>

            {/* Recent Activity Card - Live from ody-backend */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">Recent Activity</h2>
                <span className="text-xs font-medium text-gray-400">Live Database Feed</span>
              </div>
              <div className="divide-y divide-gray-100">
                {adminData.recentActivities.length > 0 ? (
                  adminData.recentActivities.map((act) => {
                    const bgClass =
                      act.badgeColor === 'teal'
                        ? 'bg-teal-100 text-[#0D6D62]'
                        : act.badgeColor === 'blue'
                        ? 'bg-blue-100 text-blue-700'
                        : act.badgeColor === 'amber'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700';

                    return (
                      <div key={act.id} className="py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${bgClass} flex items-center justify-center font-bold text-xs shrink-0`}>
                            {act.badge}
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-semibold text-gray-800">
                              {act.text}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">{act.timeAgo}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-6 text-center text-xs text-gray-400">No activity records found in database.</div>
                )}
              </div>
            </div>

            {/* Announcements Card - Live from ody-backend Announcements Collection */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">Announcements</h2>
                <Link href="/announce" className="text-xs font-bold text-[#0D6D62] hover:underline">
                  Manage All
                </Link>
              </div>

              <div className="space-y-3">
                {adminData.announcements.length > 0 ? (
                  adminData.announcements.map((item) => (
                    <div
                      key={item._id}
                      className="p-3.5 rounded-xl border border-amber-100 bg-[#FFFDF7] flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                          <Megaphone className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-gray-900">{item.title}</h4>
                            {item.pinned && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.2 rounded-md">
                                Pinned
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{item.content}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">
                        {item.date}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-gray-400 border border-dashed rounded-xl">
                    No announcements published yet.
                  </div>
                )}
              </div>

              {/* Create Announcement Button */}
              <button
                onClick={() => setIsAnnouncementModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-[#D2F4EB] hover:bg-[#BCE8DD] text-[#0E6659] text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Announcement</span>
              </button>
            </div>

            {/* Management Section Grid */}
            <div className="space-y-3">
              <h2 className="text-base font-bold text-gray-900">Management</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { label: 'Students', href: '/students', icon: Users },
                  { label: 'Teachers', href: '/teachers', icon: Tv },
                  { label: 'Classes', href: '/classes', icon: Building2 },
                  { label: 'Subjects', href: '/subjects', icon: BookOpen },
                  { label: 'Lessons', href: '/lessons', icon: BookMarked },
                  { label: 'Exercises', href: '/exercises', icon: FileEdit },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs hover:border-[#0D6D62] hover:shadow-xs transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#E6F7F3] text-[#0D6D62] flex items-center justify-center group-hover:bg-[#0D6D62] group-hover:text-white transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-gray-800">
                          {item.label}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#0D6D62] transition-colors" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Reports Section */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-3">
              <h2 className="text-base font-bold text-gray-900">Reports</h2>
              <div className="divide-y divide-gray-100">
                {[
                  { label: 'Student Performance', href: '/reports?tab=students', icon: TrendingUp },
                  { label: 'Class Performance', href: '/reports?tab=classes', icon: Users },
                  { label: 'Subject Progress', href: '/reports?tab=subjects', icon: BookOpen },
                  { label: 'Quiz Results', href: '/reports?tab=quizzes', icon: CheckCircle2 },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="py-3 flex items-center justify-between hover:bg-gray-50 px-2 rounded-xl transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#E6F7F3] text-[#0D6D62] flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-gray-800">
                          {item.label}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#0D6D62] transition-colors" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Settings Section */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-3">
              <h2 className="text-base font-bold text-gray-900">Settings</h2>
              <div className="divide-y divide-gray-100">
                {[
                  { label: 'School Information', href: '/settings?tab=school', icon: Building2 },
                  { label: 'Academic Settings', href: '/settings?tab=academic', icon: Sliders },
                  { label: 'Account Settings', href: '/settings?tab=account', icon: User },
                  { label: 'Notifications', href: '/settings?tab=notifications', icon: Bell },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="py-3 flex items-center justify-between hover:bg-gray-50 px-2 rounded-xl transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-gray-800">
                          {item.label}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 transition-colors" />
                    </Link>
                  );
                })}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full py-3 flex items-center justify-between hover:bg-red-50 px-2 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-red-600">Logout</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-300" />
                </button>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'teacher' && teacherData && (
          /* =========================================================================
             2. TEACHER / INSTRUCTOR DASHBOARD (100% Live from ody-backend)
             ========================================================================= */
          <div className="space-y-6">
            {/* Header Hero Banner */}
            <div className="bg-white border border-gray-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#0D6D62] uppercase tracking-wider">
                  {teacherData.teacherProfile.title}
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mt-1">
                  Good Day, {teacherData.teacherProfile.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Welcome back to your curriculum dashboard.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/announce')}
                  className="p-2.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 relative"
                  aria-label="Announcements"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500" />
                </button>
                <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold text-sm flex items-center justify-center">
                  {teacherData.teacherProfile.initials}
                </div>
              </div>
            </div>

            {/* Overview Stats - Live from ody-backend Database */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0D6D62] flex items-center justify-center mb-2">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-2xl font-extrabold text-gray-900">
                  {teacherData.stats.totalStudents}
                </div>
                <div className="text-xs font-semibold text-gray-500">Total Students</div>
              </div>

              <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="text-2xl font-extrabold text-gray-900">
                  {teacherData.stats.totalClasses}
                </div>
                <div className="text-xs font-semibold text-gray-500">Total Classes</div>
              </div>

              <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="text-2xl font-extrabold text-gray-900">
                  {teacherData.stats.totalLessons}
                </div>
                <div className="text-xs font-semibold text-gray-500">Total Lessons</div>
              </div>

              <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
                  <FileEdit className="w-4 h-4" />
                </div>
                <div className="text-2xl font-extrabold text-gray-900">
                  {teacherData.stats.totalExercises}
                </div>
                <div className="text-xs font-semibold text-gray-500">Total Exercises</div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-3">
              <h2 className="text-sm font-bold text-gray-900">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Link
                  href="/lessons/new"
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-100 hover:border-[#0D6D62] bg-[#FAFAFA] text-center group transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-[#E6F7F3] text-[#0D6D62] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-gray-800">Create Lesson</span>
                </Link>

                <Link
                  href="/exercises"
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-100 hover:border-[#0D6D62] bg-[#FAFAFA] text-center group transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-[#E6F7F3] text-[#0D6D62] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                    <FileEdit className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-gray-800">Add Exercise</span>
                </Link>

                <Link
                  href="/lessons"
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-100 hover:border-[#0D6D62] bg-[#FAFAFA] text-center group transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-[#E6F7F3] text-[#0D6D62] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-gray-800">Upload Audio / TTS</span>
                </Link>

                <Link
                  href="/students"
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-100 hover:border-[#0D6D62] bg-[#FAFAFA] text-center group transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-[#E6F7F3] text-[#0D6D62] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-gray-800">View Students</span>
                </Link>
              </div>
            </div>

            {/* My Classes & Recent Activity Columns - Pure DB data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* My Classes */}
              <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900">My Classes</h3>
                  <Link href="/classes" className="text-xs font-bold text-[#0D6D62] hover:underline">
                    See All
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {teacherData.myClasses.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-gray-200/80 bg-[#F9FBFA] flex items-center justify-between"
                    >
                      <div>
                        <div className="font-extrabold text-sm text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {item.studentsCount} Students · {item.subjectsCount} Subjects
                        </div>
                      </div>
                      <Link
                        href={`/students?class=${encodeURIComponent(item.name)}`}
                        className="text-xs font-semibold text-[#0D6D62] hover:underline"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900">Recent Activity</h3>
                  <Link href="/lessons" className="text-xs font-bold text-[#0D6D62] hover:underline">
                    See All
                  </Link>
                </div>

                <div className="space-y-3">
                  {teacherData.recentActivity.length > 0 ? (
                    teacherData.recentActivity.map((act) => (
                      <div key={act.id} className="p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0D6D62] flex items-center justify-center">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-900">{act.title}</div>
                            <div className="text-[11px] text-gray-500">{act.subtitle}</div>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">{act.timeAgo}</span>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-gray-400">No recent lesson updates.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          CREATE ANNOUNCEMENT MODAL (Directly saves into ody-backend MongoDB)
          ========================================================================= */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Create New Announcement</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Broadcast an update to all students, teachers, and guardians in ody-backend.
              </p>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Title <span className="text-emerald-700">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Fair Registration"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Message Content</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Type the announcement details here..."
                  value={announcementContent}
                  onChange={(e) => setAnnouncementContent(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAnnouncement}
                  className="px-5 py-2 rounded-xl bg-[#0D6D62] hover:bg-[#0A5A51] text-white text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingAnnouncement && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Publish Announcement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
