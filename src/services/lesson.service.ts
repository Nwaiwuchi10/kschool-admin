import apiClient from './api';

export interface CreateLessonDto {
  title: string;
  content: string;
  order?: number;
  status?: 'published' | 'draft';
  readTime?: number;
  audioUrl?: string;
  videoUrl?: string;
}

export const lessonService = {
  /**
   * Get all lessons across topics
   */
  async getAllLessons(): Promise<any[]> {
    const response = await apiClient.get('/subjects/lessons/all');
    return response.data;
  },

  /**
   * Get single lesson details by ID
   */
  async getLessonById(lessonId: string): Promise<any> {
    const response = await apiClient.get(`/subjects/lessons/${lessonId}`);
    return response.data;
  },

  /**
   * Create a new lesson under a topic
   */
  async createLesson(topicId: string, data: CreateLessonDto): Promise<any> {
    const response = await apiClient.post(`/subjects/topics/${topicId}/lessons`, data);
    return response.data;
  },

  /**
   * Update an existing lesson
   */
  async updateLesson(lessonId: string, data: Partial<CreateLessonDto>): Promise<any> {
    const response = await apiClient.patch(`/subjects/lessons/${lessonId}`, data);
    return response.data;
  },

  /**
   * Delete a lesson
   */
  async deleteLesson(lessonId: string): Promise<void> {
    await apiClient.delete(`/subjects/lessons/${lessonId}`);
  },
};

export default lessonService;
