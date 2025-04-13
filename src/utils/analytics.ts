/**
 * Analytics utility for the Vibewell platform
 * Provides standardized interfaces for tracking user behavior, performance metrics, and errors
 */

// Types for analytics events
export enum EventType {
  USER_ACTION = 'user_action',
  PAGE_VIEW = 'page_view',
  SYSTEM = 'system',
  ERROR = 'error',
  PERFORMANCE = 'performance'
}

// Type for analytics event data
export interface AnalyticsEvent {
  eventName: string;
  eventType: EventType;
  timestamp: number;
  properties: Record<string, any>;
}

// Interface for analytics provider implementation
export interface AnalyticsProvider {
  trackEvent: (event: AnalyticsEvent) => void;
  initialize: () => Promise<void>;
  setUser: (userId: string, userProperties?: Record<string, any>) => void;
}

// Additional types for analytics
export interface UserProperties {
  userType?: string;
  email?: string;
  role?: string;
  accountType?: string;
  subscriptionTier?: string;
  [key: string]: any;
}

export interface PageViewProperties {
  pagePath: string;
  pageTitle?: string;
  referrer?: string;
  loadTime?: number;
  [key: string]: any;
}

export interface ErrorProperties {
  errorName: string;
  errorMessage: string;
  stackTrace?: string;
  componentName?: string;
  source?: string;
  [key: string]: any;
}

export interface PerformanceProperties {
  metricName: string;
  duration: number;
  threshold?: number;
  resourceType?: string;
  [key: string]: any;
}

// Singleton analytics service
class AnalyticsService {
  private providers: AnalyticsProvider[] = [];
  private initialized = false;
  private queue: AnalyticsEvent[] = [];
  private userId: string | null = null;
  private sessionId: string = this.generateSessionId();
  private userProperties: Record<string, any> = {};
  private disabled = false;
  private retryCount: number = 0;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;

  constructor() {
    // Initialize in browser environments only
    if (typeof window !== 'undefined') {
      this.initializeFromConfig();
    }
  }

  /**
   * Initialize the analytics service from configuration
   */
  private async initializeFromConfig(): Promise<void> {
    try {
      // Register providers based on environment
      if (process.env.NODE_ENV === 'production') {
        // In production, use real analytics providers
        // Dynamically import providers to avoid bundling in development
        try {
          // Example: If using Google Analytics
          const { GoogleAnalyticsProvider } = await import('./analytics-providers/google-analytics');
          if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
            this.registerProvider(new GoogleAnalyticsProvider({
              measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
            }));
          }
          
          // Example: If using Segment
          const { SegmentProvider } = await import('./analytics-providers/segment');
          if (process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY) {
            this.registerProvider(new SegmentProvider({
              writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY
            }));
          }
        } catch (err) {
          console.error('Error loading analytics providers:', err);
        }
      } else {
        // In development, log to console with formatted output
        this.registerProvider({
          trackEvent: (event) => {
            const { eventName, eventType, properties } = event;
            console.groupCollapsed(
              `%c Analytics: ${eventType} - ${eventName}`,
              'color: #3498db; font-weight: bold;'
            );
            console.log('Properties:', properties);
            console.log('Timestamp:', new Date(event.timestamp).toISOString());
            console.groupEnd();
          },
          initialize: () => Promise.resolve(),
          setUser: (userId, props) => {
            console.log(`%c Analytics: Set User ${userId}`, 'color: #2ecc71; font-weight: bold;', props);
          }
        });
      }

      // Initialize all providers with retry logic
      await this.initializeProviders();
      
      // Process any queued events
      this.processQueue();
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  /**
   * Initialize providers with retry logic
   */
  private async initializeProviders(): Promise<void> {
    try {
      await Promise.all(this.providers.map(p => p.initialize()));
      this.initialized = true;
      this.retryCount = 0;
    } catch (error) {
      this.retryCount++;
      console.error(`Analytics initialization failed (attempt ${this.retryCount}/${this.MAX_RETRIES}):`, error);
      
      if (this.retryCount < this.MAX_RETRIES) {
        // Retry with exponential backoff
        const delay = this.RETRY_DELAY * Math.pow(2, this.retryCount - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.initializeProviders();
      } else {
        // Max retries reached, set initialized to avoid infinite retries
        console.warn('Max analytics initialization retries reached, some events may not be tracked');
        this.initialized = true;
      }
    }
  }

  /**
   * Register an analytics provider
   * @param provider Analytics provider implementation
   */
  public registerProvider(provider: AnalyticsProvider): void {
    this.providers.push(provider);
  }

  /**
   * Enable or disable analytics tracking
   * @param enabled Whether tracking is enabled
   */
  public setEnabled(enabled: boolean): void {
    this.disabled = !enabled;
    
    // Log status change
    console.log(`Analytics tracking ${enabled ? 'enabled' : 'disabled'}`);
    
    // Process queue if enabling
    if (enabled && this.initialized && this.queue.length > 0) {
      this.processQueue();
    }
  }

  /**
   * Set the current user ID and properties
   * @param userId User identifier
   * @param properties Additional user properties
   */
  public setUser(userId: string, properties: UserProperties = {}): void {
    this.userId = userId;
    this.userProperties = { ...this.userProperties, ...properties };
    
    // Update user in all providers
    this.providers.forEach(provider => {
      try {
        provider.setUser(userId, this.userProperties);
      } catch (error) {
        console.error('Error setting user in analytics provider:', error);
      }
    });
    
    // Track user identification event
    this.trackEvent(EventType.SYSTEM, 'user_identified', {
      method: properties.userType || 'direct',
      isNewSession: true
    });
  }

  /**
   * Clear the current user (for logout)
   */
  public clearUser(): void {
    // Track logout event before clearing
    if (this.userId) {
      this.trackEvent(EventType.USER_ACTION, 'user_logged_out', {
        userId: this.userId
      });
    }
    
    this.userId = null;
    this.userProperties = {};
    this.sessionId = this.generateSessionId();
    
    // Update in providers
    this.providers.forEach(provider => {
      try {
        provider.setUser('anonymous');
      } catch (error) {
        console.error('Error clearing user in analytics provider:', error);
      }
    });
  }

  /**
   * Track an analytics event
   * @param eventType Type of event
   * @param eventName Name of the event
   * @param properties Additional properties
   */
  private trackEvent(
    eventType: EventType,
    eventName: string,
    properties: Record<string, any> = {}
  ): void {
    if (this.disabled) return;

    const event: AnalyticsEvent = {
      eventName,
      eventType,
      timestamp: Date.now(),
      properties: {
        ...properties,
        sessionId: this.sessionId,
        userId: this.userId || 'anonymous',
        userType: this.getUserType(),
        appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '0.0.0',
        environment: process.env.NODE_ENV,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
      }
    };

    if (!this.initialized) {
      // Queue the event to be processed later
      this.queue.push(event);
      return;
    }

    // Send to all providers
    this.providers.forEach(provider => {
      try {
        provider.trackEvent(event);
      } catch (error) {
        console.error('Error tracking event:', error);
        // Add to queue if tracking failed
        this.queue.push(event);
      }
    });
  }

  /**
   * Process the queue of events after initialization
   */
  private processQueue(): void {
    if (this.queue.length === 0) return;
    
    // Display queue information
    console.log(`Processing ${this.queue.length} queued analytics events`);
    
    // Process and clear the queue
    const failedEvents: AnalyticsEvent[] = [];
    
    this.queue.forEach(event => {
      let eventProcessed = false;
      
      this.providers.forEach(provider => {
        try {
          provider.trackEvent(event);
          eventProcessed = true;
        } catch (error) {
          console.error('Error processing queued event:', error);
        }
      });
      
      // Keep track of events that failed processing
      if (!eventProcessed) {
        failedEvents.push(event);
      }
    });
    
    // Update queue with only failed events
    this.queue = failedEvents;
    
    if (failedEvents.length > 0) {
      console.warn(`${failedEvents.length} events could not be processed and remain in queue`);
    }
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
  }

  /**
   * Get the current user type based on properties
   */
  private getUserType(): string {
    return this.userProperties.userType || 
           (this.userId ? 'registered' : 'anonymous');
  }

  /**
   * Track a general event
   * @param eventName Name of the event
   * @param properties Additional properties
   */
  public logEvent(eventName: string, properties: Record<string, any> = {}): void {
    this.trackEvent(EventType.SYSTEM, eventName, properties);
  }

  /**
   * Track a user action
   * @param actionName Name of the action
   * @param properties Additional properties
   */
  public trackUserAction(actionName: string, properties: Record<string, any> = {}): void {
    // Add timestamp for user actions to measure time between actions
    const enhancedProps = {
      ...properties,
      actionTime: new Date().toISOString()
    };
    
    this.trackEvent(EventType.USER_ACTION, actionName, enhancedProps);
  }

  /**
   * Track a page view
   * @param pagePath Path of the page
   * @param properties Additional properties
   */
  public trackPageView(pagePath: string, properties: PageViewProperties): void {
    // Calculate page load time if not provided
    let enhancedProps: PageViewProperties = {
      ...properties,
      pagePath,
      pageTitle: properties.pageTitle || (typeof document !== 'undefined' ? document.title : ''),
      referrer: properties.referrer || (typeof document !== 'undefined' ? document.referrer : '')
    };
    
    // Add navigation timing data if available
    if (typeof window !== 'undefined' && window.performance) {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const domLoadTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
      
      enhancedProps = {
        ...enhancedProps,
        loadTime: properties.loadTime || (pageLoadTime > 0 ? pageLoadTime : undefined),
        domLoadTime: domLoadTime > 0 ? domLoadTime : undefined
      };
    }
    
    this.trackEvent(EventType.PAGE_VIEW, 'page_viewed', enhancedProps);
  }

  /**
   * Track an error
   * @param errorName Name or category of the error
   * @param properties Error details
   */
  public trackError(errorName: string, properties: ErrorProperties): void {
    // Ensure we have the basic error information
    const enhancedProps: ErrorProperties = {
      errorName,
      errorMessage: properties.errorMessage || 'Unknown error',
      ...properties,
      time: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined
    };
    
    this.trackEvent(EventType.ERROR, errorName, enhancedProps);
  }

  /**
   * Track a performance metric
   * @param metricName Name of the metric
   * @param properties Performance details
   */
  public trackPerformance(metricName: string, properties: PerformanceProperties): void {
    // Ensure we have a duration
    if (!properties.duration && typeof properties.duration !== 'number') {
      console.warn('Performance metric tracked without duration:', metricName);
      return;
    }
    
    // Add timestamp and threshold info
    const enhancedProps: PerformanceProperties = {
      metricName,
      ...properties,
      timestamp: new Date().toISOString(),
      isOverThreshold: properties.threshold ? properties.duration > properties.threshold : undefined,
      measurementUnit: 'ms'
    };
    
    this.trackEvent(EventType.PERFORMANCE, metricName, enhancedProps);
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

// Export utility functions that use the singleton service
export const logEvent = (eventName: string, properties?: Record<string, any>) => 
  analyticsService.logEvent(eventName, properties || {});

export const trackUserAction = (actionName: string, properties?: Record<string, any>) => 
  analyticsService.trackUserAction(actionName, properties || {});

export const trackPageView = (pagePath: string, properties?: Partial<PageViewProperties>) => 
  analyticsService.trackPageView(pagePath, properties || { pagePath });

export const trackError = (errorName: string, properties: Partial<ErrorProperties>) => 
  analyticsService.trackError(errorName, {
    errorName,
    errorMessage: properties.errorMessage || errorName,
    ...properties
  });

export const trackPerformance = (metricName: string, duration: number, properties?: Partial<Omit<PerformanceProperties, 'metricName' | 'duration'>>) => 
  analyticsService.trackPerformance(metricName, {
    metricName,
    duration,
    ...properties || {}
  });

export const setUser = (userId: string, properties?: UserProperties) => 
  analyticsService.setUser(userId, properties);

export const clearUser = () => analyticsService.clearUser();

export const setEnabled = (enabled: boolean) => analyticsService.setEnabled(enabled);

// Export the service as default
export default analyticsService; 