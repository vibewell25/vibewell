import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { init as SentryInit, captureException, setUser, setTag } from '@sentry/nextjs';
import posthog from 'posthog-js';
import type { NextWebVitalsMetric } from 'next/app';

// Initialize monitoring services
export function initMonitoring() {
  // Initialize Sentry for error tracking
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    SentryInit({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
      integrations: [
        new posthog.SentryIntegration(posthog),
      ],
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

// Analytics component wrapper
export function AnalyticsWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Analytics />
      <SpeedInsights />
    </>
  );
}

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
  properties: EventProperties[T]
) => {
  if (process.env.NODE_ENV === 'production') {
    posthog.capture(eventName, properties);
  }
};

// Performance monitoring
export const trackWebVitals = ({ id, name, label, value }: NextWebVitalsMetric) => {
  if (process.env.NODE_ENV === 'production') {
    posthog.capture('web_vitals', {
      metric_id: id,
      name,
      label,
      value,
    });
  }
};

// User session tracking with type safety
interface UserData {
  id: string;
  email?: string;
  name?: string;
  role?: string;
}

export const trackUserSession = (userData: UserData) => {
  if (process.env.NODE_ENV === 'production') {
    // Set user in PostHog
    posthog.identify(userData.id, {
      email: userData.email,
      name: userData.name,
      role: userData.role,
    });

    // Set user in Sentry
    setUser({
      id: userData.id,
      email: userData.email,
      username: userData.name,
    });

    // Set role tag in Sentry
    if (userData.role) {
      setTag('role', userData.role);
    }
  }
};

// Error tracking with context
export const trackError = (error: Error, context?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'production') {
    captureException(error, { extra: context });
    
    // Also track in PostHog
    trackEvent('error', {
      message: error.message,
      code: error.name,
      ...context,
    } as EventProperties['error']);
  }
}; 