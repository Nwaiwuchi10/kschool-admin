import apiClient from './api';

export interface SubscriptionPackage {
  _id?: string;
  name: string;
  academicSession: string;
  price: number;
  features: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentSubscriptionItem {
  id: string;
  reference: string;
  studentName: string;
  studentEmail: string;
  classLevel: string;
  packageName: string;
  amount: number;
  paymentGateway: string;
  status: 'active' | 'grace' | 'expired' | 'pending';
  startDate: string;
  expiresAt: string;
  graceExpiresAt: string;
  createdAt: string;
}

export interface FinancesSummary {
  totalRevenue: number;
  totalTransactions: number;
  activeSubscriptionsCount: number;
  graceSubscriptionsCount: number;
  expiredSubscriptionsCount: number;
  packagesCount: number;
}

export interface FinancesOverviewResponse {
  summary: FinancesSummary;
  transactions: StudentSubscriptionItem[];
}

export const subscriptionService = {
  /**
   * Get all subscription packages
   */
  async getPackages(): Promise<SubscriptionPackage[]> {
    const res = await apiClient.get<SubscriptionPackage[]>('/subscriptions/packages');
    return res.data || [];
  },

  /**
   * Get package by ID
   */
  async getPackageById(id: string): Promise<SubscriptionPackage> {
    const res = await apiClient.get<SubscriptionPackage>(`/subscriptions/packages/${id}`);
    return res.data;
  },

  /**
   * Create a new subscription package
   */
  async createPackage(data: Partial<SubscriptionPackage>): Promise<SubscriptionPackage> {
    const res = await apiClient.post<SubscriptionPackage>('/subscriptions/packages', data);
    return res.data;
  },

  /**
   * Update an existing subscription package
   */
  async updatePackage(id: string, data: Partial<SubscriptionPackage>): Promise<SubscriptionPackage> {
    const res = await apiClient.patch<SubscriptionPackage>(`/subscriptions/packages/${id}`, data);
    return res.data;
  },

  /**
   * Delete a subscription package
   */
  async deletePackage(id: string): Promise<void> {
    await apiClient.delete(`/subscriptions/packages/${id}`);
  },

  /**
   * Get admin finances overview (revenue, transactions, active/expired/grace counts)
   */
  async getFinancesOverview(filters?: {
    startDate?: string;
    endDate?: string;
    classLevel?: string;
  }): Promise<FinancesOverviewResponse> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.classLevel && filters.classLevel !== 'All') {
      params.append('classLevel', filters.classLevel);
    }

    const url = `/subscriptions/admin/finances${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await apiClient.get<FinancesOverviewResponse>(url);
    return res.data;
  },

  /**
   * Get admin subscriptions list by status
   */
  async getSubscriptionsList(status?: string): Promise<any[]> {
    const url = status && status !== 'all' ? `/subscriptions/admin/all?status=${status}` : '/subscriptions/admin/all';
    const res = await apiClient.get<any[]>(url);
    return res.data || [];
  },
};

export default subscriptionService;
