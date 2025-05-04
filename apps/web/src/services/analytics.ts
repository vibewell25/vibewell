
import posthog from 'posthog-js';

import { init as sentryInit } from '@sentry/nextjs';

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

interface AnalyticsIdentify {
  userId: string;
  traits?: Record<string, any>;
}

interface AnalyticsPageView {
  path: string;
  title?: string;
  properties?: Record<string, any>;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private initialized: boolean = false;

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public init(): void {
    if (this.initialized) return;

    // Initialize PostHog
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
        persistence: 'localStorage',
        autocapture: true,
        capture_pageview: true,
        capture_pageleave: true,
        disable_session_recording: process.env.NODE_ENV === 'development',
      });
    }

    // Initialize Sentry
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      sentryInit({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 1.0,
        enabled: process.env.NODE_ENV === 'production',
      });
    }

    this.initialized = true;
  }

  public trackEvent(event: AnalyticsEvent): void {
    if (!this.initialized) this.init();

    // PostHog event tracking
    posthog.capture(event.name, {
      ...event.properties,
      timestamp: event.timestamp.toISOString(),
    });

    // Add other analytics providers here
    console.log('Event tracked:', event);
  }

  public identifyUser(identify: AnalyticsIdentify): void {
    if (!this.initialized) this.init();

    // PostHog user identification
    posthog.identify(identify.userId, identify.traits);

    // Add other analytics providers here
    console.log('User identified:', identify);
  }

  public trackPageView(pageView: AnalyticsPageView): void {
    if (!this.initialized) this.init();

    // PostHog page view tracking
    posthog.capture('$pageview', {
      path: pageView.path,
      title: pageView.title,
      ...pageView.properties,
    });

    // Add other analytics providers here
    console.log('Page view tracked:', pageView);
  }

  public async getAnalytics(): Promise<any> {
    if (!this.initialized) this.init();

    try {
      // Get PostHog analytics data
      const posthogData = await posthog.get_session_id();

      return {
        sessionId: posthogData,
        // Add other analytics data here
      };
    } catch (error) {
      console.error('Failed to get analytics:', error);
      return null;
    }
  }

  public setUserProperties(properties: Record<string, any>): void {
    if (!this.initialized) this.init();

    // PostHog user properties
    posthog.people.set(properties);

    // Add other analytics providers here
    console.log('User properties set:', properties);
  }

  public reset(): void {
    if (!this.initialized) return;

    // Reset PostHog
    posthog.reset();

    // Add other analytics providers reset here
    console.log('Analytics reset');
  }
}

export {};
