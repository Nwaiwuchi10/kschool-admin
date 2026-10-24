import apiClient from './api';
import { storageService } from './storage.service';
import {
  AdminUser,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  VerifyCodePayload,
  VerifyCodeResponse,
  ResetPasswordPayload,
} from '@/types/auth.types';

export const authService = {
  /**
   * Log in an admin user
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
    });

    if (response.data?.access_token) {
      storageService.setToken(response.data.access_token);
      storageService.setUser(response.data.user);
    }

    return response.data;
  },

  /**
   * Register a new admin user
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      email: payload.email.trim().toLowerCase(),
      phoneNumber: payload.phoneNumber?.trim() || undefined,
      password: payload.password,
      role: 'admin',
    });

    if (response.data?.access_token) {
      storageService.setToken(response.data.access_token);
      storageService.setUser(response.data.user);
    }

    return response.data;
  },

  /**
   * Request a 4-digit password reset verification code
   */
  async forgotPassword(payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> {
    const email = payload.email.trim().toLowerCase();
    const response = await apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', {
      email,
    });

    storageService.setResetEmail(email);
    return response.data;
  },

  /**
   * Verify the 4-digit verification code
   */
  async verifyResetCode(payload: VerifyCodePayload): Promise<VerifyCodeResponse> {
    const email = payload.email.trim().toLowerCase();
    const code = payload.code.trim();

    const response = await apiClient.post<VerifyCodeResponse>('/auth/verify-reset-code', {
      email,
      code,
    });

    storageService.setResetEmail(email);
    storageService.setResetCode(code);
    return response.data;
  },

  /**
   * Reset password with the verified code
   */
  async resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/reset-password', {
      email: payload.email.trim().toLowerCase(),
      code: payload.code.trim(),
      newPassword: payload.newPassword,
    });

    // Clear reset data upon successful reset
    storageService.clearResetFlow();
    return response.data;
  },

  /**
   * Log out the admin user
   */
  logout(): void {
    storageService.clearAll();
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!storageService.getToken();
  },

  /**
   * Get current stored admin profile
   */
  getCurrentUser(): AdminUser | null {
    return storageService.getUser();
  },
};

export default authService;
