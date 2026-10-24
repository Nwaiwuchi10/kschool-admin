'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { classService } from '@/services/class.service';
import { useResponseModal } from '@/context/ModalContext';
import { Network, CheckCircle2 } from 'lucide-react';

export default function CreateClassPage() {
  const router = useRouter();
  const { showSuccess, showError } = useResponseModal();

  const [className, setClassName] = useState('');
  const [educationLevel, setEducationLevel] = useState<'Primary' | 'Junior Secondary' | 'Senior Secondary'>('Primary');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = className.trim();
    if (!trimmedName) {
      showError('Validation Error', 'Class name is required.');
      return;
    }

    try {
      setIsSubmitting(true);

      const code = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      // Order calculation heuristic
      let order = 1;
      if (educationLevel === 'Primary') {
        const num = trimmedName.match(/\d+/)?.[0];
        order = num ? parseInt(num, 10) : 1;
      } else if (educationLevel === 'Junior Secondary') {
        const num = trimmedName.match(/\d+/)?.[0];
        order = 6 + (num ? parseInt(num, 10) : 1);
      } else {
        const num = trimmedName.match(/\d+/)?.[0];
        order = 9 + (num ? parseInt(num, 10) : 1);
      }

      await classService.createClass({
        name: trimmedName,
        code,
        category: educationLevel,
        order,
        description: description.trim() || undefined,
        isActive: status === 'Active',
      });

      showSuccess(
        'Class Created',
        `Class "${trimmedName}" has been successfully added to Greenfield Academy's curriculum.`,
        () => router.push('/classes'),
        'Go to Classes'
      );
    } catch (err: any) {
      showError(
        'Failed to Create Class',
        err?.response?.data?.message || err?.message || 'An error occurred while creating the class.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout
      activeNav="Classes"
      breadcrumbs={[
        { label: 'Management', href: '/classes' },
        { label: 'Classes', href: '/classes' },
        { label: 'Create Class' },
      ]}
    >
      <div className="space-y-6 max-w-6xl">
        {/* Header Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Create Class
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Set up a class, then assign subjects and organize its learning content.
          </p>
        </div>

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* =====================================================================
              LEFT COLUMN: MAIN FORM
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
                  placeholder="Primary 3"
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
                  placeholder="Foundation learning content for Primary 3 pupils."
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

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-end gap-3 border-t border-gray-100">
                <Link
                  href="/classes"
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
                  <span>{isSubmitting ? 'Creating Class...' : 'Create Class'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* =====================================================================
              RIGHT COLUMN: "A HOME FOR LEARNING CONTENT" WIDGET (Matching Screenshot Exactly)
              ===================================================================== */}
          <div className="lg:col-span-4 bg-[#F2FAF7] border border-[#D5EFE7] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
            {/* Widget Icon */}
            <div className="w-10 h-10 rounded-xl bg-[#D2F4EB] text-[#0D6D62] flex items-center justify-center">
              <Network className="w-5 h-5" />
            </div>

            {/* Title */}
            <div>
              <h3 className="text-base font-bold text-gray-900 leading-tight">
                A home for learning content
              </h3>
            </div>

            {/* Stepper Steps */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#0D6D62] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  1
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-900">Create the class</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#D2F4EB] text-[#0D6D62] flex items-center justify-center text-xs font-bold shrink-0">
                  2
                </div>
                <span className="text-xs sm:text-sm text-gray-700 font-medium">Assign subjects</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#D2F4EB] text-[#0D6D62] flex items-center justify-center text-xs font-bold shrink-0">
                  3
                </div>
                <span className="text-xs sm:text-sm text-gray-700 font-medium">Manage topics and lessons</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#D2F4EB] text-[#0D6D62] flex items-center justify-center text-xs font-bold shrink-0">
                  4
                </div>
                <span className="text-xs sm:text-sm text-gray-700 font-medium">Add exercises and quizzes</span>
              </div>
            </div>

            {/* Bottom Note */}
            <div className="pt-4 border-t border-[#D5EFE7]">
              <p className="text-xs text-gray-600 leading-relaxed">
                Subjects are assigned after creation. No student enrollment is required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
