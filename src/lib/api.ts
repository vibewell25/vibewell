import axios from 'axios';

// Create a custom instance of axios with some default settings
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token in requests
api.interceptors.request.use(config => {
  // Get token from localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  response => response,
  async error => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Helper function to check if the user is authenticated
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return !!localStorage.getItem('token');
};

// Helper function to get the authenticated user's token
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('token');
};

// Helper function to set the authenticated user's token
export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

// Helper function to clear the authenticated user's token
export const clearAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};
