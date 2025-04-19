import { RecommendationService } from './recommendation-service';
import { prisma } from '@/lib/database/client';

interface TryOnSession {
  id: string;
  user_id: string;
  product_id: string;
  duration_seconds?: number;
  completed?: boolean;
  feedback?: TryOnFeedback;
  screenshots?: string[];
  created_at: string;
}

interface TryOnFeedback {
  rating: number; // 1-5 stars
  would_try_in_real_life: boolean;
  comment?: string;
}

export class TryOnService {
  private recommendationService: RecommendationService;
  
  constructor() {
    this.recommendationService = new RecommendationService();
  }
  
  /**
   * Start tracking a new try-on session
   */
  async startSession(userId: string, productId: string): Promise<string> {
    try {
      const data = await prisma.tryOnSession.create({
        data: {
          userId,
          productId,
          completed: false,
        },
        select: {
          id: true
        }
      });
      
      // Increment product view count via recommendation service
      try {
        await this.recommendationService.trackProductView(userId, productId);
      } catch (viewError) {
        console.error('Failed to track product view:', viewError);
        // Continue with session creation even if view tracking fails
      }
      
      return data.id;
    } catch (err) {
      console.error('Error starting try-on session:', err);
      throw err;
    }
  }
  
  /**
   * Update an existing try-on session with completion data
   */
  async completeSession(
    sessionId: string, 
    userId: string,
    data: { 
      duration_seconds?: number, 
      screenshots?: string[],
      feedback?: TryOnFeedback
    }
  ): Promise<void> {
    try {
      await prisma.tryOnSession.updateMany({
        where: {
          id: sessionId,
          userId: userId
        },
        data: {
          completed: true,
          durationSeconds: data.duration_seconds,
          screenshots: data.screenshots,
          feedback: data.feedback as any,
        }
      });
    } catch (err) {
      console.error('Error completing try-on session:', err);
      throw err;
    }
  }
  
  /**
   * Add feedback to a try-on session
   */
  async addFeedback(
    sessionId: string, 
    userId: string, 
    feedback: TryOnFeedback
  ): Promise<void> {
    try {
      await prisma.tryOnSession.updateMany({
        where: {
          id: sessionId,
          userId: userId
        },
        data: {
          feedback: feedback as any,
        }
      });
    } catch (err) {
      console.error('Error adding try-on feedback:', err);
      throw err;
    }
  }
  
  /**
   * Get all try-on sessions for a user
   */
  async getUserSessions(userId: string): Promise<TryOnSession[]> {
    try {
      const sessions = await prisma.tryOnSession.findMany({
        where: {
          userId: userId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      return sessions.map(session => ({
        id: session.id,
        user_id: session.userId,
        product_id: session.productId,
        duration_seconds: session.durationSeconds || undefined,
        completed: session.completed || undefined,
        feedback: session.feedback as TryOnFeedback | undefined,
        screenshots: session.screenshots,
        created_at: session.createdAt.toISOString()
      }));
    } catch (err) {
      console.error('Error getting user try-on sessions:', err);
      return [];
    }
  }
  
  /**
   * Get most recent try-on session for a product
   */
  async getProductSession(userId: string, productId: string): Promise<TryOnSession | null> {
    try {
      const session = await prisma.tryOnSession.findFirst({
        where: {
          userId: userId,
          productId: productId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      if (!session) {
        return null;
      }
      
      return {
        id: session.id,
        user_id: session.userId,
        product_id: session.productId,
        duration_seconds: session.durationSeconds || undefined,
        completed: session.completed || undefined,
        feedback: session.feedback as TryOnFeedback | undefined,
        screenshots: session.screenshots,
        created_at: session.createdAt.toISOString()
      };
    } catch (err) {
      console.error('Error getting product try-on session:', err);
      return null;
    }
  }
  
  /**
   * Get all try-on sessions within a date range
   * Used for analytics and feedback analysis
   */
  async getAllSessions(startDate: Date, endDate: Date): Promise<TryOnSession[]> {
    try {
      const sessions = await prisma.tryOnSession.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      return sessions.map(session => ({
        id: session.id,
        user_id: session.userId,
        product_id: session.productId,
        duration_seconds: session.durationSeconds || undefined,
        completed: session.completed || undefined,
        feedback: session.feedback as TryOnFeedback | undefined,
        screenshots: session.screenshots,
        created_at: session.createdAt.toISOString()
      }));
    } catch (err) {
      console.error('Error getting all try-on sessions:', err);
      return [];
    }
  }
  
  /**
   * Get try-on analytics for admin dashboard
   */
  async getAnalytics(startDate: Date, endDate: Date): Promise<{
    totalSessions: number;
    completedSessions: number;
    averageDuration: number;
    productBreakdown: Record<string, number>;
  }> {
    try {
      const sessions = await prisma.tryOnSession.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      });
      
      const completedSessions = sessions.filter(s => s.completed);
      
      const totalDuration = completedSessions.reduce((sum, session) => {
        return sum + (session.durationSeconds || 0);
      }, 0);
      
      const averageDuration = completedSessions.length > 0 
        ? totalDuration / completedSessions.length 
        : 0;
      
      const productBreakdown: Record<string, number> = {};
      sessions.forEach(session => {
        productBreakdown[session.productId] = (productBreakdown[session.productId] || 0) + 1;
      });
      
      return {
        totalSessions: sessions.length,
        completedSessions: completedSessions.length,
        averageDuration,
        productBreakdown,
      };
    } catch (err) {
      console.error('Error getting try-on analytics:', err);
      return {
        totalSessions: 0,
        completedSessions: 0,
        averageDuration: 0,
        productBreakdown: {},
      };
    }
  }
} 