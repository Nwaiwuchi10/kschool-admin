'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { useResponseModal } from '@/context/ModalContext';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  FileText,
  HelpCircle,
  AlertTriangle,
  Archive,
} from 'lucide-react';

export default function ContentStatusPage() {
  const router = useRouter();
  const { showSuccess, showError, showModal } = useResponseModal();

  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      setStatus('published');
      showSuccess(
        'Curriculum Published Successfully! 🚀',
        'All lessons, Google Cloud TTS audio streams, and practice quizzes are now live for subscribed students in the mobile app.',
        () => router.push('/classes'),
        'View Classes'
      );
    } catch (err: any) {
      showError('Publication Error', err?.message || 'Failed to publish curriculum.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleArchive = () => {
    showModal({
      type: 'warning',
      title: 'Unpublish & Archive',
      message: 'Archiving will temporarily hide these lesson modules and quizzes from students. Do you wish to continue?',
      confirmText: 'Yes, Archive',
      cancelText: 'Cancel',
      onConfirm: () => {
        setStatus('draft');
        showSuccess('Curriculum Archived', 'Content moved to draft status.');
      },
    });
  };

  return (
    <AdminLayout
      activeNav="Lessons"
      breadcrumbs={[
        { label: 'Management', href: '/classes' },
        { label: 'Lessons', href: '/lessons' },
        { label: 'Curriculum Status' },
      ]}
    >
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb matching Image 3 Screen 3 */}
        <div className="mb-4">
          <Link
            href="/lessons"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Back to Lessons</span>
          </Link>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-2xs">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-6">
            Content Status
          </h1>

          {/* Amber Notice Banner matching Image 3 Screen 3 */}
          <div
            className={`p-5 rounded-2xl mb-8 flex items-center justify-between border ${
              status === 'published'
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-[#FEF3C7] border-[#FDE68A]'
            }`}
          >
            <div>
              <span
                className={`text-[11px] font-extrabold tracking-wider uppercase ${
                  status === 'published' ? 'text-[#127A71]' : 'text-amber-800'
                }`}
              >
                CURRENT STATUS
              </span>
              <h2
                className={`text-lg sm:text-xl font-extrabold tracking-tight mt-0.5 ${
                  status === 'published' ? 'text-emerald-900' : 'text-amber-950'
                }`}
              >
                {status === 'published' ? 'Live & Published' : 'Pending Review (Draft)'}
              </h2>
            </div>

            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                status === 'published'
                  ? 'bg-emerald-100 text-[#127A71]'
                  : 'bg-amber-200/60 text-amber-800'
              }`}
            >
              {status === 'published' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Clock className="w-5 h-5" />
              )}
            </div>
          </div>

          {/* Stat Boxes matching Image 3 */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-gray-100 text-center">
              <span className="text-xs text-gray-500 font-medium">Lessons</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">5</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-gray-100 text-center">
              <span className="text-xs text-gray-500 font-medium">Quizzes</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">3</p>
            </div>
          </div>

          {/* Quality Assurance Checklist matching Image 3 Screen 3 */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Readiness Checklist
            </h3>

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <CheckCircle2 className="w-5 h-5 text-[#127A71] shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-gray-800">
                  Text Content Complete
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <CheckCircle2 className="w-5 h-5 text-[#127A71] shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-gray-800">
                  Audio Generated & Verified (Google Cloud TTS)
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <CheckCircle2 className="w-5 h-5 text-[#127A71] shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-gray-800">
                  Practice Quiz Attached
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons matching Image 3 Screen 3 */}
          <div className="flex flex-col gap-3">
            <PrimaryButton
              onClick={handlePublish}
              isLoading={isPublishing}
              loadingText="Publishing Curriculum..."
            >
              Publish Curriculum
            </PrimaryButton>

            <button
              type="button"
              onClick={() => showSuccess('Draft Saved', 'Curriculum draft state saved.')}
              className="w-full py-3.5 px-6 rounded-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-sm transition-colors cursor-pointer"
            >
              Save as Draft
            </button>

            <button
              type="button"
              onClick={handleArchive}
              className="w-full py-3 px-6 rounded-full text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
            >
              Unpublish / Archive
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
