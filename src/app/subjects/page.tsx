'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { subjectService } from '@/services/subject.service';
import { classService } from '@/services/class.service';
import { Subject, SchoolClass } from '@/types/curriculum.types';
import { useResponseModal } from '@/context/ModalContext';
import { ChevronRight, BookOpen, Layers, RefreshCw, Sparkles, Filter, Plus, Trash2 } from 'lucide-react';

function SubjectsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialClassLevel = searchParams.get('classLevel') || 'All';

  const { showSuccess, showError } = useResponseModal();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [availableClasses, setAvailableClasses] = useState<SchoolClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedClassLevel, setSelectedClassLevel] = useState<string>(initialClassLevel);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedClassNames, setSelectedClassNames] = useState<string[]>([]);
  const [newSubjectDescription, setNewSubjectDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Edit / Link classes state
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editClassNames, setEditClassNames] = useState<string[]>([]);
  const [isUpdatingClasses, setIsUpdatingClasses] = useState(false);

  useEffect(() => {
    async function loadClasses() {
      try {
        const cls = await classService.getClasses();
        if (cls && cls.length > 0) {
          setAvailableClasses(cls);
        }
      } catch (err) {
        console.warn('Failed to load classes for subject filter:', err);
      }
    }
    loadClasses();
  }, []);

  const fetchSubjects = async () => {
    try {
      const data = await subjectService.getSubjects(
        selectedClassLevel === 'All' ? undefined : selectedClassLevel
      );
      setSubjects(data);
    } catch (err: any) {
      showError('Load Error', err?.message || 'Unable to fetch subjects.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [selectedClassLevel]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchSubjects();
      showSuccess('Subjects Synchronized', 'Curriculum syllabus and module counts updated.');
    } catch (err: any) {
      showError('Sync Failed', err?.message || 'Failed to refresh subjects.');
    }
  };

  const toggleClassSelection = (className: string) => {
    setSelectedClassNames((prev) =>
      prev.includes(className)
        ? prev.filter((c) => c !== className)
        : [...prev, className]
    );
  };

  const toggleEditClassSelection = (className: string) => {
    setEditClassNames((prev) =>
      prev.includes(className)
        ? prev.filter((c) => c !== className)
        : [...prev, className]
    );
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newSubjectName.trim();
    if (!trimmedName) {
      showError('Validation Error', 'Please enter a subject name.');
      return;
    }

    try {
      setIsCreating(true);
      await subjectService.createSubject({
        name: trimmedName,
        classes: selectedClassNames,
        classLevel: selectedClassNames[0] || undefined,
        description: newSubjectDescription.trim() || undefined,
      });

      setIsCreateModalOpen(false);
      setNewSubjectName('');
      setSelectedClassNames([]);
      setNewSubjectDescription('');
      showSuccess(
        'Subject Created',
        `"${trimmedName}" has been successfully created as a standalone subject ${
          selectedClassNames.length > 0
            ? `and linked to ${selectedClassNames.join(', ')}.`
            : 'ready to be linked to classes anytime.'
        }`
      );
      await fetchSubjects();
    } catch (err: any) {
      showError('Create Failed', err?.response?.data?.message || err?.message || 'Could not create subject.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveClassLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;

    try {
      setIsUpdatingClasses(true);
      await subjectService.updateSubject(editingSubject._id, {
        classes: editClassNames,
        classLevel: editClassNames[0] || undefined,
      });

      setEditingSubject(null);
      showSuccess(
        'Class Links Updated',
        `Classes linked to "${editingSubject.name}" have been updated successfully.`
      );
      await fetchSubjects();
    } catch (err: any) {
      showError('Update Failed', err?.response?.data?.message || err?.message || 'Failed to update linked classes.');
    } finally {
      setIsUpdatingClasses(false);
    }
  };

  const openEditModal = (e: React.MouseEvent, subject: Subject) => {
    e.stopPropagation();
    setEditingSubject(subject);
    const existingClasses =
      Array.isArray(subject.classes) && subject.classes.length > 0
        ? subject.classes
        : subject.classLevel
        ? [subject.classLevel]
        : [];
    setEditClassNames(existingClasses);
  };

  // Extract lesson count helper
  const getSubjectMetrics = (s: Subject) => {
    let lessonCount = 0;
    if (s.topics && Array.isArray(s.topics)) {
      s.topics.forEach((t) => {
        lessonCount += t.lessons?.length || 0;
      });
    }

    const tag = s.name.toLowerCase().includes('science')
      ? 'Science'
      : s.name.toLowerCase().includes('math')
      ? 'Math'
      : s.name.toLowerCase().includes('english')
      ? 'English'
      : s.classLevel || 'General';

    return {
      lessonCount,
      tag,
    };
  };

  return (
    <AdminLayout
      activeNav="Subjects"
      breadcrumbs={[{ label: 'Management', href: '/classes' }, { label: 'Subjects' }]}
    >
      <div className="space-y-6 max-w-6xl">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Subject Curriculum
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Curriculum subjects, module syllabuses, and lesson topics across all grade levels.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Sync'}</span>
            </button>

            <button
              onClick={() => {
                if (selectedClassLevel !== 'All') {
                  setSelectedClassNames([selectedClassLevel]);
                } else {
                  setSelectedClassNames([]);
                }
                setIsCreateModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D6D62] hover:bg-[#0A5A51] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Subject</span>
            </button>
          </div>
        </div>

        {/* Filter Pills derived dynamically from classes */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {['All', ...availableClasses.map((c) => c.name)].map((level) => (
            <button
              key={level}
              onClick={() => setSelectedClassLevel(level)}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                selectedClassLevel === level
                  ? 'bg-[#127A71] text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Subject Cards Grid matching Screen 3 */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs animate-pulse flex flex-col gap-3"
              >
                <div className="h-6 bg-gray-200 rounded-md w-1/2"></div>
                <div className="h-4 bg-gray-100 rounded-md w-1/3"></div>
              </div>
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-2xs flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#127A71] flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Subjects Found</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-6 max-w-sm">
              No subjects found for class &ldquo;{selectedClassLevel}&rdquo;. Refresh or choose another class filter.
            </p>
            <PrimaryButton
              fullWidth={false}
              onClick={() => setSelectedClassLevel('All')}
              className="px-6 h-11 text-sm"
            >
              View All Subjects
            </PrimaryButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjects.map((subject, idx) => {
              const metrics = getSubjectMetrics(subject);
              return (
                <div
                  key={subject._id || idx}
                  onClick={() => router.push(`/subjects/${subject._id}`)}
                  className="group bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200 hover:border-[#127A71] shadow-2xs hover:shadow-md transition-all duration-200 flex items-center justify-between gap-4 cursor-pointer"
                >
                  {/* Left: Title & Badges */}
                  <div className="flex flex-col gap-2.5">
                    <h3 className="text-base sm:text-lg font-extrabold text-gray-900 group-hover:text-[#127A71] transition-colors leading-snug">
                      {subject.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#127A71] border border-emerald-100">
                        {metrics.tag}
                      </span>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {metrics.lessonCount} Lessons
                      </span>
                      {Array.isArray(subject.classes) && subject.classes.length > 0 ? (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0D6D62] border border-teal-200">
                          {subject.classes.length} {subject.classes.length === 1 ? 'Class' : 'Classes'} Linked
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          Standalone
                        </span>
                      )}
                    </div>

                    {/* Class badges list */}
                    {Array.isArray(subject.classes) && subject.classes.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 mt-0.5">
                        {subject.classes.slice(0, 3).map((cls) => (
                          <span
                            key={cls}
                            className="px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200 text-[10px] font-bold text-gray-600"
                          >
                            {cls}
                          </span>
                        ))}
                        {subject.classes.length > 3 && (
                          <span className="text-[10px] font-bold text-gray-400">
                            +{subject.classes.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => openEditModal(e, subject)}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 hover:border-[#127A71] bg-white hover:bg-emerald-50 text-[11px] font-bold text-gray-700 hover:text-[#127A71] transition-all cursor-pointer shadow-2xs"
                      title="Link or unlink classes for this subject"
                    >
                      Link Classes
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-[11px] font-bold text-red-600 transition-all cursor-pointer shadow-2xs"
                      title={`Delete ${subject.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                    <div className="w-9 h-9 rounded-full bg-gray-50 group-hover:bg-emerald-50 group-hover:text-[#127A71] flex items-center justify-center text-gray-400 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Standalone Subject Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Create Subject</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Create a standalone subject (e.g. English Language, Mathematics) and link it across any curriculum classes.
                </p>
              </div>

              <form onSubmit={handleCreateSubject} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Subject Name <span className="text-emerald-700">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. English Language, Mathematics, Basic Science"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gray-700">
                      Link to Classes <span className="text-gray-400 font-normal">(Select multiple)</span>
                    </label>
                    <span className="text-[11px] text-[#0D6D62] font-semibold">
                      {selectedClassNames.length} selected
                    </span>
                  </div>
                  <div className="border border-gray-200 rounded-xl p-3 bg-[#FAFAFA] max-h-40 overflow-y-auto space-y-2">
                    {availableClasses.length === 0 ? (
                      <p className="text-xs text-gray-400">No classes registered yet.</p>
                    ) : (
                      availableClasses.map((cls) => {
                        const isChecked = selectedClassNames.includes(cls.name);
                        return (
                          <label
                            key={cls._id}
                            className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer text-xs font-semibold transition-all ${
                              isChecked
                                ? 'bg-[#E6F7F3] text-[#0D6D62] border border-[#A6E6D8]'
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleClassSelection(cls.name)}
                              className="w-4 h-4 text-[#0D6D62] rounded border-gray-300 focus:ring-[#0D6D62] cursor-pointer"
                            />
                            <span>{cls.name}</span>
                            <span className="text-[10px] text-gray-400 font-normal ml-auto">
                              {cls.category}
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    You can leave unselected to keep it as a standalone master subject and link classes later.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Description <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Curriculum overview and syllabus objectives..."
                    value={newSubjectDescription}
                    onChange={(e) => setNewSubjectDescription(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA] resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    disabled={isCreating}
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0D6D62] hover:bg-[#0A5A51] text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
                  >
                    {isCreating ? 'Creating...' : 'Save Subject'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Linked Classes Modal */}
        {editingSubject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Link Classes to {editingSubject.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Select which school classes should have <strong>{editingSubject.name}</strong> included in their curriculum.
                </p>
              </div>

              <form onSubmit={handleSaveClassLinks} className="space-y-4">
                <div className="border border-gray-200 rounded-xl p-3 bg-[#FAFAFA] max-h-56 overflow-y-auto space-y-2">
                  {availableClasses.map((cls) => {
                    const isChecked = editClassNames.includes(cls.name);
                    return (
                      <label
                        key={cls._id}
                        className={`flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer text-xs font-semibold transition-all ${
                          isChecked
                            ? 'bg-[#E6F7F3] text-[#0D6D62] border border-[#A6E6D8]'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleEditClassSelection(cls.name)}
                          className="w-4 h-4 text-[#0D6D62] rounded border-gray-300 focus:ring-[#0D6D62] cursor-pointer"
                        />
                        <span>{cls.name}</span>
                        <span className="text-[10px] text-gray-400 font-normal ml-auto">
                          {cls.category}
                        </span>
                      </label>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                  <span>
                    Linked to <strong>{editClassNames.length}</strong> classes
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditClassNames(availableClasses.map((c) => c.name))}
                      className="text-xs font-bold text-[#0D6D62] hover:underline"
                    >
                      Select All
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setEditClassNames([])}
                      className="text-xs font-bold text-gray-500 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    disabled={isUpdatingClasses}
                    onClick={() => setEditingSubject(null)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingClasses}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0D6D62] hover:bg-[#0A5A51] text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
                  >
                    {isUpdatingClasses ? 'Saving...' : 'Update Links'}
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

export default function SubjectsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <div className="w-8 h-8 border-4 border-[#127A71] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <SubjectsContent />
    </Suspense>
  );
}
