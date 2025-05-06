import { describe, it, expect, beforeEach } from 'vitest';
import { vi } from 'vitest';

import { BookingService } from '@/lib/services/booking';
import { PaymentService } from '@/lib/services/payment';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    booking: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    serviceBooking: {
      updateMany: vi.fn(),
    },
    payment: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  }
}));

describe('Booking and Payment Flow Tests', () => {
  let bookingService: BookingService;
  let paymentService: PaymentService;

  const mockBooking = {
    id: 'test-booking-id',
    userId: 'test-user-id',
    businessId: 'test-business-id',
    status: 'CONFIRMED',
    startTime: new Date('2024-03-20T10:00:00Z'),
    endTime: new Date('2024-03-20T11:00:00Z'),
  };

  const mockPayment = {
    id: 'test-payment-id',
    amount: 100,
    currency: 'USD',
    status: 'COMPLETED',
    bookingId: mockBooking.id,
    businessId: mockBooking.businessId,
  };

  beforeEach(() => {
    bookingService = new BookingService();
    paymentService = new PaymentService();
    vi.clearAllMocks();
  });

  describe('Reschedule Flow', () => {
    it('should validate booking ownership before rescheduling', async () => {
      (prisma.booking.findFirst as any).mockResolvedValue(null);

      await expect(bookingService.rescheduleBooking({
        bookingId: mockBooking.id,
        userId: 'wrong-user-id',
        newStartTime: new Date('2024-03-21T10:00:00Z'),
        newEndTime: new Date('2024-03-21T11:00:00Z'),
      })).rejects.toThrow('Booking not found or unauthorized');
    });

    it('should validate booking status before rescheduling', async () => {
      (prisma.booking.findFirst as any).mockResolvedValue(mockBooking);
      (prisma.booking.findUnique as any).mockResolvedValue({
        ...mockBooking,
        status: 'CANCELLED',
      });

      await expect(bookingService.rescheduleBooking({
        bookingId: mockBooking.id,
        userId: mockBooking.userId,
        newStartTime: new Date('2024-03-21T10:00:00Z'),
        newEndTime: new Date('2024-03-21T11:00:00Z'),
      })).rejects.toThrow('Booking cannot be modified in CANCELLED status');
    });

    it('should successfully reschedule a booking', async () => {
      const newStartTime = new Date('2024-03-21T10:00:00Z');
      const newEndTime = new Date('2024-03-21T11:00:00Z');

      (prisma.booking.findFirst as any).mockResolvedValue(mockBooking);
      (prisma.booking.findUnique as any).mockResolvedValue(mockBooking);
      (prisma.booking.update as any).mockResolvedValue({
        ...mockBooking,
        startTime: newStartTime,
        endTime: newEndTime,
      });

      const result = await bookingService.rescheduleBooking({
        bookingId: mockBooking.id,
        userId: mockBooking.userId,
        newStartTime,
        newEndTime,
      });

      expect(result.startTime).toEqual(newStartTime);
      expect(result.endTime).toEqual(newEndTime);
    });
  });

  describe('Payment Flow', () => {
    it('should handle idempotent payment processing', async () => {
      const paymentOptions = {
        amount: 100,
        currency: 'USD',
        bookingId: mockBooking.id,
        businessId: mockBooking.businessId,
        idempotencyKey: 'test-key',
      };

      (prisma.payment.findFirst as any).mockResolvedValue(mockPayment);

      const result = await paymentService.processPayment(paymentOptions);

      expect(result).toEqual(mockPayment);
      expect(prisma.payment.create).not.toHaveBeenCalled();
    });

    it('should process new payment with retries', async () => {
      const paymentOptions = {
        amount: 100,
        currency: 'USD',
        bookingId: mockBooking.id,
        businessId: mockBooking.businessId,
      };

      (prisma.payment.findFirst as any).mockResolvedValue(null);
      (prisma.payment.create as any).mockResolvedValue({
        ...mockPayment,
        status: 'PENDING',
      });
      (prisma.payment.update as any).mockResolvedValue(mockPayment);

      const result = await paymentService.processPayment(paymentOptions);

      expect(result.status).toBe('COMPLETED');
      expect(prisma.payment.create).toHaveBeenCalled();
    });

    it('should handle refund for cancelled bookings', async () => {
      (prisma.payment.findUnique as any).mockResolvedValue(mockPayment);
      (prisma.payment.update as any).mockResolvedValue({
        ...mockPayment,
        status: 'REFUNDED',
      });

      const result = await paymentService.refundPayment(mockPayment.id);

      expect(result.status).toBe('REFUNDED');
    });
  });
});
