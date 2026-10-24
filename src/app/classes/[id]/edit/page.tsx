'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { classService } from '@/services/class.service';
import { SchoolClass } from '@/types/curriculum.types';
import { useResponseModal } from '@/context/ModalContext';
import { ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';

function EditClassContent() {
  const params = useParams();
  const router = useRouter();
  const { showModal, showSuccess, showError } = useResponseModal();

  const idParam = Array.isArray(params?.id) ? params.id[0] : params?.id || '';

  const [classData, setClassData] = useState<SchoolClass | null>(null);
  const [className, setClassName] = useState('');
  const [educationLevel, setEducationLevel] = useState<'Primary' | 'Junior Secondary' | 'Senior Secondary'>('Primary');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        setIsLoading(true);
        let cls: SchoolClass | null = null;
        try {
          cls = await classService.getClassById(idParam);
        } catch {
          const all = await classService.getAllAdminClasses();
          cls = all.find(
            (c) =>
              c._id === idParam ||
              c.code === idParam ||
              c.name.toLowerCase() === idParam.toLowerCase() ||
              c.name.toLowerCase().replace(/\s+/g, '-') === idParam.toLowerCase()
          ) || null;
        }

        if (cls) {
          setClassData(cls);
          setClassName(cls.name);
          setEducationLevel(cls.category || 'Primary');
          setDescription(cls.description || `Foundation learning content for ${cls.name} pupils.`);
          setStatus(cls.isActive !== false ? 'Active' : 'Inactive');
        } else {
          const fallbackName = idParam.replace('-', ' ') || 'Primary 3';
          setClassName(fallbackName);
          setDescription(`Foundation learning content for ${fallbackName} pupils.`);
        }
      } catch (err: any) {
        showError('Error Loading Class', err?.message || 'Could not load class.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClass();
  }, [idParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) {
      showError('Validation Error', 'Class name cannot be empty.');
      return;
    }

    const saveChanges = async () => {
      try {
        setIsSubmitting(true);
        const targetId = classData?._id || idParam;

        await classService.updateClass(targetId, {
          name: className.trim(),
          category: educationLevel,
          description: description.trim() || undefined,
          isActive: status === 'Active',
        });

        showSuccess(
          'Changes Saved',
          `Class "${className.trim()}" has been updated successfully.`,
          () => router.push(`/classes/${targetId}`),
          'View Class Details'
        );
      } catch (err: any) {
        showError(
          'Update Failed',
          err?.response?.data?.message || err?.message || 'Failed to update class details.'
        );
      } finally {
        setIsSubmitting(false);
      }
    };

    // If changing from active to inactive, trigger confirmation modal per screenshot specification!
    if (classData?.isActive !== false && status === 'Inactive') {
      showModal({
        type: 'warning',
        title: `Deactivate ${className}?`,
        message:
          'Choosing inactive and saving will pause this class from student enrollment. All existing learning content and quizzes are retained.',
        confirmText: 'Yes, Save as Inactive',
        cancelText: 'Cancel',
        onConfirm: saveChanges,
      });
    } else {
      await saveChanges();
    }
  };

  const displayName = classData?.name || className || 'Primary 3';

  return (
    <AdminLayout
      activeNav="Classes"
      breadcrumbs={[
        { label: 'Management', href: '/classes' },
        { label: 'Classes', href: '/classes' },
        { label: `${displayName} / Edit` },
      ]}
    >
      <div className="space-y-6 max-w-6xl">
        {/* Header Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Edit Class
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Update class information and control its availability.
          </p>
        </div>

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* =====================================================================
              LEFT COLUMN: MAIN EDIT FORM
              ===================================================================== */}
          <div className="lg:col-span-8 bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-7 shadow-xs">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Card Section Header */}
              <div>
                <h2 className="text-base font-bold text-gray-900">Class information</h2>
                <p className="text-xs text-gray-400 mt-0.5">Fields marked * are required.</p>
              </div>

              {/* Class name * */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-gray-800">
                  Class name <span className="text-emerald-700">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] focus:ring-1 focus:ring-[#0D6D62] bg-[#FAFAFA]"
                />
                <p className="text-xs text-gray-400">
                  Use a unique name, for example Primary 3 or JSS 1.
                </p>
              </div>

              {/* Education level * */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold text-gray-800">
                  Education level <span className="text-emerald-700">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(['Primary', 'Junior Secondary', 'Senior Secondary'] as const).map((lvl) => {
                    const isSelected = educationLevel === lvl;
                    return (
                      <button
                        type="button"
                        key={lvl}
                        onClick={() => setEducationLevel(lvl)}
                        className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-xs sm:text-sm font-medium transition-all text-left cursor-pointer ${
                          isSelected
                            ? 'border-[#0D6D62] bg-[#E6F7F3] text-gray-900 font-semibold'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-[#0D6D62] bg-[#0D6D62]' : 'border-gray-300'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                        <span>{lvl}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description (optional) */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-gray-800">
                  Description (optional)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] focus:ring-1 focus:ring-[#0D6D62] bg-[#FAFAFA]"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold text-gray-800">
                  Status
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(['Active', 'Inactive'] as const).map((st) => {
                    const isSelected = status === st;
                    return (
                      <button
                        type="button"
                        key={st}
                        onClick={() => setStatus(st)}
                        className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-xs sm:text-sm font-medium transition-all text-left cursor-pointer ${
                          isSelected
                            ? 'border-[#0D6D62] bg-[#E6F7F3] text-gray-900 font-semibold'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-[#0D6D62] bg-[#0D6D62]' : 'border-gray-300'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                        <span>{st}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400">
                  Active classes are available for learning. Inactive classes retain all existing content.
                </p>
              </div>

              {/* Status changes require confirmation Alert Box (Matching Screenshot Exactly) */}
              <div className="p-4 rounded-xl bg-[#E6F7F3] border border-[#BCE8DD] flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#0D6D62] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="text-xs sm:text-sm font-bold text-gray-900">
                    Status changes require confirmation
                  </div>
                  <div className="text-xs text-gray-600 leading-relaxed">
                    Choosing inactive and saving will ask you to confirm before the class is deactivated.
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-end gap-3 border-t border-gray-100">
                <Link
                  href={`/classes/${classData?._id || idParam}`}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors text-center"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#0D6D62] hover:bg-[#0A5A51] text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* =====================================================================
              RIGHT COLUMN: CLASS SUMMARY CARD (Matching Screenshot 4 Exactly)
              ===================================================================== */}
          <div className="lg:col-span-4 bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-gray-900">{displayName}</h3>
              {status === 'Active' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#D2F4EB] text-[#0E6659]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0E6659]"></span>
                  <span>Active</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E5E7EB] text-[#4B5563]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]"></span>
                  <span>Inactive</span>
                </span>
              )}
            </div>

            <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">
              {educationLevel}
            </div>

            <div className="space-y-1 text-xs text-gray-600 pt-1 border-t border-gray-100">
              <div className="font-semibold text-gray-800">3 assigned subjects</div>
              <div>12 topics · 36 lessons</div>
              <div>24 exercises · 12 quizzes</div>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 leading-relaxed italic">
                Editing class details does not remove or change its learning content.
              </p>
              <div className="text-[11px] text-gray-400 mt-2">
                Created 18 Oct 2026
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function EditClassPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F7F9FA]">
          <div className="w-8 h-8 border-3 border-[#0D6D62] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <EditClassContent />
    </Suspense>
  );
}
