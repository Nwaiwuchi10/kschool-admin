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
  topic?: string | any;
  subjects?: (string | Subject)[];
  classes?: string[];
  content?: string;
  objectives?: string[];
  outlines?: string[];
  images?: string[];
  voiceNoteUrl?: string;
  voiceNoteDuration?: number;
  quiz?: any;
  duration?: string;
  readTime?: number;
  audioUrl?: string;
  videoUrl?: string;
  status?: 'published' | 'draft' | 'archived';
  isCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubjectTopic {
  _id: string;
  title: string;
  subject: string;
  lessons?: SubjectLesson[];
}

export interface Subject {
  _id: string;
  name: string; // e.g. "English Language", "Mathematics", "Basic Science"
  classLevel?: string; // Legacy / primary class
  classes?: string[]; // Array of linked classes e.g. ["JSS 1", "JSS 2", "Primary 5"]
  description?: string;
  topics?: SubjectTopic[];
  lessonCount?: number;
  progress?: number;
  avgScore?: number;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}
