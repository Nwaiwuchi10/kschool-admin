export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: 'admin' | 'superadmin' | 'teacher' | 'student';
  class?: string;
  classes?: string[];
  subject?: string;
  subjects?: string[];
  permissions?: string[];
  school?: string;
  avatar?: string;
  profilePicture?: string;
}

export interface AuthResponse {
  access_token: string;
  user: AdminUser;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  confirmPassword?: string;
  role?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  email: string;
}

export interface VerifyCodePayload {
  email: string;
  code: string;
}

export interface VerifyCodeResponse {
  valid: boolean;
  message: string;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface ApiResponse<T = any> {
  statusCode?: number;
  message?: string | string[];
  error?: string;
  data?: T;
}
