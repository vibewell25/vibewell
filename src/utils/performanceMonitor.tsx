import { performance } from 'perf_hooks';
import { EventEmitter } from 'events';
import NotificationService, { Notification } from '../services/notification-service';
import { MetricType } from '../services/performance-remediation';

// Add missing type definitions
interface PerformanceThresholds {
  [MetricType.API]: number;
  [MetricType.RENDER]: number;
  [MetricType.DATABASE]: number;
  [MetricType.COMPUTATION]: number;
  [MetricType.NETWORK]: number;
}

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PerformanceMeasure {
  id?: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  type?: MetricType;
  metadata?: Record<string, any>;
}

// Type for a completed performance measure with required fields
interface CompletedPerformanceMeasure {
  id?: string;
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  type: MetricType;
  metadata?: Record<string, any>;
}

// For compatibility with window.analyticsService
declare global {
  interface Window {
    analyticsService?: {
      trackEvent: (eventName: string, data: any) => void;
    };
  }
}

// Type guard function to check if a value is a number
function isNumber(value: number | undefined): value is number {
  return typeof value === 'number';
}

class PerformanceMonitor extends EventEmitter {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private thresholds: Map<string, number> = new Map();
  private notificationService: NotificationService | null = null;
  private isNotificationEnabled = false;
  private alertCooldowns: Map<string, number> = new Map();
  private readonly alertCooldownPeriod = 5 * 60 * 1000; // 5 minutes
  private readonly maxRetainedMetrics = 1000; // Maximum metrics to retain per type
  private measures: Map<string, PerformanceMeasure> = new Map();

  constructor() {
    super();
    this.setupEventListeners();
    this.initNotificationService();

    // Set default thresholds
    this.setDefaultThresholds();
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Listen for beforeunload to send any pending metrics
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flushMetrics();
      });
    }
  }

  /**
   * Initialize the notification service lazily to avoid circular dependencies
   */
  private async initNotificationService() {
    this.notificationService = new NotificationService();
  }

  /**
   * Set default thresholds for different metric types
   */
  private setDefaultThresholds(): void {
    const defaultThresholds: Partial<Record<string, number>> = {
      [MetricType.API]: 500, // 500ms for API calls
      [MetricType.RENDER]: 100, // 100ms for rendering
      [MetricType.DATABASE]: 200, // 200ms for database operations
      [MetricType.COMPUTATION]: 300, // 300ms for heavy computations
      [MetricType.NETWORK]: 1000, // 1000ms for network operations
    };

    this.setThresholds(defaultThresholds);
  }

  /**
   * Flush metrics to analytics before page unload
   */
  private flushMetrics(): void {
    // Implement flushing pending metrics to analytics service
    if (typeof window !== 'undefined' && window.analyticsService) {
      const pendingMeasures = this.getMeasures().filter(m => m.endTime && m.duration);

      if (pendingMeasures.length > 0) {
        window.analyticsService.trackEvent('performance_metrics_batch', {
          count: pendingMeasures.length,
          metrics: pendingMeasures,
        });
      }
    }
  }

  /**
   * Enable or disable performance monitoring
   */
  public setEnabled(isEnabled: boolean): void {
    this.isNotificationEnabled = isEnabled;
  }

  /**
   * Update performance thresholds
   */
  public setThresholds(thresholds: Partial<Record<string, number>>): void {
    for (const [key, value] of Object.entries(thresholds)) {
      // Use the type guard to ensure value is a number
      if (isNumber(value)) {
        this.thresholds.set(key, value);
      } else {
        console.warn(`Ignoring invalid threshold value for ${key}: value is undefined`);
      }
    }
  }

  /**
   * Start measuring performance for a specific operation
   * @param name Name of the operation to measure
   * @param type Optional metric type categorization
   * @param metadata Optional metadata to associate with the measurement
   */
  public startMeasure(name: string, type?: MetricType, metadata?: Record<string, any>): string {
    const id = type ? `${type}_${name}_${Date.now()}` : name;
    const startTime = performance.now();

    this.measures.set(id, {
      id,
      name,
      type,
      startTime,
      metadata,
    });

    return id;
  }

  /**
   * End a performance measurement
   */
  public stopMeasure(id: string): PerformanceMeasure | null {
    const measure = this.measures.get(id);
    if (!measure) {
      console.warn(`No measure found with id/name "${id}"`);
      return null;
    }

    measure.endTime = performance.now();
    measure.duration = measure.endTime - measure.startTime;

    // Check if measurement exceeds threshold and type exists
    if (measure.type && measure.duration && this.thresholds.has(measure.type)) {
      const threshold = this.thresholds.get(measure.type);
      if (threshold && measure.duration > threshold) {
        // Create a proper completed measure with required fields and non-null assertions
        const completedMeasure: CompletedPerformanceMeasure = {
          id: measure.id,
          name: measure.name,
          startTime: measure.startTime,
          endTime: measure.endTime!,
          duration: measure.duration!,
          type: measure.type!,
          metadata: measure.metadata,
        };
        this.reportPerformanceIssue(completedMeasure, threshold);
      }
    }

    // Store the completed metric
    this.storeMetric(measure);

    return measure;
  }

  /**
   * Store a metric in the metrics collection
   */
  private storeMetric(measure: PerformanceMeasure): void {
    if (!measure.duration || !measure.endTime) return;

    const type = measure.type || 'default';
    const metric: PerformanceMetric = {
      name: measure.name,
      duration: measure.duration,
      timestamp: Date.now(),
      metadata: measure.metadata,
    };

    // Get or create the array for this type
    if (!this.metrics.has(type)) {
      this.metrics.set(type, []);
    }

    const typeMetrics = this.metrics.get(type)!;
    typeMetrics.push(metric);

    // Trim array if it exceeds maximum size
    if (typeMetrics.length > this.maxRetainedMetrics) {
      typeMetrics.shift(); // Remove oldest entry
    }
  }

  /**
   * Alias for stopMeasure for backward compatibility
   */
  public endMeasure(id: string): PerformanceMeasure | null {
    return this.stopMeasure(id);
  }

  /**
   * Get a specific performance measure
   */
  public getMeasure(name: string): PerformanceMeasure | null {
    return this.measures.get(name) || null;
  }

  /**
   * Get all performance measures
   */
  public getMeasures(): PerformanceMeasure[] {
    return Array.from(this.measures.values());
  }

  /**
   * Get performance measures by type
   */
  public getMeasuresByType(type: MetricType): PerformanceMeasure[] {
    return Array.from(this.measures.values()).filter(measure => measure.type === type);
  }

  /**
   * Get metrics by type
   */
  public getMetricsByType(type: string): PerformanceMetric[] {
    return this.metrics.get(type) || [];
  }

  /**
   * Clear all performance measures
   */
  public clearMeasures(): void {
    this.measures.clear();
  }

  /**
   * Alias for clearMeasures for backward compatibility
   */
  public clearAll(): void {
    this.clearMeasures();
  }

  /**
   * Report performance issues above threshold
   */
  private reportPerformanceIssue(measure: CompletedPerformanceMeasure, threshold: number): void {
    // Use nullish coalescing operator to ensure we always have number values
    const duration = measure.duration ?? 0;
    const type = measure.type;

    // Early exit if no meaningful duration
    if (duration === 0) return;

    // Log to console
    console.warn(
      `Performance issue detected: ${type} - ${measure.name} took ${duration}ms (threshold: ${threshold}ms)`
    );

    // Send to analytics service if available
    if (typeof window !== 'undefined' && window.analyticsService) {
      window.analyticsService.trackEvent('performance_issue', {
        type,
        name: measure.name,
        duration,
        threshold,
        metadata: measure.metadata,
      });
    }

    // Emit performance issue event for remediation service to handle
    this.emit('performance_issue', {
      type,
      name: measure.name,
      duration,
      threshold,
      timestamp: Date.now(),
      metadata: measure.metadata,
    });

    // Send notification to admin if significantly over threshold
    if (this.notificationService && this.isNotificationEnabled && duration > threshold * 2) {
      // Check if we're in cooldown period for this issue
      const issueKey = `${type}_${measure.name}`;
      const now = Date.now();
      const lastAlertTime = this.alertCooldowns.get(issueKey) || 0;

      if (now - lastAlertTime > this.alertCooldownPeriod) {
        // Update cooldown timestamp
        this.alertCooldowns.set(issueKey, now);

        const exceedPercentage = Math.round((duration / threshold) * 100 - 100);
        const durationStr = String(Math.round(duration * 100) / 100);

        const notification: Notification = {
          type: 'system',
          subject: 'Performance Alert',
          message: `Critical performance issue: ${type} operation "${measure.name}" took ${durationStr}ms, exceeding the ${threshold}ms threshold by ${exceedPercentage}%`,
          data: measure,
        };

        this.notificationService.notifyAdmins(notification).catch(err => {
          console.error('Failed to send performance notification:', err);
        });
      }
    }
  }

  /**
   * Create a wrapped function that automatically measures performance
   */
  public createMeasureFunction<T extends (...args: any[]) => any>(
    name: string,
    fn: T,
    type?: MetricType,
    metadata?: Record<string, any>
  ): (...args: Parameters<T>) => ReturnType<T> {
    return (...args: Parameters<T>): ReturnType<T> => {
      const measureId = this.startMeasure(name, type, metadata);

      try {
        const result = fn(...args);

        // Handle promise results
        if (result instanceof Promise) {
          return result
            .then(value => {
              this.stopMeasure(measureId);
              return value;
            })
            .catch(error => {
              this.stopMeasure(measureId);
              throw error;
            }) as unknown as ReturnType<T>;
        }

        // Handle synchronous results
        this.stopMeasure(measureId);
        return result;
      } catch (error) {
        this.stopMeasure(measureId);
        throw error;
      }
    };
  }

  /**
   * Enable or disable notification for performance issues
   */
  public enableNotifications(enabled = true): void {
    this.isNotificationEnabled = enabled;
  }

  /**
   * Get performance statistics summary
   */
  public getStatistics(): Record<string, any> {
    const stats: Record<string, any> = {
      measures: this.measures.size,
      byType: {},
    };

    // Calculate statistics by type
    Array.from(this.metrics.entries()).forEach(([type, metrics]) => {
      if (metrics.length === 0) return;

      const durations = metrics.map((m: PerformanceMetric) => m.duration);
      const total = durations.reduce((sum: number, val: number) => sum + val, 0);
      const average = total / durations.length;
      const sorted = [...durations].sort((a: number, b: number) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      const p95 = sorted[Math.floor(sorted.length * 0.95)];

      stats.byType[type] = {
        count: metrics.length,
        average,
        median,
        min,
        max,
        p95,
      };
    });

    return stats;
  }

  /**
   * Export metrics for analysis
   */
  public exportMetrics(): Record<string, PerformanceMetric[]> {
    const result: Record<string, PerformanceMetric[]> = {};

    Array.from(this.metrics.entries()).forEach(([type, metrics]) => {
      result[type] = [...metrics];
    });

    return result;
  }
}

// Create and export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Example usage:
// performanceMonitor.setThresholds({
//   [MetricType.API]: 200,
//   [MetricType.RENDER]: 50,
// });
//
// // Start/stop manually
// const id = performanceMonitor.startMeasure('fetch-users', MetricType.API);
// fetchUsers().then(() => performanceMonitor.stopMeasure(id));
//
// // Or wrap functions automatically:
// const wrappedFetchUsers = performanceMonitor.createMeasureFunction(
//   'fetch-users',
//   fetchUsers,
//   MetricType.API
// );
//
// // Listen for events
// performanceMonitor.on('threshold-exceeded', event => {
//   console.warn(`Performance threshold exceeded: ${event.type} - ${event.name}`);
// });

/**
 * Performance monitoring utilities for the Vibewell application
 * Implements real user monitoring and performance budgets
 */

// Performance metrics we want to track
export interface PerformanceMetrics {
  // Navigation timing
  timeToFirstByte: number;
  domContentLoaded: number;
  fullPageLoad: number;

  // Component render timing
  firstContentfulPaint: number;
  largestContentfulPaint: number;

  // Interactivity
  firstInputDelay: number;
  timeToInteractive: number;

  // Stability
  cumulativeLayoutShift: number;

  // Custom component metrics
  componentRenderTime?: Record<string, number>;
  apiCallDuration?: Record<string, number>;
}

// Performance budgets - thresholds for acceptable performance
export const PERFORMANCE_BUDGETS = {
  timeToFirstByte: 200, // ms
  domContentLoaded: 1000, // ms
  fullPageLoad: 2000, // ms
  firstContentfulPaint: 1000, // ms
  largestContentfulPaint: 2500, // ms
  firstInputDelay: 100, // ms
  timeToInteractive: 3000, // ms
  cumulativeLayoutShift: 0.1, // score (lower is better)

  // Component-specific budgets
  components: {
    // Critical components
    Navigation: 50, // ms
    ProductList: 200, // ms
    UserProfile: 100, // ms
    Checkout: 150, // ms
    ARViewer: 300, // ms
  },

  // API call budgets
  api: {
    auth: 500, // ms
    products: 300, // ms
    user: 200, // ms
    checkout: 400, // ms
  },
};

/**
 * Component render timing - call at start of component render
 */
export function startComponentRender(componentName: string) {
  if (typeof window === 'undefined' || !window.performance) return null;

  const markName = `component-start-${componentName}`;
  performance.mark(markName);
  return markName;
}

/**
 * Component render timing - call when component has rendered
 */
export function endComponentRender(componentName: string, startMark?: string) {
  if (typeof window === 'undefined' || !window.performance) return;

  try {
    const markName = startMark || `component-start-${componentName}`;
    const endMarkName = `component-end-${componentName}`;

    performance.mark(endMarkName);
    performance.measure(`component-${componentName}`, markName, endMarkName);

    const measures = performance.getEntriesByName(`component-${componentName}`, 'measure');
    if (measures.length > 0) {
      const duration = measures[0].duration;

      // Store component render times
      const storedComponents = JSON.parse(sessionStorage.getItem('componentRenderTimes') || '{}');
      storedComponents[componentName] = duration;
      sessionStorage.setItem('componentRenderTimes', JSON.stringify(storedComponents));

      // Check against budget
      checkComponentAgainstBudget(componentName, duration);
    }

    // Clean up marks
    performance.clearMarks(markName);
    performance.clearMarks(endMarkName);
    performance.clearMeasures(`component-${componentName}`);
  } catch (error) {
    console.error(`[Performance] Error measuring component ${componentName}:`, error);
  }
}

/**
 * Check component render time against its budget
 */
export function checkComponentAgainstBudget(componentName: string, duration: number) {
  const componentBudgets = PERFORMANCE_BUDGETS.components;

  if (componentName in componentBudgets) {
    const budget = componentBudgets[componentName as keyof typeof componentBudgets];

    if (duration > budget) {
      reportPerformanceViolation(`Component: ${componentName}`, duration, budget);
    }
  }
}

/**
 * API call timing - call before making API request
 */
export function startApiCall(endpoint: string): string | null {
  if (typeof window === 'undefined' || !window.performance) return null;

  const markName = `api-start-${endpoint}`;
  performance.mark(markName);
  return markName;
}

/**
 * API call timing - call after API response received
 */
export function endApiCall(endpoint: string, startMark?: string | null): void {
  if (typeof window === 'undefined' || !window.performance) return;

  try {
    // Use default mark name if startMark is null or undefined
    const markName = startMark || `api-start-${endpoint}`;
    const endMarkName = `api-end-${endpoint}`;

    performance.mark(endMarkName);
    performance.measure(`api-${endpoint}`, markName, endMarkName);

    const measures = performance.getEntriesByName(`api-${endpoint}`, 'measure');
    if (measures.length > 0) {
      const duration = measures[0].duration;

      // Safely get stored API call durations
      const storedApiCalls = JSON.parse(sessionStorage.getItem('apiCallDurations') || '{}');
      storedApiCalls[endpoint] = duration;
      sessionStorage.setItem('apiCallDurations', JSON.stringify(storedApiCalls));

      // Check against budget
      checkApiAgainstBudget(endpoint, duration);
    }

    // Clean up marks
    performance.clearMarks(markName);
    performance.clearMarks(endMarkName);
    performance.clearMeasures(`api-${endpoint}`);
  } catch (error) {
    console.error(`[Performance] Error measuring API call ${endpoint}:`, error);
  }
}

/**
 * Check API call time against its budget
 */
export function checkApiAgainstBudget(endpoint: string, duration: number) {
  const apiBudgets = PERFORMANCE_BUDGETS.api;

  // Find the closest matching endpoint
  let matchingEndpoint: string | null = null;

  for (const budgetEndpoint in apiBudgets) {
    if (endpoint.includes(budgetEndpoint)) {
      matchingEndpoint = budgetEndpoint;
      break;
    }
  }

  if (matchingEndpoint) {
    const budget = apiBudgets[matchingEndpoint as keyof typeof apiBudgets];

    if (duration > budget) {
      reportPerformanceViolation(`API: ${endpoint}`, duration, budget);
    }
  }
}

/**
 * Report a performance budget violation
 */
export function reportPerformanceViolation(metricName: string, value: number, budget: number) {
  console.warn(
    `[Performance] Budget exceeded for ${metricName}: ${value.toFixed(2)}ms (budget: ${budget}ms)`
  );

  // Store violations for analysis
  const violations = JSON.parse(sessionStorage.getItem('performanceViolations') || '[]');
  violations.push({
    metric: metricName,
    value,
    budget,
    timestamp: Date.now(),
    url: window.location.pathname,
  });
  sessionStorage.setItem('performanceViolations', JSON.stringify(violations));

  // Send violation to analytics in production
  if (process.env.NODE_ENV === 'production' && window.analyticsService) {
    window.analyticsService.trackEvent('performance_violation', {
      metric: metricName,
      value,
      budget,
      url: window.location.pathname,
    });
  }
}

/**
 * Get all collected performance metrics
 */
export function getMetrics(): Partial<PerformanceMetrics> {
  if (typeof window === 'undefined') return {};

  try {
    return {
      timeToFirstByte: parseFloat(sessionStorage.getItem('ttfb') || '0'),
      domContentLoaded: parseFloat(sessionStorage.getItem('dcl') || '0'),
      fullPageLoad: parseFloat(sessionStorage.getItem('load') || '0'),
      firstContentfulPaint: parseFloat(sessionStorage.getItem('fcp') || '0'),
      largestContentfulPaint: parseFloat(sessionStorage.getItem('lcp') || '0'),
      firstInputDelay: parseFloat(sessionStorage.getItem('fid') || '0'),
      cumulativeLayoutShift: parseFloat(sessionStorage.getItem('cls') || '0'),
      componentRenderTime: JSON.parse(sessionStorage.getItem('componentRenderTimes') || '{}'),
      apiCallDuration: JSON.parse(sessionStorage.getItem('apiCallDurations') || '{}'),
    };
  } catch (error) {
    console.error('[Performance] Error getting metrics:', error);
    return {};
  }
}

/**
 * Check all metrics against their budgets
 */
export function checkBudgets() {
  const metrics = getMetrics();
  const violations = [];

  // Check core metrics
  for (const [key, value] of Object.entries(metrics)) {
    if (key in PERFORMANCE_BUDGETS && typeof value === 'number') {
      const budget = PERFORMANCE_BUDGETS[key as keyof typeof PERFORMANCE_BUDGETS];
      // Only compare if budget is a number
      if (typeof budget === 'number' && value > budget) {
        violations.push({ metric: key, value, budget });
      }
    }
  }

  // Check component metrics
  const componentTimes = metrics.componentRenderTime || {};
  for (const [component, time] of Object.entries(componentTimes)) {
    const componentBudgets = PERFORMANCE_BUDGETS.components;
    if (component in componentBudgets) {
      const budget = componentBudgets[component as keyof typeof componentBudgets];
      if (typeof time === 'number' && time > budget) {
        violations.push({ metric: `Component: ${component}`, value: time, budget });
      }
    }
  }

  // Check API metrics
  const apiTimes = metrics.apiCallDuration || {};
  for (const [endpoint, time] of Object.entries(apiTimes)) {
    const apiBudgets = PERFORMANCE_BUDGETS.api;
    for (const budgetEndpoint in apiBudgets) {
      if (endpoint.includes(budgetEndpoint)) {
        const budget = apiBudgets[budgetEndpoint as keyof typeof apiBudgets];
        if (typeof time === 'number' && time > budget) {
          violations.push({ metric: `API: ${endpoint}`, value: time, budget });
        }
        break;
      }
    }
  }

  return violations;
}

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return null;

  // Return API for manual performance monitoring
  return {
    startComponentRender,
    endComponentRender,
    startApiCall,
    endApiCall,
    reportPerformanceViolation,
    getMetrics,
    checkBudgets,
  };
}

// Create and export the default utility with all the necessary functions
const performanceUtility = {
  startComponentRender,
  endComponentRender,
  startApiCall,
  endApiCall,
  reportPerformanceViolation,
  getMetrics,
  checkBudgets,
  initPerformanceMonitoring,
};

export default performanceUtility;
