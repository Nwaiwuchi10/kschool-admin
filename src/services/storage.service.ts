import { AdminUser } from '@/types/auth.types';

const TOKEN_KEY = 'kschool_admin_token';
const USER_KEY = 'kschool_admin_user';
const RESET_EMAIL_KEY = 'kschool_admin_reset_email';
const RESET_CODE_KEY = 'kschool_admin_reset_code';

export const storageService = {
  // Token
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
  },

  // User
  getUser(): AdminUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setUser(user: AdminUser): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  removeUser(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_KEY);
  },

  // Password reset flow helpers
  setResetEmail(email: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(RESET_EMAIL_KEY, email);
  },

  getResetEmail(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(RESET_EMAIL_KEY);
  },

  setResetCode(code: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(RESET_CODE_KEY, code);
  },

  getResetCode(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(RESET_CODE_KEY);
  },

  clearResetFlow(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(RESET_EMAIL_KEY);
    sessionStorage.removeItem(RESET_CODE_KEY);
  },

  // Clear all
  clearAll(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(RESET_EMAIL_KEY);
    sessionStorage.removeItem(RESET_CODE_KEY);
  },
};
