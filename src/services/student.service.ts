import apiClient from './api';
import {
  ClassOverviewResponse,
  StudentOverviewItem,
  StudentDetails,
} from '@/types/student.types';

export const studentService = {
  /**
   * Get class overview metrics and students for a specific class strictly from backend
   */
  async getClassOverview(classIdentifier?: string): Promise<ClassOverviewResponse> {
    const url = classIdentifier
      ? `/classes/students/overview/${encodeURIComponent(classIdentifier)}`
      : '/classes/students/overview';
    const response = await apiClient.get<ClassOverviewResponse>(url);
    return response.data;
  },

  /**
   * Get students for a specific class with search and status filtering strictly from backend
   */
  async getClassStudents(
    classIdentifier: string,
    search?: string,
    status?: string
  ): Promise<{ className: string; totalCount: number; students: StudentOverviewItem[] }> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);

    const response = await apiClient.get<{ className: string; totalCount: number; students: StudentOverviewItem[] }>(
      `/classes/${encodeURIComponent(classIdentifier)}/students?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get detailed profile, breakdown, quizzes, and insights for a student strictly from backend
   */
  async getStudentDetails(studentId: string): Promise<StudentDetails> {
    const response = await apiClient.get<StudentDetails>(
      `/classes/students/${encodeURIComponent(studentId)}/details`
    );
    return response.data;
  },

  /**
   * Encourage student action
   */
  async encourageStudent(
    studentId: string,
    message?: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/classes/students/${encodeURIComponent(studentId)}/encourage`,
      { message }
    );
    return response.data;
  },

  /**
   * Assign extra practice
   */
  async assignPractice(
    studentId: string,
    payload: {
      subject: string;
      topic: string;
      questionsCount: number;
    }
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/classes/students/${encodeURIComponent(studentId)}/assign-practice`,
      payload
    );
    return response.data;
  },
};

export default studentService;
