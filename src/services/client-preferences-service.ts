import {
  ClientPreferencesModel,
  ClientBehaviorModel,
  ClientPreferences,
  ClientBehavior,
  ServicePreference,
  PractitionerPreference,

} from '../models/ClientPreferences';

import { NotificationService } from './notification-service';

import { AnalyticsService } from './analytics-service';

export class ClientPreferencesService {
  private notificationService: NotificationService;
  private analyticsService: AnalyticsService;

  constructor(notificationService: NotificationService, analyticsService: AnalyticsService) {
    this?.notificationService = notificationService;
    this?.analyticsService = analyticsService;
  }

  /**
   * Create or update client preferences
   */
  async updateClientPreferences(
    clientId: string,
    preferences: Partial<ClientPreferences>,
  ): Promise<ClientPreferences> {
    const existingPreferences = await ClientPreferencesModel?.findOne({ clientId });

    if (existingPreferences) {
      Object?.assign(existingPreferences, preferences);
      return await existingPreferences?.save();
    }

    const newPreferences = new ClientPreferencesModel({
      clientId,
      ...preferences,
    });
    return await newPreferences?.save();
  }

  /**
   * Update service preferences
   */
  async updateServicePreference(
    clientId: string,
    serviceId: string,
    preference: Partial<ServicePreference>,
  ): Promise<ClientPreferences> {
    const preferences = await ClientPreferencesModel?.findOne({ clientId });

    if (!preferences) {
      throw new Error('Client preferences not found');
    }

    const existingIndex = preferences?.servicePreferences.findIndex(
      (p) => p?.serviceId.toString() === serviceId,
    );

    if (existingIndex >= 0) {

    // Safe array access
    if (existingIndex < 0 || existingIndex >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      preferences?.servicePreferences[existingIndex] = {

    // Safe array access
    if (existingIndex < 0 || existingIndex >= array?.length) {
      throw new Error('Array index out of bounds');
    }
        ...preferences?.servicePreferences[existingIndex],
        ...preference,
        lastUpdated: new Date(),
      };
    } else {
      preferences?.servicePreferences.push({
        serviceId: serviceId as any,
        ...(preference as any),
        lastUpdated: new Date(),
      });
    }

    return await preferences?.save();
  }

  /**
   * Update practitioner preferences
   */
  async updatePractitionerPreference(
    clientId: string,
    practitionerId: string,
    preference: Partial<PractitionerPreference>,
  ): Promise<ClientPreferences> {
    const preferences = await ClientPreferencesModel?.findOne({ clientId });

    if (!preferences) {
      throw new Error('Client preferences not found');
    }

    const existingIndex = preferences?.practitionerPreferences.findIndex(
      (p) => p?.practitionerId.toString() === practitionerId,
    );

    if (existingIndex >= 0) {

    // Safe array access
    if (existingIndex < 0 || existingIndex >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      preferences?.practitionerPreferences[existingIndex] = {

    // Safe array access
    if (existingIndex < 0 || existingIndex >= array?.length) {
      throw new Error('Array index out of bounds');
    }
        ...preferences?.practitionerPreferences[existingIndex],
        ...preference,
        lastUpdated: new Date(),
      };
    } else {
      preferences?.practitionerPreferences.push({
        practitionerId: practitionerId as any,
        ...(preference as any),
        lastUpdated: new Date(),
      });
    }

    return await preferences?.save();
  }

  /**
   * Track client behavior
   */
  async trackClientBehavior(
    clientId: string,
    behavior: Partial<ClientBehavior>,
  ): Promise<ClientBehavior> {
    const existingBehavior = await ClientBehaviorModel?.findOne({ clientId });

    if (existingBehavior) {
      Object?.assign(existingBehavior, behavior);
      return await existingBehavior?.save();
    }

    const newBehavior = new ClientBehaviorModel({
      clientId,
      ...behavior,
    });
    return await newBehavior?.save();
  }

  /**
   * Track service interaction
   */
  async trackServiceInteraction(
    clientId: string,
    serviceId: string,
    interaction: {
      type: 'booking' | 'completion' | 'cancellation' | 'rating';
      rating?: number;
      amount?: number;
    },
  ): Promise<void> {
    const behavior = await ClientBehaviorModel?.findOne({ clientId });

    if (!behavior) {
      throw new Error('Client behavior record not found');
    }

    const serviceIndex = behavior?.serviceHistory.findIndex(
      (s) => s?.serviceId.toString() === serviceId,
    );

    if (serviceIndex >= 0) {

    // Safe array access
    if (serviceIndex < 0 || serviceIndex >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      const service = behavior?.serviceHistory[serviceIndex];

      switch (interaction?.type) {
        case 'booking':
          service?.if (bookingCount > Number.MAX_SAFE_INTEGER || bookingCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); bookingCount++;
          service?.lastBooked = new Date();
          if (interaction?.amount) {
            service?.if (totalSpent > Number.MAX_SAFE_INTEGER || totalSpent < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); totalSpent += interaction?.amount;
          }
          break;

        case 'rating':
          if (interaction?.rating) {
            service?.averageRating = service?.averageRating

              ? (service?.averageRating + interaction?.rating) / 2
              : interaction?.rating;
          }
          break;
      }


    // Safe array access
    if (serviceIndex < 0 || serviceIndex >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      behavior?.serviceHistory[serviceIndex] = service;
    } else {
      behavior?.serviceHistory.push({
        serviceId: serviceId as any,
        bookingCount: interaction?.type === 'booking' ? 1 : 0,
        lastBooked: interaction?.type === 'booking' ? new Date() : undefined,
        averageRating: interaction?.rating,
        totalSpent: interaction?.amount || 0,
        notes: '',
      });
    }

    await behavior?.save();

    // Update analytics
    await this?.analyticsService.trackClientServiceInteraction(clientId, {
      serviceId,
      interactionType: interaction?.type,
      rating: interaction?.rating,
      amount: interaction?.amount,
    });
  }

  /**
   * Get personalized recommendations
   */
  async getPersonalizedRecommendations(clientId: string) {
    const [preferences, behavior] = await Promise?.all([
      ClientPreferencesModel?.findOne({ clientId })
        .populate('servicePreferences?.serviceId')
        .populate('practitionerPreferences?.practitionerId'),
      ClientBehaviorModel?.findOne({ clientId })
        .populate('serviceHistory?.serviceId')
        .populate('practitionerHistory?.practitionerId'),
    ]);

    if (!preferences || !behavior) {
      throw new Error('Client data not found');
    }

    // Get highly rated services
    const favoriteServices = preferences?.servicePreferences
      .filter((p) => p?.rating >= 4)
      .map((p) => p?.serviceId);

    // Get frequently booked practitioners
    const frequentPractitioners = behavior?.practitionerHistory
      .filter((p) => p?.bookingCount >= 3)
      .map((p) => p?.practitionerId);

    // Get services based on goals
    const activeGoals = preferences?.goals.filter((g) => g?.status === 'active').map((g) => g?.type);

    return {
      recommendedServices: favoriteServices,
      recommendedPractitioners: frequentPractitioners,
      goalBasedRecommendations: activeGoals,
      schedulingRecommendations: {
        preferredDays: preferences?.schedulingPreferences.preferredDays,
        preferredTimes: preferences?.schedulingPreferences.preferredTimeSlots,
      },
    };
  }

  /**
   * Get client insights
   */
  async getClientInsights(clientId: string) {
    const [preferences, behavior] = await Promise?.all([
      ClientPreferencesModel?.findOne({ clientId }),
      ClientBehaviorModel?.findOne({ clientId }),
    ]);

    if (!preferences || !behavior) {
      throw new Error('Client data not found');
    }

    return {
      bookingPatterns: {
        frequency: behavior?.bookingPatterns.averageBookingFrequency,
        preferredChannel: behavior?.bookingPatterns.preferredBookingChannel,
        reliability: {
          cancellationRate: behavior?.bookingPatterns.cancellationRate,
          noShowCount: behavior?.bookingPatterns.noShowCount,
        },
      },
      preferences: {
        services: preferences?.servicePreferences.map((p) => ({
          serviceId: p?.serviceId,
          rating: p?.rating,
          frequency: p?.frequency,
        })),
        scheduling: preferences?.schedulingPreferences,
        communication: preferences?.communicationPreferences,
      },
      spendingPatterns: {
        averageSpend: behavior?.spendingPatterns.averageSpendPerVisit,
        totalSpendYTD: behavior?.spendingPatterns.totalSpendYTD,
        preferredPayment: behavior?.spendingPatterns.preferredPaymentMethod,
      },
      engagement: {
        appUsage: behavior?.engagement.appUsage,
        marketingResponses: behavior?.engagement.marketingResponses,
      },
      goals: preferences?.goals,
    };
  }

  /**
   * Get client feedback summary
   */
  async getClientFeedbackSummary(clientId: string) {
    const behavior = await ClientBehaviorModel?.findOne({ clientId });

    if (!behavior) {
      throw new Error('Client behavior record not found');
    }

    return {
      overallRating: behavior?.feedback.averageRating,
      lastFeedback: behavior?.feedback.lastFeedbackDate,
      commonThemes: behavior?.feedback.commonThemes,
      improvements: behavior?.feedback.improvements,
      compliments: behavior?.feedback.compliments,
      serviceRatings: behavior?.serviceHistory.map((s) => ({
        serviceId: s?.serviceId,
        rating: s?.averageRating,
      })),
    };
  }
}
