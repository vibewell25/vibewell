import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's business ID through their practitioner profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        practitioner: {
          select: {
            id: true,
            businessId: true,
          },
        },
      },
    });

    if (!user?.practitioner?.businessId) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const businessId = user.practitioner.businessId;
    const practitionerId = user.practitioner.id;

    // Get total bookings (excluding cancelled)
    const totalBookings = await prisma.booking.count({
      where: {
        businessId,
        status: {
          not: BookingStatus.CANCELLED,
        },
      },
    });

    // Calculate total revenue from completed bookings
    const totalRevenue = await prisma.payment.aggregate({
      where: {
        businessId,
        status: 'COMPLETED',
        booking: {
          status: BookingStatus.COMPLETED,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get active customers (customers with completed bookings in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeCustomers = await prisma.booking.count({
      where: {
        businessId,
        status: BookingStatus.COMPLETED,
        startTime: {
          gte: thirtyDaysAgo,
        },
      },
      distinct: ['userId'],
    });

    // Calculate average rating from service reviews
    const reviews = await prisma.serviceReview.aggregate({
      where: {
        businessId,
      },
      _avg: {
        rating: true,
      },
    });

    return NextResponse.json({
      totalBookings,
      totalRevenue: totalRevenue._sum?.amount || 0,
      activeCustomers,
      averageRating: reviews._avg?.rating || 0,
    });
  } catch (error) {
    console.error('Error fetching business stats:', error);
    return NextResponse.json({ error: 'Failed to fetch business stats' }, { status: 500 });
  }
}
