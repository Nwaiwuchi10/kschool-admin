'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { quizService, QuizQuestion } from '@/services/quiz.service';
import { classService } from '@/services/class.service';
import { subjectService } from '@/services/subject.service';
import { SchoolClass, Subject } from '@/types/curriculum.types';
import { useResponseModal } from '@/context/ModalContext';
import { FormulaToolbar } from '@/components/FormulaToolbar';
import { MathRenderer } from '@/components/MathRenderer';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  HelpCircle,
  Sparkles,
  BookOpen,
} from 'lucide-react';

function CreateQuizContent() {
  const router = useRouter();
  const { showSuccess, showError } = useResponseModal();

  // Quiz details state
  const [title, setTitle] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [subject, setSubject] = useState('');
  const [topicId, setTopicId] = useState('');

  // Dropdown data
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [availableTopics, setAvailableTopics] = useState<any[]>([]);

  // Questions state
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      questionText: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
    },
  ]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch classes on mount
  useEffect(() => {
    async function fetchClasses() {
      try {
        const clsList = await classService.getClasses();
        setClasses(clsList || []);
        if (clsList && clsList.length > 0) {
          setClassLevel(clsList[0].name);
        }
      } catch (err) {
        console.warn('Failed to load classes for quiz:', err);
      }
    }
    fetchClasses();
  }, []);

  // Fetch subjects when classLevel changes
  useEffect(() => {
    async function fetchSubjects() {
      if (!classLevel) return;
      try {
        const subjs = await subjectService.getSubjects(classLevel);
        setSubjects(subjs || []);
        if (subjs && subjs.length > 0) {
          setSubject(subjs[0].name);
          const topList = subjs[0].topics || [];
          setAvailableTopics(topList);
          setTopicId(topList[0]?._id || '');
        } else {
          setSubject('');
          setAvailableTopics([]);
          setTopicId('');
        }
      } catch (err) {
        console.warn('Failed to load subjects for quiz:', err);
      }
    }
    fetchSubjects();
  }, [classLevel]);

  // Handle subject change
  const handleSubjectChange = (newSubjectName: string) => {
    setSubject(newSubjectName);
    const foundSubj = subjects.find((s) => s.name === newSubjectName);
    if (foundSubj && foundSubj.topics && foundSubj.topics.length > 0) {
      setAvailableTopics(foundSubj.topics);
      setTopicId(foundSubj.topics[0]._id || '');
    } else {
      setAvailableTopics([]);
      setTopicId('');
    }
  };

  // Add question
  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
      },
    ]);
    setActiveQuestionIndex(questions.length);
  };

  // Remove question
  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) {
      showError('Cannot Delete', 'A quiz must contain at least one question.');
      return;
    }
    const updated = questions.filter((_, i) => i !== idx);
    setQuestions(updated);
    if (activeQuestionIndex >= updated.length) {
      setActiveQuestionIndex(updated.length - 1);
    }
  };

  // Update question text
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

  // Mark correct option
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

  // Submit quiz form
  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showError('Validation Error', 'Please enter a quiz title.');
      return;
    }

    if (!topicId.trim()) {
      showError('Validation Error', 'Please select a curriculum topic for this quiz.');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        showError('Validation Error', `Question ${i + 1} statement is empty.`);
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

    setIsLoading(true);
    try {
      await quizService.createQuiz(topicId, {
        title: title.trim(),
        questions,
      });

      showSuccess(
        'Quiz Created Successfully',
        `"${title}" has been published with ${questions.length} question(s) and linked to the curriculum topic.`,
        () => router.push('/quizzes'),
        'View All Quizzes'
      );
    } catch (err: any) {
      showError('Error', err?.message || 'Failed to save quiz to database.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentQ = questions[activeQuestionIndex] || questions[0];

  return (
    <AdminLayout
      activeNav="Quizzes"
      breadcrumbs={[
        { label: 'Management', href: '/classes' },
        { label: 'Quizzes', href: '/quizzes' },
        { label: 'Create Quiz' },
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb Back Link */}
        <div className="mb-2">
          <Link
            href="/quizzes"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Back to Quizzes</span>
          </Link>
        </div>

        {/* Header Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Create Topic Quiz
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Build and publish standardized curriculum quizzes and tests for students.
          </p>
        </div>

        <form onSubmit={handleSaveQuiz} className="space-y-6">
          {/* Section 1: Curriculum Target */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#0D6D62]" />
              <span>Curriculum & Topic Association</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Motion, Velocity & Acceleration Mastery Quiz"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] focus:ring-1 focus:ring-[#0D6D62] bg-[#FAFAFA]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Class Level *
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
                    placeholder="e.g. SS 2"
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
                    placeholder="e.g. Physics"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA]"
                    required
                  />
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Curriculum Topic *
                </label>
                {availableTopics.length > 0 ? (
                  <select
                    value={topicId}
                    onChange={(e) => setTopicId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0D6D62] bg-white"
                    required
                  >
                    {availableTopics.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    No curriculum topics exist yet for this subject. Please create a topic first under Subjects & Topics.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Question Builder & Math/Formula Tools */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#0D6D62]" />
                  <span>Quiz Questions ({questions.length})</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Select question numbers to edit statements, formulas, and radio answer choices.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddQuestion}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E6F7F3] text-[#0D6D62] hover:bg-[#D2F4EB] text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Question</span>
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

            {/* Question Statement */}
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

              <input
                type="text"
                placeholder="e.g. Calculate the acceleration of a body with mass 5kg experiencing force 25N..."
                value={currentQ.questionText}
                onChange={(e) => handleQuestionTextChange(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#0D6D62] focus:ring-2 focus:ring-[#0D6D62]/15 text-sm sm:text-base text-gray-900 bg-white transition-all outline-none"
              />

              {/* Live Math / Formula Preview */}
              {currentQ.questionText.includes('$') && (
                <div className="p-3 bg-[#F8FAF9] border border-gray-100 rounded-xl text-xs text-gray-700">
                  <span className="font-bold text-gray-500 block mb-1">Live Formula Preview:</span>
                  <MathRenderer content={currentQ.questionText} />
                </div>
              )}
            </div>

            {/* Answer Options */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700">Answer Options</label>
                <span className="text-[11px] text-gray-400">
                  Click radio button to mark the correct choice
                </span>
              </div>

              <div className="space-y-2.5">
                {currentQ.options.map((option, idx) => {
                  const isSelected = currentQ.correctOptionIndex === idx;
                  const letter = String.fromCharCode(65 + idx); // A, B, C, D
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSetCorrectOption(idx)}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#0D6D62] bg-emerald-50/60 ring-2 ring-[#0D6D62]/15'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="shrink-0 text-[#0D6D62]">
                        {isSelected ? (
                          <CheckCircle2 className="w-5 h-5 fill-[#0D6D62] text-white" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300" />
                        )}
                      </div>

                      <span className="text-xs font-bold text-gray-500 w-5">{letter}.</span>

                      <input
                        type="text"
                        placeholder={`Option ${letter}`}
                        value={option}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        className="flex-1 bg-transparent text-sm sm:text-base font-semibold text-gray-900 outline-none"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Student Question & Options KaTeX Preview */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-xs">
              <div className="text-[11px] font-bold text-[#0D6D62] uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Student View Live KaTeX Preview:</span>
                <span className="text-[10px] text-gray-400 font-normal">Accurate math rendering</span>
              </div>
              <div className="p-3 bg-white border border-gray-100 rounded-xl mb-3 font-medium text-gray-900 text-sm">
                <MathRenderer content={currentQ.questionText || 'Enter a question statement to preview...'} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentQ.options.map((opt, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                      currentQ.correctOptionIndex === i
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                        : 'bg-white border-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="font-bold text-gray-400">{String.fromCharCode(65 + i)}.</span>
                    <MathRenderer content={opt || `Option ${String.fromCharCode(65 + i)}`} inline />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/quizzes"
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>

            <PrimaryButton
              type="submit"
              isLoading={isLoading}
              loadingText="Saving Quiz..."
              className="px-6 h-11"
            >
              Save Quiz
            </PrimaryButton>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export default function CreateQuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <div className="w-8 h-8 border-4 border-[#0D6D62] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <CreateQuizContent />
    </Suspense>
  );
}
