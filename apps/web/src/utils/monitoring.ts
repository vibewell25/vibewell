import type { NextWebVitalsMetric } from 'next/app';

// Web Vitals reporting
export function reportWebVitals(metric: NextWebVitalsMetric) {
  const body = {
    name: metric.name,
    value: metric.value,
    id: metric.id,
    startTime: metric.startTime,
    // Include additional fields only if they exist
    ...(metric as any).rating !== undefined && { rating: (metric as any).rating },
    ...(metric as any).delta !== undefined && { delta: (metric as any).delta },
  };

  // Send to analytics endpoint
  if (process.env['NEXT_PUBLIC_ANALYTICS_ENDPOINT']) {
    fetch(process.env['NEXT_PUBLIC_ANALYTICS_ENDPOINT'], {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// Performance monitoring
export const performanceMonitoring = {
  // Track page load performance
  trackPageLoad: () => {
    if (typeof window !== 'undefined') {
      const navigation = performance.getEntriesByType(
        'navigation',
      )[0] as PerformanceNavigationTiming;
      
      if (!navigation) return;
      
      const metrics = {
        dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcpConnection: navigation.connectEnd - navigation.connectStart,
        serverResponse: navigation.responseEnd - navigation.requestStart,
        // Use safe property access for properties that might not exist in newer specs
        domLoad: navigation.domComplete - (navigation as any).domLoading || 0,
        fullPageLoad: navigation.loadEventEnd - (navigation as any).startTime || 0,
      };

      // Send metrics to analytics
      if (process.env['NEXT_PUBLIC_ANALYTICS_ENDPOINT']) {
        fetch(`${process.env['NEXT_PUBLIC_ANALYTICS_ENDPOINT']}/performance`, {
          method: 'POST',
          body: JSON.stringify(metrics),
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
    }
  },

  // For tracking web vitals metrics
  trackWebVitals: (metric: any) => {
    if (process.env['NEXT_PUBLIC_ANALYTICS_ENDPOINT'] && metric) {
      fetch(`${process.env['NEXT_PUBLIC_ANALYTICS_ENDPOINT']}/web-vitals`, {
        method: 'POST',
        body: JSON.stringify(metric),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  },

  // Track API performance
  trackApiCall: async (url: string, startTime: number) => {
    const endTime = performance.now();
    const duration = endTime - startTime;

    const metrics = {
      url,
      duration,
      timestamp: new Date().toISOString(),
    };

    // Send metrics to analytics
    if (process.env['NEXT_PUBLIC_ANALYTICS_ENDPOINT']) {
      await fetch(`${process.env['NEXT_PUBLIC_ANALYTICS_ENDPOINT']}/api-performance`, {
        method: 'POST',
        body: JSON.stringify(metrics),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  },

  // Track client-side errors
  trackError: (error: Error, componentStack?: string) => {
    const errorMetrics = {
      message: error.message,
      stack: error.stack,
      componentStack,
      timestamp: new Date().toISOString(),
    };

    // Send error metrics to analytics
    if (process.env['NEXT_PUBLIC_ANALYTICS_ENDPOINT']) {
      fetch(`${process.env['NEXT_PUBLIC_ANALYTICS_ENDPOINT']}/error`, {
        method: 'POST',
        body: JSON.stringify(errorMetrics),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  },

  // Start timing for performance tracking
  start: (markName: string) => {
    if (typeof window !== 'undefined' && performance) {
      performance.mark(`${markName}-start`);
    }
  },

  // End timing and report performance data
  end: (markName: string) => {
    if (typeof window !== 'undefined' && performance) {
      performance.mark(`${markName}-end`);
      try {
        performance.measure(markName, `${markName}-start`, `${markName}-end`);

        const measurements = performance.getEntriesByName(markName);
        if (measurements && measurements.length > 0 && measurements[0]) {
          const duration = measurements[0].duration;

          // Send custom mark metrics to analytics
          if (process.env['NEXT_PUBLIC_ANALYTICS_ENDPOINT']) {
            fetch(`${process.env['NEXT_PUBLIC_ANALYTICS_ENDPOINT']}/custom-marks`, {
              method: 'POST',
              body: JSON.stringify({
                name: markName,
                duration,
                timestamp: new Date().toISOString(),
              }),
              headers: {
                'Content-Type': 'application/json',
              },
            });
          }
        }
      } catch (error) {
        console.error('Error measuring performance:', error);
      }
    }
  },
};

/**
 * Performance monitoring utilities
 */

export const performanceMarks = {
  start: (markId: string) => {
    if (typeof performance !== 'undefined') {
      try {
        performance.mark(`${markId}:start`);
      } catch (error) {
        console.error('Error creating performance mark:', error);
      }
    }
  },
  
  end: (markId: string) => {
    if (typeof performance !== 'undefined') {
      try {
        performance.mark(`${markId}:end`);
        performance.measure(markId, `${markId}:start`, `${markId}:end`);
        
        // Optional: log the measurement duration
        const entries = performance.getEntriesByName(markId);
        if (entries.length > 0) {
          const duration = entries[0].duration;
          if (duration > 1000) { // Only log slow operations (> 1s)
            console.warn(`Performance: ${markId} took ${duration.toFixed(2)}ms`);
          }
        }
      } catch (error) {
        console.error('Error measuring performance:', error);
      }
    }
  },
  
  clearMarks: (markId: string) => {
    if (typeof performance !== 'undefined') {
      try {
        performance.clearMarks(`${markId}:start`);
        performance.clearMarks(`${markId}:end`);
        performance.clearMeasures(markId);
      } catch (error) {
        console.error('Error clearing performance marks:', error);
      }
    }
  }
};

/**
 * Track an event for analytics
 */
export const trackEvent = (
  eventName: string, 
  properties: Record<string, any> = {}
) => {
  // In a real app, you'd send this to an analytics service
  console.log(`[Event] ${eventName}`, properties);
  
  // Example implementation of sending to analytics service
  if (typeof window !== 'undefined' && window.gtag) {
    try {
      window.gtag('event', eventName, properties);
    } catch (error) {
      console.error('Error sending event to analytics:', error);
    }
  }
};

/**
 * Monitor errors
 */
export const captureError = (
  error: Error, 
  context: Record<string, any> = {}
) => {
  console.error('[Error]', error, context);
  
  // In a real app, you'd send this to an error monitoring service
  if (typeof window !== 'undefined' && window.Sentry) {
    try {
      window.Sentry.captureException(error, { extra: context });
    } catch (err) {
      console.error('Error sending to monitoring service:', err);
    }
  }
};

// Add types for window globals
declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      eventParams?: Record<string, any>
    ) => void;
    Sentry?: {
      captureException: (
        error: Error,
        context?: { extra: Record<string, any> }
      ) => void;
    };
  }
}

export default {
  reportWebVitals,
  performanceMonitoring,
};
