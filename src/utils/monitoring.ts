import { NextWebVitalsMetric } from 'next/app';

// Web Vitals reporting
export function reportWebVitals(metric: NextWebVitalsMetric) {
  const body = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
  };

  // Send to analytics endpoint
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
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
      const metrics = {
        dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcpConnection: navigation.connectEnd - navigation.connectStart,
        serverResponse: navigation.responseEnd - navigation.requestStart,
        domLoad: navigation.domComplete - navigation.domLoading,
        fullPageLoad: navigation.loadEventEnd - navigation.navigationStart,
      };

      // Send metrics to analytics
      if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
        fetch(`${process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT}/performance`, {
          method: 'POST',
          body: JSON.stringify(metrics),
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
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
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      await fetch(`${process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT}/api-performance`, {
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
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      fetch(`${process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT}/error`, {
        method: 'POST',
        body: JSON.stringify(errorMetrics),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  },
};

// Custom performance marks
export const performanceMarks = {
  start: (markName: string) => {
    if (typeof window !== 'undefined') {
      performance.mark(`${markName}-start`);
    }
  },

  end: (markName: string) => {
    if (typeof window !== 'undefined') {
      performance.mark(`${markName}-end`);
      performance.measure(markName, `${markName}-start`, `${markName}-end`);

      const measurements = performance.getEntriesByName(markName);
      const duration = measurements[0].duration;

      // Send custom mark metrics to analytics
      if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
        fetch(`${process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT}/custom-marks`, {
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
  },
};

export default {
  reportWebVitals,
  performanceMonitoring,
  performanceMarks,
};
