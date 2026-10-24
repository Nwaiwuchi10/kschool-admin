'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { useResponseModal } from '@/context/ModalContext';
import {
  Building2,
  Sliders,
  User,
  Bell,
  LogOut,
  Save,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Globe,
} from 'lucide-react';

function SettingsContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as any) || 'school';
  const [activeTab, setActiveTab] = useState<'school' | 'academic' | 'account' | 'notifications'>(
    initialTab
  );

  const { user, logout } = useAuth();
  const { showSuccess, showModal } = useResponseModal();

  // School Information state
  const [schoolName, setSchoolName] = useState('');
  const [schoolEmail, setSchoolEmail] = useState('');
  const [schoolPhone, setSchoolPhone] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('');

  // Academic Settings state
  const [currentSession, setCurrentSession] = useState('2026/2027');
  const [currentTerm, setCurrentTerm] = useState('First Term');
  const [gradingScale, setGradingScale] = useState('WAEC Standard (A1-F9)');

  React.useEffect(() => {
    if (user) {
      if (user.school) setSchoolName(user.school);
      if (user.email) setSchoolEmail(user.email);
    }
  }, [user]);

  const handleSave = (section: string) => {
    showSuccess('Settings Updated', `${section} preferences have been saved successfully.`);
  };

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

  return (
    <AdminLayout
      activeNav="Settings"
      breadcrumbs={[{ label: 'Management', href: '/dashboard' }, { label: 'Settings' }]}
    >
      <div className="space-y-6 max-w-5xl">
        {/* Title Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            School & Portal Settings
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Configure school profile, academic terms, and administrative accounts.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'school', label: 'School Information', icon: Building2 },
            { id: 'academic', label: 'Academic Settings', icon: Sliders },
            { id: 'account', label: 'Account Settings', icon: User },
            { id: 'notifications', label: 'Notifications', icon: Bell },
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

        {/* School Info Tab */}
        {activeTab === 'school' && (
          <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-7 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-gray-900">Institution Profile</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">School Name</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Official Email</label>
                <input
                  type="email"
                  value={schoolEmail}
                  onChange={(e) => setSchoolEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Contact Helpline
                </label>
                <input
                  type="text"
                  value={schoolPhone}
                  onChange={(e) => setSchoolPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Campus Address</label>
                <input
                  type="text"
                  value={schoolAddress}
                  onChange={(e) => setSchoolAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => handleSave('School Profile')}
                className="px-5 py-2.5 rounded-xl bg-[#0D6D62] hover:bg-[#0A5A51] text-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Save School Profile</span>
              </button>
            </div>
          </div>
        )}

        {/* Academic Settings Tab */}
        {activeTab === 'academic' && (
          <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-7 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-gray-900">Academic Year Configuration</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Active Session</label>
                <select
                  value={currentSession}
                  onChange={(e) => setCurrentSession(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] bg-white"
                >
                  <option>2026/2027</option>
                  <option>2025/2026</option>
                  <option>2027/2028</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Current Term</label>
                <select
                  value={currentTerm}
                  onChange={(e) => setCurrentTerm(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] bg-white"
                >
                  <option>First Term</option>
                  <option>Second Term</option>
                  <option>Third Term</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Grading System</label>
                <select
                  value={gradingScale}
                  onChange={(e) => setGradingScale(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] bg-white"
                >
                  <option>WAEC Standard (A1-F9)</option>
                  <option>Percentage (0-100%)</option>
                  <option>4.0 GPA Scale</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => handleSave('Academic Calendar')}
                className="px-5 py-2.5 rounded-xl bg-[#0D6D62] hover:bg-[#0A5A51] text-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Save Academic Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-7 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-gray-900">Administrator Credentials</h3>

            <div className="p-4 rounded-xl border border-gray-100 bg-[#FAFAFA] flex items-center justify-between">
              <div>
                <div className="font-bold text-gray-900 text-sm">
                  {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin User' : 'Admin User'}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.email || '—'}
                </div>
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D2F4EB] text-[#0E6659]">
                  Role: {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Administrator'}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-gray-900">Email & Alert Preferences</h3>

            <div className="space-y-3">
              {[
                { title: 'New Student Registrations', desc: 'Receive instant email when a student enrolls.' },
                { title: 'Lesson Submissions & Feedback', desc: 'Notify when instructors submit lessons for review.' },
                { title: 'Quiz & Exam Performance Alerts', desc: 'Get summaries of weekly class quiz scores.' },
                { title: 'Subscription Renewals', desc: 'Receive notifications on yearly student renewal payments.' },
              ].map((n, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border border-gray-100 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-gray-900 text-xs sm:text-sm">{n.title}</span>
                    <p className="text-xs text-gray-500">{n.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 accent-[#0D6D62] rounded cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => handleSave('Notification')}
                className="px-5 py-2.5 rounded-xl bg-[#0D6D62] hover:bg-[#0A5A51] text-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Save Notification Settings</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <div className="w-8 h-8 border-4 border-[#0D6D62] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
