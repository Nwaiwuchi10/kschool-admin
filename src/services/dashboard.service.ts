import apiClient from './api';

export interface AdminDashboardData {
  session: string;
  adminProfile: {
    name: string;
    role: string;
    school: string;
    unreadNotifications: number;
    avatar: string;
  };
  stats: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    totalSubjects: number;
    totalLessons: number;
    totalQuizzes: number;
  };
  recentActivities: Array<{
    id: string;
    badge: string;
    badgeColor: string;
    text: string;
    timeAgo: string;
  }>;
  announcements: Array<{
    _id: string;
    title: string;
    content: string;
    audience: string;
    pinned: boolean;
    date: string;
    authorName?: string;
  }>;
}

export interface TeacherDashboardData {
  teacherProfile: {
    name: string;
    title: string;
    initials: string;
  };
  stats: {
    totalStudents: number;
    totalClasses: number;
    totalLessons: number;
    totalExercises: number;
  };
  myClasses: Array<{
    id: string;
    name: string;
    studentsCount: number;
    subjectsCount: number;
    color: string;
  }>;
  recentActivity: Array<{
    id: string;
    title: string;
    subtitle: string;
    timeAgo: string;
    iconType: string;
  }>;
}

export const dashboardService = {
  async getAdminDashboard(): Promise<AdminDashboardData> {
    const res = await apiClient.get<AdminDashboardData>('/dashboard/admin');
    return res.data;
  },

  async getTeacherDashboard(name?: string): Promise<TeacherDashboardData> {
    const res = await apiClient.get<TeacherDashboardData>('/dashboard/teacher', {
      params: name ? { name } : undefined,
    });
    return res.data;
  },

  async getAnnouncements() {
    const res = await apiClient.get('/dashboard/announcements');
    return res.data;
  },

  async createAnnouncement(data: { title: string; content: string; audience?: string; pinned?: boolean }) {
    const res = await apiClient.post('/dashboard/announcements', data);
    return res.data;
  },

  async deleteAnnouncement(id: string) {
    const res = await apiClient.delete(`/dashboard/announcements/${id}`);
    return res.data;
  },

  async getReports() {
    const res = await apiClient.get('/dashboard/reports');
    return res.data;
  },
};
