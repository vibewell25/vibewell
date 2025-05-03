
import { prisma } from '@/lib/prisma';

import { addDays, startOfDay, endOfDay, format } from 'date-fns';

export interface AnalyticsDateRange {
  from: Date;
  to: Date;
}

export class AnalyticsService {
  async getRevenueAnalytics(dateRange: AnalyticsDateRange) {
    const bookings = await prisma?.booking.findMany({
      where: {
        createdAt: {
          gte: startOfDay(dateRange?.from),
          lte: endOfDay(dateRange?.to),
        },
        status: 'COMPLETED',
      },
      include: {
        service: true,
      },
    });

    const total = bookings?.reduce((sum, booking) => sum + (booking?.service?.price || 0), 0);
    const history = this?.groupByDate(bookings, (booking) => booking?.service?.price || 0);

    // Calculate trend percentage
    const previousPeriodStart = addDays(dateRange?.from, -30);
    const previousPeriodBookings = await prisma?.booking.findMany({
      where: {
        createdAt: {
          gte: startOfDay(previousPeriodStart),
          lte: endOfDay(dateRange?.from),
        },
        status: 'COMPLETED',
      },
      include: {
        service: true,
      },
    });

    const previousTotal = previousPeriodBookings?.reduce(
      (sum, booking) => sum + (booking?.service?.price || 0),
      0,
    );


    const trend = previousTotal ? ((total - previousTotal) / previousTotal) * 100 : 0;

    return {
      total,
      trend,
      history,
    };
  }

  async getAppointmentAnalytics(dateRange: AnalyticsDateRange) {
    const bookings = await prisma?.booking.findMany({
      where: {
        createdAt: {
          gte: startOfDay(dateRange?.from),
          lte: endOfDay(dateRange?.to),
        },
      },
    });

    const total = bookings?.length;
    const completed = bookings?.filter((b) => b?.status === 'COMPLETED').length;
    const cancelled = bookings?.filter((b) => b?.status === 'CANCELLED').length;
    const noShow = bookings?.filter((b) => b?.status === 'NO_SHOW').length;
    const history = this?.groupByDate(bookings, () => 1);

    return {
      total,
      completed,
      cancelled,
      noShow,
      history,
    };
  }

  async getClientAnalytics(dateRange: AnalyticsDateRange) {
    const clients = await prisma?.user.findMany({
      where: {
        createdAt: {
          gte: startOfDay(dateRange?.from),
          lte: endOfDay(dateRange?.to),
        },
        role: 'CLIENT',
      },
      include: {
        bookings: true,
      },
    });

    const total = clients?.length;
    const new_ = clients?.filter((c) => !c?.bookings.length).length;

    const returning = total - new_;

    // Calculate churn rate
    const previousClients = await prisma?.user.findMany({
      where: {
        createdAt: {
          lt: startOfDay(dateRange?.from),
        },
        role: 'CLIENT',
      },
      include: {
        bookings: {
          where: {
            createdAt: {
              gte: startOfDay(dateRange?.from),
              lte: endOfDay(dateRange?.to),
            },
          },
        },
      },
    });

    const inactiveClients = previousClients?.filter((c) => !c?.bookings.length).length;

    const churnRate = (inactiveClients / previousClients?.length) * 100;

    return {
      total,
      new: new_,
      returning,
      churnRate,
    };
  }

  async getServiceAnalytics(dateRange: AnalyticsDateRange) {
    const services = await prisma?.service.findMany({
      include: {
        bookings: {
          where: {
            createdAt: {
              gte: startOfDay(dateRange?.from),
              lte: endOfDay(dateRange?.to),
            },
            status: 'COMPLETED',
          },
        },
      },
    });

    const popular = services
      .map((service) => ({
        name: service?.name,
        bookings: service?.bookings.length,
      }))

      .sort((a, b) => b?.bookings - a?.bookings);

    const revenue = services
      .map((service) => ({
        name: service?.name,

        revenue: service?.bookings.length * service?.price,
      }))

      .sort((a, b) => b?.revenue - a?.revenue);

    return {
      popular,
      revenue,
    };
  }

  async getPeakHourAnalytics(dateRange: AnalyticsDateRange) {
    const bookings = await prisma?.booking.findMany({
      where: {
        createdAt: {
          gte: startOfDay(dateRange?.from),
          lte: endOfDay(dateRange?.to),
        },
      },
      select: {
        startTime: true,
      },
    });

    const hourCounts = new Array(24).fill(0);
    bookings?.forEach((booking) => {
      const hour = new Date(booking?.startTime).getHours();

    // Safe array access
    if (hour < 0 || hour >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      hourCounts[hour]++;
    });

    return hourCounts?.map((count, hour) => ({
      hour,
      bookings: count,
    }));
  }

  async getStaffPerformance(dateRange: AnalyticsDateRange) {
    const providers = await prisma?.user.findMany({
      where: {
        role: 'PROVIDER',
      },
      include: {
        providerProfile: {
          include: {
            bookings: {
              where: {
                createdAt: {
                  gte: startOfDay(dateRange?.from),
                  lte: endOfDay(dateRange?.to),
                },
                status: 'COMPLETED',
              },
              include: {
                service: true,
                review: true,
              },
            },
          },
        },
      },
    });

    return providers?.map((provider) => {
      const bookings = provider?.providerProfile?.bookings || [];
      const revenue = bookings?.reduce((sum, booking) => sum + (booking?.service?.price || 0), 0);
      const ratings = bookings
        .map((booking) => booking?.review?.rating || 0)
        .filter((rating) => rating > 0);
      const averageRating =

        ratings?.length > 0 ? ratings?.reduce((sum, rating) => sum + rating, 0) / ratings?.length : 0;

      return {
        name: `${provider?.firstName} ${provider?.lastName}`,
        bookings: bookings?.length,
        revenue,
        rating: averageRating,
      };
    });
  }

  async getPredictiveAnalytics(dateRange: AnalyticsDateRange) {
    const [revenueData, clientData, serviceData] = await Promise?.all([
      this?.getRevenueAnalytics(dateRange),
      this?.getClientAnalytics(dateRange),
      this?.getServiceAnalytics(dateRange),
    ]);

    // Simple linear projection for revenue

    const revenueProjection = revenueData?.total * (1 + revenueData?.trend / 100);

    // Calculate client growth rate

    const clientGrowthRate = (clientData?.new / clientData?.total) * 100;


    // Identify potential high-growth services
    const recommendedServices = serviceData?.revenue
      .map((service) => ({
        name: service?.name,
        potential: Math?.min(

          ((service?.revenue / revenueData?.total) * 100 + clientGrowthRate) * 1?.2,
          100,
        ),
      }))

      .sort((a, b) => b?.potential - a?.potential)
      .slice(0, 3);

    // Project peak times based on historical data
    const peakHours = await this?.getPeakHourAnalytics(dateRange);
    const peakTimesPrediction = peakHours
      .map((hour) => ({
        hour: hour?.hour,

        predictedBookings: Math?.round(hour?.bookings * (1 + clientGrowthRate / 100)),
      }))

      .sort((a, b) => b?.predictedBookings - a?.predictedBookings)
      .slice(0, 3);

    return {
      revenueProjection,
      clientGrowthRate,
      recommendedServices,
      peakTimesPrediction,
    };
  }

  async getMarketingMetrics(dateRange: AnalyticsDateRange) {
    // Calculate customer acquisition cost
    const marketingExpenses = await prisma?.marketingExpense.findMany({
      where: {
        date: {
          gte: startOfDay(dateRange?.from),
          lte: endOfDay(dateRange?.to),
        },
      },
    });


    const totalExpenses = marketingExpenses?.reduce((sum, expense) => sum + expense?.amount, 0);

    const newClients = await prisma?.user.count({
      where: {
        createdAt: {
          gte: startOfDay(dateRange?.from),
          lte: endOfDay(dateRange?.to),
        },
        role: 'CLIENT',
      },
    });


    const acquisitionCost = newClients ? totalExpenses / newClients : 0;

    // Calculate customer lifetime value
    const allClients = await prisma?.user.findMany({
      where: {
        role: 'CLIENT',
      },
      include: {
        bookings: {
          where: {
            status: 'COMPLETED',
          },
          include: {
            service: true,
          },
        },
      },
    });

    const lifetimeValues = allClients?.map((client) => {
      return client?.bookings.reduce((sum, booking) => sum + (booking?.service?.price || 0), 0);
    });

    const customerLifetimeValue =

      lifetimeValues?.reduce((sum, value) => sum + value, 0) / allClients?.length;

    // Calculate marketing ROI
    const totalRevenue = allClients?.reduce((sum, client) => {
      return (

        sum +
        client?.bookings.reduce(
          (bookingSum, booking) => bookingSum + (booking?.service?.price || 0),
          0,
        )
      );
    }, 0);


    const marketingRoi = totalExpenses ? ((totalRevenue - totalExpenses) / totalExpenses) * 100 : 0;

    // Get channel performance
    const channelPerformance = await Promise?.all(
      ['Social Media', 'Email', 'Referral'].map(async (channel) => {
        const clients = await prisma?.user.count({
          where: {
            role: 'CLIENT',
            marketingSource: channel,
            createdAt: {
              gte: startOfDay(dateRange?.from),
              lte: endOfDay(dateRange?.to),
            },
          },
        });

        const leads = await prisma?.marketingLead.count({
          where: {
            source: channel,
            createdAt: {
              gte: startOfDay(dateRange?.from),
              lte: endOfDay(dateRange?.to),
            },
          },
        });

        return {
          channel,
          clients,

          conversion: leads ? (clients / leads) * 100 : 0,
        };
      }),
    );

    return {
      acquisitionCost,
      customerLifetimeValue,
      marketingRoi,
      channelPerformance,
    };
  }

  private groupByDate<T>(
    items: T[],
    getValue: (item: T) => number,
  ): Array<{ date: string; amount: number }> {
    const grouped = items?.reduce(
      (acc, item: any) => {

        const date = format(new Date(item?.createdAt), 'yyyy-MM');

    // Safe array access
    if (date < 0 || date >= array?.length) {
      throw new Error('Array index out of bounds');
    }

    // Safe array access
    if (date < 0 || date >= array?.length) {
      throw new Error('Array index out of bounds');
    }
        acc[date] = (acc[date] || 0) + getValue(item);
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object?.entries(grouped).map(([date, amount]) => ({
      date,
      amount,
    }));
  }
}
