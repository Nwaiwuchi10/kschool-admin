'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { subscriptionService, SubscriptionPackage } from '@/services/subscription.service';
import { useResponseModal } from '@/context/ModalContext';
import {
  CreditCard,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Search,
  Users,
} from 'lucide-react';

function SubscriptionsContent() {
  const { showModal, showSuccess, showError } = useResponseModal();
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Create Package Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [packageName, setPackageName] = useState('');
  const [academicSession, setAcademicSession] = useState('2026/2027');
  const [price, setPrice] = useState(25000);
  const [featuresText, setFeaturesText] = useState(
    'Full access to all class subjects\nInteractive audio lessons & quizzes\nSession progress tracking'
  );
  const [isSaving, setIsSaving] = useState(false);

  const fetchPackages = async () => {
    try {
      setIsLoading(true);
      const data = await subscriptionService.getPackages();
      setPackages(data || []);
    } catch (err: any) {
      showError('Error', err?.message || 'Failed to fetch subscription packages.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setPackageName('');
    setAcademicSession('2026/2027');
    setPrice(25000);
    setFeaturesText(
      'Full access to all class subjects\nInteractive audio lessons & quizzes\nSession progress tracking'
    );
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg: SubscriptionPackage) => {
    setIsEditing(true);
    setEditingId(pkg._id || null);
    setPackageName(pkg.name);
    setAcademicSession(pkg.academicSession);
    setPrice(pkg.price);
    setFeaturesText(pkg.features?.join('\n') || '');
    setIsModalOpen(true);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageName.trim()) {
      showError('Validation Error', 'Package name is required.');
      return;
    }

    const features = featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    setIsSaving(true);
    try {
      if (isEditing && editingId) {
        await subscriptionService.updatePackage(editingId, {
          name: packageName.trim(),
          academicSession: academicSession.trim(),
          price: Number(price) || 0,
          features,
        });
        showSuccess('Package Updated', `${packageName} updated successfully.`);
      } else {
        await subscriptionService.createPackage({
          name: packageName.trim(),
          academicSession: academicSession.trim(),
          price: Number(price) || 0,
          features,
        });
        showSuccess('Package Created', `${packageName} has been created and published.`);
      }
      setIsModalOpen(false);
      await fetchPackages();
    } catch (err: any) {
      showError('Error', err?.message || 'Could not save subscription package.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePackage = (pkg: SubscriptionPackage) => {
    showModal({
      type: 'warning',
      title: 'Delete Subscription Package?',
      message: `Are you sure you want to delete "${pkg.name}"? Existing active student subscriptions will remain safely archived.`,
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          if (pkg._id) {
            await subscriptionService.deletePackage(pkg._id);
            showSuccess('Package Deleted', `${pkg.name} deleted successfully.`);
            await fetchPackages();
          }
        } catch (err: any) {
          showError('Delete Failed', err?.message || 'Could not delete package.');
        }
      },
    });
  };

  const filteredPackages = packages.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.academicSession.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout
      activeNav="Subscriptions"
      breadcrumbs={[{ label: 'Management', href: '/classes' }, { label: 'Subscriptions' }]}
    >
      <div className="space-y-6 max-w-6xl">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Subscription Packages
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Create, configure, and price annual learning packages for pupil and student enrollment.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/finances"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm font-semibold transition-all shadow-xs"
            >
              <span>View Earnings & Transactions</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D6D62] hover:bg-[#0A5A51] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Package</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white border border-gray-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search packages by class or session..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA]"
              />
            </div>
            <span className="text-xs text-gray-400 font-medium">
              {filteredPackages.length} Packages listed
            </span>
          </div>

          {/* Packages Grid */}
          <div className="p-5 sm:p-6">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-2 text-gray-400">
                <div className="w-7 h-7 border-3 border-[#0D6D62] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs">Loading subscription packages...</span>
              </div>
            ) : filteredPackages.length === 0 ? (
              <div className="py-16 text-center text-gray-400 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#0D6D62] flex items-center justify-center mb-3">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-800 text-base mb-1">No Subscription Packages</h3>
                <p className="text-xs text-gray-500 max-w-sm mb-4">
                  Create annual curriculum packages with custom pricing and features for students.
                </p>
                <button
                  onClick={handleOpenCreate}
                  className="px-4 py-2 rounded-xl bg-[#0D6D62] text-white text-xs font-bold"
                >
                  Create First Package
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPackages.map((pkg) => (
                  <div
                    key={pkg._id}
                    className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-[#0D6D62] transition-colors"
                  >
                    <div>
                      {/* Top Row: Name and Session Badge */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-extrabold text-gray-900 text-base leading-snug">
                          {pkg.name}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F7F3] text-[#0D6D62] whitespace-nowrap">
                          {pkg.academicSession}
                        </span>
                      </div>

                      {/* Price Display */}
                      <div className="mt-3 mb-4">
                        <span className="text-2xl font-extrabold text-gray-900">
                          ₦{pkg.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400 font-medium"> / Yearly</span>
                      </div>

                      {/* Features List */}
                      <div className="space-y-2 border-t border-gray-100 pt-3">
                        {pkg.features && pkg.features.length > 0 ? (
                          pkg.features.map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                              <CheckCircle2 className="w-4 h-4 text-[#0D6D62] shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-gray-400 italic">Standard curriculum access</div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                      <button
                        onClick={() => handleOpenEdit(pkg)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D6D62] hover:underline cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeletePackage(pkg)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create / Edit Package Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-extrabold text-lg text-gray-900">
                  {isEditing ? 'Edit Subscription Package' : 'Create Subscription Package'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSavePackage} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. JSS 1 Annual Learning Package"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Yearly / Academic Session *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2026/2027"
                      value={academicSession}
                      onChange={(e) => setAcademicSession(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Price (₦) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={price}
                      onChange={(e) => setPrice(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Package Features (One per line)
                  </label>
                  <textarea
                    rows={4}
                    value={featuresText}
                    onChange={(e) => setFeaturesText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA]"
                  />
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl bg-[#0D6D62] hover:bg-[#0A5A51] text-white text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : isEditing ? 'Update Package' : 'Publish Package'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default function SubscriptionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <div className="w-8 h-8 border-4 border-[#0D6D62] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SubscriptionsContent />
    </Suspense>
  );
}
