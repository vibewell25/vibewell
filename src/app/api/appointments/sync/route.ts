import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';

interface AppointmentData {
  id?: string;
  serviceId: string;
  startTime: string;
  endTime: string;
  status?: BookingStatus;
  notes?: string;
  customerId: string;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const appointment: AppointmentData = await request.json();

    // Validate the appointment data
    if (!appointment.serviceId || !appointment.startTime || !appointment.endTime) {
      return new NextResponse('Invalid appointment data', { status: 400 });
    }

    // Get the user's business
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        practitioner: {
          include: {
            business: true
          }
        }
      }
    });

    if (!user?.practitioner?.business) {
      return new NextResponse('Business not found', { status: 404 });
    }

    // Create or update the appointment
    const updatedAppointment = await prisma.booking.upsert({
      where: {
        id: appointment.id || 'temp_' + Date.now(), // Handle new appointments
      },
      create: {
        service: { connect: { id: appointment.serviceId } },
        startTime: new Date(appointment.startTime),
        endTime: new Date(appointment.endTime),
        status: appointment.status || BookingStatus.PENDING,
        notes: appointment.notes,
        business: { connect: { id: user.practitioner.business.id } },
        practitioner: { connect: { id: user.practitioner.id } },
        user: { connect: { id: appointment.customerId } }
      },
      update: {
        startTime: new Date(appointment.startTime),
        endTime: new Date(appointment.endTime),
        status: appointment.status,
        notes: appointment.notes,
      },
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error('Error syncing appointment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 