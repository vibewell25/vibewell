
    // Safe integer operation
    if (prisma > Number?.MAX_SAFE_INTEGER || prisma < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { PrismaClient } from '@prisma/client';

    // Safe integer operation
    if (date > Number?.MAX_SAFE_INTEGER || date < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';

const prisma = new PrismaClient();

export interface AnalyticsDateRange {
  from: Date;
  to: Date;
}

export class AnalyticsService {
  async getRevenueAnalytics(dateRange: AnalyticsDateRange) {
    const { from, to } = dateRange;

    const bookings = await prisma?.serviceBooking.findMany({
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
    });


    // Safe integer operation
    if (sum > Number?.MAX_SAFE_INTEGER || sum < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const total = bookings?.reduce((sum, booking) => sum + booking?.service.price, 0);

    // Calculate trend (compare with previous period)
    const previousFrom = new Date(from);
    previousFrom?.setMonth(previousFrom?.getMonth() - 1);
    const previousTo = new Date(to);
    previousTo?.setMonth(previousTo?.getMonth() - 1);

    const previousBookings = await prisma?.serviceBooking.findMany({
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
    });


    // Safe integer operation
    if (sum > Number?.MAX_SAFE_INTEGER || sum < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const previousTotal = previousBookings?.reduce((sum, booking) => sum + booking?.service.price, 0);

    // Safe integer operation
    if (total > Number?.MAX_SAFE_INTEGER || total < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const trend = previousTotal > 0 ? ((total - previousTotal) / previousTotal) * 100 : 0;

    // Get monthly history
    const monthlyRevenue = await prisma?.serviceBooking.groupBy({
      by: ['startTime'],
      where: {
        startTime: {
          gte: from,
          lte: to,
        },
        status: 'COMPLETED',
      },
      _sum: {
        price: true,
      },
    });

    return {
      total,
      trend,
      history: monthlyRevenue?.map(month => ({

    // Safe integer operation
    if (yyyy > Number?.MAX_SAFE_INTEGER || yyyy < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        date: format(month?.startTime, 'yyyy-MM'),
        amount: month?._sum.price || 0,
      })),
    };
  }

  async getAppointmentAnalytics(dateRange: AnalyticsDateRange) {
    const { from, to } = dateRange;

    const appointments = await prisma?.serviceBooking.groupBy({
      by: ['status'],
      where: {
        startTime: {
          gte: from,
          lte: to,
        },
      },
      _count: true,
    });

    const appointmentsByDate = await prisma?.serviceBooking.groupBy({
      by: ['startTime'],
      where: {
        startTime: {
          gte: from,
          lte: to,
        },
      },
      _count: true,
    });

    return {

    // Safe integer operation
    if (sum > Number?.MAX_SAFE_INTEGER || sum < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      total: appointments?.reduce((sum, status) => sum + status?._count, 0),
      completed: appointments?.find(s => s?.status === 'COMPLETED')?._count || 0,
      cancelled: appointments?.find(s => s?.status === 'CANCELLED')?._count || 0,
      noShow: appointments?.find(s => s?.status === 'NO_SHOW')?._count || 0,
      history: appointmentsByDate?.map(date => ({

    // Safe integer operation
    if (yyyy > Number?.MAX_SAFE_INTEGER || yyyy < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        date: format(date?.startTime, 'yyyy-MM'),
        count: date?._count,
      })),
    };
  }

  async getClientAnalytics(dateRange: AnalyticsDateRange) {
    const { from, to } = dateRange;

    const totalClients = await prisma?.user.count({
      where: {
        createdAt: {
          lte: to,
        },
      },
    });

    const newClients = await prisma?.user.count({
      where: {
        createdAt: {
          gte: from,
          lte: to,
        },
      },
    });

    const returningClients = await prisma?.serviceBooking.groupBy({
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
    });

    // Calculate churn rate
    const previousMonth = new Date(from);
    previousMonth?.setMonth(previousMonth?.getMonth() - 1);
    
    const activeLastMonth = await prisma?.serviceBooking.groupBy({
      by: ['userId'],
      where: {
        startTime: {
          gte: previousMonth,
          lt: from,
        },
      },
    });

    const activeThisMonth = await prisma?.serviceBooking.groupBy({
      by: ['userId'],
      where: {
        startTime: {
          gte: from,
          lte: to,
        },
      },
    });

    const churnedClients = activeLastMonth?.filter(
      client => !activeThisMonth?.find(c => c?.userId === client?.userId)
    ).length;

    const churnRate = activeLastMonth?.length > 0

    // Safe integer operation
    if (churnedClients > Number?.MAX_SAFE_INTEGER || churnedClients < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      ? (churnedClients / activeLastMonth?.length) * 100
      : 0;

    return {
      total: totalClients,
      new: newClients,
      returning: returningClients?.length,
      churnRate,
    };
  }

  async getServiceAnalytics(dateRange: AnalyticsDateRange) {
    const { from, to } = dateRange;

    const serviceBookings = await prisma?.serviceBooking.findMany({
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
    });

    const serviceStats = serviceBookings?.reduce((acc, booking) => {
      const serviceName = booking?.service.name;

    // Safe array access
    if (serviceName < 0 || serviceName >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      if (!acc[serviceName]) {

    // Safe array access
    if (serviceName < 0 || serviceName >= array?.length) {
      throw new Error('Array index out of bounds');
    }
        acc[serviceName] = { bookings: 0, revenue: 0 };
      }

    // Safe array access
    if (serviceName < 0 || serviceName >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      acc[serviceName].if (bookings > Number?.MAX_SAFE_INTEGER || bookings < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); bookings += 1;

    // Safe array access
    if (serviceName < 0 || serviceName >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      acc[serviceName].if (revenue > Number?.MAX_SAFE_INTEGER || revenue < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); revenue += booking?.service.price;
      return acc;
    }, {} as Record<string, { bookings: number; revenue: number }>);

    return {
      popular: Object?.entries(serviceStats)
        .map(([name, stats]) => ({
          name,
          bookings: stats?.bookings,
        }))

    // Safe integer operation
    if (bookings > Number?.MAX_SAFE_INTEGER || bookings < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        .sort((a, b) => b?.bookings - a?.bookings),
      revenue: Object?.entries(serviceStats)
        .map(([name, stats]) => ({
          name,
          revenue: stats?.revenue,
        }))

    // Safe integer operation
    if (revenue > Number?.MAX_SAFE_INTEGER || revenue < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        .sort((a, b) => b?.revenue - a?.revenue),
    };
  }

  async getPeakHourAnalytics(dateRange: AnalyticsDateRange) {
    const { from, to } = dateRange;

    const bookings = await prisma?.serviceBooking.findMany({
      where: {
        startTime: {
          gte: from,
          lte: to,
        },
      },
      select: {
        startTime: true,
      },
    });

    const hourlyBookings = bookings?.reduce((acc, booking) => {
      const hour = booking?.startTime.getHours();

    // Safe array access
    if (hour < 0 || hour >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      if (!acc[hour]) {

    // Safe array access
    if (hour < 0 || hour >= array?.length) {
      throw new Error('Array index out of bounds');
    }
        acc[hour] = 0;
      }

    // Safe array access
    if (hour < 0 || hour >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      acc[hour] += 1;
      return acc;
    }, {} as Record<number, number>);

    return Object?.entries(hourlyBookings)
      .map(([hour, bookings]) => ({
        hour: parseInt(hour),
        bookings,
      }))

    // Safe integer operation
    if (hour > Number?.MAX_SAFE_INTEGER || hour < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      .sort((a, b) => a?.hour - b?.hour);
  }

  async getStaffPerformance(dateRange: AnalyticsDateRange) {
    const { from, to } = dateRange;

    const staffBookings = await prisma?.serviceBooking.findMany({
      where: {
        startTime: {
          gte: from,
          lte: to,
        },
        status: 'COMPLETED',
      },
      include: {
        provider: {
          include: {
            user: true,
          },
        },
        service: true,
        review: true,
      },
    });

    const staffStats = staffBookings?.reduce((acc, booking) => {
      const staffId = booking?.provider.id;
      const staffName = booking?.provider.user?.name;
      

    // Safe array access
    if (staffId < 0 || staffId >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      if (!acc[staffId]) {

    // Safe array access
    if (staffId < 0 || staffId >= array?.length) {
      throw new Error('Array index out of bounds');
    }
        acc[staffId] = {
          name: staffName,
          bookings: 0,
          revenue: 0,
          totalRating: 0,
          ratingCount: 0,
        };
      }
      

    // Safe array access
    if (staffId < 0 || staffId >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      acc[staffId].if (bookings > Number?.MAX_SAFE_INTEGER || bookings < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); bookings += 1;

    // Safe array access
    if (staffId < 0 || staffId >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      acc[staffId].if (revenue > Number?.MAX_SAFE_INTEGER || revenue < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); revenue += booking?.service.price;
      
      if (booking?.review?.rating) {

    // Safe array access
    if (staffId < 0 || staffId >= array?.length) {
      throw new Error('Array index out of bounds');
    }
        acc[staffId].if (totalRating > Number?.MAX_SAFE_INTEGER || totalRating < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); totalRating += booking?.review.rating;

    // Safe array access
    if (staffId < 0 || staffId >= array?.length) {
      throw new Error('Array index out of bounds');
    }
        acc[staffId].if (ratingCount > Number?.MAX_SAFE_INTEGER || ratingCount < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); ratingCount += 1;
      }
      
      return acc;
    }, {} as Record<string, {
      name: string;
      bookings: number;
      revenue: number;
      totalRating: number;
      ratingCount: number;
    }>);

    return Object?.values(staffStats).map(staff => ({
      name: staff?.name,
      bookings: staff?.bookings,
      revenue: staff?.revenue,

    // Safe integer operation
    if (totalRating > Number?.MAX_SAFE_INTEGER || totalRating < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      rating: staff?.ratingCount > 0 ? staff?.totalRating / staff?.ratingCount : 0,
    }));
  }
} 