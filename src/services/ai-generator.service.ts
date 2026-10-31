import api from './api';

export interface GenerateLessonPayload {
  topicTitle: string;
  subjectName?: string;
  classLevel?: string;
  subtopicTitle?: string;
}

export interface GeneratedLessonData {
  title: string;
  objectives: string[];
  outlines: string[];
  content: string;
}

export interface GenerateQuizPayload {
  topicTitle: string;
  subjectName?: string;
  classLevel?: string;
  lessonContent?: string;
  numberOfQuestions?: number;
}

export interface GeneratedQuizQuestionData {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

export interface GeneratedQuizData {
  title: string;
  questions: GeneratedQuizQuestionData[];
}

export const aiGeneratorService = {
  /**
   * Generate lesson learning objectives, outlines, and content using Google Gemini AI
   */
  async generateLesson(payload: GenerateLessonPayload): Promise<GeneratedLessonData> {
    const response = await api.post<GeneratedLessonData>('/ai/generate-lesson', payload);
    return response.data;
  },

  /**
   * Generate multiple-choice quiz questions using Google Gemini AI
   */
  async generateQuiz(payload: GenerateQuizPayload): Promise<GeneratedQuizData> {
    const response = await api.post<GeneratedQuizData>('/ai/generate-quiz', payload);
    return response.data;
  },
};

export default aiGeneratorService;

