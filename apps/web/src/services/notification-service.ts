/**

 * Notification Service
 * Handles notifications across the application
 */


import { PrismaClient, ServiceBooking, NotificationType, NotificationStatus } from '@prisma/client';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

import { logger } from '@/lib/logger';

import { EmailService } from '@/lib/email';

import { PushNotificationService } from '@/lib/push-notifications';
import {
  pointsExpiringTemplate,
  pointMultiplierTemplate,
  rewardUnlockedTemplate,
  seasonalChallengeTemplate,


} from '../templates/loyalty-email-templates';

const prisma = new PrismaClient();

// Initialize Twilio client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}

interface NotificationPreference {
  userId: string;
  type: NotificationType;
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export class NotificationService {
  async notifyUser(userId: string, payload: NotificationPayload): Promise<void> {
    try {
      // Create notification record
      const notification = await prisma.notification.create({
        data: {
          userId,
          type: payload.type,
          title: payload.title,
          message: payload.message,
          data: payload.data,
          status: NotificationStatus.PENDING,
        },
      });

      // Get user's notification preferences
      const preferences = await prisma.notificationPreferences.findUnique({
        where: { userId },
      });

      if (!preferences) {
        logger.warn('User has no notification preferences', 'NotificationService', { userId });
        return;
      }

      // Check if user has enabled this type of notification
      if (!this.isNotificationEnabled(preferences, payload.type)) {
        logger.info('Notification type disabled by user', 'NotificationService', {
          userId,
          type: payload.type,
        });
        return;
      }

      // Send push notification if enabled
      if (preferences.pushEnabled) {
        await this.sendPushNotification(userId, payload);
      }

      // Send email notification if enabled
      if (preferences.emailEnabled) {
        await this.sendEmailNotification(userId, payload);
      }

      // Send SMS notification if enabled
      if (preferences.smsEnabled) {
        await this.sendSMSNotification(userId, payload);
      }

      // Update notification status
      await prisma.notification.update({
        where: { id: notification.id },
        data: { status: NotificationStatus.DELIVERED },
      });

      logger.info('Notification sent successfully', 'NotificationService', {
        userId,
        notificationId: notification.id,
      });
    } catch (error) {
      logger.error('Failed to send notification', 'NotificationService', { error });
      throw error;
    }
  }

  private isNotificationEnabled(preferences: any, type: NotificationType): boolean {
    switch (type) {
      case NotificationType.SYSTEM:
        return preferences.systemNotifications;
      case NotificationType.BOOKING:
        return preferences.bookingNotifications;
      case NotificationType.LOYALTY:
        return preferences.loyaltyNotifications;
      case NotificationType.MARKETING:
        return preferences.marketingNotifications;
      default:
        return true;
    }
  }

  private async sendPushNotification(userId: string, payload: NotificationPayload): Promise<void> {
    try {
      // Get user's push tokens
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { pushTokens: true },
      });

      if (!user.pushTokens.length) {
        return;
      }

      // Implement push notification using Firebase Cloud Messaging
      const pushService = new PushNotificationService();

      // Send notifications to all user devices
      await Promise.all(
        user.pushTokens.map((token) =>
          pushService.sendNotification({
            token,
            title: payload.title,
            body: payload.message,
            data: payload.data || {},
            type: payload.type,
          }),
        ),
      );

      logger.info('Push notification sent', 'NotificationService', {
        userId,
        tokenCount: user.pushTokens.length,
      });
    } catch (error) {
      logger.error('Failed to send push notification', 'NotificationService', { error });
    }
  }

  private async sendEmailNotification(userId: string, payload: NotificationPayload): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });

      if (!user.email) {
        return;
      }

      const emailService = new EmailService();

      // Prepare email content based on notification type
      const subject = payload.title;
      let template = '';

      switch (payload.type) {
        case 'BOOKING':

          template = 'booking-notification';
          break;
        case 'LOYALTY':

          template = 'loyalty-notification';
          break;
        case 'MARKETING':

          template = 'marketing-notification';
          break;
        case 'SYSTEM':
        default:

          template = 'system-notification';
          break;
      }

      // Send email through email service
      await emailService.sendEmail({
        to: user.email,
        subject,
        template,
        data: {
          userName: user.name || 'Valued Customer',
          message: payload.message,
          ...payload.data,
        },
      });

      logger.info('Email notification sent', 'NotificationService', {
        userId,
        email: user.email,
        notificationType: payload.type,
      });
    } catch (error) {
      logger.error('Failed to send email notification', 'NotificationService', { error });
    }
  }

  private async sendSMSNotification(userId: string, payload: NotificationPayload): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { phone: true },
      });

      if (!user.phone) {
        return;
      }

      // Format phone number to E.164 format if needed
      const formattedPhone = user.phone.startsWith('+') ? user.phone : `+${user.phone}`;

      // Send SMS using Twilio
      await twilioClient.messages.create({
        body: `${payload.title}: ${payload.message}`,
        from: process.env.TWILIO_PHONE_NUMBER || '',
        to: formattedPhone,
      });

      logger.info('SMS notification sent', 'NotificationService', {
        userId,
        phone: formattedPhone,
      });
    } catch (error) {
      logger.error('Failed to send SMS notification', 'NotificationService', { error });
    }
  }

  async sendBulkNotifications(userIds: string[], notification: NotificationData) {
    try {
      const notifications = await Promise.all(
        userIds.map((userId) => this.notifyUser(userId, notification as NotificationPayload)),
      );

      logger.info(`Sent bulk notifications`, {
        userCount: userIds.length,
        type: notification.type,
      });

      return notifications;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error sending bulk notifications: ${errorMessage}`);
      throw error;
    }
  }

  async scheduleNotification(userId: string, notification: NotificationData, scheduledFor: Date) {
    try {
      const scheduledNotification = await prisma.scheduledNotification.create({
        data: {
          userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data || {},
          scheduledFor,
          status: 'SCHEDULED',
        },
      });

      logger.info(`Scheduled notification`, {
        userId,
        notificationId: scheduledNotification.id,
        scheduledFor,
      });

      return scheduledNotification;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error scheduling notification: ${errorMessage}`);
      throw error;
    }
  }

  async getUserPreferences(userId: string): Promise<NotificationPreference> {
    try {
      const preferences = await prisma.notificationPreferences.findUnique({
        where: { userId },
      });

      // Return default preferences if none are set
      if (!preferences) {
        return {
          userId,
          type: 'ALL',
          email: true,
          push: true,
          sms: false,
        };
      }

      return preferences;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error getting user preferences: ${errorMessage}`);
      throw error;
    }
  }

  async updateUserPreferences(userId: string, preferences: Partial<NotificationPreference>) {
    try {
      const updatedPreferences = await prisma.notificationPreferences.upsert({
        where: { userId },
        create: {
          userId,
          ...preferences,
        },
        update: preferences,
      });

      logger.info(`Updated notification preferences`, {
        userId,
        preferences: updatedPreferences,
      });

      return updatedPreferences;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error updating user preferences: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Get user's notifications
   */
  async getUserNotifications(
    userId: string,
    options: {
      unreadOnly?: boolean;
      limit?: number;
      offset?: number;
    } = {},
  ) {
    try {
      const { unreadOnly = false, limit = 10, offset = 0 } = options;

      return await prisma.notification.findMany({
        where: {
          userId,
          ...(unreadOnly && { read: false }),
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      });
    } catch (error) {
      logger.error('Error getting user notifications', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string) {
    try {
      return await prisma.notification.update({
        where: { id: notificationId },
        data: {
          read: true,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error('Error marking notification as read', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string) {
    try {
      return await prisma.notification.updateMany({
        where: {
          userId,
          read: false,
        },
        data: {
          read: true,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error('Error marking all notifications as read', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string) {
    try {
      return await prisma.notification.delete({
        where: { id: notificationId },
      });
    } catch (error) {
      logger.error('Error deleting notification', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      return await prisma.notification.count({
        where: {
          userId,
          read: false,
        },
      });
    } catch (error) {
      logger.error('Error getting unread notification count', error);
      throw error;
    }
  }

  /**
   * Send booking confirmation
   */
  async sendBookingConfirmation(booking: ServiceBooking): Promise<void> {
    try {
      const user = await this.getUser(booking.userId);

      if (!user) {
        throw new Error('User not found');
      }

      const message = {
        title: 'Booking Confirmed',
        body: `Your booking for ${booking.services.length} service(s) on ${booking.startTime.toLocaleDateString()} has been confirmed.`,
        data: {
          bookingId: booking.id,
          type: 'BOOKING_CONFIRMATION',
        },
      };

      // Send email notification
      if (user.preferences.emailEnabled) {
        await EmailService.send({
          to: user.email!,
          subject: 'Booking Confirmation',

          template: 'booking-confirmation',
          data: {
            userName: user.name,
            bookingDetails: {
              services: booking.services,
              date: booking.startTime.toLocaleDateString(),
              time: booking.startTime.toLocaleTimeString(),
            },
          },
        });
      }

      // Send push notification
      if (user.preferences.pushEnabled) {
        await this.notifyUser(user.id, message as NotificationPayload);
      }

      // Create notification record
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: NotificationType.BOOKING_CONFIRMATION,
          title: message.title,
          body: message.body,
          data: message.data,
        },
      });
    } catch (error) {
      logger.error('Error sending booking confirmation:', error);
      throw error;
    }
  }

  /**
   * Send waitlist confirmation
   */
  async sendWaitlistConfirmation(userId: string, serviceId: string): Promise<void> {
    try {
      const [user, service] = await Promise.all([
        this.getUser(userId),
        prisma.beautyService.findUnique({
          where: { id: serviceId },
        }),
      ]);

      if (!user || !service) {
        throw new Error('User or service not found');
      }

      const message = {
        title: 'Added to Waitlist',
        body: `You've been added to the waitlist for ${service.name}. We'll notify you when a slot becomes available.`,
        data: {
          serviceId,
          type: 'WAITLIST_CONFIRMATION',
        },
      };

      // Send email notification
      if (user.preferences.emailEnabled) {
        await EmailService.send({
          to: user.email!,
          subject: 'Waitlist Confirmation',

          template: 'waitlist-confirmation',
          data: {
            userName: user.name,
            serviceName: service.name,
          },
        });
      }

      // Send push notification
      if (user.preferences.pushEnabled) {
        await this.notifyUser(user.id, message as NotificationPayload);
      }

      // Create notification record
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: NotificationType.WAITLIST_CONFIRMATION,
          title: message.title,
          body: message.body,
          data: message.data,
        },
      });
    } catch (error) {
      logger.error('Error sending waitlist confirmation:', error);
      throw error;
    }
  }

  /**
   * Send waitlist notification
   */
  async sendWaitlistNotification(
    userId: string,
    serviceId: string,
    availableSlot: Date,
  ): Promise<void> {
    try {
      const [user, service] = await Promise.all([
        this.getUser(userId),
        prisma.beautyService.findUnique({
          where: { id: serviceId },
        }),
      ]);

      if (!user || !service) {
        throw new Error('User or service not found');
      }

      const message = {
        title: 'Slot Available',
        body: `A slot is now available for ${service.name} on ${availableSlot.toLocaleDateString()} at ${availableSlot.toLocaleTimeString()}. Book now!`,
        data: {
          serviceId,
          availableSlot: availableSlot.toISOString(),
          type: 'WAITLIST_SLOT_AVAILABLE',
        },
      };

      // Send email notification
      if (user.preferences.emailEnabled) {
        await EmailService.send({
          to: user.email!,
          subject: 'Waitlist Slot Available',

          template: 'waitlist-slot-available',
          data: {
            userName: user.name,
            serviceName: service.name,
            date: availableSlot.toLocaleDateString(),
            time: availableSlot.toLocaleTimeString(),
          },
        });
      }

      // Send push notification
      if (user.preferences.pushEnabled) {
        await this.notifyUser(user.id, message as NotificationPayload);
      }

      // Create notification record
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: NotificationType.WAITLIST_SLOT_AVAILABLE,
          title: message.title,
          body: message.body,
          data: message.data,
        },
      });
    } catch (error) {
      logger.error('Error sending waitlist notification:', error);
      throw error;
    }
  }

  async sendPointsExpiringNotification(userId: string, points: number, daysUntilExpiry: number) {
    const user = await this.getUser(userId);
    if (!user || !user.email) return;

    const emailContent = pointsExpiringTemplate(points, daysUntilExpiry);
    await this.notifyUser(user.id, {
      type: 'LOYALTY',
      title: 'Your Points Are About to Expire!',
      message: emailContent,
    } as NotificationPayload);

    // Send push notification if enabled
    if (user.preferences.pushEnabled) {
      await this.notifyUser(user.id, {
        type: 'LOYALTY',
        title: 'Points Expiring Soon',
        body: `${points} points will expire in ${daysUntilExpiry} days. Use them now!`,
      } as NotificationPayload);
    }
  }

  async sendPointMultiplierNotification(userId: string, multiplier: number, endDate: Date) {
    const user = await this.getUser(userId);
    if (!user || !user.email) return;

    const formattedDate = endDate.toLocaleDateString();
    const emailContent = pointMultiplierTemplate(multiplier, formattedDate);
    await this.notifyUser(user.id, {
      type: 'LOYALTY',
      title: `${multiplier}x Points Event!`,
      message: emailContent,
    } as NotificationPayload);

    if (user.preferences.pushEnabled) {
      await this.notifyUser(user.id, {
        type: 'LOYALTY',
        title: 'Points Multiplier Event',
        body: `Earn ${multiplier}x points on all services until ${formattedDate}!`,
      } as NotificationPayload);
    }
  }

  async sendRewardUnlockedNotification(userId: string, rewardName: string, pointsCost: number) {
    const user = await this.getUser(userId);
    if (!user || !user.email) return;

    const emailContent = rewardUnlockedTemplate(rewardName, pointsCost);
    await this.notifyUser(user.id, {
      type: 'LOYALTY',
      title: 'New Reward Unlocked! 🎉',
      message: emailContent,
    } as NotificationPayload);

    if (user.preferences.pushEnabled) {
      await this.notifyUser(user.id, {
        type: 'LOYALTY',
        title: 'New Reward Unlocked!',
        body: `You've unlocked ${rewardName}! Redeem now for ${pointsCost} points.`,
      } as NotificationPayload);
    }
  }

  async sendSeasonalChallengeNotification(userId: string, challengeName: string, reward: string) {
    const user = await this.getUser(userId);
    if (!user || !user.email) return;

    const emailContent = seasonalChallengeTemplate(challengeName, reward);
    await this.notifyUser(user.id, {
      type: 'LOYALTY',
      title: 'New Seasonal Challenge Available!',
      message: emailContent,
    } as NotificationPayload);

    if (user.preferences.pushEnabled) {
      await this.notifyUser(user.id, {
        type: 'LOYALTY',
        title: 'New Seasonal Challenge',
        body: `Complete "${challengeName}" to earn ${reward}!`,
      } as NotificationPayload);
    }
  }

  private async getUser(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        preferences: true, // Assuming we have a preferences relation
      },
    });
  }
}

// Export as default
export default NotificationService;
