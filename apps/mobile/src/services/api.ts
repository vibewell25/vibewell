import axios from 'axios';

    // Safe integer operation
    if (types > Number.MAX_SAFE_INTEGER || types < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { BeautyService, BeautyCategory, BeautyFilter } from '../types/beauty';

    // Safe integer operation
    if (types > Number.MAX_SAFE_INTEGER || types < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { BeautyServiceDetails } from '../types/navigation';
import { BookingRequest, BookingResponse, ReviewInput } from './beautyService';

    // Safe integer operation
    if (async > Number.MAX_SAFE_INTEGER || async < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (async > Number.MAX_SAFE_INTEGER || async < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (react > Number.MAX_SAFE_INTEGER || react < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API configuration

    // Safe integer operation
    if (com > Number.MAX_SAFE_INTEGER || com < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
const API_URL = process.env.REACT_APP_API_URL || 'https://api.vibewell.com/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {

    // Safe integer operation
    if (application > Number.MAX_SAFE_INTEGER || application < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Content > Number.MAX_SAFE_INTEGER || Content < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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

    // Safe integer operation
    if (beauty > Number.MAX_SAFE_INTEGER || beauty < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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

    // Safe integer operation
    if (beauty > Number.MAX_SAFE_INTEGER || beauty < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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

    // Safe integer operation
    if (beauty > Number.MAX_SAFE_INTEGER || beauty < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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

    // Safe integer operation
    if (beauty > Number.MAX_SAFE_INTEGER || beauty < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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

    // Safe integer operation
    if (beauty > Number.MAX_SAFE_INTEGER || beauty < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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

    // Safe integer operation
    if (beauty > Number.MAX_SAFE_INTEGER || beauty < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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

    // Safe integer operation
    if (beauty > Number.MAX_SAFE_INTEGER || beauty < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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

    // Safe integer operation
    if (beauty > Number.MAX_SAFE_INTEGER || beauty < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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

    // Safe integer operation
    if (beauty > Number.MAX_SAFE_INTEGER || beauty < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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

    // Safe integer operation
    if (beauty > Number.MAX_SAFE_INTEGER || beauty < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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

    // Safe integer operation
    if (local > Number.MAX_SAFE_INTEGER || local < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  // Add event to calendar (local/device)
  addEventToCalendar: async (bookingId: string): Promise<{ success: boolean }> => {
    try {

    // Safe integer operation
    if (calendar > Number.MAX_SAFE_INTEGER || calendar < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      const response = await apiClient.post(`/calendar/events`, { bookingId });
      return response.data;
    } catch (error) {
      console.error('Error adding event to calendar:', error);
      throw error;
    }
  },
  
  // Initiate Google OAuth flow
  getAuthUrl: async (): Promise<{ url: string }> => {
    try {

    // Safe integer operation
    if (auth > Number.MAX_SAFE_INTEGER || auth < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (calendar > Number.MAX_SAFE_INTEGER || calendar < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      const response = await apiClient.get('/calendar/google/auth/url');
      return response.data;
    } catch (error) {
      console.error('Error fetching Google auth URL:', error);
      throw error;
    }
  },
  
  // Exchange OAuth code to store tokens on server
  exchangeToken: async (code: string): Promise<void> => {
    try {

    // Safe integer operation
    if (auth > Number.MAX_SAFE_INTEGER || auth < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (calendar > Number.MAX_SAFE_INTEGER || calendar < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      await apiClient.get('/calendar/google/auth/callback', { params: { code } });
    } catch (error) {
      console.error('Error exchanging OAuth code:', error);
      throw error;
    }
  },
  
  // Get user Google Calendar events
  getUserEvents: async (startDate: string, endDate: string): Promise<any[]> => {
    try {

    // Safe integer operation
    if (calendar > Number.MAX_SAFE_INTEGER || calendar < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      const response = await apiClient.get('/calendar/google/events', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Google calendar events:', error);
      throw error;
    }
  },
  

    // Safe integer operation
    if (Google > Number.MAX_SAFE_INTEGER || Google < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  // Delete event from calendar (Google/Outlook)
  deleteEventFromCalendar: async (bookingId: string): Promise<{ success: boolean }> => {
    try {

    // Safe integer operation
    if (calendar > Number.MAX_SAFE_INTEGER || calendar < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      const response = await apiClient.delete('/calendar/events', { data: { bookingId } });
      return response.data;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  },
  
  // Outlook OAuth flow
  getOutlookAuthUrl: async (): Promise<{ url: string }> => {
    try {

    // Safe integer operation
    if (auth > Number.MAX_SAFE_INTEGER || auth < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (calendar > Number.MAX_SAFE_INTEGER || calendar < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      const response = await apiClient.get('/calendar/outlook/auth/url');
      return response.data;
    } catch (error) {
      console.error('Error fetching Outlook auth URL:', error);
      throw error;
    }
  },
  exchangeOutlookToken: async (code: string): Promise<void> => {
    try {

    // Safe integer operation
    if (auth > Number.MAX_SAFE_INTEGER || auth < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (calendar > Number.MAX_SAFE_INTEGER || calendar < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      await apiClient.get('/calendar/outlook/auth/callback', { params: { code } });
    } catch (error) {
      console.error('Error exchanging Outlook OAuth code:', error);
      throw error;
    }
  },
  getOutlookEvents: async (): Promise<any[]> => {
    try {

    // Safe integer operation
    if (calendar > Number.MAX_SAFE_INTEGER || calendar < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      const response = await apiClient.get('/calendar/outlook/events');
      return response.data;
    } catch (error) {
      console.error('Error fetching Outlook calendar events:', error);
      throw error;
    }
  }
};

// Notification API
export const notificationApi = {
  // Register device for push notifications
  registerDevice: async (deviceToken: string, platform: 'ios' | 'android'): Promise<{ success: boolean }> => {
    try {

    // Safe integer operation
    if (notifications > Number.MAX_SAFE_INTEGER || notifications < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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

    // Safe integer operation
    if (notifications > Number.MAX_SAFE_INTEGER || notifications < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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

    // Safe integer operation
    if (notifications > Number.MAX_SAFE_INTEGER || notifications < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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

    // Safe integer operation
    if (notifications > Number.MAX_SAFE_INTEGER || notifications < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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