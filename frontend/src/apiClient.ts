import axios from 'axios';
import { useAuthStore } from './store/authStore';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // This ensures cookies are sent with every request
});

// Request Interceptor: Attach Bearer token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Redirect to login page on 401 Unauthorized (or 403/auth error)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    // Do not redirect on auth endpoints so pages can display validation error messages
    const isAuthEndpoint =
      requestUrl.includes('/users/login') ||
      requestUrl.includes('/users/signup') ||
      requestUrl.includes('/users/forgot-password') ||
      requestUrl.includes('/users/reset-password');

    // Check for 401 Unauthorized, 403 Forbidden, or explicit unauthorized error message
    const isUnauthorized =
      status === 401 ||
      status === 403 ||
      (status === 400 &&
        String(error.response?.data?.error || '').toLowerCase().includes('unauthorized'));

    if (isUnauthorized && !isAuthEndpoint) {
      // Clear auth state
      useAuthStore.getState().logout();

      // Redirect user to login page if not already in auth flow
      const currentPath = window.location.pathname;
      const isPublicAuthPage =
        currentPath === '/login' ||
        currentPath === '/signup' ||
        currentPath === '/forgot-password' ||
        currentPath === '/reset-password';

      if (!isPublicAuthPage) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);
