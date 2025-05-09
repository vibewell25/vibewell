import { PrismaClient } from '@prisma/client';
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';
import { sumInts } from '../utils/math';

const prisma = new PrismaClient();

export interface AnalyticsDateRange {
  from: Date;
  to: Date;
}

// Define interfaces for the data structures used in the service
interface BookingWithService {
  startTime: Date;
  service: {
    price: number | bigint;
    name: string;
  };
}

interface BookingWithPractitioner {
  practitioner: {
    id: string;
    name: string;
  };
  service: {
    price: number | bigint;
  };
  booking: {
    reviews: Array<{
      rating: number;
    }>;
  };
}

interface AppointmentGroup {
  status: string;
  _count: number;
}

interface AppointmentDateGroup {
  startTime: Date;
  _count: number;
}

interface UserGroup {
  userId: string;
}

export class AnalyticsService {
  async getRevenueAnalytics(dateRange: AnalyticsDateRange) {
    const { from, to } = dateRange;

    const bookings = await prisma.serviceBooking.findMany({
      where: {
        startTime: {
          gte: from,
          lte: to,
        },
        status: 'COMPLETED',
      },
      include: {
        service: true,
      },
    }) as BookingWithService[];

    const total = sumInts(...bookings.map((b: BookingWithService) => b.service.price));

    // Calculate trend (compare with previous period)
    const previousFrom = new Date(from);
    previousFrom.setMonth(previousFrom.getMonth() - 1);
    const previousTo = new Date(to);
    previousTo.setMonth(previousTo.getMonth() - 1);

    const previousBookings = await prisma.serviceBooking.findMany({
      where: {
        startTime: {
          gte: previousFrom,
          lte: previousTo,
        },
        status: 'COMPLETED',
      },
      include: {
        service: true,
      },
    }) as BookingWithService[];

    const previousTotal = sumInts(...previousBookings.map((b: BookingWithService) => b.service.price));

    const trend = previousTotal > 0n ? (Number(total - previousTotal) / Number(previousTotal)) * 100 : 0;

    // Get monthly history by aggregating service prices per month
    const historyMap: Record<string, bigint> = {};
    bookings.forEach((b: BookingWithService) => {
      const monthKey = format(b.startTime, 'yyyy-MM');
      historyMap[monthKey] = (historyMap[monthKey] ?? 0n) + BigInt(b.service.price);
    });

    const history = Object.entries(historyMap).map(([date, amount]) => ({ date, amount }));
    return { total, trend, history };
  }

  async getAppointmentAnalytics(dateRange: AnalyticsDateRange) {
    const { from, to } = dateRange;

    const appointments = await prisma.serviceBooking.groupBy({
      by: ['status'],
      where: {
        startTime: {
          gte: from,
          lte: to,
        },
      },
      _count: true,
    }) as AppointmentGroup[];

    const appointmentsByDate = await prisma.serviceBooking.groupBy({
      by: ['startTime'],
      where: {
        startTime: {
          gte: from,
          lte: to,
        },
      },
      _count: true,
    }) as AppointmentDateGroup[];

    return {
      total: appointments.reduce((sum: number, status: AppointmentGroup) => sum + status._count, 0),
      completed: appointments.find((s: AppointmentGroup) => s.status === 'COMPLETED')?._count || 0,
      cancelled: appointments.find((s: AppointmentGroup) => s.status === 'CANCELLED')?._count || 0,
      noShow: appointments.find((s: AppointmentGroup) => s.status === 'NO_SHOW')?._count || 0,
      history: appointmentsByDate.map((date: AppointmentDateGroup) => ({
        date: format(date.startTime, 'yyyy-MM'),
        count: date._count,
      })),
    };
  }

  async getClientAnalytics(dateRange: AnalyticsDateRange) {
    const { from, to } = dateRange;

    const totalClients = await prisma.user.count({
      where: {
        createdAt: {
          lte: to,
        },
      },
    });

    const newClients = await prisma.user.count({
      where: {
        createdAt: {
          gte: from,
          lte: to,
        },
      },
    });

    const returningClients = await prisma.serviceBooking.groupBy({
      by: ['userId'],
      having: {
        userId: {
          _count: {
            gt: 1,
          },
        },
      },
      where: {
        startTime: {
          gte: from,
          lte: to,
        },
      },
    }) as UserGroup[];

    // Calculate churn rate
    const previousMonth = new Date(from);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    
    const activeLastMonth = await prisma.serviceBooking.groupBy({
      by: ['userId'],
      where: {
        startTime: {
          gte: previousMonth,
          lt: from,
        },
      },
    }) as UserGroup[];

    const activeThisMonth = await prisma.serviceBooking.groupBy({
      by: ['userId'],
      where: {
        startTime: {
          gte: from,
          lte: to,
        },
      },
    }) as UserGroup[];

    const churnedClients = activeLastMonth.filter(
      (client: UserGroup) => !activeThisMonth.find((c: UserGroup) => c.userId === client.userId)
    ).length;

    const churnRate = activeLastMonth.length > 0
      ? (churnedClients / activeLastMonth.length) * 100
      : 0;

    return {
      total: totalClients,
      new: newClients,
      returning: returningClients.length,
      churnRate,
    };
  }

  async getServiceAnalytics(dateRange: AnalyticsDateRange) {
    const { from, to } = dateRange;

    const serviceBookings = await prisma.serviceBooking.findMany({
      where: {
        startTime: {
          gte: from,
          lte: to,
        },
        status: 'COMPLETED',
      },
      include: {
        service: true,
      },
    }) as BookingWithService[];

    type ServiceStats = { bookings: number; revenue: number };
    
    const serviceStats = serviceBookings.reduce((acc: Record<string, ServiceStats>, booking: BookingWithService) => {
      const serviceName = booking.service.name;

      if (!acc[serviceName]) {
        acc[serviceName] = { bookings: 0, revenue: 0 };
      }
      acc[serviceName].bookings += 1;
      acc[serviceName].revenue += Number(booking.service.price);
      return acc;
    }, {} as Record<string, ServiceStats>);

    return {
      popular: Object.entries(serviceStats)
        .map(([name, stats]: [string, ServiceStats]) => ({
          name,
          bookings: stats.bookings,
        }))
        .sort((a, b) => b.bookings - a.bookings),
      revenue: Object.entries(serviceStats)
        .map(([name, stats]: [string, ServiceStats]) => ({
          name,
          revenue: stats.revenue,
        }))
        .sort((a, b) => b.revenue - a.revenue),
    };
  }

  async getPeakHourAnalytics(dateRange: AnalyticsDateRange) {
    const { from, to } = dateRange;

    const bookings = await prisma.serviceBooking.findMany({
      where: {
        startTime: {
          gte: from,
          lte: to,
        },
      },
      select: {
        startTime: true,
      },
    }) as { startTime: Date }[];

    const hourlyBookings = bookings.reduce((acc: Record<number, number>, booking: { startTime: Date }) => {
      const hour = booking.startTime.getHours();

      if (!acc[hour]) {
        acc[hour] = 0;
      }
      acc[hour] += 1;
      return acc;
    }, {} as Record<number, number>);

    return Object.entries(hourlyBookings)
      .map(([hour, bookings]: [string, number]) => ({
        hour: parseInt(hour),
        bookings,
      }))
      .sort((a, b) => a.hour - b.hour);
  }

  async getStaffPerformance(dateRange: AnalyticsDateRange) {
    const { from, to } = dateRange;

    // Fetch service bookings including practitioners, services, and reviews
    const staffBookings = await prisma.serviceBooking.findMany({
      where: {
        startTime: { gte: from, lte: to },
        status: 'COMPLETED',
      },
      include: {
        practitioner: true,
        service: true,
        booking: { include: { reviews: true } },
      },
    }) as BookingWithPractitioner[];

    // Define type for staff statistics
    type StaffStats = { 
      name: string; 
      bookings: number; 
      revenue: bigint; 
      ratingSum: number; 
      ratingCount: number 
    };

    // Aggregate bookings, revenue, and ratings per staff
    const stats = staffBookings.reduce((acc: Record<string, StaffStats>, b: BookingWithPractitioner) => {
      const { practitioner: pr, service, booking } = b;
      const staffId = pr.id;
      const staffName = pr.name;
      
      if (!acc[staffId]) {
        acc[staffId] = { name: staffName, bookings: 0, revenue: 0n, ratingSum: 0, ratingCount: 0 };
      }
      
      const rec = acc[staffId];
      rec.bookings += 1;
      rec.revenue += BigInt(service.price);
      
      booking.reviews.forEach((r: { rating: number }) => {
        rec.ratingSum += r.rating;
        rec.ratingCount += 1;
      });
      
      return acc;
    }, {} as Record<string, StaffStats>);

    // Prepare result with average rating
    return Object.values(stats).map((s: StaffStats) => ({
      name: s.name,
      bookings: s.bookings,
      revenue: s.revenue,
      rating: s.ratingCount > 0 ? s.ratingSum / s.ratingCount : 0,
    }));
  }
}
