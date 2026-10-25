'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { exerciseService, ExerciseQuestion } from '@/services/exercise.service';
import { classService } from '@/services/class.service';
import { subjectService } from '@/services/subject.service';
import { lessonService } from '@/services/lesson.service';
import { SchoolClass, Subject } from '@/types/curriculum.types';
import { useResponseModal } from '@/context/ModalContext';
import { FormulaToolbar } from '@/components/FormulaToolbar';
import { MathRenderer } from '@/components/MathRenderer';
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  FileQuestion,
  Sparkles,
  HelpCircle,
  Clock,
  Award,
} from 'lucide-react';

function CreateExerciseContent() {
  const router = useRouter();
  const { showSuccess, showError } = useResponseModal();

  // Metadata state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [lesson, setLesson] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [points, setPoints] = useState(10);
  const [estimatedMinutes, setEstimatedMinutes] = useState(15);

  // Dynamic dropdown lists
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [availableLessons, setAvailableLessons] = useState<Array<{ id: string; title: string }>>([]);

  // Questions state
  const [questions, setQuestions] = useState<ExerciseQuestion[]>([
    {
      questionText: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      hint: '',
      explanation: '',
    },
  ]);

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load classes on mount
  useEffect(() => {
    async function fetchClasses() {
      try {
        const clsList = await classService.getClasses();
        setClasses(clsList || []);
        if (clsList && clsList.length > 0) {
          setClassLevel(clsList[0].name);
        }
      } catch (err) {
        console.warn('Failed to load classes for exercise:', err);
      }
    }
    fetchClasses();
  }, []);

  // Load subjects whenever classLevel changes
  useEffect(() => {
    async function fetchSubjects() {
      if (!classLevel) return;
      try {
        const subjs = await subjectService.getSubjects(classLevel);
        setSubjects(subjs || []);
        if (subjs && subjs.length > 0) {
          setSubject(subjs[0].name);
          const topList = subjs[0].topics?.map((t) => t.title) || [];
          setAvailableTopics(topList);
          setTopic(topList[0] || '');
        } else {
          setSubject('');
          setAvailableTopics([]);
          setTopic('');
        }
      } catch (err) {
        console.warn('Failed to load subjects for class:', err);
      }
    }
    fetchSubjects();
  }, [classLevel]);

  // Load lessons dynamically whenever classLevel or subject changes
  useEffect(() => {
    async function fetchLessons() {
      if (!classLevel) return;
      try {
        const foundSubj = subjects.find((s) => s.name === subject);
        const lessonsData = await lessonService.getAllLessons({
          classLevel,
          subjectId: foundSubj?._id,
        });

        if (Array.isArray(lessonsData) && lessonsData.length > 0) {
          const formatted = lessonsData.map((l: any) => ({
            id: l._id || l.id,
            title: l.title || 'Untitled Lesson',
          }));
          setAvailableLessons(formatted);
        } else {
          // Fallback to topic lessons if any
          const topicLessons: Array<{ id: string; title: string }> = [];
          foundSubj?.topics?.forEach((t: any) => {
            t.lessons?.forEach((l: any) => {
              if (typeof l === 'string') {
                topicLessons.push({ id: l, title: l });
              } else if (l?.title) {
                topicLessons.push({ id: l._id || l.title, title: l.title });
              }
            });
          });
          setAvailableLessons(topicLessons);
        }
      } catch (err) {
        console.warn('Failed to load lessons for exercise:', err);
        setAvailableLessons([]);
      }
    }
    fetchLessons();
  }, [classLevel, subject, subjects]);

  // Update topics when subject changes
  const handleSubjectChange = (newSubjectName: string) => {
    setSubject(newSubjectName);
    const foundSubj = subjects.find((s) => s.name === newSubjectName);
    if (foundSubj && foundSubj.topics && foundSubj.topics.length > 0) {
      const topList = foundSubj.topics.map((t) => t.title);
      setAvailableTopics(topList);
      setTopic(topList[0] || '');
    } else {
      setAvailableTopics([]);
      setTopic('');
    }
  };

  // Update topic
  const handleTopicChange = (newTopicTitle: string) => {
    setTopic(newTopicTitle);
  };

  // Add question
  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        hint: '',
        explanation: '',
      },
    ]);
    setActiveQuestionIndex(questions.length);
  };

  // Remove question
  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) {
      showError('Cannot Remove', 'An exercise requires at least one question.');
      return;
    }
    const updated = questions.filter((_, i) => i !== idx);
    setQuestions(updated);
    if (activeQuestionIndex >= updated.length) {
      setActiveQuestionIndex(updated.length - 1);
    }
  };

  // Update active question text
  const handleQuestionTextChange = (text: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[activeQuestionIndex] = {
        ...updated[activeQuestionIndex],
        questionText: text,
      };
      return updated;
    });
  };

  // Update option
  const handleOptionChange = (optionIndex: number, text: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const cur = { ...updated[activeQuestionIndex] };
      const curOptions = [...cur.options];
      curOptions[optionIndex] = text;
      cur.options = curOptions;
      updated[activeQuestionIndex] = cur;
      return updated;
    });
  };

  // Set correct option
  const handleSetCorrectOption = (optionIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[activeQuestionIndex] = {
        ...updated[activeQuestionIndex],
        correctOptionIndex: optionIndex,
      };
      return updated;
    });
  };

  // Submit exercise form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showError('Validation Error', 'Please enter an exercise title.');
      return;
    }

    if (!classLevel.trim()) {
      showError('Validation Error', 'Please select or enter the class level.');
      return;
    }

    if (!subject.trim()) {
      showError('Validation Error', 'Please select or enter the subject name.');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        showError('Validation Error', `Question ${i + 1} is missing its question statement.`);
        setActiveQuestionIndex(i);
        return;
      }
      const validOptions = q.options.filter((o) => o.trim().length > 0);
      if (validOptions.length < 2) {
        showError('Validation Error', `Question ${i + 1} must have at least 2 answer choices.`);
        setActiveQuestionIndex(i);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await exerciseService.createExercise({
        title: title.trim(),
        description: description.trim(),
        classLevel: classLevel.trim(),
        subject: subject.trim(),
        topic: topic.trim(),
        lesson: lesson.trim(),
        status,
        points: Number(points) || 10,
        estimatedMinutes: Number(estimatedMinutes) || 15,
        questions,
      });

      showSuccess(
        'Exercise Created!',
        `"${title}" has been published and linked to ${subject}.`,
        () => router.push('/exercises'),
        'Back to Exercises'
      );
    } catch (err: any) {
      showError('Creation Failed', err?.message || 'Could not save exercise to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = questions[activeQuestionIndex] || questions[0];

  return (
    <AdminLayout
      activeNav="Exercises"
      breadcrumbs={[
        { label: 'Management', href: '/classes' },
        { label: 'Exercises', href: '/exercises' },
        { label: 'New Exercise' },
      ]}
    >
      <div className="space-y-6 max-w-5xl">
        {/* Top Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/exercises"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Back to Exercises</span>
          </Link>
        </div>

        {/* Title Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Create Exercise & Practice Sheet
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Build interactive question sheets, homework tasks, and topic-specific student exercises.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Exercise Metadata */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <FileQuestion className="w-5 h-5 text-[#0D6D62]" />
              <span>Exercise Overview</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Exercise Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Algebra & Linear Equations Practice Sheet"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] focus:ring-1 focus:ring-[#0D6D62] bg-[#FAFAFA]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Target Class Level *
                </label>
                {classes.length > 0 ? (
                  <select
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] bg-white"
                  >
                    {classes.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="e.g. JSS 1"
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA]"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Subject *
                </label>
                {subjects.length > 0 ? (
                  <select
                    value={subject}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] bg-white"
                  >
                    {subjects.map((s) => (
                      <option key={s._id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="e.g. Mathematics"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA]"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Topic (Optional)
                </label>
                {availableTopics.length > 0 ? (
                  <select
                    value={topic}
                    onChange={(e) => handleTopicChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] bg-white"
                  >
                    <option value="">-- None / General --</option>
                    {availableTopics.map((t, idx) => (
                      <option key={idx} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="e.g. Algebraic Expressions"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA]"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Associated Lesson (Optional)
                </label>
                {availableLessons.length > 0 ? (
                  <select
                    value={lesson}
                    onChange={(e) => setLesson(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] bg-white"
                  >
                    <option value="">-- None / Standalone --</option>
                    {availableLessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="e.g. Introduction to Variables or Lesson ID"
                    value={lesson}
                    onChange={(e) => setLesson(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA]"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Estimated Completion (Mins)
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="1"
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10) || 15)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Points / Score Value
                </label>
                <div className="relative">
                  <Award className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="1"
                    value={points}
                    onChange={(e) => setPoints(parseInt(e.target.value, 10) || 10)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA]"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Instructions / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Instructions for students taking this practice worksheet..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Questions Editor */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#0D6D62]" />
                  <span>Exercise Questions ({questions.length})</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Select a question number to edit its statement, formula, and options.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddQuestion}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E6F7F3] text-[#0D6D62] hover:bg-[#D2F4EB] text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            </div>

            {/* Question Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {questions.map((_, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setActiveQuestionIndex(i)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeQuestionIndex === i
                      ? 'bg-[#0D6D62] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Q{i + 1}
                </button>
              ))}
            </div>

            {/* Formula Toolbar */}
            <FormulaToolbar
              onInsert={(snippet) =>
                handleQuestionTextChange(
                  currentQ.questionText ? currentQ.questionText + ' ' + snippet : snippet
                )
              }
            />

            {/* Current Question Statement */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700">
                  Question {activeQuestionIndex + 1} Statement *
                </label>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(activeQuestionIndex)}
                    className="text-red-500 hover:text-red-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Q{activeQuestionIndex + 1}</span>
                  </button>
                )}
              </div>

              <textarea
                rows={3}
                placeholder="Enter question statement or formula (e.g., Solve for x in $\frac{2x+6}{2} = 10$)..."
                value={currentQ.questionText}
                onChange={(e) => handleQuestionTextChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA]"
              />

              {/* Math Preview if contains $ */}
              {currentQ.questionText.includes('$') && (
                <div className="p-3 bg-[#F8FAF9] border border-gray-100 rounded-xl text-xs text-gray-700">
                  <span className="font-bold text-gray-500 block mb-1">Live Formula Preview:</span>
                  <MathRenderer content={currentQ.questionText} />
                </div>
              )}
            </div>

            {/* Answer Options */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div className="text-xs font-bold text-gray-700">
                Answer Options (Click radio button to mark correct answer)
              </div>

              <div className="space-y-2.5">
                {currentQ.options.map((opt, optIdx) => {
                  const isCorrect = currentQ.correctOptionIndex === optIdx;
                  return (
                    <div
                      key={optIdx}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        isCorrect
                          ? 'border-[#0D6D62] bg-[#F2FAF8]'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSetCorrectOption(optIdx)}
                        className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                          isCorrect
                            ? 'text-[#0D6D62]'
                            : 'text-gray-300 hover:text-gray-400'
                        }`}
                      >
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 fill-[#0D6D62] text-white" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <span className="text-xs font-bold text-gray-400 w-5">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>

                      <input
                        type="text"
                        placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                        value={opt}
                        onChange={(e) => handleOptionChange(optIdx, e.target.value)}
                        className="flex-1 text-sm bg-transparent border-none focus:outline-none text-gray-900"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hint & Explanation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Hint (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Remember to isolate x first"
                  value={currentQ.hint || ''}
                  onChange={(e) => {
                    setQuestions((prev) => {
                      const updated = [...prev];
                      updated[activeQuestionIndex] = {
                        ...updated[activeQuestionIndex],
                        hint: e.target.value,
                      };
                      return updated;
                    });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Explanation (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Multiplying both sides by 2 yields 2x + 6 = 20..."
                  value={currentQ.explanation || ''}
                  onChange={(e) => {
                    setQuestions((prev) => {
                      const updated = [...prev];
                      updated[activeQuestionIndex] = {
                        ...updated[activeQuestionIndex],
                        explanation: e.target.value,
                      };
                      return updated;
                    });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA]"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/exercises"
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#0D6D62] hover:bg-[#0A5A51] text-white text-xs sm:text-sm font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Publishing Exercise...' : 'Publish Exercise'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export default function CreateExercisePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <div className="w-8 h-8 border-4 border-[#0D6D62] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CreateExerciseContent />
    </Suspense>
  );
}
