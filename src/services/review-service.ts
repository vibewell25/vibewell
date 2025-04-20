import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';
import { SentimentAnalysisService } from '@/lib/sentiment-analysis';

const prisma = new PrismaClient();

interface CreateReviewInput {
  userId: string;
  serviceId: string;
  businessId: string;
  rating: number;
  comment?: string;
  bookingId?: string;
}

interface ReviewAnalytics {
  averageRating: number;
  totalReviews: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  commonAspects: {
    [key: string]: {
      count: number;
      averageScore: number;
      keywords: string[];
    };
  };
}

export class ReviewService {
  private sentimentAnalysis: SentimentAnalysisService;

  constructor() {
    this.sentimentAnalysis = new SentimentAnalysisService();
  }

  async createReview(input: CreateReviewInput) {
    try {
      // Create the review
      const review = await prisma.serviceReview.create({
        data: {
          userId: input.userId,
          serviceId: input.serviceId,
          businessId: input.businessId,
          rating: input.rating,
          comment: input.comment,
          bookingId: input.bookingId,
        },
      });

      // If there's a comment, analyze its sentiment
      if (input.comment) {
        const sentiment = await this.sentimentAnalysis.analyzeSentiment(input.comment);
        
        // Store sentiment analysis results
        await prisma.reviewSentiment.create({
          data: {
            reviewId: review.id,
            sentiment: sentiment.sentiment,
            score: sentiment.score,
            aspects: sentiment.aspects,
          },
        });
      }

      logger.info('Review created successfully', 'ReviewService', { reviewId: review.id });
      return review;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error creating review', 'ReviewService', { error: errorMessage });
      throw error;
    }
  }

  async getServiceReviews(serviceId: string) {
    try {
      const reviews = await prisma.serviceReview.findMany({
        where: { serviceId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          sentiment: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return reviews;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error fetching service reviews', 'ReviewService', { error: errorMessage });
      throw error;
    }
  }

  async getBusinessReviews(businessId: string) {
    try {
      const reviews = await prisma.serviceReview.findMany({
        where: { businessId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          service: true,
          sentiment: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return reviews;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error fetching business reviews', 'ReviewService', { error: errorMessage });
      throw error;
    }
  }

  async getReviewAnalytics(businessId: string): Promise<ReviewAnalytics> {
    try {
      // Get all reviews with their sentiment analysis
      const reviews = await prisma.serviceReview.findMany({
        where: { businessId },
        include: {
          sentiment: true,
        },
      });

      // Calculate average rating
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

      // Calculate sentiment breakdown
      const sentimentBreakdown = {
        positive: 0,
        neutral: 0,
        negative: 0,
      };

      const aspectsMap: {
        [key: string]: {
          count: number;
          totalScore: number;
          keywords: Set<string>;
        };
      } = {};

      reviews.forEach(review => {
        if (review.sentiment) {
          // Update sentiment breakdown
          sentimentBreakdown[review.sentiment.sentiment]++;

          // Aggregate aspects
          Object.entries(review.sentiment.aspects).forEach(([aspect, data]) => {
            if (!aspectsMap[aspect]) {
              aspectsMap[aspect] = {
                count: 0,
                totalScore: 0,
                keywords: new Set(),
              };
            }
            aspectsMap[aspect].count++;
            aspectsMap[aspect].totalScore += data.score;
            data.keywords.forEach(keyword => aspectsMap[aspect].keywords.add(keyword));
          });
        }
      });

      // Convert aspects map to final format
      const commonAspects: ReviewAnalytics['commonAspects'] = {};
      Object.entries(aspectsMap).forEach(([aspect, data]) => {
        commonAspects[aspect] = {
          count: data.count,
          averageScore: data.totalScore / data.count,
          keywords: Array.from(data.keywords),
        };
      });

      return {
        averageRating,
        totalReviews: reviews.length,
        sentimentBreakdown,
        commonAspects,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error getting review analytics', 'ReviewService', { error: errorMessage });
      throw error;
    }
  }
} 