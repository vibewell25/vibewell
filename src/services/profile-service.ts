/**
 * Profile Service
 * Handles API requests for user profiles
 */
import { apiClient, ApiResponse } from './api-client';

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
}

export interface UpdateProfileParams {
  name?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  location?: string;
}

export const profileService = {
  /**
   * Get the current user's profile
   */
  async getCurrentProfile(): Promise<ApiResponse<UserProfile>> {
    return apiClient.get<UserProfile>('/api/profile');
  },
  
  /**
   * Get a user profile by ID
   */
  async getProfileById(id: string): Promise<ApiResponse<UserProfile>> {
    return apiClient.get<UserProfile>(`/api/profiles/${id}`);
  },
  
  /**
   * Update the current user's profile
   */
  async updateProfile(params: UpdateProfileParams): Promise<ApiResponse<UserProfile>> {
    return apiClient.put<UserProfile>('/api/profile', params);
  },
  
  /**
   * Upload a profile avatar
   */
  async uploadAvatar(file: File): Promise<ApiResponse<{avatarUrl: string}>> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return apiClient.post<{avatarUrl: string}>('/api/profile/avatar', formData, {
      headers: {
        // No Content-Type header as it's set automatically for FormData
      }
    });
  },
  
  /**
   * Delete the profile avatar
   */
  async deleteAvatar(): Promise<ApiResponse<void>> {
    return apiClient.delete<void>('/api/profile/avatar');
  },
  
  /**
   * Search for profiles
   */
  async searchProfiles(query: string): Promise<ApiResponse<UserProfile[]>> {
    return apiClient.get<UserProfile[]>(`/api/profiles/search?q=${encodeURIComponent(query)}`);
  }
}; 