import apiClient from './api';
import { SchoolClass } from '@/types/curriculum.types';

export const classService = {
  /**
   * Get all active curriculum classes
   */
  async getClasses(): Promise<SchoolClass[]> {
    const response = await apiClient.get<SchoolClass[]>('/classes');
    return response.data;
  },

  /**
   * Get all classes for back office administration (including inactive)
   */
  async getAllAdminClasses(): Promise<SchoolClass[]> {
    const response = await apiClient.get<SchoolClass[]>('/classes/admin/all');
    return response.data;
  },

  /**
   * Get single class details by ID
   */
  async getClassById(id: string): Promise<SchoolClass> {
    const response = await apiClient.get<SchoolClass>(`/classes/${id}`);
    return response.data;
  },

  /**
   * Create a new curriculum class
   */
  async createClass(data: Partial<SchoolClass>): Promise<SchoolClass> {
    const response = await apiClient.post<SchoolClass>('/classes', data);
    return response.data;
  },

  /**
   * Update an existing class
   */
  async updateClass(id: string, data: Partial<SchoolClass>): Promise<SchoolClass> {
    const response = await apiClient.patch<SchoolClass>(`/classes/${id}`, data);
    return response.data;
  },

  /**
   * Delete a class
   */
  async deleteClass(id: string): Promise<void> {
    await apiClient.delete(`/classes/${id}`);
  },

  /**
   * Seed standard 12 classes
   */
  async seedClasses(): Promise<{ count: number; message: string }> {
    const response = await apiClient.post<{ count: number; message: string }>('/classes/seed');
    return response.data;
  },
};

export default classService;
