import {
  PerformanceReviewModel,
  PerformanceReview,
  PerformanceMetric,
  MetricEvaluation,
  DevelopmentGoal,
} from '../models/PerformanceReview';
import { NotificationService } from './notification-service';
import { AnalyticsService } from './analytics-service';
import { v4 as uuidv4 } from 'uuid';

export class PerformanceReviewService {
  private notificationService: NotificationService;
  private analyticsService: AnalyticsService;

  // Define standard performance metrics
  private readonly STANDARD_METRICS: PerformanceMetric[] = [
    {
      id: 'SERVICE_QUALITY',
      name: 'Service Quality',
      category: 'service_quality',
      description: 'Overall quality of services provided to clients',
      weight: 25,
      scoringCriteria: {
        excellent: 'Consistently exceeds client expectations with exceptional service',
        good: 'Regularly meets client expectations with quality service',
        satisfactory: 'Generally meets basic service requirements',
        needsImprovement: 'Frequently falls below expected service standards',
      },
    },
    {
      id: 'CLIENT_SATISFACTION',
      name: 'Client Satisfaction',
      category: 'client_satisfaction',
      description: 'Client feedback and satisfaction metrics',
      weight: 25,
      scoringCriteria: {
        excellent: 'Outstanding client feedback with high retention rate',
        good: 'Positive client feedback with good retention',
        satisfactory: 'Mixed client feedback with average retention',
        needsImprovement: 'Poor client feedback with low retention',
      },
    },
    {
      id: 'EFFICIENCY',
      name: 'Operational Efficiency',
      category: 'efficiency',
      description: 'Time management and operational effectiveness',
      weight: 20,
      scoringCriteria: {
        excellent: 'Highly efficient with optimal resource utilization',
        good: 'Good time management and resource usage',
        satisfactory: 'Adequate efficiency in operations',
        needsImprovement: 'Inefficient operations and resource usage',
      },
    },
    {
      id: 'REVENUE',
      name: 'Revenue Generation',
      category: 'revenue',
      description: 'Contribution to business revenue',
      weight: 15,
      scoringCriteria: {
        excellent: 'Consistently exceeds revenue targets',
        good: 'Regularly meets revenue targets',
        satisfactory: 'Sometimes meets revenue targets',
        needsImprovement: 'Rarely meets revenue targets',
      },
    },
    {
      id: 'PROFESSIONAL_DEVELOPMENT',
      name: 'Professional Development',
      category: 'professional_development',
      description: 'Continuous learning and skill improvement',
      weight: 15,
      scoringCriteria: {
        excellent: 'Proactively pursues development opportunities',
        good: 'Regularly participates in development activities',
        satisfactory: 'Completes required development activities',
        needsImprovement: 'Minimal engagement in development',
      },
    },
  ];

  constructor(notificationService: NotificationService, analyticsService: AnalyticsService) {
    this.notificationService = notificationService;
    this.analyticsService = analyticsService;
  }

  /**
   * Create a new performance review
   */
  async createReview(
    practitionerId: string,
    reviewType: 'quarterly' | 'annual' | 'probation' | 'special',
    period: { start: Date; end: Date },
  ): Promise<PerformanceReview> {
    // Check for existing review in the same period
    const existingReview = await PerformanceReviewModel.findOne({
      practitionerId,
      reviewType,
      'reviewPeriod.start': { $lte: period.end },
      'reviewPeriod.end': { $gte: period.start },
    });

    if (existingReview) {
      throw new Error('A review already exists for this period');
    }

    const review = new PerformanceReviewModel({
      practitionerId,
      reviewType,
      reviewPeriod: period,
      metrics: this.STANDARD_METRICS.map((metric) => ({
        metricId: metric.id,
        score: 0,
        notes: '',
        evaluatorId: null,
        evaluationDate: null,
      })),
    });

    await review.save();

    // Notify practitioner
    await this.notificationService.notifyUser(practitionerId, {
      type: 'REVIEW',
      title: 'New Performance Review',
      message: `A new ${reviewType} review has been created for the period ${period.start.toLocaleDateString()} to ${period.end.toLocaleDateString()}`,
    });

    return review;
  }

  /**
   * Update metric evaluation
   */
  async updateMetricEvaluation(
    reviewId: string,
    metricId: string,
    evaluation: Partial<MetricEvaluation>,
  ): Promise<PerformanceReview> {
    const review = await PerformanceReviewModel.findById(reviewId);

    if (!review) {
      throw new Error('Review not found');
    }

    const metricIndex = review.metrics.findIndex((m) => m.metricId === metricId);

    if (metricIndex === -1) {
      throw new Error('Metric not found in review');
    }

    review.metrics[metricIndex] = {
      ...review.metrics[metricIndex],
      ...evaluation,
      evaluationDate: new Date(),
    };

    // Calculate overall score
    const totalWeight = this.STANDARD_METRICS.reduce((sum, m) => sum + m.weight, 0);
    const weightedSum = review.metrics.reduce((sum, m) => {
      const metric = this.STANDARD_METRICS.find((sm) => sm.id === m.metricId);
      return sum + m.score * (metric?.weight || 0);
    }, 0);

    review.overallScore = weightedSum / totalWeight;

    return await review.save();
  }

  /**
   * Add development goal
   */
  async addDevelopmentGoal(
    reviewId: string,
    goal: Omit<DevelopmentGoal, 'id' | 'status' | 'progress'>,
  ): Promise<PerformanceReview> {
    const review = await PerformanceReviewModel.findById(reviewId);

    if (!review) {
      throw new Error('Review not found');
    }

    const newGoal: DevelopmentGoal = {
      ...goal,
      id: uuidv4(),
      status: 'not_started',
      progress: 0,
    };

    review.developmentGoals.push(newGoal);
    return await review.save();
  }

  /**
   * Update goal progress
   */
  async updateGoalProgress(
    reviewId: string,
    goalId: string,
    update: {
      status?: DevelopmentGoal['status'];
      progress?: number;
      completedMilestones?: string[];
    },
  ): Promise<PerformanceReview> {
    const review = await PerformanceReviewModel.findById(reviewId);

    if (!review) {
      throw new Error('Review not found');
    }

    const goalIndex = review.developmentGoals.findIndex((g) => g.id === goalId);

    if (goalIndex === -1) {
      throw new Error('Goal not found');
    }

    const goal = review.developmentGoals[goalIndex];

    if (update.status) {
      goal.status = update.status;
    }

    if (update.progress !== undefined) {
      goal.progress = update.progress;
    }

    if (update.completedMilestones) {
      goal.milestones = goal.milestones.map((m) => ({
        ...m,
        status: update.completedMilestones?.includes(m.title) ? 'completed' : m.status,
        completedDate: update.completedMilestones?.includes(m.title) ? new Date() : m.completedDate,
      }));
    }

    review.developmentGoals[goalIndex] = goal;
    return await review.save();
  }

  /**
   * Add peer feedback
   */
  async addPeerFeedback(
    reviewId: string,
    feedback: {
      reviewerId: string;
      rating: number;
      comments: string;
    },
  ): Promise<PerformanceReview> {
    const review = await PerformanceReviewModel.findById(reviewId);

    if (!review) {
      throw new Error('Review not found');
    }

    review.feedback.peerFeedback.push({
      ...feedback,
      date: new Date(),
    } as any);

    return await review.save();
  }

  /**
   * Submit self assessment
   */
  async submitSelfAssessment(
    reviewId: string,
    assessment: {
      strengths: string[];
      challenges: string[];
      goals: string[];
    },
  ): Promise<PerformanceReview> {
    const review = await PerformanceReviewModel.findById(reviewId);

    if (!review) {
      throw new Error('Review not found');
    }

    review.feedback.selfAssessment = {
      ...assessment,
      submitted: new Date(),
    };

    return await review.save();
  }

  /**
   * Schedule review meeting
   */
  async scheduleReviewMeeting(
    reviewId: string,
    meeting: {
      scheduledDate: Date;
      duration: number;
      attendees: string[];
    },
  ): Promise<PerformanceReview> {
    const review = await PerformanceReviewModel.findById(reviewId);

    if (!review) {
      throw new Error('Review not found');
    }

    review.reviewMeetings.push({
      ...meeting,
      notes: '',
      actionItems: [],
    } as any);

    await review.save();

    // Notify attendees
    for (const attendeeId of meeting.attendees) {
      await this.notificationService.notifyUser(attendeeId, {
        type: 'REVIEW',
        title: 'Performance Review Meeting Scheduled',
        message: `A review meeting has been scheduled for ${meeting.scheduledDate.toLocaleString()}`,
      });
    }

    return review;
  }

  /**
   * Complete review
   */
  async completeReview(
    reviewId: string,
    reviewerId: string,
    completionData: {
      strengths: string[];
      areasForImprovement: string[];
      compensation?: {
        recommendedAdjustment?: number;
        adjustmentReason?: string;
        bonusRecommendation?: number;
        bonusJustification?: string;
      };
    },
  ): Promise<PerformanceReview> {
    const review = await PerformanceReviewModel.findById(reviewId);

    if (!review) {
      throw new Error('Review not found');
    }

    if (review.status !== 'in_review') {
      throw new Error('Review must be in review status to complete');
    }

    if (!review.metrics.every((m) => m.score > 0)) {
      throw new Error('All metrics must be evaluated before completion');
    }

    Object.assign(review, {
      status: 'completed',
      strengths: completionData.strengths,
      areasForImprovement: completionData.areasForImprovement,
      compensation: {
        ...review.compensation,
        ...completionData.compensation,
      },
      signatures: {
        ...review.signatures,
        reviewer: {
          userId: reviewerId,
          signed: true,
          date: new Date(),
        },
      },
    });

    await review.save();

    // Notify practitioner
    await this.notificationService.notifyUser(review.practitionerId.toString(), {
      type: 'REVIEW',
      title: 'Performance Review Completed',
      message: 'Your performance review has been completed. Please sign to acknowledge.',
    });

    return review;
  }

  /**
   * Get review summary
   */
  async getReviewSummary(practitionerId: string, period?: { start: Date; end: Date }) {
    const query = {
      practitionerId,
      ...(period && {
        'reviewPeriod.start': { $gte: period.start },
        'reviewPeriod.end': { $lte: period.end },
      }),
    };

    const reviews = await PerformanceReviewModel.find(query).sort({ 'reviewPeriod.start': -1 });

    return {
      totalReviews: reviews.length,
      averageScore: reviews.reduce((sum, r) => sum + (r.overallScore || 0), 0) / reviews.length,
      completedGoals: reviews.reduce(
        (sum, r) => sum + r.developmentGoals.filter((g) => g.status === 'completed').length,
        0,
      ),
      strengthAreas: this.aggregateStrengths(reviews),
      improvementAreas: this.aggregateImprovements(reviews),
      recentReviews: reviews.slice(0, 3).map((r) => ({
        id: r._id,
        period: r.reviewPeriod,
        type: r.reviewType,
        status: r.status,
        score: r.overallScore,
      })),
    };
  }

  private aggregateStrengths(reviews: PerformanceReview[]): { area: string; frequency: number }[] {
    const strengthCounts = new Map<string, number>();

    reviews.forEach((review) => {
      review.strengths.forEach((strength) => {
        strengthCounts.set(strength, (strengthCounts.get(strength) || 0) + 1);
      });
    });

    return Array.from(strengthCounts.entries())
      .map(([area, frequency]) => ({ area, frequency }))
      .sort((a, b) => b.frequency - a.frequency);
  }

  private aggregateImprovements(
    reviews: PerformanceReview[],
  ): { area: string; frequency: number }[] {
    const improvementCounts = new Map<string, number>();

    reviews.forEach((review) => {
      review.areasForImprovement.forEach((area) => {
        improvementCounts.set(area, (improvementCounts.get(area) || 0) + 1);
      });
    });

    return Array.from(improvementCounts.entries())
      .map(([area, frequency]) => ({ area, frequency }))
      .sort((a, b) => b.frequency - a.frequency);
  }
}
