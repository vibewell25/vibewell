import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from '@/lib/logger';
import { NotificationService } from './notification-service';

const prisma = new PrismaClient();

interface RecurringBookingOptions {
  frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  endDate: Date;
  skipDates?: Date[];
}

interface PackageBookingOptions {
  packageId: string;
  preferredDates: Date[];
  notes?: string;
}

interface WaitlistEntry {
  userId: string;
  serviceId: string;
  preferredDates: Date[];
  priority: number;
  notes?: string;
}

export class AdvancedBookingService {
  private notificationService: NotificationService;

  constructor(notificationService: NotificationService) {
    this.notificationService = notificationService;
  }

  // Recurring Booking Management
  async createRecurringBooking(
    userId: string,
    serviceId: string,
    startDate: Date,
    options: RecurringBookingOptions
  ) {
    try {
      const service = await prisma.beautyService.findUnique({
        where: { id: serviceId },
        include: { business: true },
      });

      if (!service) {
        throw new Error('Service not found');
      }

      const bookingDates = this.generateRecurringDates(startDate, options);
      const bookings = [];

      // Create bookings in a transaction
      await prisma.$transaction(async tx => {
        // Create recurring booking group
        const recurringGroup = await tx.recurringBookingGroup.create({
          data: {
            userId,
            serviceId,
            frequency: options.frequency,
            startDate,
            endDate: options.endDate,
            skipDates: options.skipDates || [],
          },
        });

        // Create individual bookings
        for (const date of bookingDates) {
          const booking = await tx.serviceBooking.create({
            data: {
              userId,
              serviceId,
              startTime: date,
              endTime: new Date(date.getTime() + service.duration * 60000),
              status: 'CONFIRMED',
              recurringGroupId: recurringGroup.id,
            },
          });
          bookings.push(booking);
        }
      });

      logger.info('Created recurring booking', {
        userId,
        serviceId,
        frequency: options.frequency,
      });

      return bookings;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error creating recurring booking: ${errorMessage}`);
      throw error;
    }
  }

  // Waitlist Management with Priority System
  async addToWaitlist(entry: WaitlistEntry) {
    try {
      const waitlistEntry = await prisma.waitlist.create({
        data: {
          userId: entry.userId,
          serviceId: entry.serviceId,
          preferredDates: entry.preferredDates,
          priority: this.calculatePriority(entry),
          notes: entry.notes,
          status: 'PENDING',
        },
      });

      // Check for cancellations or new slots
      await this.checkWaitlistAvailability(entry.serviceId, entry.preferredDates);

      logger.info('Added to waitlist', {
        userId: entry.userId,
        serviceId: entry.serviceId,
        priority: waitlistEntry.priority,
      });

      return waitlistEntry;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error adding to waitlist: ${errorMessage}`);
      throw error;
    }
  }

  // Package/Bundle Booking
  async createPackageBooking(userId: string, options: PackageBookingOptions) {
    try {
      const package = await prisma.servicePackage.findUnique({
        where: { id: options.packageId },
        include: { services: true },
      });

      if (!package) {
        throw new Error('Package not found');
      }

      // Create package booking in a transaction
      const bookings = await prisma.$transaction(async tx => {
        const packageBooking = await tx.packageBooking.create({
          data: {
            userId,
            packageId: options.packageId,
            status: 'CONFIRMED',
            notes: options.notes,
          },
        });

        // Create individual service bookings
        return Promise.all(
          package.services.map((service, index) =>
            tx.serviceBooking.create({
              data: {
                userId,
                serviceId: service.id,
                startTime: options.preferredDates[index] || options.preferredDates[0],
                endTime: new Date(
                  (options.preferredDates[index] || options.preferredDates[0]).getTime() +
                    service.duration * 60000
                ),
                status: 'CONFIRMED',
                packageBookingId: packageBooking.id,
              },
            })
          )
        );
      });

      logger.info('Created package booking', {
        userId,
        packageId: options.packageId,
      });

      return bookings;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error creating package booking: ${errorMessage}`);
      throw error;
    }
  }

  // Dynamic Pricing
  async calculateDynamicPrice(
    serviceId: string,
    date: Date
  ): Promise<{ price: number; discounts: Array<{ type: string; amount: number }> }> {
    try {
      const service = await prisma.beautyService.findUnique({
        where: { id: serviceId },
        include: { business: true },
      });

      if (!service) {
        throw new Error('Service not found');
      }

      let finalPrice = service.price;
      const discounts = [];

      // Peak hour pricing (20% increase during peak hours)
      const hour = date.getHours();
      if (hour >= 9 && hour <= 17) {
        finalPrice *= 1.2;
        discounts.push({ type: 'PEAK_HOUR', amount: service.price * 0.2 });
      }

      // Last-minute discount (30% off if booking is within 24 hours)
      const isLastMinute = date.getTime() - new Date().getTime() <= 24 * 60 * 60 * 1000;
      if (isLastMinute) {
        const discount = finalPrice * 0.3;
        finalPrice -= discount;
        discounts.push({ type: 'LAST_MINUTE', amount: discount });
      }

      // Demand-based pricing
      const demandMultiplier = await this.calculateDemandMultiplier(serviceId, date);
      if (demandMultiplier > 1) {
        const increase = finalPrice * (demandMultiplier - 1);
        finalPrice *= demandMultiplier;
        discounts.push({ type: 'HIGH_DEMAND', amount: increase });
      }

      return { price: finalPrice, discounts };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error calculating dynamic price: ${errorMessage}`);
      throw error;
    }
  }

  // Private helper methods
  private generateRecurringDates(startDate: Date, options: RecurringBookingOptions): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= options.endDate) {
      if (
        !options.skipDates?.some(skipDate => skipDate.toDateString() === currentDate.toDateString())
      ) {
        dates.push(new Date(currentDate));
      }

      // Calculate next date based on frequency
      switch (options.frequency) {
        case 'WEEKLY':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'BIWEEKLY':
          currentDate.setDate(currentDate.getDate() + 14);
          break;
        case 'MONTHLY':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
      }
    }

    return dates;
  }

  private async calculateDemandMultiplier(serviceId: string, date: Date): Promise<number> {
    // Count bookings for the same service on the same day
    const bookingCount = await prisma.serviceBooking.count({
      where: {
        serviceId,
        startTime: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
      },
    });

    // Calculate multiplier based on booking count
    // 1.0 = normal price, 1.5 = 50% increase
    if (bookingCount >= 10) return 1.5;
    if (bookingCount >= 5) return 1.25;
    return 1.0;
  }

  private calculatePriority(entry: WaitlistEntry): number {
    let priority = entry.priority || 1;

    // Increase priority for loyal customers
    const loyaltyMultiplier = this.calculateLoyaltyMultiplier(entry.userId);
    priority *= loyaltyMultiplier;

    // Increase priority for each day on waitlist
    const daysOnWaitlist = await this.getDaysOnWaitlist(entry.userId, entry.serviceId);
    priority += daysOnWaitlist * 0.1;

    return priority;
  }

  private async calculateLoyaltyMultiplier(userId: string): Promise<number> {
    const bookingCount = await prisma.serviceBooking.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Last year
        },
      },
    });

    if (bookingCount >= 20) return 2.0;
    if (bookingCount >= 10) return 1.5;
    if (bookingCount >= 5) return 1.25;
    return 1.0;
  }

  private async getDaysOnWaitlist(userId: string, serviceId: string): Promise<number> {
    const waitlistEntry = await prisma.waitlist.findFirst({
      where: {
        userId,
        serviceId,
        status: 'PENDING',
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (!waitlistEntry) return 0;

    const daysOnWaitlist = Math.floor(
      (Date.now() - waitlistEntry.createdAt.getTime()) / (24 * 60 * 60 * 1000)
    );

    return daysOnWaitlist;
  }

  private async checkWaitlistAvailability(serviceId: string, dates: Date[]) {
    // Check each preferred date for availability
    for (const date of dates) {
      const availability = await this.checkSlotAvailability(serviceId, date);
      if (availability.available) {
        // Get highest priority waitlist entry for this service
        const waitlistEntry = await prisma.waitlist.findFirst({
          where: {
            serviceId,
            status: 'PENDING',
          },
          orderBy: {
            priority: 'desc',
          },
          include: {
            user: true,
          },
        });

        if (waitlistEntry) {
          // Notify user of availability
          await this.notificationService.sendNotification(waitlistEntry.userId, {
            type: 'WAITLIST_SLOT_AVAILABLE',
            title: 'Slot Available!',
            message: `A slot is now available for your waitlisted service on ${date.toLocaleDateString()}`,
            data: {
              serviceId,
              date: date.toISOString(),
            },
          });
        }
      }
    }
  }

  private async checkSlotAvailability(
    serviceId: string,
    date: Date
  ): Promise<{ available: boolean; slots: Date[] }> {
    const service = await prisma.beautyService.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new Error('Service not found');
    }

    // Get all bookings for this service on the given date
    const bookings = await prisma.serviceBooking.findMany({
      where: {
        serviceId,
        startTime: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
      },
    });

    // Calculate available slots
    const availableSlots = this.findAvailableSlots(date, service.duration, bookings);

    return {
      available: availableSlots.length > 0,
      slots: availableSlots,
    };
  }

  private findAvailableSlots(date: Date, duration: number, existingBookings: any[]): Date[] {
    const slots: Date[] = [];
    const startHour = 9; // Business hours start
    const endHour = 17; // Business hours end

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotStart = new Date(date.setHours(hour, minute, 0, 0));
        const slotEnd = new Date(slotStart.getTime() + duration * 60000);

        // Check if slot conflicts with existing bookings
        const hasConflict = existingBookings.some(booking =>
          this.hasTimeConflict(slotStart, slotEnd, booking.startTime, booking.endTime)
        );

        if (!hasConflict) {
          slots.push(slotStart);
        }
      }
    }

    return slots;
  }

  private hasTimeConflict(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
    return start1 < end2 && start2 < end1;
  }
}

export const advancedBookingService = new AdvancedBookingService(new NotificationService());
