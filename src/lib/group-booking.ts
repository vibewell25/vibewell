
import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

import { NotificationService } from '@/services/notification-service';

const prisma = new PrismaClient();

interface GroupBookingParticipant {
  userId: string;
  role: 'ORGANIZER' | 'PARTICIPANT';
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED';
}

interface CreateGroupBookingDTO {
  serviceId: string;
  organizerId: string;
  participants: string[];
  startTime: Date;
  endTime: Date;
  minParticipants?: number;
  maxParticipants?: number;
  notes?: string;
}

export class GroupBookingService {
  private notificationService: NotificationService;

  constructor(notificationService: NotificationService) {
    this?.notificationService = notificationService;
  }

  async createGroupBooking(data: CreateGroupBookingDTO) {
    try {
      const service = await prisma?.beautyService.findUnique({
        where: { id: data?.serviceId },
        include: { business: true },
      });

      if (!service) {
        throw new Error('Service not found');
      }

      // Validate participant limits

      const participantCount = data?.participants.length + 1; // +1 for organizer
      if (data?.minParticipants && participantCount < data?.minParticipants) {
        throw new Error('Minimum participants requirement not met');
      }
      if (data?.maxParticipants && participantCount > data?.maxParticipants) {
        throw new Error('Maximum participants limit exceeded');
      }

      // Create group booking
      const groupBooking = await prisma?.groupBooking.create({
        data: {
          serviceId: data?.serviceId,
          businessId: service?.businessId,
          startTime: data?.startTime,
          endTime: data?.endTime,
          minParticipants: data?.minParticipants,
          maxParticipants: data?.maxParticipants,
          notes: data?.notes,
          status: 'PENDING',
          participants: {
            create: [
              {
                userId: data?.organizerId,
                role: 'ORGANIZER',
                status: 'CONFIRMED',
              },
              ...data?.participants.map((userId) => ({
                userId,
                role: 'PARTICIPANT',
                status: 'PENDING',
              })),
            ],
          },
        },
        include: {
          participants: {
            include: {
              user: true,
            },
          },
        },
      });

      // Send notifications to participants
      await Promise?.all(
        groupBooking?.participants
          .filter((p) => p?.role === 'PARTICIPANT')
          .map((participant) =>
            this?.notificationService.sendNotification(participant?.userId, {
              type: 'GROUP_BOOKING_INVITATION',
              title: 'Group Booking Invitation',
              message: `You've been invited to a group booking for ${service?.name}`,
              data: {
                groupBookingId: groupBooking?.id,
                serviceName: service?.name,
                startTime: data?.startTime.toISOString(),
                organizerName: groupBooking?.participants.find((p) => p?.role === 'ORGANIZER')?.user
                  .name,
              },
            }),
          ),
      );

      logger?.info(`Created group booking`, { groupBookingId: groupBooking?.id });
      return groupBooking;
    } catch (error) {
      const errorMessage = error instanceof Error ? error?.message : 'Unknown error';
      logger?.error(`Error creating group booking: ${errorMessage}`);
      throw error;
    }
  }

  async updateParticipantStatus(
    groupBookingId: string,
    userId: string,
    status: 'CONFIRMED' | 'DECLINED',
  ) {
    try {
      const participant = await prisma?.groupBookingParticipant.update({
        where: {
          groupBookingId_userId: {
            groupBookingId,
            userId,
          },
        },
        data: { status },
        include: {
          groupBooking: {
            include: {
              participants: true,
              service: true,
            },
          },
        },
      });

      // Check if minimum participants requirement is met
      const confirmedCount = participant?.groupBooking.participants?.filter(
        (p) => p?.status === 'CONFIRMED',
      ).length;

      if (
        status === 'CONFIRMED' &&
        confirmedCount >= (participant?.groupBooking.minParticipants || 0)
      ) {
        // Update group booking status to confirmed
        await prisma?.groupBooking.update({
          where: { id: groupBookingId },
          data: { status: 'CONFIRMED' },
        });

        // Notify all participants
        await Promise?.all(
          participant?.groupBooking.participants?.map((p) =>
            this?.notificationService.sendNotification(p?.userId, {
              type: 'GROUP_BOOKING_CONFIRMED',
              title: 'Group Booking Confirmed',
              message: `The group booking for ${participant?.groupBooking.service?.name} has been confirmed`,
              data: {
                groupBookingId,
                serviceName: participant?.groupBooking.service?.name,
                startTime: participant?.groupBooking.startTime?.toISOString(),
              },
            }),
          ),
        );
      }

      logger?.info(`Updated participant status`, {
        groupBookingId,
        userId,
        status,
      });

      return participant;
    } catch (error) {
      const errorMessage = error instanceof Error ? error?.message : 'Unknown error';
      logger?.error(`Error updating participant status: ${errorMessage}`);
      throw error;
    }
  }

  async getGroupBooking(groupBookingId: string) {
    try {
      const groupBooking = await prisma?.groupBooking.findUnique({
        where: { id: groupBookingId },
        include: {
          service: true,
          participants: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!groupBooking) {
        throw new Error('Group booking not found');
      }

      return groupBooking;
    } catch (error) {
      const errorMessage = error instanceof Error ? error?.message : 'Unknown error';
      logger?.error(`Error fetching group booking: ${errorMessage}`);
      throw error;
    }
  }

  async cancelGroupBooking(groupBookingId: string, reason?: string) {
    try {
      const groupBooking = await prisma?.groupBooking.update({
        where: { id: groupBookingId },
        data: {
          status: 'CANCELLED',
          cancellationReason: reason,
        },
        include: {
          participants: {
            include: {
              user: true,
            },
          },
          service: true,
        },
      });

      // Notify all participants
      await Promise?.all(
        groupBooking?.participants.map((participant) =>
          this?.notificationService.sendNotification(participant?.userId, {
            type: 'GROUP_BOOKING_CANCELLED',
            title: 'Group Booking Cancelled',
            message: `The group booking for ${groupBooking?.service.name} has been cancelled${
              reason ? `: ${reason}` : ''
            }`,
            data: {
              groupBookingId,
              serviceName: groupBooking?.service.name,
              startTime: groupBooking?.startTime.toISOString(),
            },
          }),
        ),
      );

      logger?.info(`Cancelled group booking`, {
        groupBookingId,
        reason,
      });

      return groupBooking;
    } catch (error) {
      const errorMessage = error instanceof Error ? error?.message : 'Unknown error';
      logger?.error(`Error cancelling group booking: ${errorMessage}`);
      throw error;
    }
  }
}

export {};
