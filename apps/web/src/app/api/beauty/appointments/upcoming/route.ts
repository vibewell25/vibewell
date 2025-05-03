
import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

import { prisma } from '@/lib/prisma';

interface Appointment {
  id: string;
  date: Date;
  time: string;
  status: string;
  service: {
    name: string;
  };
  provider: {
    name: string;
  };
}

export async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse?.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    // Get upcoming appointments
    const appointments = await prisma?.serviceBooking.findMany({
      where: {
        userId: session?.user.id,
        date: {
          gte: now,
        },
        status: {
          not: 'cancelled',
        },
      },
      include: {
        service: {
          select: {
            name: true,
          },
        },
        provider: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
      take: 5, // Limit to 5 upcoming appointments
    });

    // Format appointments for the response
    const formattedAppointments = appointments?.map((appointment: Appointment) => ({
      id: appointment?.id,
      serviceName: appointment?.service.name,
      date: appointment?.date.toISOString(),
      time: appointment?.time,
      providerName: appointment?.provider.name,
      status: appointment?.status,
    }));

    return NextResponse?.json({
      appointments: formattedAppointments,
      count: appointments?.length,
    });
  } catch (error) {
    console?.error('Error fetching upcoming appointments:', error);
    return NextResponse?.json({ error: 'Failed to fetch upcoming appointments' }, { status: 500 });
  }
}
