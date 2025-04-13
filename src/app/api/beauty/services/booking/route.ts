import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { serviceId, date, time, notes } = await request.json();

    // Check service availability
    const service = await prisma.beautyService.findUnique({
      where: { id: serviceId },
      include: { provider: true },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Check if the time slot is available
    const existingBooking = await prisma.serviceBooking.findFirst({
      where: {
        serviceId,
        date,
        time,
        status: { not: 'cancelled' },
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: 'This time slot is already booked' },
        { status: 400 }
      );
    }

    // Create the booking
    const booking = await prisma.serviceBooking.create({
      data: {
        userId: session.user.id,
        serviceId,
        providerId: service.providerId,
        date,
        time,
        notes,
        status: 'confirmed',
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const providerId = searchParams.get('providerId');

    const bookings = await prisma.serviceBooking.findMany({
      where: {
        OR: [
          { userId: userId || session.user.id },
          { providerId },
        ],
      },
      include: {
        service: true,
        provider: true,
        user: true,
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
} 