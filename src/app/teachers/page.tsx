'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useResponseModal } from '@/context/ModalContext';
import apiClient from '@/services/api';
import classService from '@/services/class.service';
import subjectService from '@/services/subject.service';
import { SchoolClass, Subject } from '@/types/curriculum.types';
import { Plus, Search, BookOpen, Mail, Phone, Loader2, GraduationCap, ShieldCheck, Key, Check } from 'lucide-react';

interface TeacherItem {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  subjects?: string[];
  class?: string;
  classes?: string[];
  permissions?: string[];
  status: string;
}

const AVAILABLE_PERMISSIONS = [
  { id: 'lessons', label: 'Lessons', description: 'Create and edit curriculum lessons & notes' },
  { id: 'exercises', label: 'Exercises', description: 'Manage student practice worksheets & exercises' },
  { id: 'quizzes', label: 'Quizzes', description: 'Create and evaluate student quizzes' },
  { id: 'subjects', label: 'Subjects', description: 'View assigned class subjects and topics' },
  { id: 'classes', label: 'Classes', description: 'View classes and class rosters' },
  { id: 'students', label: 'Students', description: 'View enrolled student profiles' },
  { id: 'announcements', label: 'Announcements', description: 'Publish announcements to students' },
];

export default function TeachersPage() {
  const { showSuccess, showError } = useResponseModal();
  const [searchTerm, setSearchTerm] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [useAutoPassword, setUseAutoPassword] = useState(true);

  // Multi-selection states
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'lessons',
    'exercises',
    'quizzes',
    'students',
  ]);

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all available classes
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const clsList = await classService.getClasses();
        setClasses(clsList || []);
      } catch (err) {
        console.error('Failed to load classes for teachers modal:', err);
      }
    };
    loadClasses();
  }, []);

  // Load all subjects across the school
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setIsLoadingDropdowns(true);
        const subList = await subjectService.getSubjects();
        setSubjects(subList || []);
      } catch (err) {
        console.error('Failed to load subjects:', err);
      } finally {
        setIsLoadingDropdowns(false);
      }
    };
    loadSubjects();
  }, []);

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
          subject: u.subject || (u.subjects && u.subjects[0]) || 'Faculty',
          subjects: Array.isArray(u.subjects) && u.subjects.length > 0 ? u.subjects : (u.subject ? [u.subject] : []),
          class: u.class || (u.classes && u.classes[0]) || '',
          classes: Array.isArray(u.classes) && u.classes.length > 0 ? u.classes : (u.class ? [u.class] : []),
          permissions: Array.isArray(u.permissions) ? u.permissions : [],
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

  const toggleClassSelection = (className: string) => {
    setSelectedClasses((prev) =>
      prev.includes(className) ? prev.filter((c) => c !== className) : [...prev, className]
    );
  };

  const toggleSubjectSelection = (subjectName: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectName) ? prev.filter((s) => s !== subjectName) : [...prev, subjectName]
    );
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const filteredTeachers = teachers.filter((t) => {
    const q = searchTerm.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      (t.subjects && t.subjects.some((s) => s.toLowerCase().includes(q))) ||
      (t.classes && t.classes.some((c) => c.toLowerCase().includes(q)))
    );
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) return;

    if (selectedClasses.length === 0) {
      showError('Class Assignment Missing', 'Please select at least one class for this teacher.');
      return;
    }

    if (selectedSubjects.length === 0) {
      showError('Subject Assignment Missing', 'Please select at least one subject for this teacher.');
      return;
    }

    try {
      setIsSaving(true);
      const parts = inviteName.trim().split(' ');
      const firstName = parts[0] || 'Teacher';
      const lastName = parts.slice(1).join(' ') || 'Staff';

      const payload: any = {
        firstName,
        lastName,
        email: inviteEmail.trim().toLowerCase(),
        phoneNumber: invitePhone.trim() || undefined,
        role: 'teacher',
        classes: selectedClasses,
        class: selectedClasses[0],
        subjects: selectedSubjects,
        subject: selectedSubjects[0],
        permissions: selectedPermissions,
      };

      if (!useAutoPassword && customPassword.trim()) {
        payload.password = customPassword.trim();
      }

      await apiClient.post('/users', payload);

      setIsInviteModalOpen(false);
      showSuccess(
        'Teacher Invitation Dispatched',
        `Teacher record for ${inviteName.trim()} has been saved successfully! An email with their login credentials, assigned ${selectedClasses.length} class(es), and ${selectedSubjects.length} subject(s) has been dispatched.`
      );

      // Reset form
      setInviteEmail('');
      setInviteName('');
      setInvitePhone('');
      setCustomPassword('');
      setUseAutoPassword(true);
      setSelectedClasses([]);
      setSelectedSubjects([]);
      setSelectedPermissions(['lessons', 'exercises', 'quizzes', 'students']);
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
              Manage instructors, assigned classes, subjects, login credentials, and page permissions.
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

        {/* 3 Metric Cards */}
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
              Active Faculty
            </div>
          </div>
          <div className="bg-white border border-gray-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-2xs">
            <div className="text-xl sm:text-3xl font-extrabold text-indigo-600">
              {teachers.reduce((acc, t) => acc + (t.classes?.length || 0), 0)}
            </div>
            <div className="text-[10px] sm:text-xs font-semibold text-gray-500 mt-1">
              Assigned Classes
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
                placeholder="Search teachers by name, subject, class, or email..."
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
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F9FBFA] transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-11 h-11 rounded-full bg-[#E6F7F3] text-[#0D6D62] flex items-center justify-center font-extrabold text-sm shrink-0">
                      {teacher.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm sm:text-base">
                          {teacher.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D2F4EB] text-[#0E6659]">
                          {teacher.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
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

                      {/* Multi Subjects Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[11px] font-semibold text-gray-400 mr-1 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> Subjects:
                        </span>
                        {teacher.subjects && teacher.subjects.length > 0 ? (
                          teacher.subjects.map((sub) => (
                            <span
                              key={sub}
                              className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium"
                            >
                              {sub}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs italic">None specified</span>
                        )}
                      </div>

                      {/* Permissions Tags */}
                      {teacher.permissions && teacher.permissions.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-0.5">
                          <span className="text-[11px] font-semibold text-gray-400 mr-1 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-[#0D6D62]" /> Access:
                          </span>
                          {teacher.permissions.map((perm) => (
                            <span
                              key={perm}
                              className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 uppercase"
                            >
                              {perm}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Multi Classes Column */}
                  <div className="flex flex-col md:items-end gap-1.5 shrink-0 self-start md:self-center">
                    <span className="text-[11px] font-semibold text-gray-400">Assigned Classes:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {teacher.classes && teacher.classes.length > 0 ? (
                        teacher.classes.map((cls) => (
                          <span
                            key={cls}
                            className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold"
                          >
                            {cls}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">No classes</span>
                      )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#E6F7F3] text-[#0D6D62] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Invite New Faculty Teacher</h3>
                  <p className="text-xs text-gray-500">
                    Assign classes, subjects, login password, and portal permissions.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    Phone Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +234 812 345 6789"
                    value={invitePhone}
                    onChange={(e) => setInvitePhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62]"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email Address <span className="text-emerald-700">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="teacher@school.edu.ng"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62]"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Invitation and portal login credentials will be emailed to this address.
                </p>
              </div>

              {/* Password Section */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-[#0D6D62]" />
                    <span className="text-xs font-bold text-gray-800">Login Password</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUseAutoPassword(!useAutoPassword)}
                    className="text-xs text-[#0D6D62] font-semibold hover:underline"
                  >
                    {useAutoPassword ? 'Set Custom Password' : 'Auto-Generate Password'}
                  </button>
                </div>

                {useAutoPassword ? (
                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-white p-2.5 rounded-lg border border-gray-200">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      A secure login password (e.g. <strong>KSch-XXXXXX</strong>) will be automatically generated and sent to their email.
                    </span>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      placeholder="Enter a custom password (min 6 characters)"
                      value={customPassword}
                      onChange={(e) => setCustomPassword(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] bg-white"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      This password will also be included in their invitation welcome email.
                    </p>
                  </div>
                )}
              </div>

              {/* Multi Classes Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700">
                    Assigned Classes <span className="text-emerald-700">*</span>
                  </label>
                  <span className="text-[11px] text-gray-500 font-semibold">
                    {selectedClasses.length} selected
                  </span>
                </div>
                {classes.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No classes available. Create classes first.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 rounded-xl border border-gray-200 bg-gray-50/50">
                    {classes.map((cls) => {
                      const isSelected = selectedClasses.includes(cls.name);
                      return (
                        <button
                          key={cls._id}
                          type="button"
                          onClick={() => toggleClassSelection(cls.name)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all border ${
                            isSelected
                              ? 'bg-[#0D6D62] text-white border-[#0D6D62] shadow-xs'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border ${
                              isSelected ? 'bg-white border-white text-[#0D6D62]' : 'border-gray-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="truncate">{cls.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Multi Subjects Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700">
                    Assigned Subjects <span className="text-emerald-700">*</span>
                  </label>
                  <span className="text-[11px] text-gray-500 font-semibold">
                    {selectedSubjects.length} selected
                  </span>
                </div>
                {isLoadingDropdowns ? (
                  <div className="p-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin text-[#0D6D62]" />
                    <span>Loading school subjects...</span>
                  </div>
                ) : subjects.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No subjects available in the catalog.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 rounded-xl border border-gray-200 bg-gray-50/50">
                    {subjects.map((sub) => {
                      const isSelected = selectedSubjects.includes(sub.name);
                      return (
                        <button
                          key={sub._id}
                          type="button"
                          onClick={() => toggleSubjectSelection(sub.name)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all border ${
                            isSelected
                              ? 'bg-[#0D6D62] text-white border-[#0D6D62] shadow-xs'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border ${
                              isSelected ? 'bg-white border-white text-[#0D6D62]' : 'border-gray-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="truncate">{sub.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Permissions Checkbox Group */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Teacher Portal Access & Page Permissions
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 rounded-xl border border-gray-200 bg-gray-50/50">
                  {AVAILABLE_PERMISSIONS.map((perm) => {
                    const isChecked = selectedPermissions.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(perm.id)}
                          className="mt-0.5 rounded text-[#0D6D62] focus:ring-[#0D6D62] cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold">{perm.label}</div>
                          <div className="text-[10px] text-gray-500 leading-tight">
                            {perm.description}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
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
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0D6D62] hover:bg-[#0A5A51] text-white text-xs font-bold disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSaving ? 'Dispatching...' : 'Invite & Send Credentials'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

