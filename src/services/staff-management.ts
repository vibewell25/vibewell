import { PrismaClient, Prisma, StaffPerformance, ShiftSwapRequest } from '@prisma/client';
import { OpenAI } from 'openai';
import { logger } from '@/lib/logger';
import { differenceInDays, addDays, subDays } from 'date-fns';

const prisma = new PrismaClient();
const openai = new OpenAI();

interface StaffAnalytics {
  performance: {
    clientSatisfaction: number;
    efficiency: number;
    salesPerformance: number;
    attendance: number;
  };
  trends: {
    bookingTrend: number;
    revenueTrend: number;
    clientRetentionRate: number;
  };
  predictions: {
    expectedBookings: number;
    potentialRevenue: number;
    burnoutRisk: number;
  };
}

interface ScheduleOptimizationResult {
  suggestedSchedule: Array<{
    staffId: string;
    startTime: Date;
    endTime: Date;
    predictedDemand: number;
  }>;
  reasoning: string;
}

interface AvailabilityPreference {
  staffId: string;
  dayOfWeek: number; // 0-6 for Sunday-Saturday
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isPreferred: boolean;
  notes?: string;
}

interface BreakSchedule {
  id: string;
  staffId: string;
  shiftId: string;
  startTime: Date;
  duration: number; // in minutes
  type: 'LUNCH' | 'REST' | 'PERSONAL';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED';
}

interface TeamMetrics {
  teamId: string;
  metrics: {
    overallEfficiency: number;
    clientSatisfaction: number;
    teamCollaboration: number;
    goalCompletion: number;
  };
  period: {
    start: Date;
    end: Date;
  };
}

interface StaffGoal {
  id: string;
  staffId: string;
  type: 'PERFORMANCE' | 'LEARNING' | 'CLIENT_SATISFACTION' | 'SALES';
  target: number;
  current: number;
  deadline: Date;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'MISSED';
  description: string;
}

interface Message {
  id: string;
  senderId: string;
  recipientId?: string;
  teamId?: string;
  type: 'DIRECT' | 'TEAM' | 'ANNOUNCEMENT';
  content: string;
  attachments?: string[];
  createdAt: Date;
  readBy: string[];
}

interface ShiftHandover {
  id: string;
  shiftId: string;
  staffId: string;
  notes: string;
  tasks: {
    completed: string[];
    pending: string[];
  };
  incidents?: string[];
  createdAt: Date;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string[];
  deadline?: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface ShiftSwapRequest {
  id: string;
  requestingStaffId: string;
  targetStaffId: string;
  scheduleId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class StaffManagementService {
  /**
   * Optimizes staff scheduling using AI
   */
  async optimizeSchedule(
    startDate: Date,
    endDate: Date,
    staffIds: string[],
  ): Promise<ScheduleOptimizationResult> {
    try {
      // Gather historical booking data
      const historicalBookings = await prisma.serviceBooking.findMany({
        where: {
          providerId: { in: staffIds },
          createdAt: {
            gte: addDays(startDate, -30),
            lte: startDate,
          },
        },
        include: {
          service: true,
          provider: true,
        },
      });

      // Gather staff performance data
      const staffPerformanceData = await prisma.staffPerformance.findMany({
        where: {
          staffId: { in: staffIds },
        },
      });

      // Generate optimization prompt
      const prompt = this.buildScheduleOptimizationPrompt(
        historicalBookings,
        staffPerformanceData,
        startDate,
        endDate,
      );

      // Get AI suggestions
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in staff scheduling optimization.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = completion.choices[0].message.content || '';
      const suggestedSchedule = this.parseAIScheduleSuggestions(content);

      return {
        suggestedSchedule,
        reasoning: content,
      };
    } catch (error) {
      logger.error('Failed to optimize schedule', 'StaffManagement', { error });
      throw error;
    }
  }

  /**
   * Analyzes staff performance using multiple metrics
   */
  async analyzePerformance(staffId: string): Promise<StaffAnalytics> {
    try {
      // Gather comprehensive data
      const [bookings, reviews, sales, attendance, performance] = await Promise.all([
        this.getStaffBookings(staffId),
        this.getStaffReviews(staffId),
        this.getStaffSales(staffId),
        this.getStaffAttendance(staffId),
        this.getStaffPerformance(staffId),
      ]);

      // Calculate current metrics
      const analytics: StaffAnalytics = {
        performance: {
          clientSatisfaction: this.calculateClientSatisfaction(reviews),
          efficiency: this.calculateEfficiency(bookings),
          salesPerformance: this.calculateSalesPerformance(sales),
          attendance: this.calculateAttendanceScore(attendance),
        },
        trends: {
          bookingTrend: this.calculateTrend(bookings, 'bookings'),
          revenueTrend: this.calculateTrend(sales, 'revenue'),
          clientRetentionRate: this.calculateClientRetention(bookings),
        },
        predictions: {
          expectedBookings: this.predictFutureBookings(bookings),
          potentialRevenue: this.predictPotentialRevenue(sales),
          burnoutRisk: this.calculateBurnoutRisk(bookings, attendance),
        },
      };

      // Update performance records
      await this.updatePerformanceMetrics(staffId, analytics);

      return analytics;
    } catch (error) {
      logger.error('Failed to analyze staff performance', 'StaffManagement', { error });
      throw error;
    }
  }

  /**
   * Tracks and processes staff commissions
   */
  async processCommissions(staffId: string, period: { start: Date; end: Date }): Promise<void> {
    try {
      // Get all relevant transactions
      const [serviceBookings, productSales] = await Promise.all([
        this.getServiceBookings(staffId, period),
        this.getProductSales(staffId, period),
      ]);

      // Calculate commissions
      const serviceCommission = this.calculateServiceCommission(serviceBookings);
      const productCommission = this.calculateProductCommission(productSales);
      const bonusCommission = await this.calculateBonusCommission(staffId, period);

      // Create commission records
      await Promise.all([
        this.createCommissionRecord(staffId, 'SERVICE', serviceCommission),
        this.createCommissionRecord(staffId, 'PRODUCT_SALE', productCommission),
        this.createCommissionRecord(staffId, 'BONUS', bonusCommission),
      ]);

      logger.info('Processed staff commissions', 'StaffManagement', {
        staffId,
        totalCommission: serviceCommission + productCommission + bonusCommission,
      });
    } catch (error) {
      logger.error('Failed to process commissions', 'StaffManagement', { error });
      throw error;
    }
  }

  /**
   * Manages certifications and training
   */
  async manageCertifications(staffId: string): Promise<void> {
    try {
      const certifications = await prisma.$queryRaw`
        SELECT *
        FROM certifications
        WHERE staff_id = ${staffId}
      `;

      // Check for expiring certifications
      const expiringCertifications = certifications.filter(
        (cert: any) => cert.expiry_date && differenceInDays(cert.expiry_date, new Date()) <= 30,
      );

      if (expiringCertifications.length > 0) {
        await this.notifyExpiringCertifications(staffId, expiringCertifications);
      }

      // Suggest relevant training
      const suggestedTraining = await this.suggestTraining(staffId, certifications);
      await this.notifyTrainingSuggestions(staffId, suggestedTraining);
    } catch (error) {
      logger.error('Failed to manage certifications', 'StaffManagement', { error });
      throw error;
    }
  }

  /**
   * Manages employee availability preferences
   */
  async manageAvailability(staffId: string, preferences: AvailabilityPreference[]): Promise<void> {
    try {
      // Validate and store preferences
      await prisma.staffAvailability.deleteMany({
        where: { staffId },
      });

      await prisma.staffAvailability.createMany({
        data: preferences.map((pref) => ({
          staffId,
          dayOfWeek: pref.dayOfWeek,
          startTime: pref.startTime,
          endTime: pref.endTime,
          isPreferred: pref.isPreferred,
          notes: pref.notes,
        })),
      });

      logger.info('Updated staff availability preferences', 'StaffManagement', {
        staffId,
        preferencesCount: preferences.length,
      });
    } catch (error) {
      logger.error('Failed to update availability preferences', 'StaffManagement', { error });
      throw error;
    }
  }

  /**
   * Manages break schedules
   */
  async scheduleBreak(staffId: string, startTime: Date, endTime: Date): Promise<void> {
    try {
      await prisma.$executeRaw`
        INSERT INTO break_schedule (
          staff_id,
          start_time,
          end_time
        ) VALUES (
          ${staffId},
          ${startTime},
          ${endTime}
        )
      `;
    } catch (error) {
      logger.error('Failed to schedule break', 'StaffManagement', { error });
      throw error;
    }
  }

  /**
   * Manages shift swap requests
   */
  async requestShiftSwap(
    request: Omit<ShiftSwapRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>,
  ): Promise<void> {
    try {
      // First verify the schedule exists
      const schedule = await prisma.$queryRaw`
        SELECT id
        FROM schedule
        WHERE id = ${request.scheduleId}
          AND staff_id = ${request.requestingStaffId}
      `;

      if (!schedule) {
        throw new Error('Schedule not found');
      }

      await prisma.$executeRaw`
        INSERT INTO shift_swap_request (
          requesting_staff_id,
          target_staff_id,
          schedule_id,
          status,
          notes
        ) VALUES (
          ${request.requestingStaffId},
          ${request.targetStaffId},
          ${request.scheduleId},
          'PENDING',
          ${request.notes || null}
        )
      `;
    } catch (error) {
      logger.error('Failed to request shift swap', 'StaffManagement', { error });
      throw error;
    }
  }

  /**
   * Responds to a shift swap request
   */
  async respondToShiftSwap(
    swapRequestId: string,
    recipientId: string,
    accept: boolean,
  ): Promise<ShiftSwapRequest> {
    try {
      const swapRequest = await prisma.shiftSwapRequest.findFirst({
        where: {
          id: swapRequestId,
          recipientId,
          status: 'PENDING',
        },
        include: {
          shift: true,
        },
      });

      if (!swapRequest) {
        throw new Error('Swap request not found or already processed');
      }

      const status = accept ? 'APPROVED' : 'REJECTED';

      // Update swap request status
      const updatedRequest = await prisma.shiftSwapRequest.update({
        where: { id: swapRequestId },
        data: {
          status,
          respondedAt: new Date(),
        },
      });

      if (accept) {
        // Swap the shifts
        await prisma.schedule.update({
          where: { id: swapRequest.shiftId },
          data: { staffId: recipientId },
        });

        // Notify both parties
        await Promise.all([
          this.notifyStaffMember(swapRequest.requesterId, {
            type: 'SHIFT_SWAP_APPROVED',
            message: `Your shift swap request has been approved`,
            data: { shiftId: swapRequest.shiftId },
          }),
          this.notifyStaffMember(recipientId, {
            type: 'SHIFT_SWAP_CONFIRMED',
            message: `You have been assigned a new shift`,
            data: { shiftId: swapRequest.shiftId },
          }),
        ]);
      }

      logger.info('Processed shift swap response', 'StaffManagement', {
        swapRequestId,
        recipientId,
        status,
      });

      return updatedRequest as ShiftSwapRequest;
    } catch (error) {
      logger.error('Failed to process shift swap response', 'StaffManagement', { error });
      throw error;
    }
  }

  private async notifyStaffMember(
    staffId: string,
    notification: {
      type: string;
      message: string;
      data?: Record<string, any>;
    },
  ): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          staffId,
          type: notification.type,
          message: notification.message,
          data: notification.data || {},
          isRead: false,
        },
      });
    } catch (error) {
      logger.error('Failed to send notification', 'StaffManagement', { error });
      // Don't throw error to prevent disrupting the main flow
    }
  }

  // Private helper methods
  private async getStaffBookings(staffId: string) {
    return prisma.serviceBooking.findMany({
      where: { providerId: staffId },
      include: { service: true },
    });
  }

  private async getStaffReviews(staffId: string) {
    return prisma.practitionerReview.findMany({
      where: { practitionerId: staffId },
    });
  }

  private async getStaffSales(staffId: string) {
    return prisma.serviceBooking.findMany({
      where: { providerId: staffId },
      include: { payment: true },
    });
  }

  private async getStaffAttendance(staffId: string) {
    return prisma.schedule.findMany({
      where: { staffId },
    });
  }

  private async getStaffPerformance(staffId: string): Promise<StaffPerformance | null> {
    try {
      return await prisma.staffPerformance.findUnique({
        where: { staffId },
      });
    } catch (error) {
      logger.error('Failed to get staff performance', 'StaffManagement', { error });
      throw error;
    }
  }

  private calculateClientSatisfaction(reviews: any[]): number {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  }

  private calculateEfficiency(bookings: any[]): number {
    // Calculate ratio of completed bookings to allocated time
    const completed = bookings.filter((b) => b.status === 'COMPLETED').length;
    return bookings.length > 0 ? completed / bookings.length : 0;
  }

  private calculateSalesPerformance(sales: any[]): number {
    // Calculate total revenue and compare against targets
    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.payment?.amount || 0), 0);
    const target = 5000; // This should be configurable
    return Math.min(totalRevenue / target, 1);
  }

  private calculateAttendanceScore(attendance: any[]): number {
    const total = attendance.length;
    const present = attendance.filter((a) => a.isAvailable).length;
    return total > 0 ? present / total : 0;
  }

  private calculateTrend(data: any[], type: 'bookings' | 'revenue'): number {
    // Implement trend analysis using linear regression
    // Returns a value indicating trend direction and strength
    return 0; // Placeholder
  }

  private calculateClientRetention(bookings: any[]): number {
    // Calculate percentage of repeat clients
    const uniqueClients = new Set(bookings.map((b) => b.userId)).size;
    const repeatClients = bookings.length - uniqueClients;
    return uniqueClients > 0 ? repeatClients / uniqueClients : 0;
  }

  private predictFutureBookings(historicalBookings: any[]): number {
    // Use historical data to predict future booking volume
    // This should be enhanced with machine learning
    return 0; // Placeholder
  }

  private predictPotentialRevenue(historicalSales: any[]): number {
    // Predict future revenue based on historical trends
    return 0; // Placeholder
  }

  private calculateBurnoutRisk(bookings: any[], attendance: any[]): number {
    // Calculate risk of staff burnout based on workload and patterns
    return 0; // Placeholder
  }

  private async updatePerformanceMetrics(
    staffId: string,
    analytics: StaffAnalytics,
  ): Promise<void> {
    await prisma.staffPerformance.upsert({
      where: { staffId },
      create: {
        staffId,
        clientSatisfaction: analytics.performance.clientSatisfaction,
        efficiency: analytics.performance.efficiency,
        salesPerformance: analytics.performance.salesPerformance,
        attendance: analytics.performance.attendance,
      },
      update: {
        clientSatisfaction: analytics.performance.clientSatisfaction,
        efficiency: analytics.performance.efficiency,
        salesPerformance: analytics.performance.salesPerformance,
        attendance: analytics.performance.attendance,
      },
    });
  }

  private async notifyExpiringCertifications(
    staffId: string,
    certifications: any[],
  ): Promise<void> {
    // Implement notification logic
    logger.info('Notifying about expiring certifications', 'StaffManagement', {
      staffId,
      certifications: certifications.map((c) => c.name),
    });
  }

  private async suggestTraining(staffId: string, certifications: any[]): Promise<string[]> {
    // Implement training suggestion logic
    return []; // Placeholder
  }

  private async notifyTrainingSuggestions(staffId: string, suggestions: string[]): Promise<void> {
    // Implement notification logic
    logger.info('Notifying about training suggestions', 'StaffManagement', {
      staffId,
      suggestions,
    });
  }

  private buildScheduleOptimizationPrompt(
    historicalBookings: any[],
    staffPerformance: any[],
    startDate: Date,
    endDate: Date,
  ): string {
    return `Optimize staff schedule based on:
      - Historical bookings: ${JSON.stringify(historicalBookings)}
      - Staff performance: ${JSON.stringify(staffPerformance)}
      - Period: ${startDate} to ${endDate}
      Consider peak hours, staff expertise, and client preferences.`;
  }

  private parseAIScheduleSuggestions(aiResponse: string): Array<{
    staffId: string;
    startTime: Date;
    endTime: Date;
    predictedDemand: number;
  }> {
    try {
      const suggestions = JSON.parse(aiResponse);
      return Array.isArray(suggestions) ? suggestions : [];
    } catch {
      return [];
    }
  }

  /**
   * Tracks real-time staff performance
   */
  async trackPerformanceMetrics(
    staffId: string,
    metrics: {
      type: string;
      value: number;
      timestamp: Date;
      metadata?: Record<string, any>;
    },
  ): Promise<void> {
    try {
      // Store performance metric
      await prisma.performanceMetric.create({
        data: {
          staffId,
          type: metrics.type,
          value: metrics.value,
          timestamp: metrics.timestamp,
          metadata: metrics.metadata,
        },
      });

      // Update rolling averages
      await this.updateRollingAverages(staffId, metrics.type);

      // Check for goal progress
      await this.checkGoalProgress(staffId, metrics);

      logger.info('Tracked performance metric', 'StaffManagement', {
        staffId,
        metricType: metrics.type,
        value: metrics.value,
      });
    } catch (error) {
      logger.error('Failed to track performance metric', 'StaffManagement', { error });
      throw error;
    }
  }

  /**
   * Calculates team-based performance metrics
   */
  async calculateTeamMetrics(
    teamId: string,
    period: { start: Date; end: Date },
  ): Promise<TeamMetrics> {
    try {
      // Get team members
      const teamMembers = await prisma.staff.findMany({
        where: { teamId },
      });

      // Calculate individual metrics for each team member
      const memberMetrics = await Promise.all(
        teamMembers.map((member) => this.analyzePerformance(member.id)),
      );

      // Calculate team-wide metrics
      const teamMetrics: TeamMetrics = {
        teamId,
        metrics: {
          overallEfficiency: this.calculateAverageMetric(memberMetrics, 'efficiency'),
          clientSatisfaction: this.calculateAverageMetric(memberMetrics, 'clientSatisfaction'),
          teamCollaboration: await this.calculateTeamCollaboration(teamId, period),
          goalCompletion: await this.calculateTeamGoalCompletion(teamId, period),
        },
        period,
      };

      // Store team metrics
      await prisma.teamMetrics.create({
        data: {
          teamId,
          ...teamMetrics.metrics,
          periodStart: period.start,
          periodEnd: period.end,
        },
      });

      return teamMetrics;
    } catch (error) {
      logger.error('Failed to calculate team metrics', 'StaffManagement', { error });
      throw error;
    }
  }

  /**
   * Manages staff goals and tracks achievements
   */
  async manageStaffGoal(
    staffId: string,
    goal: Omit<StaffGoal, 'id' | 'current' | 'status'>,
  ): Promise<StaffGoal> {
    try {
      // Create new goal
      const newGoal = await prisma.staffGoal.create({
        data: {
          staffId,
          type: goal.type,
          target: goal.target,
          current: 0,
          deadline: goal.deadline,
          status: 'IN_PROGRESS',
          description: goal.description,
        },
      });

      // Set up tracking
      await this.initializeGoalTracking(newGoal.id);

      logger.info('Created staff goal', 'StaffManagement', {
        staffId,
        goalType: goal.type,
        target: goal.target,
      });

      return newGoal as StaffGoal;
    } catch (error) {
      logger.error('Failed to create staff goal', 'StaffManagement', { error });
      throw error;
    }
  }

  private async updateRollingAverages(staffId: string, metricType: string): Promise<void> {
    try {
      const recentMetrics = await prisma.$queryRaw`
        SELECT value
        FROM performance_metrics
        WHERE staff_id = ${staffId}
          AND type = ${metricType}
          AND timestamp >= ${subDays(new Date(), 30)}
        ORDER BY timestamp DESC
      `;

      const average =
        recentMetrics.reduce((sum: number, metric: { value: number }) => sum + metric.value, 0) /
        (recentMetrics.length || 1);

      await prisma.$executeRaw`
        INSERT INTO staff_performance (staff_id, ${Prisma.raw(`${metricType}_average`)}, updated_at)
        VALUES (${staffId}, ${average}, ${new Date()})
        ON CONFLICT (staff_id)
        DO UPDATE SET
          ${Prisma.raw(`${metricType}_average`)} = ${average},
          updated_at = ${new Date()}
      `;
    } catch (error) {
      logger.error('Failed to update rolling averages', 'StaffManagement', { error });
    }
  }

  private async checkGoalProgress(
    staffId: string,
    metrics: { type: string; value: number },
  ): Promise<void> {
    try {
      const activeGoals = await prisma.staffGoal.findMany({
        where: {
          staffId,
          status: 'IN_PROGRESS',
          type: metrics.type,
        },
      });

      for (const goal of activeGoals) {
        const newCurrent = goal.current + metrics.value;
        const status = newCurrent >= goal.target ? 'COMPLETED' : 'IN_PROGRESS';

        await prisma.staffGoal.update({
          where: { id: goal.id },
          data: {
            current: newCurrent,
            status,
          },
        });

        if (status === 'COMPLETED') {
          await this.notifyStaffMember(staffId, {
            type: 'GOAL_COMPLETED',
            message: `Congratulations! You've achieved your goal: ${goal.description}`,
            data: { goalId: goal.id },
          });
        }
      }
    } catch (error) {
      logger.error('Failed to check goal progress', 'StaffManagement', { error });
      // Don't throw to prevent disrupting the main flow
    }
  }

  private calculateAverageMetric(
    metrics: StaffAnalytics[],
    key: keyof StaffAnalytics['performance'],
  ): number {
    const values = metrics.map((m) => m.performance[key]);
    return values.reduce((sum: number, val: number) => sum + val, 0) / values.length;
  }

  private async calculateTeamCollaboration(
    teamId: string,
    period: { start: Date; end: Date },
  ): Promise<number> {
    try {
      const [messages, handovers] = await Promise.all([
        prisma.message.count({
          where: {
            teamId,
            createdAt: {
              gte: period.start,
              lte: period.end,
            },
          },
        }),
        prisma.shiftHandover.count({
          where: {
            shift: {
              staff: {
                teamId,
              },
            },
            createdAt: {
              gte: period.start,
              lte: period.end,
            },
          },
        }),
      ]);

      const teamSize = await prisma.staff.count({ where: { teamId } });
      const expectedInteractions = teamSize * 2 * differenceInDays(period.end, period.start);
      const actualInteractions = messages + handovers;

      return Math.min(actualInteractions / expectedInteractions, 1);
    } catch (error) {
      logger.error('Failed to calculate team collaboration', 'StaffManagement', { error });
      return 0;
    }
  }

  private async calculateTeamGoalCompletion(
    teamId: string,
    period: { start: Date; end: Date },
  ): Promise<number> {
    try {
      const goals = await prisma.staffGoal.findMany({
        where: {
          staff: {
            teamId,
          },
          deadline: {
            gte: period.start,
            lte: period.end,
          },
        },
      });

      if (goals.length === 0) return 0;

      const completedGoals = goals.filter((g) => g.status === 'COMPLETED').length;
      return completedGoals / goals.length;
    } catch (error) {
      logger.error('Failed to calculate team goal completion', 'StaffManagement', { error });
      return 0;
    }
  }

  private async initializeGoalTracking(goalId: string): Promise<void> {
    try {
      // Set up any necessary tracking or notifications
      // This is a placeholder for more complex initialization logic
      logger.info('Initialized goal tracking', 'StaffManagement', { goalId });
    } catch (error) {
      logger.error('Failed to initialize goal tracking', 'StaffManagement', { error });
      // Don't throw to prevent disrupting the main flow
    }
  }

  /**
   * Sends a message to staff member(s)
   */
  async sendMessage(
    senderId: string,
    message: {
      content: string;
      recipientId?: string;
      teamId?: string;
      type: 'DIRECT' | 'TEAM' | 'ANNOUNCEMENT';
      attachments?: string[];
    },
  ): Promise<Message> {
    try {
      if (!message.recipientId && !message.teamId) {
        throw new Error('Either recipientId or teamId must be provided');
      }

      const newMessage = await prisma.message.create({
        data: {
          senderId,
          recipientId: message.recipientId,
          teamId: message.teamId,
          type: message.type,
          content: message.content,
          attachments: message.attachments,
          readBy: [senderId],
          createdAt: new Date(),
        },
      });

      // Send notifications
      if (message.type === 'DIRECT' && message.recipientId) {
        await this.notifyStaffMember(message.recipientId, {
          type: 'NEW_MESSAGE',
          message: `New message from ${senderId}`,
          data: { messageId: newMessage.id },
        });
      } else if (message.type === 'TEAM' && message.teamId) {
        const teamMembers = await prisma.staff.findMany({
          where: { teamId: message.teamId },
        });

        await Promise.all(
          teamMembers
            .filter((member) => member.id !== senderId)
            .map((member) =>
              this.notifyStaffMember(member.id, {
                type: 'NEW_TEAM_MESSAGE',
                message: `New team message from ${senderId}`,
                data: { messageId: newMessage.id },
              }),
            ),
        );
      }

      logger.info('Sent message', 'StaffManagement', {
        senderId,
        type: message.type,
        recipientId: message.recipientId,
        teamId: message.teamId,
      });

      return newMessage as Message;
    } catch (error) {
      logger.error('Failed to send message', 'StaffManagement', { error });
      throw error;
    }
  }

  /**
   * Creates a shift handover note
   */
  async createHandover(
    staffId: string,
    handover: {
      shiftId: string;
      notes: string;
      tasks: {
        completed: string[];
        pending: string[];
      };
      incidents?: string[];
    },
  ): Promise<ShiftHandover> {
    try {
      const newHandover = await prisma.shiftHandover.create({
        data: {
          staffId,
          shiftId: handover.shiftId,
          notes: handover.notes,
          tasks: handover.tasks,
          incidents: handover.incidents,
          createdAt: new Date(),
        },
      });

      // Notify next shift staff
      const nextShift = await prisma.schedule.findFirst({
        where: {
          startTime: {
            gt: new Date(),
          },
        },
        orderBy: {
          startTime: 'asc',
        },
      });

      if (nextShift) {
        await this.notifyStaffMember(nextShift.staffId, {
          type: 'NEW_HANDOVER',
          message: 'New shift handover note available',
          data: { handoverId: newHandover.id },
        });
      }

      logger.info('Created shift handover', 'StaffManagement', {
        staffId,
        shiftId: handover.shiftId,
      });

      return newHandover as ShiftHandover;
    } catch (error) {
      logger.error('Failed to create handover', 'StaffManagement', { error });
      throw error;
    }
  }

  /**
   * Manages tasks
   */
  async createTask(
    creatorId: string,
    task: {
      title: string;
      description: string;
      assignedTo: string[];
      deadline?: Date;
      priority: 'LOW' | 'MEDIUM' | 'HIGH';
      tags: string[];
    },
  ): Promise<Task> {
    try {
      const newTask = await prisma.task.create({
        data: {
          ...task,
          status: 'TODO',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Notify assigned staff
      await Promise.all(
        task.assignedTo.map((staffId) =>
          this.notifyStaffMember(staffId, {
            type: 'TASK_ASSIGNED',
            message: `You have been assigned a new task: ${task.title}`,
            data: { taskId: newTask.id },
          }),
        ),
      );

      logger.info('Created task', 'StaffManagement', {
        creatorId,
        taskTitle: task.title,
        assignedTo: task.assignedTo,
      });

      return newTask as Task;
    } catch (error) {
      logger.error('Failed to create task', 'StaffManagement', { error });
      throw error;
    }
  }

  /**
   * Updates task status
   */
  async updateTaskStatus(
    taskId: string,
    staffId: string,
    status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED',
  ): Promise<Task> {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          assignedTo: true,
        },
      });

      if (!task) {
        throw new Error('Task not found');
      }

      if (!task.assignedTo.some((assigned) => assigned.id === staffId)) {
        throw new Error('Staff member not assigned to this task');
      }

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          status,
          updatedAt: new Date(),
        },
      });

      if (status === 'COMPLETED') {
        // Notify task creator
        await this.notifyStaffMember(task.creatorId, {
          type: 'TASK_COMPLETED',
          message: `Task "${task.title}" has been completed`,
          data: { taskId },
        });
      }

      logger.info('Updated task status', 'StaffManagement', {
        taskId,
        staffId,
        status,
      });

      return updatedTask as Task;
    } catch (error) {
      logger.error('Failed to update task status', 'StaffManagement', { error });
      throw error;
    }
  }

  /**
   * Gets tasks for a staff member
   */
  async getStaffTasks(
    staffId: string,
    filters?: {
      status?: Task['status'];
      priority?: Task['priority'];
      tags?: string[];
      deadline?: Date;
    },
  ): Promise<Task[]> {
    try {
      const tasks = await prisma.task.findMany({
        where: {
          assignedTo: {
            some: {
              id: staffId,
            },
          },
          ...(filters?.status && { status: filters.status }),
          ...(filters?.priority && { priority: filters.priority }),
          ...(filters?.tags && { tags: { hasEvery: filters.tags } }),
          ...(filters?.deadline && {
            deadline: {
              lte: filters.deadline,
            },
          }),
        },
        orderBy: [{ priority: 'desc' }, { deadline: 'asc' }, { createdAt: 'desc' }],
      });

      return tasks as Task[];
    } catch (error) {
      logger.error('Failed to get staff tasks', 'StaffManagement', { error });
      throw error;
    }
  }

  /**
   * Gets service bookings for a staff member
   */
  private async getServiceBookings(
    staffId: string,
    period: { start: Date; end: Date },
  ): Promise<any[]> {
    return prisma.serviceBooking.findMany({
      where: {
        providerId: staffId,
        createdAt: {
          gte: period.start,
          lte: period.end,
        },
      },
      include: {
        service: true,
        payment: {
          select: {
            amount: true,
            currency: true,
          },
        },
      },
    });
  }

  /**
   * Gets product sales for a staff member
   */
  private async getProductSales(
    staffId: string,
    period: { start: Date; end: Date },
  ): Promise<any[]> {
    return prisma.productSale.findMany({
      where: {
        staffId,
        createdAt: {
          gte: period.start,
          lte: period.end,
        },
      },
      include: {
        product: true,
        payment: {
          select: {
            amount: true,
            currency: true,
          },
        },
      },
    });
  }

  /**
   * Calculates commission for services
   */
  private calculateServiceCommission(bookings: any[]): number {
    return bookings.reduce((total, booking) => {
      const commissionRate = 0.2; // 20% commission rate
      const amount = booking.payment?.amount || 0;
      return total + amount * commissionRate;
    }, 0);
  }

  /**
   * Calculates commission for product sales
   */
  private calculateProductCommission(sales: any[]): number {
    return sales.reduce((total, sale) => {
      const commissionRate = 0.1; // 10% commission rate
      const amount = sale.payment?.amount || 0;
      return total + amount * commissionRate;
    }, 0);
  }

  /**
   * Calculates bonus commission based on performance
   */
  private async calculateBonusCommission(
    staffId: string,
    period: { start: Date; end: Date },
  ): Promise<number> {
    const performance = await this.analyzePerformance(staffId);
    const bonusThreshold = 0.8; // 80% performance threshold
    const bonusAmount = 100; // $100 bonus

    return performance.performance.efficiency >= bonusThreshold ? bonusAmount : 0;
  }

  /**
   * Creates a commission record
   */
  private async createCommissionRecord(
    staffId: string,
    type: 'SERVICE' | 'PRODUCT_SALE' | 'BONUS',
    amount: number,
  ): Promise<void> {
    await prisma.commission.create({
      data: {
        staffId,
        type,
        amount,
        date: new Date(),
      },
    });
  }

  async getStaffAvailability(staffId: string): Promise<AvailabilityPreference[]> {
    try {
      const availabilities = await prisma.$queryRaw<AvailabilityPreference[]>`
        SELECT 
          staff_id as "staffId",
          day_of_week as "dayOfWeek",
          start_time as "startTime",
          end_time as "endTime",
          is_preferred as "isPreferred",
          notes
        FROM staff_availability
        WHERE staff_id = ${staffId}
      `;
      return availabilities;
    } catch (error) {
      logger.error('Failed to get staff availability', 'StaffManagement', { error });
      throw error;
    }
  }

  async updateStaffAvailability(availability: AvailabilityPreference): Promise<void> {
    try {
      await prisma.$executeRaw`
        INSERT INTO staff_availability (
          staff_id,
          day_of_week,
          start_time,
          end_time,
          is_preferred,
          notes
        ) VALUES (
          ${availability.staffId},
          ${availability.dayOfWeek},
          ${availability.startTime},
          ${availability.endTime},
          ${availability.isPreferred},
          ${availability.notes || null}
        )
        ON CONFLICT (staff_id, day_of_week)
        DO UPDATE SET
          start_time = ${availability.startTime},
          end_time = ${availability.endTime},
          is_preferred = ${availability.isPreferred},
          notes = ${availability.notes || null}
      `;
    } catch (error) {
      logger.error('Failed to update staff availability', 'StaffManagement', { error });
      throw error;
    }
  }

  async getSchedule(staffId: string, startDate: Date, endDate: Date) {
    try {
      return await prisma.$queryRaw`
        SELECT *
        FROM schedule
        WHERE staff_id = ${staffId}
          AND start_time >= ${startDate}
          AND end_time <= ${endDate}
      `;
    } catch (error) {
      logger.error('Failed to get schedule', 'StaffManagement', { error });
      throw error;
    }
  }
}
