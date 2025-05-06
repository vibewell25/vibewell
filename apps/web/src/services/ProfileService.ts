import { apiClient, ApiResponse } from '@/types/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  role: 'customer' | 'provider' | 'admin';
  createdAt: string;
  updatedAt: string;
export interface UpdateProfileParams {
  name?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  location?: string;
export {};
