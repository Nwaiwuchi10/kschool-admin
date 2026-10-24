import apiClient from './api';
import { Subject, SubjectTopic, SubjectLesson } from '@/types/curriculum.types';

export const subjectService = {
  /**
   * Get all subjects with optional classLevel filter (e.g. "JSS 1")
   */
  async getSubjects(classLevel?: string): Promise<Subject[]> {
    const params: Record<string, string> = {};
    if (classLevel && classLevel.trim()) {
      params.classLevel = classLevel.trim();
    }
    const response = await apiClient.get<Subject[]>('/subjects', { params });
    return response.data;
  },

  /**
   * Get subject details including topics and lessons
   */
  async getSubjectById(id: string): Promise<Subject> {
    const response = await apiClient.get<Subject>(`/subjects/${id}`);
    return response.data;
  },

  async createSubject(data: {
    name: string;
    classLevel?: string;
    classes?: string[];
    description?: string;
  }): Promise<Subject> {
    const response = await apiClient.post<Subject>('/subjects', data);
    return response.data;
  },

  /**
   * Update an existing subject and its linked classes
   */
  async updateSubject(
    id: string,
    data: { name?: string; classLevel?: string; classes?: string[]; description?: string }
  ): Promise<Subject> {
    const response = await apiClient.patch<Subject>(`/subjects/${id}`, data);
    return response.data;
  },

  /**
   * Delete a subject
   */
  async deleteSubject(id: string): Promise<void> {
    await apiClient.delete(`/subjects/${id}`);
  },

  /**
   * Create a new topic under a subject
   */
  async createTopic(subjectId: string, data: { title: string }): Promise<SubjectTopic> {
    const response = await apiClient.post<SubjectTopic>(`/subjects/${subjectId}/topics`, data);
    return response.data;
  },

  /**
   * Get topic details including lessons
   */
  async getTopicById(topicId: string): Promise<SubjectTopic> {
    const response = await apiClient.get<SubjectTopic>(`/subjects/topics/${topicId}`);
    return response.data;
  },

  /**
   * Create a lesson under a topic
   */
  async createLesson(topicId: string, data: { title: string; content?: string }): Promise<SubjectLesson> {
    const response = await apiClient.post<SubjectLesson>(`/subjects/topics/${topicId}/lessons`, data);
    return response.data;
  },

  /**
   * Trigger seeding of standard curriculum subjects
   */
  async seedSubjects(): Promise<{ count: number; message: string }> {
    const response = await apiClient.post<{ count: number; message: string }>('/subjects/seed');
    return response.data;
  },
};

export default subjectService;
