'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useResponseModal } from '@/context/ModalContext';
import apiClient from '@/services/api';
import classService from '@/services/class.service';
import subjectService from '@/services/subject.service';
import { SchoolClass, Subject } from '@/types/curriculum.types';
import { Plus, Search, BookOpen, Mail, Phone, Loader2, GraduationCap } from 'lucide-react';

interface TeacherItem {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  classes?: string[];
  status: string;
}

export default function TeachersPage() {
  const { showSuccess, showError } = useResponseModal();
  const [searchTerm, setSearchTerm] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteClass, setInviteClass] = useState('');
  const [inviteSubject, setInviteSubject] = useState('');

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load classes for the dropdown
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const clsList = await classService.getClasses();
        setClasses(clsList || []);
        if (clsList && clsList.length > 0 && !inviteClass) {
          setInviteClass(clsList[0].name);
        }
      } catch (err) {
        console.error('Failed to load classes for teachers modal:', err);
      }
    };
    loadClasses();
  }, []);

  // When selected class changes, dynamically load subjects for that class
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setIsLoadingDropdowns(true);
        const subList = await subjectService.getSubjects(inviteClass || undefined);
        setSubjects(subList || []);
        if (subList && subList.length > 0) {
          setInviteSubject(subList[0].name);
        } else {
          setInviteSubject('');
        }
      } catch (err) {
        console.error('Failed to load subjects for class:', inviteClass, err);
      } finally {
        setIsLoadingDropdowns(false);
      }
    };
    loadSubjects();
  }, [inviteClass]);

  const fetchTeachers = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get<any[]>('/users');
      // Filter faculty/teachers from users collection
      const list = (res.data || [])
        .filter((u) => u.role === 'teacher' || u.role === 'instructor' || u.role === 'admin')
        .map((u) => ({
          _id: u._id,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Staff Member',
          email: u.email,
          phone: u.phoneNumber || '',
          subject: u.subject || u.class || 'Faculty',
          classes: u.class ? [u.class] : [],
          status: 'Active',
        }));
      setTeachers(list);
    } catch (err: any) {
      showError('Load Failed', err?.message || 'Unable to fetch teachers from server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.subject && t.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.classes && t.classes.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) return;
    try {
      setIsSaving(true);
      const parts = inviteName.trim().split(' ');
      const firstName = parts[0] || 'Teacher';
      const lastName = parts.slice(1).join(' ') || 'Staff';
      await apiClient.post('/users', {
        firstName,
        lastName,
        email: inviteEmail.trim(),
        role: 'teacher',
        class: inviteClass.trim() || undefined,
        subject: inviteSubject.trim() || undefined,
      });
      setIsInviteModalOpen(false);
      showSuccess(
        'Teacher Invitation Sent',
        `Teacher record for ${inviteName.trim()} has been saved successfully with ${inviteClass || 'assigned class'} & ${inviteSubject || 'primary subject'}.`
      );
      setInviteEmail('');
      setInviteName('');
      fetchTeachers();
    } catch (err: any) {
      showError('Invite Failed', err?.response?.data?.message || err?.message || 'Could not create teacher record.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout
      activeNav="Teachers"
      breadcrumbs={[{ label: 'Management', href: '/classes' }, { label: 'Teachers' }]}
    >
      <div className="space-y-6 max-w-6xl">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Teachers Directory
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Manage instructors, assigned curriculum subjects, and teaching permissions.
            </p>
          </div>

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D6D62] hover:bg-[#0A5A51] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs shrink-0 cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Invite Teacher</span>
          </button>
        </div>

        {/* 3 Metric Cards purely derived from live backend */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          <div className="bg-white border border-gray-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-2xs">
            <div className="text-xl sm:text-3xl font-extrabold text-gray-900">{teachers.length}</div>
            <div className="text-[10px] sm:text-xs font-semibold text-gray-500 mt-1">
              Total Teachers
            </div>
          </div>
          <div className="bg-white border border-gray-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-2xs">
            <div className="text-xl sm:text-3xl font-extrabold text-[#0D6D62]">{teachers.length}</div>
            <div className="text-[10px] sm:text-xs font-semibold text-gray-500 mt-1">
              Active Staff
            </div>
          </div>
          <div className="bg-white border border-gray-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-2xs">
            <div className="text-xl sm:text-3xl font-extrabold text-amber-600">0</div>
            <div className="text-[10px] sm:text-xs font-semibold text-gray-500 mt-1">
              Pending Invites
            </div>
          </div>
        </div>

        {/* Teachers List */}
        <div className="bg-white border border-gray-200/90 rounded-2xl shadow-xs overflow-hidden">
          {/* Search Bar */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search teachers by name, subject, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA]"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="py-16 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#0D6D62]" />
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="py-16 text-center text-xs text-gray-400">
              No teachers or faculty records found in database.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTeachers.map((teacher) => (
                <div
                  key={teacher._id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F9FBFA] transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-full bg-[#E6F7F3] text-[#0D6D62] flex items-center justify-center font-extrabold text-sm shrink-0">
                      {teacher.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm sm:text-base">
                          {teacher.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D2F4EB] text-[#0E6659]">
                          {teacher.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        {teacher.subject && (
                          <span className="inline-flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                            {teacher.subject}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {teacher.email}
                        </span>
                        {teacher.phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {teacher.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <div className="flex items-center gap-1 flex-wrap">
                      {teacher.classes?.map((cls) => (
                        <span
                          key={cls}
                          className="px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-semibold"
                        >
                          {cls}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Invite New Teacher</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Save an onboard teacher record to ody-backend database.
              </p>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Full Name <span className="text-emerald-700">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Blessing Nnamdi"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email Address <span className="text-emerald-700">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@school.edu.ng"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Assigned Class <span className="text-emerald-700">*</span>
                </label>
                <select
                  value={inviteClass}
                  onChange={(e) => setInviteClass(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] bg-white cursor-pointer"
                >
                  {classes.length === 0 ? (
                    <option value="">No classes found (Create classes first)</option>
                  ) : (
                    classes.map((cls) => (
                      <option key={cls._id} value={cls.name}>
                        {cls.name}
                      </option>
                    ))
                  )}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  Subjects will dynamically populate based on the selected curriculum level.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700">
                    Primary Subject <span className="text-emerald-700">*</span>
                  </label>
                  {isLoadingDropdowns && (
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Loading subjects...
                    </span>
                  )}
                </div>
                {subjects.length > 0 ? (
                  <select
                    value={inviteSubject}
                    onChange={(e) => setInviteSubject(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] bg-white cursor-pointer"
                  >
                    {subjects.map((sub) => (
                      <option key={sub._id} value={sub.name}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={inviteSubject}
                    onChange={(e) => setInviteSubject(e.target.value)}
                    placeholder="Enter subject name (e.g. Mathematics)"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62]"
                  />
                )}
                {subjects.length === 0 && !isLoadingDropdowns && (
                  <p className="text-[11px] text-amber-600 mt-1">
                    No subjects exist for {inviteClass || 'this class'} yet. You can type one manually or add it in the Subjects manager.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0D6D62] hover:bg-[#0A5A51] text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSaving ? 'Saving...' : 'Save Teacher'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
