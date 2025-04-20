import { PrismaClient, BusinessVerificationStatus } from '@prisma/client';
import { NotificationService } from './notification-service';
import { logger } from '@/lib/logger';
import { uploadDocument } from '@/lib/storage';
import { verifyDocument } from '@/lib/verification';

const prisma = new PrismaClient();

interface BusinessProfileData {
  name: string;
  description: string;
  type: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  businessHours: {
    day: number;
    openTime: string;
    closeTime: string;
  }[];
}

interface BusinessAnalytics {
  totalBookings: number;
  totalRevenue: number;
  newCustomers: number;
  period: {
    start: Date;
    end: Date;
  };
}

interface BusinessInsights {
  popularServices: Array<{
    serviceId: string;
    count: number;
  }>;
  peakHours: Array<{
    hour: number;
    count: number;
  }>;
  customerRetention: {
    oneTime: number;
    repeat: number;
    loyal: number;
  };
}

interface SelfServicePortalConfig {
  features: {
    onlineBooking: boolean;
    rescheduling: boolean;
    cancellation: boolean;
    paymentManagement: boolean;
    documentUpload: boolean;
    messageCenter: boolean;
  };
  customization: {
    theme: string;
    logo?: string;
    colors: {
      primary: string;
      secondary: string;
    };
  };
}

interface PricingRule {
  serviceId: string;
  basePrice: number;
  peakMultiplier?: number;
  offPeakDiscount?: number;
  bulkDiscount?: {
    minServices: number;
    discountPercentage: number;
  };
  seasonalPricing?: {
    startDate: Date;
    endDate: Date;
    multiplier: number;
  }[];
}

interface VerificationDocument {
  type: 'BUSINESS_LICENSE' | 'INSURANCE' | 'CERTIFICATION';
  file: File;
  expiryDate?: Date;
}

export interface CreateBusinessProfileDTO {
  userId: string;
  businessName: string;
  description?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
}

export interface CustomPricingDTO {
  serviceId: string;
  name: string;
  description?: string;
  basePrice: number;
  variables: Record<string, any>;
  conditions: Record<string, any>;
}

export interface BusinessVerificationDTO {
  businessId: string;
  documents: Array<{
    type: string;
    documentUrl: string;
  }>;
}

export class BusinessService {
  private notificationService: NotificationService;

  constructor(notificationService: NotificationService) {
    this.notificationService = notificationService;
  }

  /**
   * Create a business profile
   */
  async createBusinessProfile(data: CreateBusinessProfileDTO) {
    try {
      const profile = await prisma.businessProfile.create({
        data: {
          userId: data.userId,
          businessName: data.businessName,
          description: data.description,
          address: data.address,
          phone: data.phone,
          email: data.email,
          website: data.website,
        },
      });

      logger.info('Created business profile', { profileId: profile.id });
      return profile;
    } catch (error) {
      logger.error('Error creating business profile:', error);
      throw error;
    }
  }

  /**
   * Update business profile
   */
  async updateBusinessProfile(id: string, data: Partial<BusinessProfileData>) {
    try {
      const profile = await prisma.businessProfile.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });

      return profile;
    } catch (error) {
      logger.error('Error updating business profile', error);
      throw error;
    }
  }

  /**
   * Get business analytics
   */
  async getBusinessAnalytics(businessId: string, startDate: Date, endDate: Date): Promise<BusinessAnalytics> {
    try {
      const [bookings, reviews, revenue] = await Promise.all([
        // Get booking analytics
        prisma.serviceBooking.findMany({
          where: {
            business: { id: businessId },
            startTime: {
              gte: startDate,
              lte: endDate
            }
          },
          include: {
            services: true,
            payment: true
          }
        }),

        // Get review analytics
        prisma.serviceReview.findMany({
          where: {
            businessId,
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }),

        // Get revenue analytics
        prisma.payment.findMany({
          where: {
            booking: {
              business: { id: businessId }
            },
            createdAt: {
              gte: startDate,
              lte: endDate
            },
            status: 'COMPLETED'
          }
        })
      ]);

      // Calculate metrics
      const totalBookings = bookings.length;
      const totalRevenue = revenue.reduce((sum, payment) => sum + payment.amount, 0);
      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

      // Calculate service popularity
      const servicePopularity = bookings.reduce((acc, booking) => {
        booking.services.forEach(service => {
          acc[service.serviceId] = (acc[service.serviceId] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>);

      return {
        totalBookings,
        totalRevenue,
        averageRating,
        servicePopularity,
        recentReviews: reviews.slice(0, 5), // Last 5 reviews
        bookingTrend: this.calculateBookingTrend(bookings),
        revenueTrend: this.calculateRevenueTrend(revenue)
      };
    } catch (error) {
      logger.error('Error getting business analytics', error);
      throw error;
    }
  }

  /**
   * Get business insights
   */
  async getBusinessInsights(businessId: string): Promise<BusinessInsights> {
    try {
      const [popularServices, peakHours, customerRetention] = await Promise.all([
        this.getPopularServices(businessId),
        this.getPeakHours(businessId),
        this.getCustomerRetention(businessId)
      ]);

      return {
        popularServices,
        peakHours,
        customerRetention
      };
    } catch (error) {
      logger.error('Error getting business insights', error);
      throw error;
    }
  }

  /**
   * Get popular services
   */
  private async getPopularServices(businessId: string) {
    const services = await prisma.booking.groupBy({
      by: ['serviceId'],
      where: {
        businessId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      _count: true,
      orderBy: {
        _count: {
          serviceId: 'desc'
        }
      },
      take: 5
    });

    return services;
  }

  /**
   * Get peak hours
   */
  private async getPeakHours(businessId: string) {
    const bookings = await prisma.booking.findMany({
      where: {
        businessId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      select: {
        startTime: true
      }
    });

    const hourCounts = new Array(24).fill(0);
    bookings.forEach(booking => {
      const hour = new Date(booking.startTime).getHours();
      hourCounts[hour]++;
    });

    return hourCounts.map((count, hour) => ({
      hour,
      count
    }));
  }

  /**
   * Get customer retention
   */
  private async getCustomerRetention(businessId: string) {
    const customers = await prisma.booking.groupBy({
      by: ['userId'],
      where: {
        businessId,
        createdAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
        }
      },
      _count: true
    });

    const retention = {
      oneTime: 0,
      repeat: 0,
      loyal: 0 // 3 or more bookings
    };

    customers.forEach(customer => {
      if (customer._count === 1) retention.oneTime++;
      else if (customer._count === 2) retention.repeat++;
      else retention.loyal++;
    });

    return retention;
  }

  /**
   * Configure self-service portal
   */
  async configureSelfServicePortal(businessId: string, config: SelfServicePortalConfig) {
    try {
      const business = await prisma.businessProfile.findUnique({
        where: { id: businessId }
      });

      if (!business) {
        throw new Error('Business not found');
      }

      // Update business profile with portal configuration
      const updatedBusiness = await prisma.businessProfile.update({
        where: { id: businessId },
        data: {
          selfServiceConfig: config,
          updatedAt: new Date()
        }
      });

      // Create default templates for customer communications
      await this.createDefaultTemplates(businessId);

      return updatedBusiness;
    } catch (error) {
      logger.error('Error configuring self-service portal', error);
      throw error;
    }
  }

  /**
   * Create default communication templates
   */
  private async createDefaultTemplates(businessId: string) {
    const templates = [
      {
        type: 'BOOKING_CONFIRMATION',
        subject: 'Booking Confirmation - {{serviceName}}',
        content: 'Dear {{customerName}},\n\nYour booking for {{serviceName}} has been confirmed...'
      },
      {
        type: 'RESCHEDULE_NOTIFICATION',
        subject: 'Booking Rescheduled - {{serviceName}}',
        content: 'Dear {{customerName}},\n\nYour booking has been rescheduled...'
      },
      {
        type: 'CANCELLATION_CONFIRMATION',
        subject: 'Booking Cancelled - {{serviceName}}',
        content: 'Dear {{customerName}},\n\nYour booking has been cancelled...'
      }
    ];

    for (const template of templates) {
      await prisma.communicationTemplate.create({
        data: {
          businessId,
          ...template,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }
  }

  /**
   * Get portal analytics
   */
  async getPortalAnalytics(businessId: string, startDate: Date, endDate: Date) {
    try {
      const [selfServiceBookings, totalBookings] = await Promise.all([
        prisma.booking.count({
          where: {
            businessId,
            createdAt: {
              gte: startDate,
              lte: endDate
            },
            isCreatedThroughPortal: true
          }
        }),
        prisma.booking.count({
          where: {
            businessId,
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        })
      ]);

      return {
        selfServiceBookingRate: (selfServiceBookings / totalBookings) * 100,
        totalSelfServiceBookings: selfServiceBookings,
        period: { startDate, endDate }
      };
    } catch (error) {
      logger.error('Error getting portal analytics', error);
      throw error;
    }
  }

  async updatePricingRules(businessId: string, rules: PricingRule[]): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        // Delete existing pricing rules
        await tx.pricingRule.deleteMany({
          where: { businessId }
        });

        // Create new pricing rules
        for (const rule of rules) {
          await tx.pricingRule.create({
            data: {
              businessId,
              serviceId: rule.serviceId,
              basePrice: rule.basePrice,
              peakMultiplier: rule.peakMultiplier,
              offPeakDiscount: rule.offPeakDiscount,
              bulkDiscountMinServices: rule.bulkDiscount?.minServices,
              bulkDiscountPercentage: rule.bulkDiscount?.discountPercentage,
              seasonalPricing: rule.seasonalPricing
                ? JSON.stringify(rule.seasonalPricing)
                : null
            }
          });
        }
      });
    } catch (error) {
      logger.error('Error updating pricing rules:', error);
      throw error;
    }
  }

  async calculatePrice(
    serviceId: string,
    date: Date,
    quantity: number = 1
  ): Promise<number> {
    try {
      const service = await prisma.beautyService.findUnique({
        where: { id: serviceId },
        include: {
          business: {
            include: {
              pricingRules: true
            }
          }
        }
      });

      if (!service) {
        throw new Error('Service not found');
      }

      const pricingRule = service.business.pricingRules.find(
        (rule) => rule.serviceId === serviceId
      );

      if (!pricingRule) {
        return service.price * quantity;
      }

      let finalPrice = pricingRule.basePrice;

      // Apply peak/off-peak pricing
      const hour = date.getHours();
      if (hour >= 9 && hour <= 17) { // Peak hours
        if (pricingRule.peakMultiplier) {
          finalPrice *= pricingRule.peakMultiplier;
        }
      } else { // Off-peak hours
        if (pricingRule.offPeakDiscount) {
          finalPrice *= (1 - pricingRule.offPeakDiscount);
        }
      }

      // Apply bulk discount
      if (
        pricingRule.bulkDiscountMinServices &&
        pricingRule.bulkDiscountPercentage &&
        quantity >= pricingRule.bulkDiscountMinServices
      ) {
        finalPrice *= (1 - pricingRule.bulkDiscountPercentage / 100);
      }

      // Apply seasonal pricing
      if (pricingRule.seasonalPricing) {
        const seasonalPricing = JSON.parse(pricingRule.seasonalPricing);
        const applicableSeason = seasonalPricing.find((season: any) => {
          const startDate = new Date(season.startDate);
          const endDate = new Date(season.endDate);
          return date >= startDate && date <= endDate;
        });

        if (applicableSeason) {
          finalPrice *= applicableSeason.multiplier;
        }
      }

      return finalPrice * quantity;
    } catch (error) {
      logger.error('Error calculating price:', error);
      throw error;
    }
  }

  async submitVerification(data: BusinessVerificationDTO) {
    try {
      const documents = await Promise.all(
        data.documents.map((doc) =>
          prisma.businessDocument.create({
            data: {
              businessId: data.businessId,
              type: doc.type,
              documentUrl: doc.documentUrl,
              status: 'PENDING',
            },
          })
        )
      );

      await this.notificationService.notifyAdmins({
        type: 'VERIFICATION',
        title: 'New Business Verification Request',
        message: `Business ${data.businessId} has submitted verification documents.`,
      });

      return documents;
    } catch (error) {
      logger.error('Error submitting verification:', error);
      throw error;
    }
  }

  async verifyBusiness(businessId: string, verifiedBy: string) {
    try {
      const [profile, documents] = await Promise.all([
        prisma.businessProfile.update({
          where: { id: businessId },
          data: {
            isVerified: true,
            verificationDate: new Date(),
          },
        }),
        prisma.businessDocument.updateMany({
          where: { businessId },
          data: {
            status: 'VERIFIED',
            verifiedAt: new Date(),
            verifiedBy,
          },
        }),
      ]);

      await this.notificationService.notifyBusiness(businessId, {
        type: 'VERIFICATION',
        title: 'Business Verified',
        message: 'Your business has been verified successfully!',
      });

      return profile;
    } catch (error) {
      logger.error('Error verifying business:', error);
      throw error;
    }
  }

  async createCustomPricing(businessId: string, data: CustomPricingDTO) {
    try {
      const pricing = await prisma.customPricing.create({
        data: {
          businessId,
          serviceId: data.serviceId,
          name: data.name,
          description: data.description,
          basePrice: data.basePrice,
          variables: data.variables,
          conditions: data.conditions,
        },
      });

      logger.info('Created custom pricing', { pricingId: pricing.id });
      return pricing;
    } catch (error) {
      logger.error('Error creating custom pricing:', error);
      throw error;
    }
  }

  async searchBusinesses(query: string, filters: Record<string, any> = {}) {
    try {
      const businesses = await prisma.businessProfile.findMany({
        where: {
          OR: [
            { businessName: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
          isVerified: true,
          ...filters,
        },
        include: {
          services: true,
          practitioners: true,
        },
      });

      return businesses;
    } catch (error) {
      logger.error('Error searching businesses:', error);
      throw error;
    }
  }

  private calculateBookingTrend(bookings: any[]) {
    // Group bookings by day and calculate daily totals
    const dailyBookings = bookings.reduce((acc, booking) => {
      const date = booking.startTime.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dailyBookings)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, count]) => ({ date, count }));
  }

  private calculateRevenueTrend(payments: any[]) {
    // Group payments by day and calculate daily totals
    const dailyRevenue = payments.reduce((acc, payment) => {
      const date = payment.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + payment.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dailyRevenue)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, amount]) => ({ date, amount }));
  }
}

export const businessService = new BusinessService(); 