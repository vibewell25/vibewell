import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BookingStatus, BeautyService, Prisma } from '@prisma/client';

type BreakTime = {
  startTime: string;
  endTime: string;
};

type PractitionerWithSchedule = {
  id: string;
  schedule: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const practitionerId = searchParams.get('practitionerId');
    const serviceId = searchParams.get('serviceId');
    const date = searchParams.get('date');
    const timezone = searchParams.get('timezone') || 'UTC';

    if (!practitionerId || !serviceId || !date) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get service details with business hours
    const service = await prisma.beautyService.findUnique({
      where: { id: serviceId },
      include: {
        businessHours: true
      }
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Get business hours for the day
    const dayOfWeek = new Date(date).getDay();
    const businessHours = service.businessHours?.find(
      (hours: { dayOfWeek: number }) => hours.dayOfWeek === dayOfWeek
    );

    if (!businessHours || businessHours.isClosed) {
      return NextResponse.json({ 
        availableSlots: [],
        message: 'Business is closed on this day' 
      });
    }

    // Get practitioner's schedule for the day
    const practitionerData = await prisma.user.findFirst({
      where: { 
        id: practitionerId,
        role: 'PRACTITIONER'
      },
      include: {
        schedule: {
          where: { dayOfWeek }
        }
      }
    });

    if (!practitionerData || practitionerData.schedule.length === 0) {
      return NextResponse.json({ 
        availableSlots: [],
        message: 'No schedule found for this day' 
      });
    }

    const schedule = practitionerData.schedule[0];
    const practitionerSchedule = {
      ...schedule,
      practitionerId,
      breaks: [] // You'll need to implement break time handling based on your requirements
    };

    // Get all bookings for the practitioner on the specified date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await prisma.serviceBooking.findMany({
      where: {
        providerId: practitionerId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.COMPLETED]
        },
      },
      select: {
        date: true,
        service: {
          select: {
            duration: true
          }
        }
      }
    });

    // Generate all possible time slots
    const [startHour, startMinute] = practitionerSchedule.startTime.split(':').map(Number);
    const [endHour, endMinute] = practitionerSchedule.endTime.split(':').map(Number);
    const serviceDuration = service.duration;
    const bufferTime = 15; // 15 minutes buffer between appointments
    const slots: string[] = [];

    let currentTime = new Date(date);
    currentTime.setHours(startHour, startMinute, 0, 0);
    const endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0, 0);

    // Helper function to check if a time slot overlaps with breaks
    const overlapsWithBreak = (slotStart: Date, slotEnd: Date) => {
      return practitionerSchedule.breaks.some((breakTime: BreakTime) => {
        const [breakStartHour, breakStartMinute] = breakTime.startTime.split(':').map(Number);
        const [breakEndHour, breakEndMinute] = breakTime.endTime.split(':').map(Number);
        
        const breakStart = new Date(date);
        breakStart.setHours(breakStartHour, breakStartMinute, 0, 0);
        const breakEnd = new Date(date);
        breakEnd.setHours(breakEndHour, breakEndMinute, 0, 0);

        return (
          (slotStart >= breakStart && slotStart < breakEnd) ||
          (slotEnd > breakStart && slotEnd <= breakEnd) ||
          (slotStart <= breakStart && slotEnd >= breakEnd)
        );
      });
    };

    // Helper function to check if a time slot overlaps with existing bookings
    const overlapsWithBooking = (slotStart: Date, slotEnd: Date) => {
      return existingBookings.some(booking => {
        const bookingStart = new Date(booking.date);
        const bookingEnd = new Date(bookingStart.getTime() + (booking.service?.duration || 0) * 60000);
        
        return (
          (slotStart >= bookingStart && slotStart < bookingEnd) ||
          (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
          (slotStart <= bookingStart && slotEnd >= bookingEnd)
        );
      });
    };

    // Generate slots considering service duration and buffer time
    while (currentTime <= endTime) {
      const slotEnd = new Date(currentTime.getTime() + serviceDuration * 60000);
      const slotWithBuffer = new Date(slotEnd.getTime() + bufferTime * 60000);

      if (slotWithBuffer <= endTime &&
          !overlapsWithBreak(currentTime, slotWithBuffer) &&
          !overlapsWithBooking(currentTime, slotWithBuffer)) {
        
        const timeString = currentTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: timezone
        });

        slots.push(timeString);
      }

      // Move to next slot (15-minute intervals)
      currentTime = new Date(currentTime.getTime() + 15 * 60000);
    }

    return NextResponse.json({
      service,
      availableSlots: slots,
      schedule: {
        startTime: practitionerSchedule.startTime,
        endTime: practitionerSchedule.endTime,
        breaks: practitionerSchedule.breaks,
      },
      businessHours: {
        startTime: businessHours.openTime,
        endTime: businessHours.closeTime
      }
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
} 