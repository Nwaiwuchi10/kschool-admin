'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useResponseModal } from '@/context/ModalContext';
import { dashboardService } from '@/services/dashboard.service';
import { Megaphone, Plus, Trash2, Pin, Loader2 } from 'lucide-react';

interface AnnouncementItem {
  _id: string;
  title: string;
  content: string;
  audience: string;
  pinned: boolean;
  date?: string;
  createdAt?: string;
}

export default function AnnouncementsPage() {
  const { showSuccess, showModal, showError } = useResponseModal();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('All');
  const [isPinned, setIsPinned] = useState(false);

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const data = await dashboardService.getAnnouncements();
      setAnnouncements(data || []);
    } catch (err: any) {
      showError('Failed to Load', err?.message || 'Could not fetch announcements from database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      await dashboardService.createAnnouncement({
        title: title.trim(),
        content: content.trim(),
        audience: targetAudience === 'All' ? 'All Students & Guardians' : targetAudience,
        pinned: isPinned,
      });
      setIsModalOpen(false);
      setTitle('');
      setContent('');
      setIsPinned(false);
      showSuccess('Broadcast Sent', `Announcement has been saved to database.`);
      fetchAnnouncements();
    } catch (err: any) {
      showError('Failed to Create', err?.message || 'Could not save announcement.');
    }
  };

  const handleDelete = (id: string, aTitle: string) => {
    showModal({
      type: 'warning',
      title: 'Delete Announcement?',
      message: `Are you sure you want to delete "${aTitle}" from database?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await dashboardService.deleteAnnouncement(id);
          showSuccess('Deleted', 'Announcement removed from database.');
          fetchAnnouncements();
        } catch (err: any) {
          showError('Delete Failed', err?.message || 'Could not delete announcement.');
        }
      },
    });
  };

  return (
    <AdminLayout
      activeNav="Announce"
      breadcrumbs={[{ label: 'Management', href: '/dashboard' }, { label: 'Announcements' }]}
    >
      <div className="space-y-6 max-w-5xl">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Announcements & Notices
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Broadcast school-wide alerts, holiday updates, and faculty bulletins.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D6D62] hover:bg-[#0A5A51] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs shrink-0 cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Announcement</span>
          </button>
        </div>

        {/* Announcements List */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#0D6D62]" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-400 bg-white rounded-2xl border border-gray-100 p-8">
            No announcements found in database. Click &ldquo;Create Announcement&rdquo; above to publish one.
          </div>
        ) : (
          <div className="space-y-3.5">
            {announcements.map((item) => (
              <div
                key={item._id}
                className="bg-white border border-gray-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs hover:border-[#0D6D62] transition-colors flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
                      {item.pinned && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F7F3] text-[#0D6D62]">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                      )}
                      <span className="text-xs text-gray-400">· {item.audience}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-2xl">
                      {item.content}
                    </p>
                    <div className="text-[11px] text-gray-400 font-medium">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Active'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(item._id, item.title)}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Broadcast Notice</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Send a real-time announcement saved directly into ody-backend database.
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Title <span className="text-emerald-700">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Exhibition Registration"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Target Audience
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] bg-white"
                >
                  <option value="All">All Students & Guardians</option>
                  <option value="Faculty Only">Faculty / Teachers Only</option>
                  <option value="Primary School">Primary School Only</option>
                  <option value="Junior Secondary">Junior Secondary Only</option>
                  <option value="Senior Secondary">Senior Secondary Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Message Content</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Type the announcement details here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded text-[#0D6D62]"
                />
                <label htmlFor="pinCheck" className="text-xs text-gray-700 font-semibold cursor-pointer">
                  Pin to top of portal
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0D6D62] hover:bg-[#0A5A51] text-white text-xs font-bold"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
