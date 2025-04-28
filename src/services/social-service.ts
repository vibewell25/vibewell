import { PrismaClient } from '@prisma/client';
import { NotificationService } from './notification-service';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  capacity: number;
  price: number;
  type: 'workshop' | 'class' | 'seminar' | 'social';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  attendees: string[];
  waitlist: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  media?: string[];
  likes: number;
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SocialService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * Create a new event
   */
  async createEvent(
    data: Omit<Event, 'id' | 'status' | 'attendees' | 'waitlist' | 'createdAt' | 'updatedAt'>,
  ) {
    try {
      const event = await prisma.event.create({
        data: {
          ...data,
          status: 'upcoming',
          attendees: [],
          waitlist: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return event;
    } catch (error) {
      logger.error('Error creating event', 'social', { error });
      throw error;
    }
  }

  /**
   * Register for an event
   */
  async registerForEvent(eventId: string, userId: string) {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        throw new Error('Event not found');
      }

      if (event.attendees.length >= event.capacity) {
        // Add to waitlist
        await prisma.event.update({
          where: { id: eventId },
          data: {
            waitlist: {
              push: userId,
            },
          },
        });

        await this.notificationService.notifyUser(userId, {
          type: 'system',
          subject: 'Added to Waitlist',
          message: `You have been added to the waitlist for ${event.title}`,
        });

        return { status: 'waitlisted' };
      }

      // Add to attendees
      await prisma.event.update({
        where: { id: eventId },
        data: {
          attendees: {
            push: userId,
          },
        },
      });

      await this.notificationService.notifyUser(userId, {
        type: 'system',
        subject: 'Event Registration Confirmed',
        message: `Your registration for ${event.title} has been confirmed`,
      });

      return { status: 'registered' };
    } catch (error) {
      logger.error('Error registering for event', 'social', { error });
      throw error;
    }
  }

  /**
   * Create a social post
   */
  async createPost(data: Omit<Post, 'id' | 'likes' | 'comments' | 'createdAt' | 'updatedAt'>) {
    try {
      const post = await prisma.post.create({
        data: {
          ...data,
          likes: 0,
          comments: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return post;
    } catch (error) {
      logger.error('Error creating post', 'social', { error });
      throw error;
    }
  }

  /**
   * Like a post
   */
  async likePost(postId: string, userId: string) {
    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        throw new Error('Post not found');
      }

      await prisma.post.update({
        where: { id: postId },
        data: {
          likes: {
            increment: 1,
          },
        },
      });

      return { success: true };
    } catch (error) {
      logger.error('Error liking post', 'social', { error });
      throw error;
    }
  }

  /**
   * Comment on a post
   */
  async commentOnPost(postId: string, data: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        throw new Error('Post not found');
      }

      const comment = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await prisma.post.update({
        where: { id: postId },
        data: {
          comments: {
            push: comment,
          },
        },
      });

      return comment;
    } catch (error) {
      logger.error('Error commenting on post', 'social', { error });
      throw error;
    }
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(limit = 10) {
    try {
      const events = await prisma.event.findMany({
        where: {
          status: 'upcoming',
          startDate: {
            gte: new Date(),
          },
        },
        orderBy: {
          startDate: 'asc',
        },
        take: limit,
      });

      return events;
    } catch (error) {
      logger.error('Error getting upcoming events', 'social', { error });
      throw error;
    }
  }

  /**
   * Get user feed
   */
  async getUserFeed(userId: string, limit = 20) {
    try {
      const posts = await prisma.post.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      });

      return posts;
    } catch (error) {
      logger.error('Error getting user feed', 'social', { error });
      throw error;
    }
  }
}
