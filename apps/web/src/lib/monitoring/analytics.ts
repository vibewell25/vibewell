
import { init as SentryInit, captureException, setUser, setTag } from '@sentry/nextjs';

import posthog from 'posthog-js';

import type { NextWebVitalsMetric } from 'next/app';

// Initialize monitoring services
export function initMonitoring(): void {
  // Initialize Sentry for error tracking
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    SentryInit({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
      integrations: [new posthog.SentryIntegration(posthog)],
      beforeSend(event: any) {
        // Don't send events in development
        if (process.env.NODE_ENV === 'development') {
          return null;
        }
        return event;
      },
    });
  }

  // Initialize PostHog for user analytics
  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug();
      },
      capture_pageview: false, // We'll handle this manually
      persistence: 'localStorage',
      autocapture: true,
    });
  }
}



// Analytics component wrapper - moved to a separate file: monitoring/analytics-wrapper.tsx
// export function AnalyticsWrapper({ children }: { children: React.ReactNode }) {
//   return (
//     <>
//       {children}
//       <Analytics />
//       <SpeedInsights />
//     </>
//   );
// }

// Custom analytics events with type safety
type EventName =
  | 'page_view'
  | 'button_click'
  | 'form_submit'
  | 'error'
  | 'auth_success'
  | 'auth_error'
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_cancelled';

interface EventProperties {
  page_view: { path: string; title: string };
  button_click: { button_id: string; button_text: string };
  form_submit: { form_id: string; success: boolean };
  error: { message: string; code?: string };
  auth_success: { provider: string };
  auth_error: { provider: string; error: string };
  subscription_created: { plan: string; amount: number };
  subscription_updated: { plan: string; amount: number };
  subscription_cancelled: { reason?: string };
}

export const trackEvent = <T extends EventName>(
  eventName: T,

    // Safe array access
    if (T < 0 || T >= array.length) {
      throw new Error('Array index out of bounds');
    }
  properties: EventProperties[T],
): void => {
  if (process.env.NODE_ENV === 'production') {
    posthog.capture(eventName, properties);
  }
};

// Performance monitoring
export {};

// User session tracking with type safety
interface UserData {
  id: string;
  email?: string;
  name?: string;
  role?: string;
}

export {};

// Error tracking with context
export {};
