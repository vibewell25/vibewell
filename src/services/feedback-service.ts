import { createClient } from '@supabase/supabase-js';
import { AnalyticsService } from './analytics-service';

export interface ProductFeedback {
  id?: string;
  userId: string;
  productId: string;
  rating: number;
  wouldTryInRealLife?: boolean;
  comment?: string;
  createdAt?: string;
}

export interface FeedbackStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: Record<number, number>;
  percentWouldTryInRealLife: number;
  recentComments: { comment: string; rating: number; createdAt: string }[];
}

export class FeedbackService {
  private supabase;
  private analyticsService: AnalyticsService;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
    this.analyticsService = new AnalyticsService();
  }

  async submitFeedback(feedback: ProductFeedback): Promise<{ data: any; error: any }> {
    try {
      // Track feedback event in analytics
      this.analyticsService.trackEvent('product_feedback_submitted', {
        productId: feedback.productId,
        rating: feedback.rating,
        wouldTryInRealLife: feedback.wouldTryInRealLife
      });

      // Store feedback in database
      const { data, error } = await this.supabase
        .from('product_feedback')
        .upsert({
          user_id: feedback.userId,
          product_id: feedback.productId,
          rating: feedback.rating,
          would_try_in_real_life: feedback.wouldTryInRealLife,
          comment: feedback.comment,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,product_id'
        });

      return { data, error };
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return { data: null, error };
    }
  }

  async getFeedbackByProduct(productId: string): Promise<{ data: ProductFeedback[]; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('product_feedback')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform to match our interface
      const transformedData = (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        productId: item.product_id,
        rating: item.rating,
        wouldTryInRealLife: item.would_try_in_real_life,
        comment: item.comment,
        createdAt: item.created_at
      }));

      return { data: transformedData, error: null };
    } catch (error) {
      console.error('Error fetching product feedback:', error);
      return { data: [], error };
    }
  }

  async getFeedbackByUser(userId: string): Promise<{ data: ProductFeedback[]; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('product_feedback')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform to match our interface
      const transformedData = (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        productId: item.product_id,
        rating: item.rating,
        wouldTryInRealLife: item.would_try_in_real_life,
        comment: item.comment,
        createdAt: item.created_at
      }));

      return { data: transformedData, error: null };
    } catch (error) {
      console.error('Error fetching user feedback:', error);
      return { data: [], error };
    }
  }

  async getProductFeedbackStats(productId: string): Promise<{ data: FeedbackStats | null; error: any }> {
    try {
      const { data: feedbackData, error } = await this.getFeedbackByProduct(productId);
      
      if (error) throw error;
      if (!feedbackData || feedbackData.length === 0) {
        return { 
          data: {
            averageRating: 0,
            totalRatings: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            percentWouldTryInRealLife: 0,
            recentComments: []
          }, 
          error: null 
        };
      }

      // Calculate stats
      const totalRatings = feedbackData.length;
      const sumRatings = feedbackData.reduce((sum, item) => sum + item.rating, 0);
      const averageRating = sumRatings / totalRatings;
      
      // Calculate rating distribution
      const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      feedbackData.forEach(item => {
        if (item.rating >= 1 && item.rating <= 5) {
          ratingDistribution[item.rating] = (ratingDistribution[item.rating] || 0) + 1;
        }
      });
      
      // Calculate percent who would try in real life
      const wouldTryCount = feedbackData.filter(item => item.wouldTryInRealLife === true).length;
      const percentWouldTryInRealLife = (wouldTryCount / totalRatings) * 100;
      
      // Get recent comments
      const recentComments = feedbackData
        .filter(item => item.comment && item.comment.trim() !== '')
        .slice(0, 5)
        .map(item => ({
          comment: item.comment || '',
          rating: item.rating,
          createdAt: item.createdAt || ''
        }));
      
      return {
        data: {
          averageRating,
          totalRatings,
          ratingDistribution,
          percentWouldTryInRealLife,
          recentComments
        },
        error: null
      };
    } catch (error) {
      console.error('Error calculating product feedback stats:', error);
      return { data: null, error };
    }
  }

  async getAllFeedbackStats(): Promise<{ data: Record<string, FeedbackStats>; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('product_feedback')
        .select('*');

      if (error) throw error;

      // Group feedback by product
      const feedbackByProduct: Record<string, ProductFeedback[]> = {};
      
      (data || []).forEach(item => {
        const feedback: ProductFeedback = {
          id: item.id,
          userId: item.user_id,
          productId: item.product_id,
          rating: item.rating,
          wouldTryInRealLife: item.would_try_in_real_life,
          comment: item.comment,
          createdAt: item.created_at
        };
        
        if (!feedbackByProduct[item.product_id]) {
          feedbackByProduct[item.product_id] = [];
        }
        
        feedbackByProduct[item.product_id].push(feedback);
      });

      // Calculate stats for each product
      const allStats: Record<string, FeedbackStats> = {};
      
      for (const [productId, feedbackList] of Object.entries(feedbackByProduct)) {
        const totalRatings = feedbackList.length;
        const sumRatings = feedbackList.reduce((sum, item) => sum + item.rating, 0);
        const averageRating = sumRatings / totalRatings;
        
        // Calculate rating distribution
        const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        feedbackList.forEach(item => {
          if (item.rating >= 1 && item.rating <= 5) {
            ratingDistribution[item.rating] = (ratingDistribution[item.rating] || 0) + 1;
          }
        });
        
        // Calculate percent who would try in real life
        const wouldTryCount = feedbackList.filter(item => item.wouldTryInRealLife === true).length;
        const percentWouldTryInRealLife = (wouldTryCount / totalRatings) * 100;
        
        // Get recent comments
        const recentComments = feedbackList
          .filter(item => item.comment && item.comment.trim() !== '')
          .slice(0, 5)
          .map(item => ({
            comment: item.comment || '',
            rating: item.rating,
            createdAt: item.createdAt || ''
          }));
        
        allStats[productId] = {
          averageRating,
          totalRatings,
          ratingDistribution,
          percentWouldTryInRealLife,
          recentComments
        };
      }
      
      return { data: allStats, error: null };
    } catch (error) {
      console.error('Error calculating all feedback stats:', error);
      return { data: {}, error };
    }
  }
} 