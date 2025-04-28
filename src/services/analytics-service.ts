import { prisma } from '@/lib/database/client';
import { randomBytes } from 'crypto';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';

const prismaClient = new PrismaClient();

// Define types for analytics events
export type EventName =
  | 'page_view'
  | 'product_view'
  | 'product_filter'
  | 'product_search'
  | 'product_recommendation_click'
  | 'product_try_on'
  | 'product_feedback_submit'
  | 'product_share'
  | 'user_sign_up'
  | 'user_sign_in'
  | 'cart_add'
  | 'cart_remove'
  | 'checkout_start'
  | 'checkout_complete'
  | 'achievement_earned'; // Added for engagement service

// Define interface for event payload
export interface AnalyticsEvent {
  event: EventName;
  user_id?: string;
  session_id: string;
  timestamp: string;
  properties: Record<string, any>;
}

// Define interface for engagement metrics
export interface EngagementMetrics {
  totalSessions: number;
  uniqueUsers: number;
  averageDuration: number;
  successRate: number;
  timeRange: {
    start: string;
    end: string;
  };
  makeupSessions: number;
  hairstyleSessions: number;
  accessorySessions: number;
  socialShares: number;
  emailShares: number;
  downloadShares: number;
  topViewedProducts: Array<{
    product_id: string;
    name: string;
    views: number;
  }>;
  productCategoryBreakdown: Record<string, number>;
}

// Define interface for product metrics
export interface ProductMetrics {
  productId: string;
  totalViews: number;
  uniqueViews: number;
  tryOnCount: number;
  conversionRate: number;
  clickThroughRate: number;
  timeRange: {
    start: string;
    end: string;
  };
}

// Define interface for recommendation metrics
export interface RecommendationMetrics {
  totalRecommendations: number;
  clickThroughRate: number;
  conversionRate: number;
  topRecommendedProducts: Array<{
    product_id: string;
    name: string;
    recommendations: number;
    clicks: number;
  }>;
  timeRange: {
    start: string;
    end: string;
  };
}

interface TryOnSessionData {
  userId: string;
  type: string;
  productId: string;
  productName: string;
  duration: number;
  intensity: number;
  success: boolean;
}

interface ShareData {
  sessionId: string;
  userId?: string;
  platform: string;
  method: 'email' | 'social' | 'download';
  success: boolean;
  error?: string;
}

export interface AnalyticsData {
  timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  metrics: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    totalBookings: number;
    totalRevenue: number;
    averageBookingValue: number;
  };
  trends: {
    userGrowth: number;
    revenueGrowth: number;
    bookingGrowth: number;
  };
  topServices: Array<{
    id: string;
    name: string;
    bookings: number;
    revenue: number;
  }>;
  userRetention: {
    newUsers: number;
    returningUsers: number;
    churnRate: number;
  };
}

export interface ServicePerformance {
  id: string;
  name: string;
  metrics: {
    totalBookings: number;
    totalRevenue: number;
    averageRating: number;
    utilization: number;
  };
  trends: {
    bookingTrend: number[];
    revenueTrend: number[];
    ratingTrend: number[];
  };
}

// Analytics Service
export class AnalyticsService {
  private sessionId: string;

  constructor() {
    // Generate a session ID for anonymous users
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    // Check if we have a session ID in localStorage
    if (typeof window !== 'undefined') {
      const storedSessionId = localStorage.getItem('analytics_session_id');

      if (storedSessionId) {
        return storedSessionId;
      }

      // Create a new session ID
      const newSessionId = this.generateSessionId();
      localStorage.setItem('analytics_session_id', newSessionId);
      return newSessionId;
    }

    // Server-side fallback
    return this.generateSessionId();
  }

  private generateSessionId(): string {
    // Use cryptographically secure random bytes instead of Math.random
    // This works in both browser and Node.js environments
    if (typeof window !== 'undefined' && window.crypto) {
      // Browser environment: use Web Crypto API
      const buffer = new Uint8Array(16);
      window.crypto.getRandomValues(buffer);
      return Array.from(buffer)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    } else {
      // Node.js environment: use crypto module
      return randomBytes(16).toString('hex');
    }
  }

  // Track an analytics event
  public async trackEvent(event: EventName, properties: Record<string, any> = {}): Promise<void> {
    try {
      // Check if running on client-side
      if (typeof window !== 'undefined') {
        // Use the API endpoint for client-side tracking
        const response = await fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event,
            properties,
            session_id: this.sessionId,
          }),
        });

        const result = await response.json();

        // Update the session ID if one was returned
        if (result.success && result.session_id) {
          localStorage.setItem('analytics_session_id', result.session_id);
          this.sessionId = result.session_id;
        }

        // If this is a production environment, you might want to
        // integrate with third-party analytics services here
        this.sendToExternalAnalytics({
          event,
          user_id: undefined, // We don't have this info client-side
          session_id: this.sessionId,
          timestamp: new Date().toISOString(),
          properties,
        });

        return;
      }

      // Server-side tracking (direct to database)
      // Get the current user ID if available
      const session = await prisma.session.findFirst({
        where: {
          sessionToken: this.sessionId,
        },
        include: {
          user: true,
        },
      });

      const userId = session?.userId;

      // Create the event payload
      const eventPayload = {
        event,
        userId,
        sessionId: this.sessionId,
        timestamp: new Date(),
        properties: JSON.stringify(properties),
      };

      // Store the event in the database using Prisma
      await prisma.analyticsEvent.create({
        data: eventPayload,
      });
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }

  // Helper method to send data to external analytics services
  private sendToExternalAnalytics(event: AnalyticsEvent): void {
    // Implement integrations with services like Google Analytics, Mixpanel, etc.

    // Example: Google Analytics (GA4)
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as any).gtag;

      gtag('event', event.event, {
        ...event.properties,
        user_id: event.user_id,
        session_id: event.session_id,
      });
    }
  }

  // Get engagement metrics for a given time range
  public async getEngagementMetrics(options: {
    start: string;
    end: string;
  }): Promise<EngagementMetrics> {
    try {
      // Query for sessions in the time range using Prisma
      const sessions = await prisma.analyticsEvent.findMany({
        where: {
          timestamp: {
            gte: new Date(options.start),
            lte: new Date(options.end),
          },
        },
        orderBy: {
          timestamp: 'asc',
        },
      });

      // Calculate metrics
      const uniqueUserIds = new Set(
        sessions.filter((session) => session.userId).map((session) => session.userId),
      );

      const uniqueSessionIds = new Set(sessions.map((session) => session.sessionId));

      // Calculate try-on session counts
      const tryOnSessions = sessions.filter((session) => session.event === 'product_try_on');

      const makeupSessions = tryOnSessions.filter((session) => {
        const props = JSON.parse(session.properties as string);
        return props.product_type === 'makeup';
      }).length;

      const hairstyleSessions = tryOnSessions.filter((session) => {
        const props = JSON.parse(session.properties as string);
        return props.product_type === 'hairstyle';
      }).length;

      const accessorySessions = tryOnSessions.filter((session) => {
        const props = JSON.parse(session.properties as string);
        return props.product_type === 'accessory';
      }).length;

      // Calculate shares
      const shareSessions = sessions.filter((session) => session.event === 'product_share');

      const socialShares = shareSessions.filter((session) => {
        const props = JSON.parse(session.properties as string);
        return props.share_method === 'social';
      }).length;

      const emailShares = shareSessions.filter((session) => {
        const props = JSON.parse(session.properties as string);
        return props.share_method === 'email';
      }).length;

      const downloadShares = shareSessions.filter((session) => {
        const props = JSON.parse(session.properties as string);
        return props.share_method === 'download';
      }).length;

      // Calculate top viewed products
      const productViews = sessions.filter((session) => session.event === 'product_view');

      const productViewsCount: Record<string, { count: number; name: string }> = {};
      productViews.forEach((view) => {
        const props = JSON.parse(view.properties as string);
        const productId = props.product_id;
        const productName = props.product_name || 'Unknown Product';

        if (!productViewsCount[productId]) {
          productViewsCount[productId] = { count: 0, name: productName };
        }
        productViewsCount[productId].count += 1;
      });

      const topViewedProducts = Object.entries(productViewsCount)
        .map(([product_id, { count, name }]) => ({ product_id, name, views: count }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Calculate product category breakdown
      const productCategoryBreakdown: Record<string, number> = {};
      productViews.forEach((view) => {
        const props = JSON.parse(view.properties as string);
        const category = props.product_category || 'Unknown';

        if (!productCategoryBreakdown[category]) {
          productCategoryBreakdown[category] = 0;
        }
        productCategoryBreakdown[category] += 1;
      });

      // Calculate average duration and success rate
      let totalDuration = 0;
      let successCount = 0;

      tryOnSessions.forEach((session) => {
        const props = JSON.parse(session.properties as string);

        if (props.duration) {
          totalDuration += props.duration;
        }

        if (props.success) {
          successCount += 1;
        }
      });

      const averageDuration = tryOnSessions.length > 0 ? totalDuration / tryOnSessions.length : 0;

      const successRate =
        tryOnSessions.length > 0 ? (successCount / tryOnSessions.length) * 100 : 0;

      return {
        totalSessions: uniqueSessionIds.size,
        uniqueUsers: uniqueUserIds.size,
        averageDuration,
        successRate,
        timeRange: {
          start: options.start,
          end: options.end,
        },
        makeupSessions,
        hairstyleSessions,
        accessorySessions,
        socialShares,
        emailShares,
        downloadShares,
        topViewedProducts,
        productCategoryBreakdown,
      };
    } catch (error) {
      console.error('Error getting engagement metrics:', error);

      // Return empty metrics on error
      return {
        totalSessions: 0,
        uniqueUsers: 0,
        averageDuration: 0,
        successRate: 0,
        timeRange: {
          start: options.start,
          end: options.end,
        },
        makeupSessions: 0,
        hairstyleSessions: 0,
        accessorySessions: 0,
        socialShares: 0,
        emailShares: 0,
        downloadShares: 0,
        topViewedProducts: [],
        productCategoryBreakdown: {},
      };
    }
  }

  // Get metrics for a specific product
  public async getProductMetrics(
    productId: string,
    options: { start: string; end: string },
  ): Promise<ProductMetrics> {
    try {
      // Query for product events in the time range
      const { data: productEvents, error: eventsError } = await prisma.analyticsEvent.findMany({
        where: {
          event: {
            in: ['product_view', 'product_try_on'],
          },
          OR: [
            {
              properties: {
                path: ['product_id'],
                equals: productId,
              },
            },
            {
              properties: {
                path: ['id'],
                equals: productId,
              },
            },
          ],
          timestamp: {
            gte: new Date(options.start),
            lte: new Date(options.end),
          },
        },
        orderBy: {
          timestamp: 'asc',
        },
      });

      if (eventsError) {
        throw eventsError;
      }

      // Calculate product metrics
      const viewEvents = productEvents.filter((event) => event.event === 'product_view');

      const tryOnEvents = productEvents.filter((event) => event.event === 'product_try_on');

      const uniqueViewerIds = new Set(
        viewEvents
          .filter((event) => event.user_id || event.session_id)
          .map((event) => event.user_id || event.session_id),
      );

      // Calculate click-through rate (views / recommendation clicks)
      const recommendationClicks = productEvents.filter(
        (event) => event.event === 'product_recommendation_click',
      ).length;

      const clickThroughRate =
        recommendationClicks > 0 ? (viewEvents.length / recommendationClicks) * 100 : 0;

      // Calculate conversion rate (try-ons / views)
      const conversionRate =
        viewEvents.length > 0 ? (tryOnEvents.length / viewEvents.length) * 100 : 0;

      return {
        productId,
        totalViews: viewEvents.length,
        uniqueViews: uniqueViewerIds.size,
        tryOnCount: tryOnEvents.length,
        conversionRate,
        clickThroughRate,
        timeRange: {
          start: options.start,
          end: options.end,
        },
      };
    } catch (error) {
      console.error(`Error fetching metrics for product ${productId}:`, error);
      throw error;
    }
  }

  // Get metrics for recommendations
  public async getRecommendationMetrics(options: {
    start: string;
    end: string;
  }): Promise<RecommendationMetrics> {
    try {
      // Query for recommendation events in the time range
      const { data: events, error: eventsError } = await prisma.analyticsEvent.findMany({
        where: {
          event: {
            in: ['product_recommendation_click', 'product_view', 'cart_add'],
          },
          timestamp: {
            gte: new Date(options.start),
            lte: new Date(options.end),
          },
        },
        orderBy: {
          timestamp: 'asc',
        },
      });

      if (eventsError) {
        throw eventsError;
      }

      // Calculate recommendation metrics
      const recommendationClicks = events.filter(
        (event) => event.event === 'product_recommendation_click',
      );

      // Track which products were recommended and clicked
      const recommendedProducts: Record<
        string,
        {
          recommendations: number;
          clicks: number;
          views: number;
          conversions: number;
          name: string;
        }
      > = {};

      recommendationClicks.forEach((event) => {
        const productId = event.properties.product_id;
        const productName = event.properties.product_name || 'Unknown Product';

        if (productId) {
          if (!recommendedProducts[productId]) {
            recommendedProducts[productId] = {
              recommendations: 0,
              clicks: 0,
              views: 0,
              conversions: 0,
              name: productName,
            };
          }
          recommendedProducts[productId].clicks += 1;
        }
      });

      // Count views for recommended products
      events
        .filter((event) => event.event === 'product_view')
        .forEach((event) => {
          const productId = event.properties.product_id;

          if (productId && recommendedProducts[productId]) {
            recommendedProducts[productId].views += 1;
          }
        });

      // Count conversions (added to cart) for recommended products
      events
        .filter((event) => event.event === 'cart_add')
        .forEach((event) => {
          const productId = event.properties.product_id;

          if (productId && recommendedProducts[productId]) {
            recommendedProducts[productId].conversions += 1;
          }
        });

      // Calculate overall metrics
      const totalRecommendations = Object.values(recommendedProducts).reduce(
        (sum, product) => sum + product.recommendations,
        0,
      );

      const totalClicks = Object.values(recommendedProducts).reduce(
        (sum, product) => sum + product.clicks,
        0,
      );

      const totalConversions = Object.values(recommendedProducts).reduce(
        (sum, product) => sum + product.conversions,
        0,
      );

      const clickThroughRate =
        totalRecommendations > 0 ? (totalClicks / totalRecommendations) * 100 : 0;

      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

      // Get top recommended products
      const topRecommendedProducts = Object.entries(recommendedProducts)
        .map(([product_id, product]) => ({
          product_id,
          name: product.name,
          recommendations: product.recommendations,
          clicks: product.clicks,
        }))
        .sort((a, b) => b.recommendations - a.recommendations)
        .slice(0, 5);

      return {
        totalRecommendations,
        clickThroughRate,
        conversionRate,
        topRecommendedProducts,
        timeRange: {
          start: options.start,
          end: options.end,
        },
      };
    } catch (error) {
      console.error('Error fetching recommendation metrics:', error);
      throw error;
    }
  }

  async trackTryOnSession(data: TryOnSessionData): Promise<void> {
    try {
      await fetch('/api/analytics/try-on-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error tracking try-on session:', error);
    }
  }

  async trackShare(data: ShareData): Promise<void> {
    try {
      await this.trackEvent('product_share', {
        session_id: data.sessionId,
        user_id: data.userId,
        platform: data.platform,
        method: data.method,
        success: data.success,
        error: data.error,
      });
    } catch (error) {
      console.error('Error tracking share:', error);
    }
  }

  /**
   * Get analytics data for a specific timeframe
   */
  async getAnalytics(
    timeframe: AnalyticsData['timeframe'],
    startDate: Date,
    endDate: Date,
  ): Promise<AnalyticsData> {
    try {
      const [userMetrics, bookingMetrics, topServices, retentionData] = await Promise.all([
        this.getUserMetrics(startDate, endDate),
        this.getBookingMetrics(startDate, endDate),
        this.getTopServices(startDate, endDate),
        this.getUserRetention(startDate, endDate),
      ]);

      const previousPeriodEnd = new Date(startDate);
      previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
      const previousPeriodStart = new Date(previousPeriodEnd);
      previousPeriodStart.setDate(
        previousPeriodStart.getDate() -
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      const [previousUserMetrics, previousBookingMetrics] = await Promise.all([
        this.getUserMetrics(previousPeriodStart, previousPeriodEnd),
        this.getBookingMetrics(previousPeriodStart, previousPeriodEnd),
      ]);

      const trends = {
        userGrowth: this.calculateGrowth(previousUserMetrics.totalUsers, userMetrics.totalUsers),
        revenueGrowth: this.calculateGrowth(
          previousBookingMetrics.totalRevenue,
          bookingMetrics.totalRevenue,
        ),
        bookingGrowth: this.calculateGrowth(
          previousBookingMetrics.totalBookings,
          bookingMetrics.totalBookings,
        ),
      };

      return {
        timeframe,
        startDate,
        endDate,
        metrics: {
          ...userMetrics,
          ...bookingMetrics,
        },
        trends,
        topServices,
        userRetention: retentionData,
      };
    } catch (error) {
      logger.error('Error getting analytics data', 'analytics', { error });
      throw error;
    }
  }

  /**
   * Get service performance metrics
   */
  async getServicePerformance(
    serviceId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ServicePerformance> {
    try {
      const service = await prismaClient.service.findUnique({
        where: { id: serviceId },
        include: {
          bookings: {
            where: {
              startTime: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
          reviews: {
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
        },
      });

      if (!service) {
        throw new Error('Service not found');
      }

      const metrics = {
        totalBookings: service.bookings.length,
        totalRevenue: service.bookings.reduce((sum, booking) => sum + booking.price, 0),
        averageRating:
          service.reviews.length > 0
            ? service.reviews.reduce((sum, review) => sum + review.rating, 0) /
              service.reviews.length
            : 0,
        utilization: await this.calculateUtilization(service, startDate, endDate),
      };

      const trends = await this.getServiceTrends(service, startDate, endDate);

      return {
        id: service.id,
        name: service.name,
        metrics,
        trends,
      };
    } catch (error) {
      logger.error('Error getting service performance', 'analytics', { error, serviceId });
      throw error;
    }
  }

  /**
   * Generate custom report
   */
  async generateReport(options: {
    startDate: Date;
    endDate: Date;
    metrics: string[];
    groupBy?: string;
    filters?: Record<string, any>;
  }) {
    try {
      const { startDate, endDate, metrics, groupBy, filters } = options;

      const reportData = await prismaClient.$transaction(async (prisma) => {
        const data: Record<string, any> = {};

        for (const metric of metrics) {
          switch (metric) {
            case 'bookings':
              data.bookings = await this.getBookingMetrics(startDate, endDate, filters);
              break;
            case 'revenue':
              data.revenue = await this.getRevenueMetrics(startDate, endDate, filters);
              break;
            case 'users':
              data.users = await this.getUserMetrics(startDate, endDate, filters);
              break;
            case 'services':
              data.services = await this.getServiceMetrics(startDate, endDate, filters);
              break;
            default:
              logger.warn('Unknown metric requested', 'analytics', { metric });
          }
        }

        if (groupBy) {
          data.groupedData = await this.groupDataBy(data, groupBy, startDate, endDate);
        }

        return data;
      });

      return reportData;
    } catch (error) {
      logger.error('Error generating report', 'analytics', { error });
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private async getUserMetrics(startDate: Date, endDate: Date, filters?: Record<string, any>) {
    const users = await prismaClient.user.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        ...filters,
      },
    });

    const activeUsers = await prismaClient.user.count({
      where: {
        lastLoginAt: {
          gte: startDate,
          lte: endDate,
        },
        ...filters,
      },
    });

    return {
      totalUsers: users.length,
      activeUsers,
      newUsers: users.filter((user) => user.createdAt >= startDate).length,
    };
  }

  private async getBookingMetrics(startDate: Date, endDate: Date, filters?: Record<string, any>) {
    const bookings = await prismaClient.booking.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        ...filters,
      },
    });

    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.price, 0);

    return {
      totalBookings: bookings.length,
      totalRevenue,
      averageBookingValue: bookings.length > 0 ? totalRevenue / bookings.length : 0,
    };
  }

  private async getTopServices(startDate: Date, endDate: Date) {
    const services = await prismaClient.service.findMany({
      include: {
        bookings: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    });

    return services
      .map((service) => ({
        id: service.id,
        name: service.name,
        bookings: service.bookings.length,
        revenue: service.bookings.reduce((sum, booking) => sum + booking.price, 0),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }

  private async getUserRetention(startDate: Date, endDate: Date) {
    const users = await prismaClient.user.findMany({
      include: {
        bookings: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    });

    const newUsers = users.filter((user) => user.createdAt >= startDate).length;
    const returningUsers = users.filter(
      (user) => user.createdAt < startDate && user.bookings.length > 0,
    ).length;

    const previousUsers = await prismaClient.user.count({
      where: {
        createdAt: {
          lt: startDate,
        },
      },
    });

    const churnRate = previousUsers > 0 ? (previousUsers - returningUsers) / previousUsers : 0;

    return {
      newUsers,
      returningUsers,
      churnRate,
    };
  }

  private calculateGrowth(previous: number, current: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  private async calculateUtilization(
    service: any,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const totalSlots = await this.getTotalAvailableSlots(service, startDate, endDate);
    if (totalSlots === 0) return 0;
    return (service.bookings.length / totalSlots) * 100;
  }

  private async getTotalAvailableSlots(
    service: any,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    // Implementation depends on your business logic
    // This is a simplified version
    const daysDifference = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const slotsPerDay = 8; // Assuming 8 slots per day
    return daysDifference * slotsPerDay;
  }

  private async getServiceTrends(service: any, startDate: Date, endDate: Date) {
    // Implementation depends on your business logic
    // This is a simplified version
    return {
      bookingTrend: [
        /* Array of booking counts over time */
      ],
      revenueTrend: [
        /* Array of revenue over time */
      ],
      ratingTrend: [
        /* Array of ratings over time */
      ],
    };
  }

  private async groupDataBy(
    data: Record<string, any>,
    groupBy: string,
    startDate: Date,
    endDate: Date,
  ) {
    // Implementation depends on your grouping requirements
    // This is a placeholder
    return {};
  }
}
