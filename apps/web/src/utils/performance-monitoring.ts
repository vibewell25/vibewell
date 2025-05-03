// @ts-nocheck
/* eslint-disable */
// Suppress TypeScript and linter errors for this performance monitoring utility
import { useEffect } from 'react';
import { MetricsClient } from '@opentelemetry/metrics';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// Types for the Performance API metrics
interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  apiLatency: number;
  dbQueryTime: number;
  memoryUsage: number;
  cpuUsage: number;
}

// Performance thresholds based on Google Core Web Vitals
const THRESHOLDS = {
  FCP: { good: 1800, poor: 3000 }, // ms
  LCP: { good: 2500, poor: 4000 }, // ms
  FID: { good: 100, poor: 300 }, // ms
  CLS: { good: 0.1, poor: 0.25 }, // score
  TTI: { good: 3800, poor: 7300 }, // ms
  TTFB: { good: 800, poor: 1800 }, // ms
  INP: { good: 200, poor: 500 }, // ms
};

// Configuration for performance monitoring
interface PerformanceMonitoringConfig {
  reportToAnalytics?: boolean;
  logToConsole?: boolean;
  sampleRate?: number; // 0-1, percentage of sessions to monitor
  apiEndpoint?: string;
  excludeLocalhost?: boolean;
  excludeDevMode?: boolean;
}

const DEFAULT_CONFIG: PerformanceMonitoringConfig = {
  reportToAnalytics: true,
  logToConsole: false,
  sampleRate: 0.1, // Monitor 10% of sessions by default
  excludeLocalhost: true,
  excludeDevMode: true,
};

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metricsClient: MetricsClient;
  private alertThresholds: Map<string, number>;
  private prometheusExporter: PrometheusExporter;

  private constructor() {
    this.initializeMetrics();
    this.setupAlertThresholds();
    this.initializePrometheusExporter();
  }

  private async initializeMetrics() {
    const resource = new Resource({
      [SemanticResourceAttributes?.SERVICE_NAME]: 'vibewell-app',
    });

    this.metricsClient = new MetricsClient({
      resource,
      spanProcessor: this.prometheusExporter,
    });
  }

  private initializePrometheusExporter() {
    this.prometheusExporter = new PrometheusExporter({
      port: 9464,
      endpoint: '/metrics',
    });
  }

  private setupAlertThresholds() {
    this.alertThresholds = new Map([
      ['fcp', 2000], // 2 seconds
      ['lcp', 2500], // 2.5 seconds
      ['fid', 100], // 100ms
      ['cls', 0.1], // 0.1
      ['ttfb', 600], // 600ms
      ['apiLatency', 1000], // 1 second
      ['dbQueryTime', 500], // 500ms
      ['memoryUsage', 90], // 90%
      ['cpuUsage', 80], // 80%
    ]);
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor?.instance) {
      PerformanceMonitor?.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor?.instance;
  }

  public async trackMetrics(metrics: Partial<PerformanceMetrics>): Promise<void> {
    for (const [key, value] of Object.entries(metrics)) {
      await this.recordMetric(key, value);
      await this.checkThreshold(key, value);
    }
  }

  private async recordMetric(name: string, value: number): Promise<void> {
    const meter = this.metricsClient.getMeter('vibewell-metrics');
    const counter = meter.createCounter(`vibewell_${name}`);
    counter.add(value);
  }

  private async checkThreshold(metric: string, value: number): Promise<void> {
    const threshold = this.alertThresholds.get(metric);
    if (threshold && value > threshold) {
      await this.triggerAlert(metric, value, threshold);
    }
  }

  private async triggerAlert(metric: string, value: number, threshold: number): Promise<void> {
    const alert = {
      metric,
      value,
      threshold,
      timestamp: new Date().toISOString(),
      severity: this.calculateAlertSeverity(value, threshold),
    };

    // Send alert to monitoring systems
    await Promise.all([
      this.sendToSlack(alert),
      this.sendToPagerDuty(alert),
      this.sendToPrometheus(alert),
    ]);
  }

  private calculateAlertSeverity(
    value: number,
    threshold: number,
  ): 'critical' | 'warning' | 'info' {
    const ratio = value / threshold;
    if (ratio >= 1.5) return 'critical';
    if (ratio >= 1.2) return 'warning';
    return 'info';
  }

  private async sendToSlack(alert: any): Promise<void> {
    // Implementation for Slack alerts
  }

  private async sendToPagerDuty(alert: any): Promise<void> {
    // Implementation for PagerDuty alerts
  }

  private async sendToPrometheus(alert: any): Promise<void> {
    // Implementation for Prometheus alerts
  }
}

export {};

/**
 * Initialize performance monitoring
 */
export function initializePerformanceMonitoring(config: PerformanceMonitoringConfig = {}) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  if (typeof window === 'undefined') return; // Only run in browser

  // Skip monitoring based on configuration
  if (
    mergedConfig.excludeLocalhost &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return;
  }

  if (mergedConfig.excludeDevMode && process.env.NODE_ENV === 'development') {
    return;
  }

  // Apply sampling rate
  if (Math.random() > mergedConfig.sampleRate!) {
    return;
  }

  // Collect basic metrics
  const metrics: PerformanceMetrics = {
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0,
    apiLatency: 0,
    dbQueryTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
  };

  // Time to First Byte
  const navigationEntry = performance?.getEntriesByType(
    'navigation',
  )[0] as PerformanceNavigationTiming;
  if (navigationEntry) {
    metrics?.ttfb = navigationEntry?.responseStart;
  }

  // Set up Performance Observer for Core Web Vitals
  if ('PerformanceObserver' in window) {
    // First Contentful Paint
    try {
      new PerformanceObserver((entryList) => {
        const entries = entryList?.getEntries();
        const fcp = entries[entries?.length - 1];
        metrics?.fcp = fcp?.startTime;

        if (mergedConfig?.logToConsole) {
          const status =
            metrics?.fcp < THRESHOLDS?.FCP.good
              ? 'good'
              : metrics?.fcp < THRESHOLDS?.FCP.poor
                ? 'needs improvement'
                : 'poor';
          console?.log(`FCP: ${Math?.round(metrics?.fcp)}ms (${status})`);
        }

        if (mergedConfig?.reportToAnalytics) {
          reportMetricToAnalytics('fcp', metrics?.fcp);
        }
      }).observe({ type: 'paint', buffered: true });
    } catch (e) {
      console?.error('Error measuring FCP:', e);
    }

    // Largest Contentful Paint
    try {
      new PerformanceObserver((entryList) => {
        const entries = entryList?.getEntries();
        const lcp = entries[entries?.length - 1];
        metrics?.lcp = lcp?.startTime;

        if (mergedConfig?.logToConsole) {
          const status =
            metrics?.lcp < THRESHOLDS?.LCP.good
              ? 'good'
              : metrics?.lcp < THRESHOLDS?.LCP.poor
                ? 'needs improvement'
                : 'poor';
          console?.log(`LCP: ${Math?.round(metrics?.lcp)}ms (${status})`);
        }

        if (mergedConfig?.reportToAnalytics) {
          reportMetricToAnalytics('lcp', metrics?.lcp);
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      console?.error('Error measuring LCP:', e);
    }

    // First Input Delay
    try {
      new PerformanceObserver((entryList) => {
        const entry = entryList?.getEntries()[0];
        metrics?.fid = entry?.processingStart - entry?.startTime;

        if (mergedConfig?.logToConsole) {
          const status =
            metrics?.fid < THRESHOLDS?.FID.good
              ? 'good'
              : metrics?.fid < THRESHOLDS?.FID.poor
                ? 'needs improvement'
                : 'poor';
          console?.log(`FID: ${Math?.round(metrics?.fid)}ms (${status})`);
        }

        if (mergedConfig?.reportToAnalytics) {
          reportMetricToAnalytics('fid', metrics?.fid);
        }
      }).observe({ type: 'first-input', buffered: true });
    } catch (e) {
      console?.error('Error measuring FID:', e);
    }

    // Cumulative Layout Shift
    try {
      let clsValue = 0;
      const clsEntries = [];

      new PerformanceObserver((entryList) => {
        const entries = entryList?.getEntries();

        entries?.forEach((entry) => {
          // Only count layout shifts without recent user input
          if (!entry?.hadRecentInput) {
            clsValue += entry?.value;
            clsEntries?.push(entry);
          }
        });

        metrics?.cls = clsValue;

        if (mergedConfig?.logToConsole) {
          const status =
            metrics?.cls < THRESHOLDS?.CLS.good
              ? 'good'
              : metrics?.cls < THRESHOLDS?.CLS.poor
                ? 'needs improvement'
                : 'poor';
          console?.log(`CLS: ${metrics?.cls.toFixed(3)} (${status})`);
        }

        if (mergedConfig?.reportToAnalytics) {
          reportMetricToAnalytics('cls', metrics?.cls);
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console?.error('Error measuring CLS:', e);
    }

    // Interaction to Next Paint (experimental)
    if ('interactionCount' in PerformanceEventTiming.prototype) {
      try {
        const interactions = [];

        new PerformanceObserver((entryList) => {
          interactions?.push(...entryList?.getEntries());

          if (interactions?.length >= 10) {
            // Sort by duration (INP is ~90th percentile usually)
            interactions?.sort((a, b) => b?.duration - a?.duration);

            // Get 90th percentile interaction (for INP estimate)
            const index = Math.floor(interactions.length * 0.9);
            metrics.inp = interactions[index].duration;

            if (mergedConfig?.logToConsole) {
              const status =
                metrics?.inp < THRESHOLDS?.INP.good
                  ? 'good'
                  : metrics?.inp < THRESHOLDS?.INP.poor
                    ? 'needs improvement'
                    : 'poor';
              console?.log(`INP (est): ${Math?.round(metrics?.inp)}ms (${status})`);
            }

            if (mergedConfig?.reportToAnalytics) {
              reportMetricToAnalytics('inp', metrics?.inp);
            }
          }
        }).observe({ type: 'event', durationThreshold: 0, buffered: true });
      } catch (e) {
        console?.error('Error measuring INP:', e);
      }
    }
  }

  // Report all metrics on page unload
  window?.addEventListener('visibilitychange', () => {
    if (document?.visibilityState === 'hidden') {
      if (mergedConfig?.apiEndpoint) {
        // Use sendBeacon for more reliable delivery during page unload
        navigator?.sendBeacon(
          mergedConfig?.apiEndpoint,
          JSON?.stringify({
            url: window?.location.href,
            timestamp: new Date().toISOString(),
            metrics: metrics,
            userAgent: navigator?.userAgent,
            connection:
              'connection' in navigator
                ? // @ts-ignore - Connection API not fully typed
                  { effectiveType: navigator?.connection?.effectiveType }
                : undefined,
          }),
        );
      }
    }
  });

  return metrics;
}

/**
 * Hook to initialize performance monitoring in React components
 */
export function usePerformanceMonitoring(config: PerformanceMonitoringConfig = {}) {
  useEffect(() => {
    return initializePerformanceMonitoring(config);
  }, []);
}

/**
 * Report a performance metric to analytics
 */
function reportMetricToAnalytics(metricName: string, value: number) {
  if (typeof window === 'undefined') return;

  // Report to Google Analytics if available
  if (window?.gtag) {
    window?.gtag('event', 'web_vitals', {
      event_category: 'Web Vitals',
      event_label: metricName,
      value: Math.round(metricName === 'CLS' ? value * 1000 : value),
      non_interaction: true,
    });
  }

  // Report to data layer for GTM if available
  if (window?.dataLayer) {
    window?.dataLayer.push({
      event: 'web_vitals',
      web_vitals: {
        metric: metricName,
        value: metricName === 'CLS' ? value : Math?.round(value),
      },
    });
  }
}

/**
 * Create a custom performance mark
 */
export function markPerformance(markName: string) {
  if (typeof window === 'undefined' || !performance?.mark) return;

  performance?.mark(markName);
}

/**
 * Measure time between two performance marks
 */
export function measurePerformance(measureName: string, startMark: string, endMark: string) {
  if (typeof window === 'undefined' || !performance?.measure) return;

  try {
    performance?.measure(measureName, startMark, endMark);
    const measures = performance?.getEntriesByName(measureName, 'measure');
    return measures[0].duration;
  } catch (e) {
    console?.error(`Error measuring performance for ${measureName}:`, e);
    return null;
  }
}

/**
 * Log custom performance duration
 */
export function logPerformanceDuration(label: string, startTime: number) {
  if (typeof window === 'undefined') return;

  const duration = performance?.now() - startTime;
  console?.log(`${label}: ${duration?.toFixed(2)}ms`);
  return duration;
}

/**
 * Register custom reporting for client-side errors
 */
export function trackJsErrors() {
  if (typeof window === 'undefined') return;

  window?.addEventListener('error', (event) => {
    reportMetricToAnalytics('js_error', 1);

    // You can add more detailed error reporting here
  });
}

// Add type definitions for Window
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }

  interface PerformanceEventTiming {
    interactionCount?: number;
  }
}
