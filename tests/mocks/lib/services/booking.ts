/**
 * Mock Booking Service for testing
 */
export class BookingService {
  /**
   * Create a new booking
   */
  async createBooking(data: any) {
    return {
      id: 'new-booking-id',
      userId: data.userId,
      businessId: data.businessId,
      status: 'CONFIRMED',
      startTime: data.startTime,
      endTime: data.endTime,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Reschedule a booking
   */
  async rescheduleBooking({ bookingId, userId, newStartTime, newEndTime }: any) {
    // Check booking ownership
    if (bookingId === 'test-booking-id' && userId !== 'test-user-id') {
      throw new Error('Booking not found or unauthorized');
    }

    // Check if booking is in CANCELLED status (for testing purposes)
    if (bookingId === 'cancelled-booking-id') {
      throw new Error('Booking cannot be modified in CANCELLED status');
    }

    return {
      id: bookingId,
      userId: userId,
      businessId: 'test-business-id',
      status: 'CONFIRMED',
      startTime: newStartTime,
      endTime: newEndTime,
      updatedAt: new Date()
    };
  }

  /**
   * Cancel a booking
   */
  async cancelBooking({ bookingId, userId, reason }: any) {
    // Check booking ownership
    if (bookingId === 'test-booking-id' && userId !== 'test-user-id') {
      throw new Error('Booking not found or unauthorized');
    }

    return {
      id: bookingId,
      userId: userId,
      businessId: 'test-business-id',
      status: 'CANCELLED',
      cancellationReason: reason,
      updatedAt: new Date()
    };
  }

  /**
   * Get a booking by ID
   */
  async getBooking(bookingId: string) {
    if (bookingId === 'test-booking-id') {
      return {
        id: 'test-booking-id',
        userId: 'test-user-id',
        businessId: 'test-business-id',
        status: 'CONFIRMED',
        startTime: new Date('2024-03-20T10:00:00Z'),
        endTime: new Date('2024-03-20T11:00:00Z')
      };
    }
    
    return null;
  }
} 