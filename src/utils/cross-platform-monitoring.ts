/**
 * Cross-platform performance monitoring utility for Vibewell
 * Works with both React Native mobile app and Next.js web app
 */

import performanceMonitoring from './performance-monitoring';

// Platform detection
const isBrowser = typeof window !== 'undefined';
const isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

// Default metrics structure
export interface PerformanceMetrics {
  // Core metrics for all platforms
  renderTime?: Record<string, number>;
  apiCallDuration?: Record<string, number>;
  memoryUsage?: number;

  // Web-specific metrics
  timeToFirstByte?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;

  // React Native specific metrics
  jsThreadBlockTime?: number;
  frameDropRate?: number;
  nativeRenderTime?: Record<string, number>;
}

// Initialize monitoring based on platform
export function initCrossPlatformMonitoring(options = {}) {
  if (isBrowser && !isReactNative) {
    // Web platform - use standard web performance monitoring
    return performanceMonitoring.initPerformanceMonitoring(options);
  } else if (isReactNative) {
    // React Native - use React Native specific implementation
    return initReactNativeMonitoring(options);
  }

  // Fallback for server-side or unsupported environments
  return mockMonitoring();
}

// React Native specific implementation
function initReactNativeMonitoring(options = {}) {
  console.log('[Performance] React Native monitoring initialized');

  // On React Native, we'd use libraries like react-native-performance or custom native modules
  // This is a placeholder implementation
  return {
    startComponentRender: (componentName: string) => {
      const timestamp = Date.now();
      console.debug(`[Performance] Start measuring ${componentName}`);
      return componentName + '-' + timestamp;
    },

    endComponentRender: (componentName: string, startMark?: string) => {
      const endTime = Date.now();
      const startTime = startMark ? parseInt(startMark.split('-')[1]) : 0;
      if (startTime) {
        const duration = endTime - startTime;
        console.debug(`[Performance] Component ${componentName} rendered in ${duration}ms`);
      }
    },

    startApiCall: (endpoint: string) => {
      const timestamp = Date.now();
      console.debug(`[Performance] Start API call to ${endpoint}`);
      return endpoint + '-' + timestamp;
    },

    endApiCall: (endpoint: string, startMark?: string) => {
      const endTime = Date.now();
      const startTime = startMark ? parseInt(startMark.split('-')[1]) : 0;
      if (startTime) {
        const duration = endTime - startTime;
        console.debug(`[Performance] API call to ${endpoint} completed in ${duration}ms`);
      }
    },

    reportPerformanceViolation: (metricName: string, value: number, budget: number) => {
      console.warn(`[Performance] Budget exceeded for ${metricName}: ${value} (budget: ${budget})`);
    },

    getMetrics: () => {
      return {}; // Placeholder
    },
  };
}

// Mock implementation for server-side or unsupported environments
function mockMonitoring() {
  return {
    startComponentRender: () => null,
    endComponentRender: () => {},
    startApiCall: () => null,
    endApiCall: () => {},
    reportPerformanceViolation: () => {},
    getMetrics: () => ({}),
  };
}

// Create and export the default cross-platform utility
const crossPlatformMonitoring = {
  ...performanceMonitoring,
  initCrossPlatformMonitoring,
};

export default crossPlatformMonitoring;
