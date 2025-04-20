import { PrismaClient } from '@prisma/client';
import { RecommendationService } from '@/lib/recommendation-service';
import { PredictiveBookingService } from '@/lib/predictive-booking';
import { SentimentAnalysisService } from '@/lib/sentiment-analysis';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();

interface ServiceWithCategory {
  id: string;
  name: string;
  description: string | null;
  category: {
    id: string;
    name: string;
  };
}

interface ServiceReviewWithService {
  id: string;
  userId: string;
  serviceId: string;
  comment: string | null;
  rating: number;
  service: {
    id: string;
    name: string;
  };
}

export class AIService {
  private recommendationService: RecommendationService;
  private predictiveBooking: PredictiveBookingService;
  private sentimentAnalysis: SentimentAnalysisService;

  constructor() {
    this.recommendationService = new RecommendationService();
    this.predictiveBooking = new PredictiveBookingService();
    this.sentimentAnalysis = new SentimentAnalysisService();
  }

  /**
   * Get personalized recommendations for a user
   */
  async getPersonalizedRecommendations(userId: string) {
    try {
      const recommendations = await this.recommendationService.generateRecommendations(userId);
      
      // Get service details for the recommendations
      const servicesWithDetails = await Promise.all(
        recommendations.map(async rec => {
          const service = await prisma.$queryRaw<ServiceWithCategory[]>`
            SELECT s.*, c.id as "categoryId", c.name as "categoryName"
            FROM "Service" s
            LEFT JOIN "ServiceCategory" c ON s."categoryId" = c.id
            WHERE s.id = ${rec.serviceId}
            LIMIT 1
          `;
          return {
            ...rec,
            service: service[0],
          };
        })
      );

      return servicesWithDetails;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error getting personalized recommendations', 'AIService', { error: errorMessage });
      throw error;
    }
  }

  /**
   * Get style suggestions for a user
   */
  async getStyleSuggestions(userId: string) {
    try {
      return await this.recommendationService.generateStyleSuggestions(userId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error getting style suggestions', 'AIService', { error: errorMessage });
      throw error;
    }
  }

  /**
   * Get resource allocation predictions for a business
   */
  async getResourcePredictions(businessId: string, date: Date) {
    try {
      // Get all services for the business
      const services = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM "Service"
        WHERE "businessId" = ${businessId}
      `;

      const forecasts = await Promise.all(
        services.map(service =>
          this.predictiveBooking.generateDemandForecast(
            businessId,
            service.id,
            date,
            new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
          )
        )
      );

      // Calculate resource allocation
      const allocation = await this.predictiveBooking.calculateResourceAllocation(
        businessId,
        date
      );

      return {
        forecasts,
        allocation: Object.fromEntries(allocation),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error getting resource predictions', 'AIService', { error: errorMessage });
      throw error;
    }
  }

  /**
   * Analyze review sentiment and update user preferences
   */
  async processReview(reviewId: string) {
    try {
      const reviews = await prisma.$queryRaw<ServiceReviewWithService[]>`
        SELECT r.*, s.id as "serviceId", s.name as "serviceName"
        FROM "ServiceReview" r
        LEFT JOIN "Service" s ON r."serviceId" = s.id
        WHERE r.id = ${reviewId}
        LIMIT 1
      `;

      const review = reviews[0];
      if (!review?.comment) return;

      // Analyze sentiment
      const sentiment = await this.sentimentAnalysis.analyzeSentiment(review.comment);

      // Store sentiment analysis
      await prisma.$executeRaw`
        INSERT INTO "ReviewSentiment" ("id", "reviewId", "sentiment", "score", "aspects", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${review.id}, ${sentiment.sentiment}, ${sentiment.score}, ${sentiment.aspects}, NOW(), NOW())
      `;

      // Update user preferences based on review
      await this.recommendationService.updateUserPreferences(
        review.userId,
        review.serviceId,
        review.rating
      );

      logger.info('Review processed successfully', 'AIService', { reviewId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error processing review', 'AIService', { error: errorMessage });
      throw error;
    }
  }

  /**
   * Update user preferences based on interactions
   */
  async trackUserInteraction(
    userId: string,
    serviceId: string,
    interactionType: 'view' | 'book' | 'favorite'
  ) {
    try {
      // Update service preferences
      await this.recommendationService.updateUserPreferences(
        userId,
        serviceId,
        interactionType === 'book' ? 0.8 : interactionType === 'favorite' ? 0.6 : 0.3
      );

      logger.info('User interaction tracked', 'AIService', {
        userId,
        serviceId,
        interactionType,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error tracking user interaction', 'AIService', { error: errorMessage });
      throw error;
    }
  }
} 