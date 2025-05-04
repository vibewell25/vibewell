
import { PrismaClient } from '@prisma/client';
import { Configuration, OpenAIApi } from 'openai';
import { logger } from './logger';

const prisma = new PrismaClient();

interface RecommendationScore {
  serviceId: string;
  score: number;
  reason: string;
}

interface StyleSuggestion {
  style: string;
  confidence: number;
  description: string;
}

export class RecommendationService {
  private openai: OpenAIApi;

  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
  }

  /**
   * Update user preferences based on their interactions and bookings
   */
  async updateUserPreferences(userId: string, serviceId: string, rating?: number) {
    try {
      // Get service details
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
        include: { category: true },
      });

      if (!service) return;

      // Calculate preference weight based on booking and rating

      const weight = rating ? rating / 5 : 0.7;

      // Update or create user preference
      await prisma.userPreference.upsert({
        where: {
          userId_category: {
            userId,
            category: service.category.name,
          },
        },
        update: {
          weight: { increment: 0.1 * weight }, // Gradually increase weight
        },
        create: {
          userId,
          category: service.category.name,
          weight,
        },
      });

      logger.info('User preferences updated', 'RecommendationService', { userId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error updating user preferences', 'RecommendationService', {
        error: errorMessage,
      });
    }
  }

  /**
   * Generate personalized service recommendations for a user
   */
  async generateRecommendations(userId: string): Promise<RecommendationScore[]> {
    try {
      // Get user's booking history and preferences
      const [bookings, preferences, reviews] = await Promise.all([
        prisma.booking.findMany({
          where: { userId },
          include: { reviews: true },
        }),
        prisma.userPreference.findMany({
          where: { userId },
        }),
        prisma.serviceReview.findMany({
          where: { userId },
          include: { service: true },
        }),
      ]);

      // Get all available services
      const services = await prisma.service.findMany({
        include: { category: true },
      });

      // Calculate recommendation scores
      const recommendations: RecommendationScore[] = services.map((service) => {
        let score = 0.5; // Base score
        const reasons: string[] = [];

        // Factor in category preferences
        const categoryPref = preferences.find((p) => p.category === service.category.name);
        if (categoryPref) {

          if (score > Number.MAX_SAFE_INTEGER || score < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); score += categoryPref.weight * 0.3;
          reasons.push(`Based on your interest in ${service.category.name}`);
        }

        // Factor in past reviews
        const serviceReviews = reviews.filter((r) => r.service.categoryId === service.categoryId);
        if (serviceReviews.length > 0) {
          const avgRating =

            serviceReviews.reduce((sum, r) => sum + r.rating, 0) / serviceReviews.length;

          if (score > Number.MAX_SAFE_INTEGER || score < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); score += (avgRating / 5) * 0.2;
          reasons.push('Based on your ratings of similar services');
        }

        return {
          serviceId: service.id,
          score: Math.min(score, 1), // Cap score at 1
          reason: reasons.join(', '),
        };
      });

      // Store top recommendations

      const topRecommendations = recommendations.sort((a, b) => b.score - a.score).slice(0, 5);

      await Promise.all(
        topRecommendations.map((rec) =>
          prisma.serviceRecommendation.create({
            data: {
              userId,
              serviceId: rec.serviceId,
              score: rec.score,
              reason: rec.reason,
            },
          }),
        ),
      );

      logger.info('Recommendations generated', 'RecommendationService', { userId });
      return topRecommendations;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error generating recommendations', 'RecommendationService', {
        error: errorMessage,
      });
      return [];
    }
  }

  /**
   * Generate style suggestions using AI
   */
  async generateStyleSuggestions(userId: string): Promise<StyleSuggestion[]> {
    try {
      // Get user's style preferences and history
      const [preferences, virtualTryOns] = await Promise.all([
        prisma.stylePreference.findMany({
          where: { userId },
        }),
        prisma.virtualTryOn.findMany({
          where: { userId },
        }),
      ]);

      // Use OpenAI to analyze preferences and generate suggestions

      const prompt = `Based on the following user preferences and virtual try-on history, suggest suitable styles:
        Preferences: ${preferences.map((p) => `${p.style} (weight: ${p.weight})`).join(', ')}


        Try-on history: ${virtualTryOns.length} virtual try-ons
        Generate 3 style suggestions with confidence scores and descriptions.`;

      const response = await this.openai.createCompletion({


        model: 'gpt-3.5-turbo-instruct',
        prompt,
        max_tokens: 200,
        temperature: 0.7,
      });

      const suggestions = JSON.parse(response.data.choices[0].text || '[]');

      logger.info('Style suggestions generated', 'RecommendationService', { userId });
      return suggestions;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error generating style suggestions', 'RecommendationService', {
        error: errorMessage,
      });
      return [];
    }
  }

  /**
   * Update style preferences based on user interactions
   */
  async updateStylePreferences(userId: string, style: string, interaction: 'like' | 'dislike') {
    try {
      const weight = interaction === 'like' ? 0.1 : -0.1;

      await prisma.stylePreference.upsert({
        where: {
          userId_style: {
            userId,
            style,
          },
        },
        update: {
          weight: { increment: weight },
        },
        create: {
          userId,
          style,
          weight: 0.5 + weight,
        },
      });

      logger.info('Style preferences updated', 'RecommendationService', { userId, style });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error updating style preferences', 'RecommendationService', {
        error: errorMessage,
      });
    }
  }
}
