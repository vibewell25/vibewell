import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/database/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BookingStatus, Prisma } from '@prisma/client';
import { z } from 'zod';

// Validation schema for creating a booking
const createBookingSchema = z.object({
  serviceId: z.string(),
  practitionerId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  time: z.string().regex(/^\d{2}:\d{2}$/), // HH:mm
  notes: z.string().optional(),
  duration: z.number().min(1),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters: Prisma.ServiceBookingWhereInput = {
      userId: session.user.id,
    };

    // Apply optional filters
    if (searchParams.has('status')) {
      filters.status = searchParams.get('status') as BookingStatus;
    }
    if (searchParams.has('fromDate')) {
      filters.startTime = {
        gte: new Date(searchParams.get('fromDate')!),
      };
    }
    if (searchParams.has('toDate')) {
      filters.endTime = {
        lte: new Date(searchParams.get('toDate')!),
      };
    }

    const bookings = await prisma.serviceBooking.findMany({
      where: filters,
      include: {
        service: true,
        practitioner: {
          include: {
            user: true,
          },
        },
        payment: true,
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createBookingSchema.parse(body);

    // Check if service exists and is active
    const service = await prisma.beautyService.findUnique({
      where: {
        id: validatedData.serviceId,
        isActive: true,
      },
      include: {
        business: true,
      },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found or inactive' }, { status: 404 });
    }

    // Check if practitioner exists and is associated with the service
    const practitioner = await prisma.practitioner.findFirst({
      where: {
        id: validatedData.practitionerId,
        services: {
          some: {
            id: validatedData.serviceId,
          },
        },
      },
    });

    if (!practitioner) {
      return NextResponse.json(
        { error: 'Practitioner not found or not associated with this service' },
        { status: 404 }
      );
    }

    // Parse date and time
    const bookingDateTime = new Date(`${validatedData.date}T${validatedData.time}`);
    const endDateTime = new Date(bookingDateTime.getTime() + validatedData.duration * 60000);

    // Check for scheduling conflicts
    const existingBooking = await prisma.serviceBooking.findFirst({
      where: {
        practitionerId: validatedData.practitionerId,
        status: {
          notIn: [BookingStatus.CANCELLED, BookingStatus.NO_SHOW],
        },
        OR: [
          {
            AND: [{ startTime: { lte: bookingDateTime } }, { endTime: { gt: bookingDateTime } }],
          },
          {
            AND: [{ startTime: { lt: endDateTime } }, { endTime: { gte: endDateTime } }],
          },
        ],
      },
    });

    if (existingBooking) {
      return NextResponse.json({ error: 'Time slot is not available' }, { status: 400 });
    }

    // Create the booking
    const booking = await prisma.serviceBooking.create({
      data: {
        userId: session.user.id,
        practitionerId: validatedData.practitionerId,
        businessId: service.businessId,
        serviceId: validatedData.serviceId,
        startTime: bookingDateTime,
        endTime: endDateTime,
        status: BookingStatus.PENDING,
        notes: validatedData.notes,
      },
      include: {
        service: true,
        practitioner: {
          include: {
            user: true,
          },
        },
        user: true,
      },
    });

    // Create initial payment record
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        businessId: service.businessId,
        amount: service.price,
        currency: 'USD',
        status: 'PENDING',
        paymentMethod: 'CARD',
        isDeposit: false,
        isRefundable: true,
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid booking data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, status, notes } = body;

    if (!bookingId || !status) {
      return NextResponse.json({ error: 'Booking ID and status are required' }, { status: 400 });
    }

    // Verify booking exists and belongs to user
    const existingBooking = await prisma.serviceBooking.findFirst({
      where: {
        id: bookingId,
        userId: session.user.id,
      },
    });

    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Update booking
    const booking = await prisma.serviceBooking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: status as BookingStatus,
        notes: notes || existingBooking.notes,
      },
      include: {
        service: true,
        practitioner: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

// Helper function to convert time string (HH:MM) to minutes for comparison
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}
