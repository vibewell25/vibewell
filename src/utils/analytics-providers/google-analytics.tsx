import { AnalyticsEvent, AnalyticsProvider } from '../analytics';

/**
 * Google Analytics provider implementation
 */
export class GoogleAnalyticsProvider implements AnalyticsProvider {
  private gaTrackingId: string;
  private isInitialized: boolean = false;

  constructor(trackingId?: string) {
    this.gaTrackingId = trackingId || process.env.NEXT_PUBLIC_GA_TRACKING_ID || '';
  }

  /**
   * Initialize Google Analytics
   */
  async initialize(): Promise<void> {
    if (this.isInitialized || !this.gaTrackingId || typeof window === 'undefined') {
      return;
    }

    try {
      // Dynamic import of Google Analytics library to avoid SSR issues
      const ReactGA = (await import('react-ga')).default;
      ReactGA.initialize(this.gaTrackingId);
      this.isInitialized = true;
      console.log('Google Analytics initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Analytics:', error);
      throw error;
    }
  }

  /**
   * Track event in Google Analytics
   */
  trackEvent(event: AnalyticsEvent): void {
    if (!this.isInitialized || typeof window === 'undefined') {
      return;
    }

    try {
      const ReactGA = require('react-ga');
      
      const { eventName, eventType, properties } = event;
      
      // Map to GA event format
      ReactGA.event({
        category: eventType,
        action: eventName,
        label: properties.label || '',
        value: properties.value,
        nonInteraction: properties.nonInteraction || false,
      });
    } catch (error) {
      console.error('Google Analytics tracking error:', error);
    }
  }

  /**
   * Set user ID and properties in Google Analytics
   */
  setUser(userId: string, userProperties?: Record<string, any>): void {
    if (!this.isInitialized || typeof window === 'undefined') {
      return;
    }

    try {
      const ReactGA = require('react-ga');
      
      // Set user ID
      ReactGA.set({ userId });
      
      // Set custom dimensions for user properties if provided
      if (userProperties) {
        const dimensions: Record<string, any> = {};
        
        // Map user properties to custom dimensions
        Object.entries(userProperties).forEach(([key, value], index) => {
          // Format: dimension1, dimension2, etc.
          dimensions[`dimension${index + 1}`] = value;
        });
        
        ReactGA.set(dimensions);
      }
    } catch (error) {
      console.error('Google Analytics set user error:', error);
    }
  }
} 