export interface SchoolClass {
  _id: string;
  name: string; // e.g. "JSS 1", "JSS 2", "Primary 5", "SS 2"
  code: string;
  category: 'Primary' | 'Junior Secondary' | 'Senior Secondary';
  order: number;
  description?: string;
  isActive: boolean;
  studentCount?: number;
  subjectCount?: number;
  avgScore?: number;
  progress?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubjectLesson {
  _id: string;
  title: string;
  topic: string;
  content?: string;
  duration?: string;
  isCompleted?: boolean;
}

export interface SubjectTopic {
  _id: string;
  title: string;
  subject: string;
  lessons?: SubjectLesson[];
}

export interface Subject {
  _id: string;
  name: string; // e.g. "JSS 1 - Science", "Mathematics", "SS 2 - Science"
  classLevel: string; // e.g. "JSS 1", "SS 2", "Primary 5"
  description?: string;
  topics?: SubjectTopic[];
  lessonCount?: number;
  progress?: number;
  avgScore?: number;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}
