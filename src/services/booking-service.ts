/**
 * Booking Service
 * Handles API requests for booking-related functionality
 */
import { apiClient, ApiResponse } from '@/types/api';
import {
  withApiErrorHandling,
  handleResponse,
  getResponseData,
  hasData,
} from '@/types/api';
import {
  PrismaClient,
  BookingStatus,
  Booking,
  ServiceBooking,
  RecurringFrequency,
  WaitlistStatus,
} from '@prisma/client';
import { Redis } from 'ioredis';
import { Service, RecurringBooking, WaitlistEntry, BookingAnalytics } from '@/types/booking';
import { logger } from '@/lib/logger';
import { NotificationService } from './notification-service';
import { CalendarService } from './calendar-service';
import { PaymentService } from './payment-service';

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || '');
const BOOKING_LOCK_TTL = 300; // 5 minutes

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

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

// Create booking request parameters
interface CreateBookingParams {
  userId: string;
  providerId: string;
  services: Array<{
    serviceId: string;
    price: number;
    duration: number;
  }>;
  startTime: Date;
  notes?: string;
  isRecurring?: boolean;
  frequency?: RecurringFrequency;
  endDate?: Date;
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
  async getBookings(filters: BookingFilterParams = {}): Promise<ApiResponse<Booking[]>> {
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
  async createBooking(params: CreateBookingParams): Promise<ApiResponse<ServiceBooking>> {
    return apiClient.post<ServiceBooking>('/api/bookings', params);
  },

  /**
   * Update an existing booking
   */
  async updateBooking(params: UpdateBookingParams): Promise<ApiResponse<Booking>> {
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
  },
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
  deleteBooking: withApiErrorHandling(bookingService.deleteBooking),
};

interface MobileBookingOptimization {
  deviceType: string;
  screenSize: string;
  platform: string;
}

export class BookingService {
  private notificationService: NotificationService;
  private calendarService: CalendarService;
  private paymentService: PaymentService;

  constructor() {
    this.notificationService = new NotificationService();
    this.calendarService = new CalendarService();
    this.paymentService = new PaymentService();
  }

  /**
   * Create a new booking
   */
  async createBooking(params: CreateBookingParams): Promise<ServiceBooking> {
    try {
      // Calculate total duration for all services
      const totalDuration = params.services.reduce((total, service) => total + service.duration, 0);
      const endTime = new Date(params.startTime.getTime() + totalDuration * 60000);

      // Start transaction
      return await prisma.$transaction(async tx => {
        // Create the main booking
        const booking = await tx.serviceBooking.create({
          data: {
            userId: params.userId,
            providerId: params.providerId,
            startTime: params.startTime,
            endTime,
            notes: params.notes,
            isRecurring: params.isRecurring || false,
            frequency: params.frequency,
            endDate: params.endDate,
            services: {
              create: params.services.map(service => ({
                serviceId: service.serviceId,
                price: service.price,
                duration: service.duration,
              })),
            },
          },
          include: {
            services: true,
            user: true,
            provider: true,
          },
        });

        // If recurring, create future bookings
        if (params.isRecurring && params.frequency && params.endDate) {
          await this.createRecurringBookings(booking, params, tx);
        }

        // Sync with calendar
        await this.calendarService.addBooking(booking);

        // Send notifications
        await this.notificationService.sendBookingConfirmation(booking);

        return booking;
      });
    } catch (error) {
      logger.error('Error creating booking:', error);
      throw error;
    }
  }

  private async createRecurringBookings(
    originalBooking: ServiceBooking,
    params: CreateBookingParams,
    tx: PrismaClient
  ): Promise<void> {
    const recurringDates = this.calculateRecurringDates(
      params.startTime,
      params.endDate!,
      params.frequency!
    );

    // Create future bookings
    for (const date of recurringDates) {
      await tx.serviceBooking.create({
        data: {
          userId: params.userId,
          providerId: params.providerId,
          startTime: date,
          endTime: new Date(
            date.getTime() +
              params.services.reduce((total, service) => total + service.duration, 0) * 60000
          ),
          notes: params.notes,
          isRecurring: true,
          recurringId: originalBooking.id,
          frequency: params.frequency,
          endDate: params.endDate,
          services: {
            create: params.services.map(service => ({
              serviceId: service.serviceId,
              price: service.price,
              duration: service.duration,
            })),
          },
        },
      });
    }
  }

  private calculateRecurringDates(
    startDate: Date,
    endDate: Date,
    frequency: RecurringFrequency
  ): Date[] {
    const dates: Date[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));

      switch (frequency) {
        case 'DAILY':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'WEEKLY':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'BIWEEKLY':
          currentDate.setDate(currentDate.getDate() + 14);
          break;
        case 'MONTHLY':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        default:
          break;
      }
    }

    return dates;
  }

  async addToWaitlist(
    userId: string,
    serviceId: string,
    preferredTime?: Date,
    notes?: string
  ): Promise<void> {
    try {
      await prisma.waitlist.create({
        data: {
          userId,
          serviceId,
          preferredTime,
          notes,
          status: WaitlistStatus.PENDING,
        },
      });

      await this.notificationService.sendWaitlistConfirmation(userId, serviceId);
    } catch (error) {
      logger.error('Error adding to waitlist:', error);
      throw error;
    }
  }

  async processWaitlist(serviceId: string, availableSlot: Date): Promise<void> {
    try {
      const waitlistEntries = await prisma.waitlist.findMany({
        where: {
          serviceId,
          status: WaitlistStatus.PENDING,
        },
        orderBy: {
          createdAt: 'asc',
        },
        include: {
          user: true,
          service: true,
        },
      });

      for (const entry of waitlistEntries) {
        await prisma.waitlist.update({
          where: { id: entry.id },
          data: { status: WaitlistStatus.NOTIFIED },
        });

        await this.notificationService.sendWaitlistNotification(
          entry.user.id,
          entry.service.id,
          availableSlot
        );
      }
    } catch (error) {
      logger.error('Error processing waitlist:', error);
      throw error;
    }
  }

  /**
   * Get booking by ID
   */
  async getBooking(id: string): Promise<ServiceBooking | null> {
    try {
      return await prisma.serviceBooking.findUnique({
        where: { id },
        include: {
          services: true,
          user: true,
          provider: true,
        },
      });
    } catch (error) {
      logger.error('Error getting booking', error);
      throw error;
    }
  }

  /**
   * Get user's bookings
   */
  async getUserBookings(userId: string, status?: BookingStatus): Promise<ServiceBooking[]> {
    try {
      return await prisma.serviceBooking.findMany({
        where: {
          userId,
          ...(status && { status }),
        },
        include: {
          services: true,
          user: true,
        },
        orderBy: {
          startTime: 'desc',
        },
      });
    } catch (error) {
      logger.error('Error getting user bookings', error);
      throw error;
    }
  }

  /**
   * Get practitioner's bookings
   */
  async getPractitionerBookings(
    practitionerId: string,
    status?: BookingStatus
  ): Promise<ServiceBooking[]> {
    try {
      return await prisma.serviceBooking.findMany({
        where: {
          practitionerId,
          ...(status && { status }),
        },
        include: {
          services: true,
          user: true,
        },
        orderBy: {
          startTime: 'desc',
        },
      });
    } catch (error) {
      logger.error('Error getting practitioner bookings', error);
      throw error;
    }
  }

  /**
   * Optimize booking flow for mobile devices
   */
  async optimizeForMobile(bookingId: string, mobileData: MobileBookingOptimization) {
    try {
      const booking = await prisma.serviceBooking.findUnique({
        where: { id: bookingId },
        include: {
          services: true,
          user: true,
        },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Store mobile optimization data
      await prisma.bookingMobileData.create({
        data: {
          bookingId: booking.id,
          deviceType: mobileData.deviceType,
          screenSize: mobileData.screenSize,
          platform: mobileData.platform,
          optimizationVersion: '1.0',
        },
      });

      // Return mobile-optimized booking data
      return {
        ...booking,
        mobileOptimized: true,
        quickActions: this.generateQuickActions(booking),
        responsiveLayout: this.getResponsiveLayout(mobileData.screenSize),
      };
    } catch (error) {
      logger.error('Error optimizing booking for mobile', error);
      throw error;
    }
  }

  private generateQuickActions(booking: any) {
    return {
      reschedule: `/booking/${booking.id}/reschedule`,
      cancel: `/booking/${booking.id}/cancel`,
      directions: `/location/${booking.locationId}`,
      contact: `/service/${booking.serviceId}/contact`,
    };
  }

  private getResponsiveLayout(screenSize: string) {
    // Implement responsive layout logic based on screen size
    return {
      layout: screenSize.includes('small') ? 'compact' : 'full',
      elements: {
        calendar: { size: 'adaptive' },
        timeSlots: { display: 'scrollable' },
        confirmationSteps: { type: 'wizard' },
      },
    };
  }
}

export const bookingServiceInstance = new BookingService();
