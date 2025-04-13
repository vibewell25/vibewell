/**
 * Booking Service
 * Handles API requests for booking-related functionality
 */
import { apiClient, ApiResponse } from './api-client';
import { withApiErrorHandling, handleResponse, getResponseData, hasData } from '../utils/api-response-utils';

// Booking interfaces
export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  providerId: string;
  providerName: string;
  date: string;
  time: string;
  duration: number;
  status: BookingStatus;
  notes?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  price: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

// Create booking request parameters
export interface CreateBookingParams {
  serviceId: string;
  providerId: string;
  date: string;
  time: string;
  notes?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}

// Update booking request parameters
export interface UpdateBookingParams {
  id: string;
  status?: BookingStatus;
  notes?: string;
  date?: string;
  time?: string;
}

// Booking filter parameters
export interface BookingFilterParams {
  status?: BookingStatus | BookingStatus[];
  providerId?: string;
  serviceId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

// Basic booking service API
export const bookingService = {
  /**
   * Get all bookings with optional filters
   */
  async getBookings(
    filters: BookingFilterParams = {}
  ): Promise<ApiResponse<Booking[]>> {
    // Convert filters to query parameters
    const queryParams = new URLSearchParams();
    
    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      statuses.forEach(status => queryParams.append('status', status));
    }
    
    if (filters.providerId) {
      queryParams.append('providerId', filters.providerId);
    }
    
    if (filters.serviceId) {
      queryParams.append('serviceId', filters.serviceId);
    }
    
    if (filters.fromDate) {
      queryParams.append('fromDate', filters.fromDate);
    }
    
    if (filters.toDate) {
      queryParams.append('toDate', filters.toDate);
    }
    
    if (filters.page) {
      queryParams.append('page', filters.page.toString());
    }
    
    if (filters.limit) {
      queryParams.append('limit', filters.limit.toString());
    }
    
    const query = queryParams.toString();
    const url = `/api/bookings${query ? `?${query}` : ''}`;
    
    return apiClient.get<Booking[]>(url);
  },
  
  /**
   * Get a booking by ID
   */
  async getBooking(id: string): Promise<ApiResponse<Booking>> {
    return apiClient.get<Booking>(`/api/bookings/${id}`);
  },
  
  /**
   * Create a new booking
   */
  async createBooking(
    params: CreateBookingParams
  ): Promise<ApiResponse<Booking>> {
    return apiClient.post<Booking>('/api/bookings', params);
  },
  
  /**
   * Update an existing booking
   */
  async updateBooking(
    params: UpdateBookingParams
  ): Promise<ApiResponse<Booking>> {
    const { id, ...updateData } = params;
    return apiClient.put<Booking>(`/api/bookings/${id}`, updateData);
  },
  
  /**
   * Cancel a booking
   */
  async cancelBooking(id: string, reason?: string): Promise<ApiResponse<Booking>> {
    return apiClient.put<Booking>(`/api/bookings/${id}/cancel`, { reason });
  },
  
  /**
   * Complete a booking
   */
  async completeBooking(id: string): Promise<ApiResponse<Booking>> {
    return apiClient.put<Booking>(`/api/bookings/${id}/complete`, {});
  },
  
  /**
   * Delete a booking
   */
  async deleteBooking(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/bookings/${id}`);
  }
};

/**
 * Type-safe booking service with enhanced error handling
 * Wraps the standard booking service with utilities for safer API interactions
 */
export const typeSafeBookingService = {
  /**
   * Get all bookings with type-safe error handling
   * @example
   * // Using the type-safe API with callbacks for success/error
   * handleResponse(
   *   await typeSafeBookingService.getBookings({ status: 'pending' }),
   *   (bookings) => { 
   *     // TypeScript knows bookings is Booking[] here
   *     return bookings.map(b => b.id);
   *   },
   *   (error) => {
   *     console.error(error);
   *     return [];
   *   }
   * );
   */
  getBookings: withApiErrorHandling(bookingService.getBookings),
  
  /**
   * Get a booking by ID with type-safe error handling
   * @example
   * // Example showing how to use type guards with the response
   * const response = await typeSafeBookingService.getBooking(bookingId);
   * if (hasData(response)) {
   *   // TypeScript knows response.data is defined here
   *   const booking = response.data;
   *   console.log(`Retrieved booking for ${booking.customerName}`);
   * }
   */
  getBooking: withApiErrorHandling(bookingService.getBooking),
  
  /**
   * Create a booking with type-safe error handling
   * @example
   * // Example showing how to get data safely with default value
   * const response = await typeSafeBookingService.createBooking(newBookingData);
   * const booking = getResponseData(response, null);
   * if (booking) {
   *   // Process the booking
   * }
   */
  createBooking: withApiErrorHandling(bookingService.createBooking),
  
  /**
   * Update a booking with type-safe error handling
   */
  updateBooking: withApiErrorHandling(bookingService.updateBooking),
  
  /**
   * Cancel a booking with type-safe error handling
   */
  cancelBooking: withApiErrorHandling(bookingService.cancelBooking),
  
  /**
   * Complete a booking with type-safe error handling
   */
  completeBooking: withApiErrorHandling(bookingService.completeBooking),
  
  /**
   * Delete a booking with type-safe error handling
   */
  deleteBooking: withApiErrorHandling(bookingService.deleteBooking)
}; 