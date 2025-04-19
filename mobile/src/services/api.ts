import axios from 'axios';
import { BeautyService, BeautyCategory, BeautyFilter } from '../types/beauty';
import { BeautyServiceDetails } from '../types/navigation';
import { BookingRequest, BookingResponse, ReviewInput } from './beautyService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API configuration
const API_URL = process.env.REACT_APP_API_URL || 'https://api.vibewell.com/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Add a request interceptor for auth tokens
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error setting auth token', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Beauty services API
export const beautyApi = {
  // Get all beauty services with optional filters
  getServices: async (searchTerm?: string, filters?: BeautyFilter): Promise<BeautyService[]> => {
    try {
      const params = {
        search: searchTerm,
        ...filters
      };
      const response = await apiClient.get('/beauty/services', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching beauty services:', error);
      throw error;
    }
  },

  // Get featured beauty services
  getFeaturedServices: async (): Promise<BeautyService[]> => {
    try {
      const response = await apiClient.get('/beauty/services/featured');
      return response.data;
    } catch (error) {
      console.error('Error fetching featured services:', error);
      throw error;
    }
  },

  // Get beauty services by category
  getServicesByCategory: async (categoryId: string): Promise<BeautyService[]> => {
    try {
      const response = await apiClient.get(`/beauty/categories/${categoryId}/services`);
      return response.data;
    } catch (error) {
      console.error('Error fetching services by category:', error);
      throw error;
    }
  },

  // Get beauty service details by ID
  getServiceDetails: async (serviceId: string): Promise<BeautyServiceDetails> => {
    try {
      const response = await apiClient.get(`/beauty/services/${serviceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching service details:', error);
      throw error;
    }
  },

  // Get all beauty categories
  getCategories: async (): Promise<BeautyCategory[]> => {
    try {
      const response = await apiClient.get('/beauty/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching beauty categories:', error);
      throw error;
    }
  },

  // Create a booking
  createBooking: async (bookingData: BookingRequest): Promise<BookingResponse> => {
    try {
      const response = await apiClient.post('/beauty/bookings', bookingData);
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  // Add a review
  addReview: async (reviewData: ReviewInput): Promise<{ success: boolean; reviewId: string }> => {
    try {
      const response = await apiClient.post(`/beauty/services/${reviewData.serviceId}/reviews`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  },

  // Check availability for a service
  checkAvailability: async (serviceId: string, date: string): Promise<{ id: string; time: string; available: boolean }[]> => {
    try {
      const response = await apiClient.get(`/beauty/services/${serviceId}/availability`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking availability:', error);
      throw error;
    }
  },
  
  // Get similar services
  getSimilarServices: async (serviceId: string): Promise<BeautyService[]> => {
    try {
      const response = await apiClient.get(`/beauty/services/${serviceId}/similar`);
      return response.data;
    } catch (error) {
      console.error('Error fetching similar services:', error);
      throw error;
    }
  },
  
  // Get all reviews for a service
  getServiceReviews: async (serviceId: string) => {
    try {
      const response = await apiClient.get(`/beauty/services/${serviceId}/reviews`);
      return response.data;
    } catch (error) {
      console.error('Error fetching service reviews:', error);
      throw error;
    }
  }
};

// Calendar integration API
export const calendarApi = {
  // Add event to calendar
  addEventToCalendar: async (bookingId: string): Promise<{ success: boolean }> => {
    try {
      const response = await apiClient.post(`/calendar/events`, { bookingId });
      return response.data;
    } catch (error) {
      console.error('Error adding event to calendar:', error);
      throw error;
    }
  },
  
  // Get user calendar events
  getUserEvents: async (startDate: string, endDate: string): Promise<any[]> => {
    try {
      const response = await apiClient.get('/calendar/events', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  }
};

// Notification API
export const notificationApi = {
  // Register device for push notifications
  registerDevice: async (deviceToken: string, platform: 'ios' | 'android'): Promise<{ success: boolean }> => {
    try {
      const response = await apiClient.post('/notifications/devices', {
        deviceToken,
        platform
      });
      return response.data;
    } catch (error) {
      console.error('Error registering device for notifications:', error);
      throw error;
    }
  },
  
  // Unregister device
  unregisterDevice: async (deviceToken: string): Promise<{ success: boolean }> => {
    try {
      const response = await apiClient.delete('/notifications/devices', {
        data: { deviceToken }
      });
      return response.data;
    } catch (error) {
      console.error('Error unregistering device for notifications:', error);
      throw error;
    }
  },
  
  // Update notification preferences
  updatePreferences: async (preferences: { 
    bookingReminders: boolean; 
    promotions: boolean; 
    reviews: boolean 
  }): Promise<{ success: boolean }> => {
    try {
      const response = await apiClient.put('/notifications/preferences', preferences);
      return response.data;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  },
  
  // Get notification preferences
  getPreferences: async (): Promise<{ 
    bookingReminders: boolean; 
    promotions: boolean; 
    reviews: boolean 
  }> => {
    try {
      const response = await apiClient.get('/notifications/preferences');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }
  }
};

export default {
  beautyApi,
  calendarApi,
  notificationApi
}; 