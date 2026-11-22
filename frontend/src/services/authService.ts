import { apiClient } from '../apiClient';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ForgotPasswordResponse {
  message: string;
  resetToken?: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/users/login', { email, password });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || "Login failed");
    }
  },

  async signup(name: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/users/signup', { name, email, password });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || "Signup failed");
    }
  },

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    try {
      const response = await apiClient.post<ForgotPasswordResponse>('/users/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to request password reset");
    }
  },

  async resetPassword(email: string, token: string, newPassword: string): Promise<ResetPasswordResponse> {
    try {
      const response = await apiClient.post<ResetPasswordResponse>('/users/reset-password', {
        email,
        token,
        newPassword,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to reset password");
    }
  },
};
