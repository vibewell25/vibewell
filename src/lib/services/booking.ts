import { prisma } from '@/lib/prisma';
import type { Booking, ServiceBooking, BookingStatus } from '@prisma/client';
import { PaymentService } from './payment';

interface RescheduleOptions {
  bookingId: string;
  userId: string;
  newStartTime: Date;
  newEndTime: Date;
}

interface CancellationOptions {
  bookingId: string;
  userId: string;
  reason?: string;
}

export class BookingService {
  private readonly paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  private async validateBookingOwnership(bookingId: string, userId: string): Promise<void> {
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId,
      },
    });

    if (!booking) {
      throw new Error('Booking not found or unauthorized');
    }
  }

  private async validateBookingStatus(bookingId: string, allowedStatuses: BookingStatus[]): Promise<void> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (!allowedStatuses.includes(booking.status)) {
      throw new Error(`Booking cannot be modified in ${booking.status} status`);
    }
  }

  private async validateRescheduleTime(bookingId: string, newStartTime: Date, newEndTime: Date): Promise<void> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        business: true,
      },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check if the new time is in the future
    if (newStartTime <= new Date()) {
      throw new Error('Cannot reschedule to a past time');
    }

    // Check if the new time slot is available
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        businessId: booking.businessId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          {
            AND: [
              { startTime: { lte: newStartTime } },
              { endTime: { gt: newStartTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: newEndTime } },
              { endTime: { gte: newEndTime } },
            ],
          },
        ],
      },
    });

    if (conflictingBooking) {
      throw new Error('Time slot is not available');
    }
  }

  public async rescheduleBooking(options: RescheduleOptions): Promise<Booking> {
    // Validate ownership and authorization
    await this.validateBookingOwnership(options.bookingId, options.userId);

    // Validate current booking status
    await this.validateBookingStatus(options.bookingId, ['PENDING', 'CONFIRMED']);

    // Validate new time slot
    await this.validateRescheduleTime(options.bookingId, options.newStartTime, options.newEndTime);

    // Perform reschedule within a transaction
    return await prisma.$transaction(async (tx) => {
      // Update the booking
      const updatedBooking = await tx.booking.update({
        where: { id: options.bookingId },
        data: {
          startTime: options.newStartTime,
          endTime: options.newEndTime,
          updatedAt: new Date(),
        },
      });

      // Update related service bookings if any
      await tx.serviceBooking.updateMany({
        where: { bookingId: options.bookingId },
        data: {
          startTime: options.newStartTime,
          endTime: options.newEndTime,
          updatedAt: new Date(),
        },
      });

      return updatedBooking;
    });
  }

  public async cancelBooking(options: CancellationOptions): Promise<Booking> {
    // Validate ownership and authorization
    await this.validateBookingOwnership(options.bookingId, options.userId);

    // Validate current booking status
    await this.validateBookingStatus(options.bookingId, ['PENDING', 'CONFIRMED']);

    // Get the booking with payment information
    const booking = await prisma.booking.findUnique({
      where: { id: options.bookingId },
      include: {
        payment: true,
      },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Perform cancellation within a transaction
    return await prisma.$transaction(async (tx) => {
      // Cancel the booking
      const cancelledBooking = await tx.booking.update({
        where: { id: options.bookingId },
        data: {
          status: 'CANCELLED',
          notes: options.reason ? `Cancelled: ${options.reason}` : undefined,
          updatedAt: new Date(),
        },
      });

      // If there's a completed payment, process refund
      if (booking.payment?.status === 'COMPLETED') {
        await this.paymentService.refundPayment(booking.payment.id);
      }

      // Cancel related service bookings if any
      await tx.serviceBooking.updateMany({
        where: { bookingId: options.bookingId },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date(),
        },
      });

      return cancelledBooking;
    });
  }
} 