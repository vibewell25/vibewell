import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

// Define types for analytics events
export type EventName = 
  | 'page_view'
  | 'product_view' 
  | 'product_filter' 
  | 'product_search'
  | 'product_recommendation_click'
  | 'product_try_on'
  | 'product_feedback_submit'
  | 'product_share'
  | 'user_sign_up'
  | 'user_sign_in'
  | 'cart_add'
  | 'cart_remove'
  | 'checkout_start'
  | 'checkout_complete';

// Define interface for event payload
export interface AnalyticsEvent {
  event: EventName;
  user_id?: string;
  session_id: string;
  timestamp: string;
  properties: Record<string, any>;
}

// Define interface for engagement metrics
export interface EngagementMetrics {
  totalSessions: number;
  uniqueUsers: number;
  averageDuration: number;
  successRate: number;
  timeRange: {
    start: string;
    end: string;
  };
  makeupSessions: number;
  hairstyleSessions: number;
  accessorySessions: number;
  socialShares: number;
  emailShares: number;
  downloadShares: number;
  topViewedProducts: Array<{
    product_id: string;
    name: string;
    views: number;
  }>;
  productCategoryBreakdown: Record<string, number>;
}

// Define interface for product metrics
export interface ProductMetrics {
  productId: string;
  totalViews: number;
  uniqueViews: number;
  tryOnCount: number;
  conversionRate: number;
  clickThroughRate: number;
  timeRange: {
    start: string;
    end: string;
  };
}

// Define interface for recommendation metrics
export interface RecommendationMetrics {
  totalRecommendations: number;
  clickThroughRate: number;
  conversionRate: number;
  topRecommendedProducts: Array<{
    product_id: string;
    name: string;
    recommendations: number;
    clicks: number;
  }>;
  timeRange: {
    start: string;
    end: string;
  };
}

interface TryOnSessionData {
  userId: string;
  type: string;
  productId: string;
  productName: string;
  duration: number;
  intensity: number;
  success: boolean;
}

interface ShareData {
  sessionId: string;
  userId?: string;
  platform: string;
  method: 'email' | 'social' | 'download';
  success: boolean;
  error?: string;
}

// Analytics Service
export class AnalyticsService {
  private supabase;
  private sessionId: string;
  
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
    
    // Generate a session ID for anonymous users
    this.sessionId = this.getOrCreateSessionId();
  }
  
  private getOrCreateSessionId(): string {
    // Check if we have a session ID in localStorage
    if (typeof window !== 'undefined') {
      const storedSessionId = localStorage.getItem('analytics_session_id');
      
      if (storedSessionId) {
        return storedSessionId;
      }
      
      // Create a new session ID
      const newSessionId = this.generateSessionId();
      localStorage.setItem('analytics_session_id', newSessionId);
      return newSessionId;
    }
    
    // Server-side fallback
    return this.generateSessionId();
  }
  
  private generateSessionId(): string {
    // Use cryptographically secure random bytes instead of Math.random
    // This works in both browser and Node.js environments
    if (typeof window !== 'undefined' && window.crypto) {
      // Browser environment: use Web Crypto API
      const buffer = new Uint8Array(16);
      window.crypto.getRandomValues(buffer);
      return Array.from(buffer)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } else {
      // Node.js environment: use crypto module
      return randomBytes(16).toString('hex');
    }
  }
  
  // Track an analytics event
  public async trackEvent(event: EventName, properties: Record<string, any> = {}): Promise<void> {
    try {
      // Check if running on client-side
      if (typeof window !== 'undefined') {
        // Use the API endpoint for client-side tracking
        const response = await fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event,
            properties,
            session_id: this.sessionId,
          }),
        });
        
        const result = await response.json();
        
        // Update the session ID if one was returned
        if (result.success && result.session_id) {
          localStorage.setItem('analytics_session_id', result.session_id);
          this.sessionId = result.session_id;
        }
        
        // If this is a production environment, you might want to
        // integrate with third-party analytics services here
        this.sendToExternalAnalytics({
          event,
          user_id: undefined, // We don't have this info client-side
          session_id: this.sessionId,
          timestamp: new Date().toISOString(),
          properties
        });
        
        return;
      }
      
      // Server-side tracking (direct to database)
      // Get the current user ID if available
      const { data: { user } } = await this.supabase.auth.getUser();
      const userId = user?.id;
      
      // Create the event payload
      const eventPayload: AnalyticsEvent = {
        event,
        user_id: userId,
        session_id: this.sessionId,
        timestamp: new Date().toISOString(),
        properties
      };
      
      // Store the event in Supabase
      const { error } = await this.supabase
        .from('analytics_events')
        .insert([eventPayload]);
      
      if (error) {
        console.error('Error tracking analytics event:', error);
      }
      
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }
  
  // Helper method to send data to external analytics services
  private sendToExternalAnalytics(event: AnalyticsEvent): void {
    // Implement integrations with services like Google Analytics, Mixpanel, etc.
    
    // Example: Google Analytics (GA4)
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as any).gtag;
      
      gtag('event', event.event, {
        ...event.properties,
        user_id: event.user_id,
        session_id: event.session_id
      });
    }
  }
  
  // Get engagement metrics for a given time range
  public async getEngagementMetrics(options: { 
    start: string, 
    end: string 
  }): Promise<EngagementMetrics> {
    try {
      // Query for sessions in the time range
      const { data: sessions, error: sessionsError } = await this.supabase
        .from('analytics_events')
        .select('*')
        .gte('timestamp', options.start)
        .lte('timestamp', options.end)
        .order('timestamp', { ascending: true });
        
      if (sessionsError) {
        throw sessionsError;
      }
      
      // Calculate metrics
      const uniqueUserIds = new Set(sessions
        .filter(session => session.user_id)
        .map(session => session.user_id));
        
      const uniqueSessionIds = new Set(sessions.map(session => session.session_id));
      
      // Calculate try-on session counts
      const tryOnSessions = sessions.filter(session => session.event === 'product_try_on');
      
      const makeupSessions = tryOnSessions.filter(
        session => session.properties.product_type === 'makeup'
      ).length;
      
      const hairstyleSessions = tryOnSessions.filter(
        session => session.properties.product_type === 'hairstyle'
      ).length;
      
      const accessorySessions = tryOnSessions.filter(
        session => session.properties.product_type === 'accessory'
      ).length;
      
      // Calculate shares
      const shareSessions = sessions.filter(session => session.event === 'product_share');
      
      const socialShares = shareSessions.filter(
        session => session.properties.share_method === 'social'
      ).length;
      
      const emailShares = shareSessions.filter(
        session => session.properties.share_method === 'email'
      ).length;
      
      const downloadShares = shareSessions.filter(
        session => session.properties.share_method === 'download'
      ).length;
      
      // Calculate top viewed products
      const productViews = sessions.filter(session => session.event === 'product_view');
      
      const productViewsCount: Record<string, { count: number, name: string }> = {};
      productViews.forEach(view => {
        const productId = view.properties.product_id;
        const productName = view.properties.product_name || 'Unknown Product';
        
        if (productId) {
          if (!productViewsCount[productId]) {
            productViewsCount[productId] = { count: 0, name: productName };
          }
          productViewsCount[productId].count += 1;
        }
      });
      
      const topViewedProducts = Object.entries(productViewsCount)
        .map(([product_id, { count, name }]) => ({ 
          product_id, 
          name, 
          views: count 
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);
        
      // Calculate product category breakdown
      const categoryViews: Record<string, number> = {};
      productViews.forEach(view => {
        const category = view.properties.category || 'unknown';
        categoryViews[category] = (categoryViews[category] || 0) + 1;
      });
      
      // Calculate success rate (completed try-ons / started try-ons)
      const startedTryOns = sessions.filter(
        session => session.event === 'product_try_on' && 
                  session.properties.action === 'start'
      ).length;
      
      const completedTryOns = sessions.filter(
        session => session.event === 'product_try_on' && 
                  session.properties.action === 'complete'
      ).length;
      
      const successRate = startedTryOns > 0 
        ? (completedTryOns / startedTryOns) * 100 
        : 0;
        
      // Calculate average session duration (this is an approximation)
      let totalDuration = 0;
      let sessionCount = 0;
      
      // Group events by session ID
      const sessionEvents: Record<string, any[]> = {};
      sessions.forEach(event => {
        if (!sessionEvents[event.session_id]) {
          sessionEvents[event.session_id] = [];
        }
        sessionEvents[event.session_id].push(event);
      });
      
      // Calculate duration for each session
      Object.values(sessionEvents).forEach(events => {
        if (events.length > 1) {
          const sortedEvents = events.sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          
          const firstEvent = new Date(sortedEvents[0].timestamp).getTime();
          const lastEvent = new Date(sortedEvents[sortedEvents.length - 1].timestamp).getTime();
          
          const durationSeconds = (lastEvent - firstEvent) / 1000;
          
          // Only count sessions with reasonable durations (less than 2 hours)
          if (durationSeconds > 0 && durationSeconds < 7200) {
            totalDuration += durationSeconds;
            sessionCount++;
          }
        }
      });
      
      const averageDuration = sessionCount > 0 ? totalDuration / sessionCount : 0;
      
      return {
        totalSessions: uniqueSessionIds.size,
        uniqueUsers: uniqueUserIds.size,
        averageDuration,
        successRate,
        makeupSessions,
        hairstyleSessions,
        accessorySessions,
        socialShares,
        emailShares,
        downloadShares,
        topViewedProducts,
        productCategoryBreakdown: categoryViews,
        timeRange: {
          start: options.start,
          end: options.end
        }
      };
    } catch (error) {
      console.error('Error fetching engagement metrics:', error);
      throw error;
    }
  }
  
  // Get metrics for a specific product
  public async getProductMetrics(
    productId: string, 
    options: { start: string, end: string }
  ): Promise<ProductMetrics> {
    try {
      // Query for product events in the time range
      const { data: productEvents, error: eventsError } = await this.supabase
        .from('analytics_events')
        .select('*')
        .gte('timestamp', options.start)
        .lte('timestamp', options.end)
        .or(`properties->product_id.eq.${productId},properties->id.eq.${productId}`)
        .order('timestamp', { ascending: true });
        
      if (eventsError) {
        throw eventsError;
      }
      
      // Calculate product metrics
      const viewEvents = productEvents.filter(
        event => event.event === 'product_view'
      );
      
      const tryOnEvents = productEvents.filter(
        event => event.event === 'product_try_on'
      );
      
      const uniqueViewerIds = new Set(
        viewEvents
          .filter(event => event.user_id || event.session_id)
          .map(event => event.user_id || event.session_id)
      );
      
      // Calculate click-through rate (views / recommendation clicks)
      const recommendationClicks = productEvents.filter(
        event => event.event === 'product_recommendation_click'
      ).length;
      
      const clickThroughRate = recommendationClicks > 0 
        ? (viewEvents.length / recommendationClicks) * 100 
        : 0;
        
      // Calculate conversion rate (try-ons / views)
      const conversionRate = viewEvents.length > 0 
        ? (tryOnEvents.length / viewEvents.length) * 100 
        : 0;
      
      return {
        productId,
        totalViews: viewEvents.length,
        uniqueViews: uniqueViewerIds.size,
        tryOnCount: tryOnEvents.length,
        conversionRate,
        clickThroughRate,
        timeRange: {
          start: options.start,
          end: options.end
        }
      };
    } catch (error) {
      console.error(`Error fetching metrics for product ${productId}:`, error);
      throw error;
    }
  }
  
  // Get metrics for recommendations
  public async getRecommendationMetrics(
    options: { start: string, end: string }
  ): Promise<RecommendationMetrics> {
    try {
      // Query for recommendation events in the time range
      const { data: events, error: eventsError } = await this.supabase
        .from('analytics_events')
        .select('*')
        .gte('timestamp', options.start)
        .lte('timestamp', options.end)
        .in('event', ['product_recommendation_click', 'product_view', 'cart_add'])
        .order('timestamp', { ascending: true });
        
      if (eventsError) {
        throw eventsError;
      }
      
      // Calculate recommendation metrics
      const recommendationClicks = events.filter(
        event => event.event === 'product_recommendation_click'
      );
      
      // Track which products were recommended and clicked
      const recommendedProducts: Record<string, { 
        recommendations: number, 
        clicks: number,
        views: number,
        conversions: number,
        name: string 
      }> = {};
      
      recommendationClicks.forEach(event => {
        const productId = event.properties.product_id;
        const productName = event.properties.product_name || 'Unknown Product';
        
        if (productId) {
          if (!recommendedProducts[productId]) {
            recommendedProducts[productId] = { 
              recommendations: 0, 
              clicks: 0,
              views: 0,
              conversions: 0,
              name: productName 
            };
          }
          recommendedProducts[productId].clicks += 1;
        }
      });
      
      // Count views for recommended products
      events.filter(event => event.event === 'product_view').forEach(event => {
        const productId = event.properties.product_id;
        
        if (productId && recommendedProducts[productId]) {
          recommendedProducts[productId].views += 1;
        }
      });
      
      // Count conversions (added to cart) for recommended products
      events.filter(event => event.event === 'cart_add').forEach(event => {
        const productId = event.properties.product_id;
        
        if (productId && recommendedProducts[productId]) {
          recommendedProducts[productId].conversions += 1;
        }
      });
      
      // Calculate overall metrics
      const totalRecommendations = Object.values(recommendedProducts)
        .reduce((sum, product) => sum + product.recommendations, 0);
        
      const totalClicks = Object.values(recommendedProducts)
        .reduce((sum, product) => sum + product.clicks, 0);
        
      const totalConversions = Object.values(recommendedProducts)
        .reduce((sum, product) => sum + product.conversions, 0);
        
      const clickThroughRate = totalRecommendations > 0 
        ? (totalClicks / totalRecommendations) * 100
        : 0;
        
      const conversionRate = totalClicks > 0
        ? (totalConversions / totalClicks) * 100
        : 0;
        
      // Get top recommended products
      const topRecommendedProducts = Object.entries(recommendedProducts)
        .map(([product_id, product]) => ({
          product_id,
          name: product.name,
          recommendations: product.recommendations,
          clicks: product.clicks
        }))
        .sort((a, b) => b.recommendations - a.recommendations)
        .slice(0, 5);
        
      return {
        totalRecommendations,
        clickThroughRate,
        conversionRate,
        topRecommendedProducts,
        timeRange: {
          start: options.start,
          end: options.end
        }
      };
    } catch (error) {
      console.error('Error fetching recommendation metrics:', error);
      throw error;
    }
  }

  async trackTryOnSession(data: TryOnSessionData): Promise<void> {
    try {
      await fetch('/api/analytics/try-on-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error tracking try-on session:', error);
    }
  }

  async trackShare(data: ShareData): Promise<void> {
    try {
      await this.trackEvent('product_share', {
        session_id: data.sessionId,
        user_id: data.userId,
        platform: data.platform,
        method: data.method,
        success: data.success,
        error: data.error
      });
    } catch (error) {
      console.error('Error tracking share:', error);
    }
  }
} 