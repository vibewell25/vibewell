import { createClient } from '@supabase/supabase-js';
import { RecommendationService } from './recommendation-service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
      const { data, error } = await supabase
        .from('try_on_sessions')
        .insert({
          user_id: userId,
          product_id: productId,
          completed: false,
        })
        .select('id')
        .single();
      
      if (error) throw error;
      
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
      const { error } = await supabase
        .from('try_on_sessions')
        .update({
          completed: true,
          duration_seconds: data.duration_seconds,
          screenshots: data.screenshots,
          feedback: data.feedback,
        })
        .eq('id', sessionId)
        .eq('user_id', userId);
      
      if (error) throw error;
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
      const { error } = await supabase
        .from('try_on_sessions')
        .update({
          feedback,
        })
        .eq('id', sessionId)
        .eq('user_id', userId);
      
      if (error) throw error;
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
      const { data, error } = await supabase
        .from('try_on_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TryOnSession[];
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
      const { data, error } = await supabase
        .from('try_on_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned (PGRST116 = no rows)
          return null;
        }
        throw error;
      }
      
      return data as TryOnSession;
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
      const startTimestamp = startDate.toISOString();
      const endTimestamp = endDate.toISOString();
      
      const { data, error } = await supabase
        .from('try_on_sessions')
        .select('*')
        .gte('created_at', startTimestamp)
        .lte('created_at', endTimestamp)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TryOnSession[];
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
      const startTimestamp = startDate.toISOString();
      const endTimestamp = endDate.toISOString();
      
      // Get all sessions in the date range
      const { data, error } = await supabase
        .from('try_on_sessions')
        .select('*')
        .gte('created_at', startTimestamp)
        .lte('created_at', endTimestamp);
      
      if (error) throw error;
      
      const sessions = data as TryOnSession[];
      const completedSessions = sessions.filter(s => s.completed);
      
      // Calculate average duration of completed sessions
      const totalDuration = completedSessions.reduce((sum, session) => {
        return sum + (session.duration_seconds || 0);
      }, 0);
      
      const averageDuration = completedSessions.length > 0 
        ? totalDuration / completedSessions.length 
        : 0;
      
      // Count sessions by product
      const productBreakdown: Record<string, number> = {};
      sessions.forEach(session => {
        productBreakdown[session.product_id] = (productBreakdown[session.product_id] || 0) + 1;
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