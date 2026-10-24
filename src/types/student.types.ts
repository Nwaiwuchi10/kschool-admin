export type StudentStatus = 'on_track' | 'falling_behind' | 'completed';

export interface StudentOverviewItem {
  id: string;
  name: string;
  rollNumber: string;
  grade: string;
  className?: string;
  score: number;
  progress: number;
  currentTopic: string;
  status: StudentStatus;
  avatar: string;
  email?: string;
}

export interface ClassOverviewResponse {
  className: string;
  classId: string;
  totalStudents: number;
  activeNow: number;
  completedTopics: number;
  avgQuizScore: number;
  students: StudentOverviewItem[];
}

export interface SubjectBreakdownItem {
  subject: string;
  scoreAvg: number;
  completedTopics: number;
  totalTopics: number;
  progress: number;
}

export interface QuizScoreItem {
  id: string;
  title: string;
  subject: string;
  timestamp: string;
  score: number;
}

export interface WeeklyStudyDay {
  day: 'M' | 'T' | 'W' | 'T' | 'F' | 'S' | 'S' | string;
  hours: number;
  active?: boolean;
}

export interface StudyDuration {
  totalHours: number;
  weekly: WeeklyStudyDay[];
}

export interface PerformanceInsights {
  strongestSubject: {
    title: string;
    score: number;
  };
  needsImprovement: {
    title: string;
    score: number;
  };
  learningStreak: number;
}

export interface StudentDetails {
  id: string;
  name: string;
  rollNumber: string;
  grade: string;
  className: string;
  score: number;
  progress: number;
  currentTopic: string;
  status: StudentStatus;
  avatar: string;
  email?: string;
  school?: string;
  overallProgress: number;
  milestoneSummary: string;
  stats: {
    subjectsCount: number;
    completedCount: number;
    inProgressCount: number;
    avgScore: number;
  };
  subjectBreakdown: SubjectBreakdownItem[];
  recentQuizzes: QuizScoreItem[];
  studyDuration: StudyDuration;
  performanceInsights: PerformanceInsights;
}
