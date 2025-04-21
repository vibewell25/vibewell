import { Analytics } from '@vercel/analytics/react';
import * as Sentry from '@sentry/nextjs';
import posthog from 'posthog-js';
import React from 'react';

// Initialize PostHog
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug();
    },
  });
}

// Initialize Sentry
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
  });
}

// Analytics event types
export type AnalyticsEvent = {
  name: string;
  properties?: Record<string, any>;
  category?: 'user' | 'content' | 'engagement' | 'error' | 'performance';
};

// Analytics provider interface
export interface AnalyticsProvider {
  trackEvent: (event: AnalyticsEvent) => void;
  trackPageView: (url: string) => void;
  identify: (userId: string, traits?: Record<string, any>) => void;
}

// Analytics implementation
class AnalyticsService implements AnalyticsProvider {
  trackEvent({ name, properties, category }: AnalyticsEvent): void {
    // Track with PostHog
    if (typeof window !== 'undefined') {
      posthog.capture(name, {
        ...properties,
        category,
      });
    }

    // Track with Sentry if it's an error
    if (category === 'error') {
      Sentry.captureEvent({
        message: name,
        level: 'error',
        extra: properties,
      });
    }
  }

  trackPageView(url: string): void {
    if (typeof window !== 'undefined') {
      posthog.capture('$pageview', {
        url,
      });
    }
  }

  identify(userId: string, traits?: Record<string, any>): void {
    if (typeof window !== 'undefined') {
      posthog.identify(userId, traits);
    }
  }

  // Performance monitoring
  trackPerformance(metric: {
    name: string;
    value: number;
    unit?: 'ms' | 'bytes' | 'percent';
  }): void {
    this.trackEvent({
      name: 'performance_metric',
      properties: metric,
      category: 'performance',
    });
  }

  // Error tracking
  trackError(error: Error, context?: Record<string, any>): void {
    this.trackEvent({
      name: 'error',
      properties: {
        message: error.message,
        stack: error.stack,
        ...context,
      },
      category: 'error',
    });

    Sentry.captureException(error, {
      extra: context,
    });
  }

  // User engagement tracking
  trackEngagement(action: string, details?: Record<string, any>): void {
    this.trackEvent({
      name: action,
      properties: details,
      category: 'engagement',
    });
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// We'll move this to a separate React component file
// export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
//   return (
//     <>
//       <Analytics />
//       {children}
//     </>
//   );
// } 