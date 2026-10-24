import apiClient from './api';

export interface QuizQuestion {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
}

export interface CreateQuizDto {
  title: string;
  topic?: string;
  lesson?: string;
  questions: QuizQuestion[];
}

export const quizService = {
  /**
   * Get all quizzes across curriculum
   */
  async getAllQuizzes(): Promise<any[]> {
    const response = await apiClient.get('/quizzes');
    return response.data || [];
  },

  /**
   * Get all quizzes for a specific lesson
   */
  async getQuizzesByLesson(lessonId: string): Promise<any[]> {
    const response = await apiClient.get(`/quizzes/lesson/${lessonId}`);
    return response.data || [];
  },

  /**
   * Get all quizzes for a specific topic
   */
  async getQuizzesByTopic(topicId: string): Promise<any[]> {
    const response = await apiClient.get(`/quizzes/topic/${topicId}`);
    return response.data;
  },

  /**
   * Get single quiz details
   */
  async getQuizById(id: string): Promise<any> {
    const response = await apiClient.get(`/quizzes/${id}`);
    return response.data;
  },

  /**
   * Create a generic quiz attached to a lesson or topic
   */
  async createGenericQuiz(data: CreateQuizDto): Promise<any> {
    const response = await apiClient.post('/quizzes/create', data);
    return response.data;
  },

  /**
   * Create a new quiz under a topic
   */
  async createQuiz(topicId: string, data: CreateQuizDto): Promise<any> {
    const response = await apiClient.post(`/quizzes/topic/${topicId}`, data);
    return response.data;
  },

  /**
   * Update an existing quiz
   */
  async updateQuiz(id: string, data: Partial<CreateQuizDto>): Promise<any> {
    const response = await apiClient.patch(`/quizzes/${id}`, data);
    return response.data;
  },

  /**
   * Delete a quiz
   */
  async deleteQuiz(id: string): Promise<void> {
    await apiClient.delete(`/quizzes/${id}`);
  },
};

export default quizService;
