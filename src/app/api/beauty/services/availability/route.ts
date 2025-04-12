import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Booking {
  time: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');
    const date = searchParams.get('date');

    if (!serviceId || !date) {
      return NextResponse.json(
        { error: 'Service ID and date are required' },
        { status: 400 }
      );
    }

    // Get service details
    const service = await prisma.beautyService.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Get all bookings for the service on the specified date
    const bookings = await prisma.serviceBooking.findMany({
      where: {
        serviceId,
        date: new Date(date),
        status: { not: 'CANCELLED' },
      },
      select: {
        time: true,
      },
    });

    // Generate available time slots (assuming 30-minute intervals)
    const availableSlots: string[] = [];
    const startTime = 9; // 9 AM
    const endTime = 17; // 5 PM
    const interval = 30; // 30 minutes

    for (let hour = startTime; hour < endTime; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const time = `${hour.toString().padStart(2, '0')}:${minute
          .toString()
          .padStart(2, '0')}`;
        const isBooked = bookings.some((booking: Booking) => booking.time === time);

        if (!isBooked) {
          availableSlots.push(time);
        }
      }
    }

    return NextResponse.json({
      service,
      availableSlots,
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
} 