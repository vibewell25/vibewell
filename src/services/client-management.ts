import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from '@/lib/logger';
import { OpenAI } from 'openai';
import { addDays, differenceInDays, isAfter } from 'date-fns';

const prisma = new PrismaClient();
const openai = new OpenAI();

interface ClientAnalytics {
  retentionScore: number;
  visitFrequency: number;
  averageRating: number;
  lifetimeValue: number;
  lastVisitDays: number;
  riskOfChurn: number;
}

type ClientCard = Prisma.ClientCardGetPayload<{
  include: {
    feedbacks: true;
    serviceHistory: {
      include: {
        service: true;
        feedback: true;
      };
    };
  };
}>;

type Feedback = Prisma.FeedbackGetPayload<{
  include: {
    clientCard: true;
  };
}>;

type MarketingPreferences = Prisma.MarketingPreferencesGetPayload<{
  include: {
    clientCard: true;
  };
}>;

export class ClientManagementService {
  /**
   * Creates or updates a client card
   */
  public async upsertClientCard(
    userId: string,
    data: Prisma.ClientCardCreateInput
  ): Promise<ClientCard> {
    try {
      return await prisma.clientCard.upsert({
        where: { userId },
        create: {
          userId,
          ...data,
        },
        update: data,
        include: {
          feedbacks: true,
          serviceHistory: {
            include: {
              service: true,
              feedback: true,
            },
          },
        },
      });
    } catch (error) {
      logger.error('Failed to upsert client card', 'ClientManagement', { error, userId });
      throw error;
    }
  }

  /**
   * Processes client feedback and triggers follow-up if needed
   */
  public async processFeedback(feedback: Feedback): Promise<void> {
    try {
      // Update client retention score based on feedback
      const clientCard = await prisma.clientCard.findUnique({
        where: { id: feedback.clientCardId },
        include: { feedbacks: true },
      });

      if (!clientCard) throw new Error('Client card not found');

      // Calculate new retention score
      const averageRating =
        clientCard.feedbacks.reduce((sum, f) => sum + f.rating, 0) / clientCard.feedbacks.length;
      const retentionScore = this.calculateRetentionScore(
        averageRating,
        clientCard.feedbacks.length
      );

      // Update client card
      await prisma.clientCard.update({
        where: { id: feedback.clientCardId },
        data: {
          retentionScore,
          nextFollowUp: feedback.followUpRequired ? addDays(new Date(), 2) : null,
        },
      });

      // Generate personalized follow-up message if needed
      if (feedback.followUpRequired) {
        await this.generateFollowUpMessage(feedback);
      }
    } catch (error) {
      logger.error('Failed to process feedback', 'ClientManagement', {
        error,
        feedbackId: feedback.id,
      });
      throw error;
    }
  }

  /**
   * Generates personalized marketing campaigns
   */
  public async generateMarketingCampaign(preferences: MarketingPreferences): Promise<string> {
    try {
      const clientCard = await prisma.clientCard.findUnique({
        where: { id: preferences.clientCardId },
        include: {
          serviceHistory: {
            include: { service: true },
          },
        },
      });

      if (!clientCard) throw new Error('Client card not found');

      // Generate personalized campaign using OpenAI
      const prompt = this.buildMarketingPrompt(clientCard, preferences);
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a beauty salon marketing expert. Create a personalized marketing message.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const campaign = completion.choices[0].message.content;

      // Update last campaign date
      await prisma.marketingPreferences.update({
        where: { id: preferences.id },
        data: { lastCampaign: new Date() },
      });

      return campaign || '';
    } catch (error) {
      logger.error('Failed to generate marketing campaign', 'ClientManagement', {
        error,
        preferencesId: preferences.id,
      });
      throw error;
    }
  }

  /**
   * Analyzes client retention and generates insights
   */
  public async analyzeClientRetention(clientCardId: string): Promise<ClientAnalytics> {
    try {
      const clientCard = await prisma.clientCard.findUnique({
        where: { id: clientCardId },
        include: {
          serviceHistory: {
            include: {
              service: true,
              feedback: true,
            },
          },
        },
      });

      if (!clientCard) throw new Error('Client card not found');

      const analytics: ClientAnalytics = {
        retentionScore: clientCard.retentionScore,
        visitFrequency: this.calculateVisitFrequency(clientCard.serviceHistory),
        averageRating: this.calculateAverageRating(clientCard.serviceHistory),
        lifetimeValue: this.calculateLifetimeValue(clientCard.serviceHistory),
        lastVisitDays: this.calculateDaysSinceLastVisit(clientCard.lastVisit),
        riskOfChurn: this.calculateChurnRisk(clientCard),
      };

      return analytics;
    } catch (error) {
      logger.error('Failed to analyze client retention', 'ClientManagement', {
        error,
        clientCardId,
      });
      throw error;
    }
  }

  /**
   * Processes automated follow-ups
   */
  public async processAutomatedFollowUps(): Promise<void> {
    try {
      const clientsNeedingFollowUp = await prisma.clientCard.findMany({
        where: {
          nextFollowUp: {
            lte: new Date(),
          },
        },
        include: {
          user: true,
          marketingPrefs: true,
        },
      });

      for (const client of clientsNeedingFollowUp) {
        await this.sendFollowUp(client);
      }
    } catch (error) {
      logger.error('Failed to process automated follow-ups', 'ClientManagement', { error });
      throw error;
    }
  }

  private calculateRetentionScore(averageRating: number, feedbackCount: number): number {
    // Weight the score based on number of feedbacks and average rating
    const feedbackWeight = Math.min(feedbackCount / 10, 1); // Max weight at 10 feedbacks
    return (averageRating / 5) * feedbackWeight;
  }

  private calculateVisitFrequency(serviceHistory: ClientCard['serviceHistory']): number {
    if (serviceHistory.length < 2) return 0;

    const sortedVisits = serviceHistory
      .map(h => new Date(h.date))
      .sort((a, b) => b.getTime() - a.getTime());

    const totalDays = differenceInDays(sortedVisits[0], sortedVisits[sortedVisits.length - 1]);
    return serviceHistory.length / (totalDays / 30); // Visits per month
  }

  private calculateAverageRating(serviceHistory: ClientCard['serviceHistory']): number {
    const ratings = serviceHistory.filter(h => h.feedback).map(h => h.feedback?.rating || 0);

    if (ratings.length === 0) return 0;
    return ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length;
  }

  private calculateLifetimeValue(serviceHistory: ClientCard['serviceHistory']): number {
    return serviceHistory.reduce((sum: number, h) => sum + (h.service?.price || 0), 0);
  }

  private calculateDaysSinceLastVisit(lastVisit: Date | null): number {
    if (!lastVisit) return 365; // Default to a year if no visits
    return differenceInDays(new Date(), lastVisit);
  }

  private calculateChurnRisk(clientCard: any): number {
    const factors = {
      daysSinceLastVisit: this.calculateDaysSinceLastVisit(clientCard.lastVisit) / 365, // Normalize to 0-1
      retentionScore: 1 - clientCard.retentionScore, // Invert so higher means more risk
      averageRating: 1 - this.calculateAverageRating(clientCard.serviceHistory) / 5, // Normalize and invert
      visitFrequency: Math.min(1, 1 / this.calculateVisitFrequency(clientCard.serviceHistory)), // Invert and cap
    };

    // Weighted average of risk factors
    return (
      factors.daysSinceLastVisit * 0.4 +
      factors.retentionScore * 0.3 +
      factors.averageRating * 0.2 +
      factors.visitFrequency * 0.1
    );
  }

  private async generateFollowUpMessage(feedback: Feedback): Promise<string> {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a customer service expert. Generate a personalized follow-up message.',
        },
        {
          role: 'user',
          content: `Generate a follow-up message for a client who gave a rating of ${feedback.rating}/5 and said: "${feedback.comment}"`,
        },
      ],
    });

    return completion.choices[0].message.content || '';
  }

  private buildMarketingPrompt(clientCard: any, preferences: MarketingPreferences): string {
    const services = clientCard.serviceHistory.map((h: any) => h.service.name).join(', ');
    const interests = preferences.interests.join(', ');

    return `Create a personalized marketing message for a salon client with the following profile:
      - Preferred services: ${services}
      - Interests: ${interests}
      - Communication preferences: ${preferences.email ? 'email' : ''} ${preferences.sms ? 'SMS' : ''} ${preferences.push ? 'push notifications' : ''}
      - Last visit: ${clientCard.lastVisit ? clientCard.lastVisit.toLocaleDateString() : 'Never'}
      
      The message should be engaging, personalized, and encourage booking their next appointment.`;
  }

  private async sendFollowUp(client: any): Promise<void> {
    // Implementation would depend on your notification system
    // This is a placeholder for the actual implementation
    logger.info('Sending follow-up', 'ClientManagement', {
      clientId: client.id,
      email: client.user.email,
    });
  }
}
