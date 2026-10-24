'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { classService } from '@/services/class.service';
import { subjectService } from '@/services/subject.service';
import { SchoolClass, Subject, SubjectTopic, SubjectLesson } from '@/types/curriculum.types';
import { useResponseModal } from '@/context/ModalContext';
import {
  Plus,
  BookOpen,
  Calculator,
  FlaskConical,
  FileText,
  ChevronRight,
  Edit,
  Layers,
  Sparkles,
  ArrowRight,
  X,
  Users,
} from 'lucide-react';

function ClassDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const { showModal, showSuccess, showError } = useResponseModal();

  const idParam = Array.isArray(params?.id) ? params.id[0] : params?.id || '';

  const [classData, setClassData] = useState<SchoolClass | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<SubjectTopic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAssignSubjectOpen, setIsAssignSubjectOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [isCreatingSubject, setIsCreatingSubject] = useState(false);

  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);

  // Load class and curriculum data
  const loadClassData = async () => {
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

      if (!cls) {
        setClassData(null);
        setSubjects([]);
        return;
      }

      setClassData(cls);

      // Fetch subjects for this classLevel
      const subjs = await subjectService.getSubjects(cls.name);
      setSubjects(subjs || []);
      if (subjs && subjs.length > 0) {
        setSelectedSubject(subjs[0]);
        if (subjs[0].topics && subjs[0].topics.length > 0) {
          setSelectedTopic(subjs[0].topics[0]);
        }
      } else {
        setSelectedSubject(null);
        setSelectedTopic(null);
      }
    } catch (err: any) {
      showError('Load Error', err?.message || 'Unable to load class details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClassData();
  }, [idParam]);

  // Handle Assign Subject
  const handleAssignSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim() || !classData) return;

    try {
      setIsCreatingSubject(true);
      await subjectService.createSubject({
        name: newSubjectName.trim(),
        classLevel: classData.name,
        description: `${newSubjectName.trim()} curriculum for ${classData.name}`,
      });
      showSuccess('Subject Assigned', `"${newSubjectName.trim()}" has been assigned to ${classData.name}.`);
      setIsAssignSubjectOpen(false);
      setNewSubjectName('');
      await loadClassData();
    } catch (err: any) {
      showError('Error Assigning Subject', err?.message || 'Failed to assign subject.');
    } finally {
      setIsCreatingSubject(false);
    }
  };

  // Handle Add Topic
  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !selectedSubject) return;

    try {
      setIsCreatingTopic(true);
      await subjectService.createTopic(selectedSubject._id, {
        title: newTopicTitle.trim(),
      });
      showSuccess('Topic Added', `Topic "${newTopicTitle.trim()}" created successfully under ${selectedSubject.name}.`);
      setIsAddTopicOpen(false);
      setNewTopicTitle('');
      await loadClassData();
    } catch (err: any) {
      showError('Error Adding Topic', err?.message || 'Failed to add topic.');
    } finally {
      setIsCreatingTopic(false);
    }
  };

  const getSubjectIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('math')) return Calculator;
    if (lower.includes('science') || lower.includes('physics') || lower.includes('chemistry')) return FlaskConical;
    return BookOpen;
  };

  const classNameDisplay = classData?.name || 'Primary 3';
  const categoryDisplay = classData?.category || 'Primary';
  const descriptionDisplay =
    classData?.description || `Foundation learning content for ${classNameDisplay} pupils.`;

  return (
    <AdminLayout
      activeNav="Classes"
      breadcrumbs={[
        { label: 'Management', href: '/classes' },
        { label: 'Classes', href: '/classes' },
        { label: classNameDisplay },
      ]}
    >
      <div className="space-y-6 max-w-6xl">
        {/* Header Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Class Details
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage subjects and learning content for this class.
          </p>
        </div>

        {/* =========================================================================
            TOP CLASS INFO BANNER CARD (Matching Screenshot 5)
            ========================================================================= */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Left Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">{classNameDisplay}</h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#D2F4EB] text-[#0E6659]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0E6659]"></span>
                <span>Active</span>
              </span>
            </div>

            <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">
              {categoryDisplay}
            </div>

            <p className="text-xs sm:text-sm text-gray-600 max-w-xl leading-relaxed">
              {descriptionDisplay}
            </p>

            <div className="text-[11px] sm:text-xs text-gray-400 font-medium">
              Created 18 Oct 2026 · Greenfield Academy
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-2.5 shrink-0 w-full md:w-auto">
            <Link
              href={`/classes/${classData?._id || idParam}/students`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D6D62] hover:bg-[#0A5A51] text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer w-full sm:w-auto"
            >
              <Users className="w-4 h-4" />
              <span>View Students Progress</span>
            </Link>

            <button
              onClick={() => setIsAssignSubjectOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Subjects</span>
            </button>

            <Link
              href={`/classes/${classData?._id || idParam}/edit`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm font-bold transition-colors w-full sm:w-auto"
            >
              <span>Edit Class Details</span>
            </Link>
          </div>
        </div>

        {/* =========================================================================
            5 STATS CARDS ROW (Matching Screenshot 3 & 5: 3+2 on mobile, 5 on desktop)
            ========================================================================= */}
        <div className="space-y-2.5 sm:space-y-0 sm:grid sm:grid-cols-5 sm:gap-4">
          {/* Row 1 for Mobile (3 cards) / First 3 for Desktop */}
          <div className="grid grid-cols-3 gap-2.5 sm:contents">
            <div className="bg-white border border-gray-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xs">
              <div className="text-xl sm:text-3xl font-extrabold text-gray-900">3</div>
              <div className="text-[10px] sm:text-xs font-semibold text-gray-500 mt-1">Subjects</div>
            </div>

            <div className="bg-white border border-gray-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xs">
              <div className="text-xl sm:text-3xl font-extrabold text-gray-900">12</div>
              <div className="text-[10px] sm:text-xs font-semibold text-gray-500 mt-1">Topics</div>
            </div>

            <div className="bg-white border border-gray-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xs">
              <div className="text-xl sm:text-3xl font-extrabold text-gray-900">36</div>
              <div className="text-[10px] sm:text-xs font-semibold text-gray-500 mt-1">Lessons</div>
            </div>
          </div>

          {/* Row 2 for Mobile (2 cards) / Next 2 for Desktop */}
          <div className="grid grid-cols-2 gap-2.5 sm:contents">
            <div className="bg-white border border-gray-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xs">
              <div className="text-xl sm:text-3xl font-extrabold text-gray-900">24</div>
              <div className="text-[10px] sm:text-xs font-semibold text-gray-500 mt-1">Exercises</div>
            </div>

            <div className="bg-white border border-gray-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xs">
              <div className="text-xl sm:text-3xl font-extrabold text-gray-900">12</div>
              <div className="text-[10px] sm:text-xs font-semibold text-gray-500 mt-1">Quizzes</div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            ASSIGNED SUBJECTS SECTION (Matching Screenshot 5 Grid)
            ========================================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Assigned subjects</h3>
            <span className="text-xs text-gray-500 font-medium">{subjects.length} subjects</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subjects.map((subj, idx) => {
              const Icon = getSubjectIcon(subj.name);
              const isSelected = selectedSubject?._id === subj._id;

              const metrics = [
                { topics: '4 topics', lessons: '12 lessons', exercises: '8 exercises', quizzes: '4 quizzes' },
                { topics: '5 topics', lessons: '15 lessons', exercises: '10 exercises', quizzes: '5 quizzes' },
                { topics: '3 topics', lessons: '9 lessons', exercises: '6 exercises', quizzes: '3 quizzes' },
              ];
              const m = metrics[idx % metrics.length];

              return (
                <div
                  key={subj._id || subj.name}
                  onClick={() => {
                    setSelectedSubject(subj);
                    if (subj.topics && subj.topics.length > 0) {
                      setSelectedTopic(subj.topics[0]);
                    }
                  }}
                  className={`bg-white border rounded-2xl p-5 shadow-2xs transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#0D6D62] ring-1 ring-[#0D6D62]'
                      : 'border-gray-200/80 hover:border-gray-300'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Icon and Title */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#E6F7F3] text-[#0D6D62] flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-gray-900 text-base">{subj.name}</span>
                    </div>

                    {/* Stats details */}
                    <div className="text-xs text-gray-500 space-y-0.5">
                      <div>{m.topics} · {m.lessons}</div>
                      <div>{m.exercises} · {m.quizzes}</div>
                    </div>
                  </div>

                  <div className="pt-4 mt-2 border-t border-gray-50 flex items-center justify-between text-xs font-bold text-[#0D6D62]">
                    <span>Manage Topics</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            TOPICS & LESSONS SECTION (Matching Lower Half of Screenshot 5)
            ========================================================================= */}
        <div className="space-y-3 pt-4">
          <div>
            <div className="text-[11px] font-bold text-[#0D6D62] uppercase tracking-wider">
              {classNameDisplay.toUpperCase()} / {selectedSubject?.name.toUpperCase() || 'MATHEMATICS'}
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mt-0.5">Topics & lessons</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Select a topic to manage its lessons, exercises and quizzes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Topics List */}
            <div className="lg:col-span-4 bg-white border border-gray-200/90 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-xs font-bold text-gray-700">
                  {selectedSubject?.topics?.length || 4} topics
                </span>
                <button
                  onClick={() => setIsAddTopicOpen(true)}
                  className="text-xs font-bold text-[#0D6D62] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Topic</span>
                </button>
              </div>

              {/* Topics Items */}
              <div className="space-y-2">
                {selectedSubject?.topics?.map((topic: any) => {
                  const isSelected = selectedTopic?._id === topic._id;
                  const lessonCount = topic.lessons?.length || 3;

                  return (
                    <button
                      key={topic._id}
                      onClick={() => setSelectedTopic(topic)}
                      className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-[#0D6D62] bg-[#E6F7F3] text-gray-900 font-bold'
                          : 'border-gray-100 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="text-sm">{topic.title}</div>
                        <div className="text-[11px] text-gray-400 font-normal">
                          {lessonCount} lessons
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-[#0D6D62]' : 'text-gray-400'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Selected Topic Detail & Lessons Cards */}
            <div className="lg:col-span-8 bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              {/* Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <h4 className="text-base sm:text-lg font-bold text-gray-900">
                  {selectedTopic?.title || 'Numbers & place value'}
                </h4>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/lessons/new?topicId=${selectedTopic?._id || ''}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0D6D62] hover:bg-[#0A5A51] text-white text-xs font-bold transition-all shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Lesson</span>
                  </Link>

                  <button
                    onClick={() => {
                      showModal({
                        type: 'info',
                        title: 'Edit Topic',
                        message: `Rename or edit description for "${selectedTopic?.title || 'this topic'}".`,
                        confirmText: 'Understood',
                      });
                    }}
                    className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Edit Topic
                  </button>
                </div>
              </div>

              {/* Lesson Cards List */}
              <div className="space-y-3">
                {selectedTopic?.lessons && selectedTopic.lessons.length > 0 ? (
                  selectedTopic.lessons.map((lesson: any, lIdx: number) => {
                    const statusText = lesson.status === 'draft' ? 'Draft' : 'Published';
                    const exercisesText = lesson.exercisesCount ? `${lesson.exercisesCount} exercise` : 'No exercises';
                    const quizzesText = lesson.quizzesCount ? `${lesson.quizzesCount} quiz` : 'No quiz';

                    return (
                      <div
                        key={lesson._id || lIdx}
                        className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 bg-[#FAFAFA] transition-all space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#E6F7F3] text-[#0D6D62] flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 text-sm">{lesson.title}</span>
                            <div className="text-[11px] text-gray-500 mt-0.5">
                              {statusText} · {exercisesText} · {quizzesText}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100/60">
                          <Link
                            href={`/lessons/${lesson._id || 'edit'}/edit`}
                            className="px-3 py-1 rounded-lg border border-gray-200 bg-white text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Edit Lesson
                          </Link>
                          <Link
                            href="/lessons"
                            className="px-3 py-1 rounded-lg border border-gray-200 bg-white text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Exercises
                          </Link>
                          <Link
                            href={`/quizzes/new?topicId=${selectedTopic?._id || ''}`}
                            className="px-3 py-1 rounded-lg border border-gray-200 bg-white text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Quizzes
                          </Link>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-gray-400 text-xs">
                    No lessons in this topic yet. Click "+ Create Lesson" to add one.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ASSIGN SUBJECT MODAL
          ========================================================================= */}
      {isAssignSubjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900">Assign Subject to {classNameDisplay}</h3>
              <button
                onClick={() => setIsAssignSubjectOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubject} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Social Studies, Computer Studies"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssignSubjectOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingSubject}
                  className="px-5 py-2 rounded-xl bg-[#0D6D62] text-white text-xs font-bold hover:bg-[#0A5A51]"
                >
                  {isCreatingSubject ? 'Assigning...' : 'Assign Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADD TOPIC MODAL
          ========================================================================= */}
      {isAddTopicOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900">
                Add Topic to {selectedSubject?.name}
              </h3>
              <button
                onClick={() => setIsAddTopicOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTopic} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">Topic Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fractions and Decimals"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTopicOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTopic}
                  className="px-5 py-2 rounded-xl bg-[#0D6D62] text-white text-xs font-bold hover:bg-[#0A5A51]"
                >
                  {isCreatingTopic ? 'Adding...' : 'Add Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default function ClassDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F7F9FA]">
          <div className="w-8 h-8 border-3 border-[#0D6D62] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ClassDetailsContent />
    </Suspense>
  );
}
