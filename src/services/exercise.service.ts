import apiClient from './api';

export interface ExerciseQuestion {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  hint?: string;
  explanation?: string;
}

export interface Exercise {
  _id?: string;
  title: string;
  description?: string;
  classLevel: string;
  subject: string;
  topic?: string;
  lesson?: string;
  status: 'published' | 'draft' | 'archived';
  points?: number;
  estimatedMinutes?: number;
  questions: ExerciseQuestion[];
  createdAt?: string;
  updatedAt?: string;
}

export const exerciseService = {
  /**
   * Get all exercises with optional classLevel / subject filters
   */
  async getAllExercises(params?: { classLevel?: string; subject?: string }): Promise<Exercise[]> {
    const searchParams = new URLSearchParams();
    if (params?.classLevel && params.classLevel !== 'All') {
      searchParams.append('classLevel', params.classLevel);
    }
    if (params?.subject && params.subject !== 'All') {
      searchParams.append('subject', params.subject);
    }
    const url = `/quizzes/exercises/all${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await apiClient.get<Exercise[]>(url);
    return response.data || [];
  },

  /**
   * Get exercise details by ID
   */
  async getExerciseById(id: string): Promise<Exercise> {
    const response = await apiClient.get<Exercise>(`/quizzes/exercises/${id}`);
    return response.data;
  },

  /**
   * Create a new exercise / practice sheet
   */
  async createExercise(data: Partial<Exercise>): Promise<Exercise> {
    const response = await apiClient.post<Exercise>('/quizzes/exercises/create', data);
    return response.data;
  },

  /**
   * Update an existing exercise
   */
  async updateExercise(id: string, data: Partial<Exercise>): Promise<Exercise> {
    const response = await apiClient.patch<Exercise>(`/quizzes/exercises/${id}`, data);
    return response.data;
  },

  /**
   * Delete an exercise
   */
  async deleteExercise(id: string): Promise<void> {
    await apiClient.delete(`/quizzes/exercises/${id}`);
  },
};

export default exerciseService;
