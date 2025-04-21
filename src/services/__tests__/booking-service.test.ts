import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BookingService } from '../booking-service';
import { NotificationService } from '../notification-service';
import { PrismaClient } from '@prisma/client';

// Mock dependencies
vi.mock('@prisma/client', () => {
  const mockPrisma = {
    serviceBooking: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(callback => callback(mockPrisma)),
  };
  return {
    PrismaClient: vi.fn(() => mockPrisma),
  };
});

vi.mock('../notification-service', () => ({
  NotificationService: vi.fn().mockImplementation(() => ({
    sendBookingConfirmation: vi.fn(),
    sendBookingCancellation: vi.fn(),
    sendBookingUpdate: vi.fn(),
  })),
}));

// Mock functions for BookingService
const mockCreateBooking = vi.fn();
const mockGetBooking = vi.fn();
const mockUpdateBooking = vi.fn();
const mockGetUserBookings = vi.fn();
const mockGetPractitionerBookings = vi.fn();
const mockOptimizeForMobile = vi.fn();
const mockCompleteBooking = vi.fn();
const mockDeleteBooking = vi.fn();

vi.mock('../booking-service', () => ({
  BookingService: vi.fn().mockImplementation(() => ({
    createBooking: mockCreateBooking,
    getBooking: mockGetBooking,
    updateBooking: mockUpdateBooking,
    getUserBookings: mockGetUserBookings,
    getPractitionerBookings: mockGetPractitionerBookings,
    addToWaitlist: vi.fn(),
    processWaitlist: vi.fn(),
    optimizeForMobile: mockOptimizeForMobile,
    completeBooking: mockCompleteBooking,
    deleteBooking: mockDeleteBooking
  })),
  bookingServiceInstance: {
    createBooking: mockCreateBooking,
    getBooking: mockGetBooking,
    updateBooking: mockUpdateBooking,
    getUserBookings: mockGetUserBookings,
    getPractitionerBookings: mockGetPractitionerBookings,
    addToWaitlist: vi.fn(),
    processWaitlist: vi.fn(),
    optimizeForMobile: mockOptimizeForMobile,
    completeBooking: mockCompleteBooking,
    deleteBooking: mockDeleteBooking
  }
}));

describe('BookingService', () => {
  let bookingService: BookingService;
  let notificationService: NotificationService;
  let prisma: PrismaClient;

  beforeEach(() => {
    bookingService = new BookingService();
    notificationService = new NotificationService();
    prisma = new PrismaClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createBooking', () => {
    it('should create a new booking successfully', async () => {
      // Arrange
      const mockBookingData = {
        userId: 'user-123',
        providerId: 'provider-456',
        services: [
          { serviceId: 'service-789', price: 100, duration: 60 }
        ],
        startTime: new Date('2023-01-01T10:00:00Z'),
        notes: 'Test booking',
      };

      const mockCreatedBooking = {
        id: 'booking-123',
        userId: 'user-123',
        providerId: 'provider-456',
        startTime: new Date('2023-01-01T10:00:00Z'),
        endTime: new Date('2023-01-01T11:00:00Z'),
        status: 'confirmed',
        notes: 'Test booking',
        services: [
          { serviceId: 'service-789', price: 100, duration: 60 }
        ],
        user: { id: 'user-123', name: 'Test User' },
        provider: { id: 'provider-456', name: 'Test Provider' },
      };

      mockCreateBooking.mockResolvedValue(mockCreatedBooking);

      // Act
      const result = await bookingService.createBooking(mockBookingData);

      // Assert
      expect(result).toEqual(mockCreatedBooking);
      expect(mockCreateBooking).toHaveBeenCalledWith(mockBookingData);
    });

    it('should handle unavailable time slots', async () => {
      // Arrange
      const mockBookingData = {
        userId: 'user-123',
        providerId: 'provider-456',
        services: [
          { serviceId: 'service-789', price: 100, duration: 60 }
        ],
        startTime: new Date('2023-01-01T10:00:00Z'),
        notes: 'Test booking',
      };

      const errorMessage = 'This time slot is not available';
      mockCreateBooking.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(bookingService.createBooking(mockBookingData))
        .rejects.toThrow(errorMessage);
      expect(mockCreateBooking).toHaveBeenCalledWith(mockBookingData);
    });

    it('should handle non-existent user', async () => {
      // Arrange
      const mockBookingData = {
        userId: 'non-existent-user',
        providerId: 'provider-456',
        services: [
          { serviceId: 'service-789', price: 100, duration: 60 }
        ],
        startTime: new Date('2023-01-01T10:00:00Z'),
        notes: 'Test booking',
      };

      const errorMessage = 'User not found';
      mockCreateBooking.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(bookingService.createBooking(mockBookingData))
        .rejects.toThrow(errorMessage);
      expect(mockCreateBooking).toHaveBeenCalledWith(mockBookingData);
    });

    it('should handle non-existent provider', async () => {
      // Arrange
      const mockBookingData = {
        userId: 'user-123',
        providerId: 'non-existent-provider',
        services: [
          { serviceId: 'service-789', price: 100, duration: 60 }
        ],
        startTime: new Date('2023-01-01T10:00:00Z'),
        notes: 'Test booking',
      };

      const errorMessage = 'Provider not found';
      mockCreateBooking.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(bookingService.createBooking(mockBookingData))
        .rejects.toThrow(errorMessage);
      expect(mockCreateBooking).toHaveBeenCalledWith(mockBookingData);
    });

    it('should handle non-existent service', async () => {
      // Arrange
      const mockBookingData = {
        userId: 'user-123',
        providerId: 'provider-456',
        services: [
          { serviceId: 'non-existent-service', price: 100, duration: 60 }
        ],
        startTime: new Date('2023-01-01T10:00:00Z'),
        notes: 'Test booking',
      };

      const errorMessage = 'Service not found';
      mockCreateBooking.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(bookingService.createBooking(mockBookingData))
        .rejects.toThrow(errorMessage);
      expect(mockCreateBooking).toHaveBeenCalledWith(mockBookingData);
    });
  });

  describe('updateBooking', () => {
    it('should update a booking successfully', async () => {
      // Arrange
      const bookingId = 'booking-123';
      const updateData = {
        id: bookingId,
        status: 'cancelled',
        notes: 'Cancelled by user'
      };

      const mockUpdatedBooking = {
        id: bookingId,
        userId: 'user-123',
        providerId: 'provider-456',
        startTime: new Date('2023-01-01T10:00:00Z'),
        endTime: new Date('2023-01-01T11:00:00Z'),
        status: 'cancelled',
        notes: 'Cancelled by user',
        services: [
          { serviceId: 'service-789', price: 100, duration: 60 }
        ],
        user: { id: 'user-123', name: 'Test User' },
        provider: { id: 'provider-456', name: 'Test Provider' },
      };

      mockUpdateBooking.mockResolvedValue(mockUpdatedBooking);

      // Act
      const result = await bookingService.updateBooking(updateData);

      // Assert
      expect(result).toEqual(mockUpdatedBooking);
      expect(mockUpdateBooking).toHaveBeenCalledWith(updateData);
    });

    it('should handle non-existent booking', async () => {
      // Arrange
      const bookingId = 'non-existent-booking';
      const updateData = {
        id: bookingId,
        status: 'cancelled',
        notes: 'Cancelled by user'
      };

      const errorMessage = 'Booking not found';
      mockUpdateBooking.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(bookingService.updateBooking(updateData))
        .rejects.toThrow(errorMessage);
      expect(mockUpdateBooking).toHaveBeenCalledWith(updateData);
    });

    it('should handle updating a booking that is already cancelled', async () => {
      // Arrange
      const bookingId = 'booking-123';
      const updateData = {
        id: bookingId,
        status: 'confirmed',
        notes: 'Trying to reactivate'
      };

      const errorMessage = 'Cannot update a cancelled booking';
      mockUpdateBooking.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(bookingService.updateBooking(updateData))
        .rejects.toThrow(errorMessage);
      expect(mockUpdateBooking).toHaveBeenCalledWith(updateData);
    });
  });

  describe('getUserBookings', () => {
    it('should retrieve all bookings for a user', async () => {
      // Arrange
      const userId = 'user-123';
      const mockBookings = [
        {
          id: 'booking-123',
          userId,
          providerId: 'provider-456',
          startTime: new Date('2023-01-01T10:00:00Z'),
          endTime: new Date('2023-01-01T11:00:00Z'),
          status: 'confirmed',
          notes: 'Test booking 1',
        },
        {
          id: 'booking-456',
          userId,
          providerId: 'provider-789',
          startTime: new Date('2023-01-02T14:00:00Z'),
          endTime: new Date('2023-01-02T15:00:00Z'),
          status: 'confirmed',
          notes: 'Test booking 2',
        },
      ];

      mockGetUserBookings.mockResolvedValue(mockBookings);

      // Act
      const result = await bookingService.getUserBookings(userId);

      // Assert
      expect(result).toEqual(mockBookings);
      expect(mockGetUserBookings).toHaveBeenCalledWith(userId);
    });

    it('should return empty array when user has no bookings', async () => {
      // Arrange
      const userId = 'user-with-no-bookings';
      mockGetUserBookings.mockResolvedValue([]);

      // Act
      const result = await bookingService.getUserBookings(userId);

      // Assert
      expect(result).toEqual([]);
      expect(mockGetUserBookings).toHaveBeenCalledWith(userId);
    });
  });

  describe('getPractitionerBookings', () => {
    it('should retrieve all bookings for a practitioner', async () => {
      // Arrange
      const practitionerId = 'provider-456';
      const mockBookings = [
        {
          id: 'booking-123',
          userId: 'user-123',
          providerId: practitionerId,
          startTime: new Date('2023-01-01T10:00:00Z'),
          endTime: new Date('2023-01-01T11:00:00Z'),
          status: 'confirmed',
          notes: 'Test booking 1',
        },
        {
          id: 'booking-456',
          userId: 'user-456',
          providerId: practitionerId,
          startTime: new Date('2023-01-02T14:00:00Z'),
          endTime: new Date('2023-01-02T15:00:00Z'),
          status: 'confirmed',
          notes: 'Test booking 2',
        },
      ];

      mockGetPractitionerBookings.mockResolvedValue(mockBookings);

      // Act
      const result = await bookingService.getPractitionerBookings(practitionerId);

      // Assert
      expect(result).toEqual(mockBookings);
      expect(mockGetPractitionerBookings).toHaveBeenCalledWith(practitionerId);
    });

    it('should return empty array when practitioner has no bookings', async () => {
      // Arrange
      const practitionerId = 'provider-with-no-bookings';
      mockGetPractitionerBookings.mockResolvedValue([]);

      // Act
      const result = await bookingService.getPractitionerBookings(practitionerId);

      // Assert
      expect(result).toEqual([]);
      expect(mockGetPractitionerBookings).toHaveBeenCalledWith(practitionerId);
    });
  });

  describe('getBookingDetails', () => {
    it('should retrieve details for a specific booking', async () => {
      // Arrange
      const bookingId = 'booking-123';
      const mockBooking = {
        id: bookingId,
        userId: 'user-123',
        providerId: 'provider-456',
        startTime: new Date('2023-01-01T10:00:00Z'),
        endTime: new Date('2023-01-01T11:00:00Z'),
        status: 'confirmed',
        notes: 'Test booking',
        services: [
          { serviceId: 'service-789', price: 100, duration: 60 }
        ],
        user: { id: 'user-123', name: 'Test User' },
        provider: { id: 'provider-456', name: 'Test Provider' },
      };

      mockGetBooking.mockResolvedValue(mockBooking);

      // Act
      const result = await bookingService.getBooking(bookingId);

      // Assert
      expect(result).toEqual(mockBooking);
      expect(mockGetBooking).toHaveBeenCalledWith(bookingId);
    });

    it('should handle non-existent booking', async () => {
      // Arrange
      const bookingId = 'non-existent-booking';
      mockGetBooking.mockResolvedValue(null);

      // Act
      const result = await bookingService.getBooking(bookingId);

      // Assert
      expect(result).toBeNull();
      expect(mockGetBooking).toHaveBeenCalledWith(bookingId);
    });
  });

  describe('updateBooking', () => {
    it('should update booking details', async () => {
      // Arrange
      const bookingId = 'booking-123';
      const updateData = {
        id: bookingId,
        notes: 'Updated notes',
        status: 'confirmed'
      };

      const mockUpdatedBooking = {
        id: bookingId,
        userId: 'user-123',
        providerId: 'provider-456',
        startTime: new Date('2023-01-01T10:00:00Z'),
        endTime: new Date('2023-01-01T11:00:00Z'),
        status: 'confirmed',
        notes: 'Updated notes',
      };

      mockUpdateBooking.mockResolvedValue(mockUpdatedBooking);

      // Act
      const result = await bookingService.updateBooking(updateData);

      // Assert
      expect(result).toEqual(mockUpdatedBooking);
      expect(mockUpdateBooking).toHaveBeenCalledWith(updateData);
    });
  });
});
