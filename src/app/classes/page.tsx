'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { classService } from '@/services/class.service';
import { SchoolClass } from '@/types/curriculum.types';
import { useResponseModal } from '@/context/ModalContext';
import {
  Plus,
  Search,
  Building2,
  GraduationCap,
  Backpack,
  ChevronLeft,
  ChevronRight,
  School,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function ClassManagementPage() {
  const router = useRouter();
  const { showModal, showSuccess, showError } = useResponseModal();

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<'All' | 'Primary' | 'Junior Secondary' | 'Senior Secondary'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const pageSize = 7; // Matching screenshot: "Showing 1–7 of 24 classes"

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      // Fetch all classes for admin, including inactive
      const data = await classService.getAllAdminClasses();
      if (data && data.length > 0) {
        setClasses(data);
      } else {
        // Fallback fetch
        const activeOnly = await classService.getClasses();
        setClasses(activeOnly);
      }
    } catch (err: any) {
      showError('Error Loading Classes', err?.message || 'Unable to fetch classes from server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Filter classes
  const filteredClasses = classes.filter((cls) => {
    // Level filter
    const matchesLevel =
      levelFilter === 'All'
        ? true
        : levelFilter === 'Primary'
        ? cls.category === 'Primary' || cls.name.toLowerCase().includes('primary')
        : levelFilter === 'Junior Secondary'
        ? cls.category === 'Junior Secondary' || cls.name.toLowerCase().includes('jss')
        : cls.category === 'Senior Secondary' || cls.name.toLowerCase().includes('ss');

    // Search filter
    const matchesSearch =
      !searchTerm.trim() ||
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cls.description && cls.description.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesLevel && matchesSearch;
  });

  // Pagination calculation
  const totalItems = filteredClasses.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedClasses = filteredClasses.slice(startIndex, startIndex + pageSize);

  // Stats calculation
  const totalCount = classes.length;
  const primaryCount = classes.filter(
    (c) => c.category === 'Primary' || c.name.toLowerCase().includes('primary'),
  ).length;
  const secondaryCount = totalCount - primaryCount;

  // Toggle Activate / Deactivate
  const handleToggleStatus = (cls: SchoolClass) => {
    const isActivating = !cls.isActive;
    const actionWord = isActivating ? 'Activate' : 'Deactivate';

    showModal({
      type: isActivating ? 'info' : 'warning',
      title: `${actionWord} ${cls.name}?`,
      message: isActivating
        ? `Activating this class will make all associated subjects and learning materials available for student enrollment.`
        : `Deactivating will pause student access to this class. All learning materials, topics, and quiz data will be retained safely.`,
      confirmText: `Yes, ${actionWord}`,
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          setActionLoadingId(cls._id);
          await classService.updateClass(cls._id, { isActive: isActivating });
          showSuccess(
            `Class ${isActivating ? 'Activated' : 'Deactivated'}`,
            `${cls.name} has been ${isActivating ? 'activated' : 'deactivated'} successfully.`,
          );
          await fetchClasses();
        } catch (err: any) {
          showError(`Failed to ${actionWord}`, err?.message || 'Could not update class status.');
        } finally {
          setActionLoadingId(null);
        }
      },
    });
  };

  // Helper formatting for dates
  const formatDate = (dateStr?: string) => {
    if (dateStr) {
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      } catch {
        // Fallback
      }
    }
    return '—';
  };

  const getEducationLevelLabel = (cls: SchoolClass) => {
    if (cls.category) return cls.category;
    if (cls.name.toLowerCase().includes('primary')) return 'Primary';
    if (cls.name.toLowerCase().includes('jss')) return 'Junior Secondary';
    return 'Senior Secondary';
  };

  const getSubjectCount = (cls: SchoolClass) => {
    return cls.subjectCount ?? 0;
  };

  return (
    <AdminLayout
      activeNav="Classes"
      breadcrumbs={[{ label: 'Management', href: '/classes' }, { label: 'Classes' }]}
    >
      <div className="space-y-6">
        {/* =========================================================================
            HEADER TITLE & CREATE CLASS ACTION
            ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Class Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Create and manage classes and organize their learning content.
            </p>
          </div>

          <Link
            href="/classes/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D6D62] hover:bg-[#0A5A51] text-white text-sm font-semibold transition-all shadow-xs shrink-0 cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Class</span>
          </Link>
        </div>

        {/* =========================================================================
            TOP 3 STATS CARDS (Matching Mobile & Desktop Screenshots: 3-column row)
            ========================================================================= */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {/* Card 1: Total Classes */}
          <div className="bg-white border border-gray-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-2xs flex flex-col justify-between">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#E6F7F3] text-[#0D6D62] flex items-center justify-center mb-2 sm:mb-3">
              <School className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {totalCount}
              </div>
              <div className="text-[10px] sm:text-xs font-semibold text-gray-500 mt-0.5 truncate">
                Total classes
              </div>
            </div>
          </div>

          {/* Card 2: Primary Classes */}
          <div className="bg-white border border-gray-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-2xs flex flex-col justify-between">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#E6F7F3] text-[#0D6D62] flex items-center justify-center mb-2 sm:mb-3">
              <Backpack className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {primaryCount}
              </div>
              <div className="text-[10px] sm:text-xs font-semibold text-gray-500 mt-0.5 truncate">
                Primary classes
              </div>
            </div>
          </div>

          {/* Card 3: Secondary Classes */}
          <div className="bg-white border border-gray-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-2xs flex flex-col justify-between">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#E6F7F3] text-[#0D6D62] flex items-center justify-center mb-2 sm:mb-3">
              <GraduationCap className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {secondaryCount}
              </div>
              <div className="text-[10px] sm:text-xs font-semibold text-gray-500 mt-0.5 truncate">
                Secondary classes
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            ALL CLASSES PANEL (Card with Search, Filters, and Table/Mobile Cards)
            ========================================================================= */}
        <div className="bg-white border border-gray-200/90 rounded-2xl shadow-xs overflow-hidden">
          {/* Top Filter and Search Bar */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
              {/* Search Input */}
              <div className="relative flex-1 max-w-xs sm:max-w-sm">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search classes"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-[#0D6D62] focus:ring-1 focus:ring-[#0D6D62] bg-[#FAFAFA]"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {(['All', 'Primary', 'Junior Secondary', 'Senior Secondary'] as const).map((level) => {
                  const isSelected = levelFilter === level;
                  const label = level === 'All' ? 'All levels' : level;

                  return (
                    <button
                      key={level}
                      onClick={() => {
                        setLevelFilter(level);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                        isSelected
                          ? 'bg-[#E6F7F3] border border-[#0D6D62] text-[#0D6D62]'
                          : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Total Classes Count Counter */}
            <div className="text-xs font-semibold text-gray-500 whitespace-nowrap self-end lg:self-auto">
              {totalItems} {totalItems === 1 ? 'class' : 'classes'}
            </div>
          </div>

          {/* =====================================================================
              DESKTOP DATA TABLE (Visible on sm and up)
              ===================================================================== */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#FAFBFB] text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-5">Class name</th>
                  <th className="py-3.5 px-4">Education level</th>
                  <th className="py-3.5 px-4">Subjects</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date created</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-7 h-7 border-3 border-[#0D6D62] border-t-transparent rounded-full animate-spin"></div>
                        <span>Loading classes...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedClasses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      No classes found matching your search.
                    </td>
                  </tr>
                ) : (
                  paginatedClasses.map((cls) => {
                    const activeState = cls.isActive !== false;

                    return (
                      <tr key={cls._id || cls.code || cls.name} className="hover:bg-[#F9FBFA] transition-colors">
                        {/* Class name */}
                        <td className="py-4 px-5 font-bold text-gray-900">{cls.name}</td>

                        {/* Education level */}
                        <td className="py-4 px-4 text-gray-600">{getEducationLevelLabel(cls)}</td>

                        {/* Subjects count */}
                        <td className="py-4 px-4 text-gray-600">{getSubjectCount(cls)}</td>

                        {/* Status badge */}
                        <td className="py-4 px-4">
                          {activeState ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#D2F4EB] text-[#0E6659]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0E6659]"></span>
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E5E7EB] text-[#4B5563]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]"></span>
                              <span>Inactive</span>
                            </span>
                          )}
                        </td>

                        {/* Date created */}
                        <td className="py-4 px-4 text-gray-500">{formatDate(cls.createdAt)}</td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right whitespace-nowrap space-x-3">
                          <Link
                            href={`/classes/${cls._id || cls.name.toLowerCase().replace(/\s+/g, '-')}`}
                            className="text-[#0D6D62] hover:text-[#0A5A51] font-bold hover:underline"
                          >
                            View Details
                          </Link>
                          <Link
                            href={`/classes/${cls._id || cls.name.toLowerCase().replace(/\s+/g, '-')}/edit`}
                            className="text-[#0D6D62] hover:text-[#0A5A51] font-bold hover:underline"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleToggleStatus(cls)}
                            disabled={actionLoadingId === cls._id}
                            className={`font-bold hover:underline cursor-pointer ${
                              activeState
                                ? 'text-[#D94141] hover:text-red-700'
                                : 'text-[#0D6D62] hover:text-[#0A5A51]'
                            }`}
                          >
                            {actionLoadingId === cls._id
                              ? 'Saving...'
                              : activeState
                              ? 'Deactivate'
                              : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* =====================================================================
              MOBILE CARDS LIST (Matching Mobile Screenshot 1 Exactly)
              ===================================================================== */}
          <div className="sm:hidden divide-y divide-gray-100 p-3 space-y-3">
            {isLoading ? (
              <div className="py-12 text-center text-gray-400">
                <div className="w-7 h-7 border-3 border-[#0D6D62] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <span>Loading classes...</span>
              </div>
            ) : paginatedClasses.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-xs">
                No classes found matching search.
              </div>
            ) : (
              paginatedClasses.map((cls) => {
                const activeState = cls.isActive !== false;

                return (
                  <div
                    key={cls._id || cls.code || cls.name}
                    className="p-3.5 bg-white border border-gray-100 rounded-xl shadow-2xs space-y-2.5"
                  >
                    {/* Top Row: Name and Status */}
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 text-base">{cls.name}</span>
                      {activeState ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D2F4EB] text-[#0E6659]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0E6659]"></span>
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E5E7EB] text-[#4B5563]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]"></span>
                          <span>Inactive</span>
                        </span>
                      )}
                    </div>

                    {/* Category */}
                    <div className="text-xs text-gray-500 font-medium">
                      {getEducationLevelLabel(cls)}
                    </div>

                    {/* Metadata */}
                    <div className="text-[11px] text-gray-400">
                      {getSubjectCount(cls)} subjects &nbsp;·&nbsp; Created {formatDate(cls.createdAt)}
                    </div>

                    {/* Action Buttons Row */}
                    <div className="pt-2 flex items-center gap-2 border-t border-gray-50">
                      <Link
                        href={`/classes/${cls._id || cls.name.toLowerCase().replace(/\s+/g, '-')}`}
                        className="flex-1 py-1.5 text-center text-xs font-bold rounded-lg border border-[#D2F4EB] text-[#0D6D62] hover:bg-[#E6F7F3] transition-colors"
                      >
                        View Details
                      </Link>
                      <Link
                        href={`/classes/${cls._id || cls.name.toLowerCase().replace(/\s+/g, '-')}/edit`}
                        className="px-3 py-1.5 text-center text-xs font-bold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(cls)}
                        disabled={actionLoadingId === cls._id}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                          activeState
                            ? 'border-red-100 text-[#D94141] hover:bg-red-50'
                            : 'border-emerald-100 text-[#0D6D62] hover:bg-emerald-50'
                        }`}
                      >
                        {actionLoadingId === cls._id
                          ? '...'
                          : activeState
                          ? 'Deactivate'
                          : 'Activate'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* =====================================================================
              PAGINATION FOOTER (Matching Screenshot Exactly)
              ===================================================================== */}
          <div className="p-4 sm:p-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 font-medium">
            <div>
              Showing {startIndex + 1}–{Math.min(startIndex + pageSize, totalItems)} of {totalItems} classes
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-gray-700"
              >
                Previous
              </button>

              <span className="w-8 h-8 rounded-lg bg-[#D2F4EB] text-[#0E6659] font-bold flex items-center justify-center">
                {currentPage}
              </span>
              <span className="text-gray-400">of {totalPages}</span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Helper Note */}
        <p className="text-xs text-gray-500 italic">
          Deactivate a class to pause its availability without removing its subjects or learning content.
        </p>
      </div>
    </AdminLayout>
  );
}
