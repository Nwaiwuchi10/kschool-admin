import apiClient from './api';
import { SubjectTopic } from '@/types/curriculum.types';

export interface CreateTopicDto {
  title: string;
  description?: string;
  order?: number;
  status?: 'published' | 'draft';
  maxLessons?: number;
  maxQuizQuestions?: number;
}

export const topicService = {
  /**
   * Get topic details by ID including lessons
   */
  async getTopicById(topicId: string): Promise<any> {
    const response = await apiClient.get(`/subjects/topics/${topicId}`);
    return response.data;
  },

  /**
   * Create a new topic under a subject
   */
  async createTopic(subjectId: string, data: CreateTopicDto): Promise<any> {
    const response = await apiClient.post(`/subjects/${subjectId}/topics`, data);
    return response.data;
  },

  /**
   * Update an existing topic
   */
  async updateTopic(topicId: string, data: Partial<CreateTopicDto>): Promise<any> {
    const response = await apiClient.patch(`/subjects/topics/${topicId}`, data);
    return response.data;
  },

  /**
   * Delete a topic
   */
  async deleteTopic(topicId: string): Promise<void> {
    await apiClient.delete(`/subjects/topics/${topicId}`);
  },
};

export default topicService;
