/**
 * Performance monitoring utilities for the Vibewell application
 * Implements real user monitoring and performance budgets
 */
import { isDefined } from './type-guards';

// Add these type declarations at the top of the file
interface PerformanceEntryExtended extends PerformanceEntry {
  processingStart?: number;
  hadRecentInput?: boolean;
}

// Add after the interfaces
interface PerformanceError extends Error {
  code: string;
  context?: any;
}

class PerformanceMonitoringError extends Error implements PerformanceError {
  code: string;
  context?: any;

  constructor(message: string, code: string, context?: any) {
    super(message);
    this.name = 'PerformanceMonitoringError';
    this.code = code;
    this.context = context;
  }
}

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
    'Navigation': 50, // ms
    'ProductList': 200, // ms
    'UserProfile': 100, // ms
    'Checkout': 150, // ms
    'ARViewer': 300, // ms
  },
  
  // API call budgets
  api: {
    'auth': 500, // ms
    'products': 300, // ms
    'user': 200, // ms
    'checkout': 400, // ms
  }
};

// Store observers for cleanup
let observers: PerformanceObserver[] = [];

// Add specific entry type interfaces
interface LCPEntry extends PerformanceEntry {
  renderTime: number;
  loadTime: number;
  size: number;
  element?: Element;
}

interface FIDEntry extends PerformanceEntry {
  processingStart: number;
  processingEnd: number;
  duration: number;
  target?: Element;
}

interface CLSEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
  sources: Array<{
    node?: Node;
    currentRect?: DOMRectReadOnly;
    previousRect?: DOMRectReadOnly;
  }>;
}

// Add retry mechanism for critical measurements
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function retryMeasurement<T>(
  measureFn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T | null> {
  try {
    return await measureFn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return retryMeasurement(measureFn, retries - 1);
    }
    console.error('[Performance] Measurement failed after retries:', error);
    return null;
  }
}

// Add performance data batching
const BATCH_INTERVAL = 5000; // 5 seconds
let metricsQueue: PerformanceMetrics[] = [];
let batchTimeout: NodeJS.Timeout | null = null;

function queueMetrics(metrics: Partial<PerformanceMetrics>) {
  metricsQueue.push(metrics as PerformanceMetrics);
  
  if (!batchTimeout) {
    batchTimeout = setTimeout(() => {
      if (metricsQueue.length > 0) {
        sendPerformanceMetricsToAnalytics(metricsQueue);
        metricsQueue = [];
      }
      batchTimeout = null;
    }, BATCH_INTERVAL);
  }
}

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring(options = {}) {
  if (typeof window === 'undefined') return null;
  
  // Setup Performance Observer for core web vitals
  setupPerformanceObservers();
  
  // Capture initial page load metrics
  capturePageLoadMetrics();
  
  console.log('[Performance] Monitoring initialized');
  
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

/**
 * Setup Performance Observers for Web Vitals
 */
function setupPerformanceObservers(): void {
  if (typeof window === 'undefined' || !window.PerformanceObserver) return;

  try {
    // First cleanup any existing observers
    cleanupPerformanceMonitoring();

    const observeEntries = (type: string) => {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            switch (type) {
              case 'largest-contentful-paint':
                handleLCPEntry(entry as LCPEntry);
                break;
              case 'first-input':
                handleFIDEntry(entry as FIDEntry);
                break;
              case 'layout-shift':
                handleCLSEntry(entry as CLSEntry);
                break;
              case 'paint':
                handlePaintEntry(entry);
                break;
            }
          });
        });
        
        observer.observe({ entryTypes: [type] });
        observers.push(observer);
      } catch (error) {
        throw new PerformanceMonitoringError(
          `Failed to setup observer for ${type}`,
          'OBSERVER_SETUP_FAILED',
          { type, error }
        );
      }
    };

    ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'].forEach(observeEntries);

  } catch (error) {
    if (error instanceof PerformanceMonitoringError) {
      console.error(`[Performance] ${error.code}:`, error.message, error.context);
    } else {
      console.error('[Performance] Error setting up observers:', error);
    }
  }
}

/**
 * Capture metrics for initial page load
 */
function capturePageLoadMetrics() {
  if (typeof window === 'undefined' || !window.performance) return;
  
  // Use requestAnimationFrame to ensure we capture metrics after render
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      try {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          // Time to First Byte
          const ttfb = navigation.responseStart - navigation.requestStart;
          sessionStorage.setItem('ttfb', ttfb.toString());
          checkAgainstBudget('timeToFirstByte', ttfb);
          
          // DOM Content Loaded
          const dcl = navigation.domContentLoadedEventEnd - navigation.fetchStart;
          sessionStorage.setItem('dcl', dcl.toString());
          checkAgainstBudget('domContentLoaded', dcl);
          
          // Full Page Load
          const load = navigation.loadEventEnd - navigation.fetchStart;
          sessionStorage.setItem('load', load.toString());
          checkAgainstBudget('fullPageLoad', load);
        }
        
        // First Contentful Paint
        const paintMetrics = performance.getEntriesByType('paint');
        const fcpEntry = paintMetrics.find(entry => entry.name === 'first-contentful-paint');
        
        if (fcpEntry) {
          sessionStorage.setItem('fcp', fcpEntry.startTime.toString());
          checkAgainstBudget('firstContentfulPaint', fcpEntry.startTime);
        }
        
        // Log performance data
        sendPerformanceMetricsToAnalytics(getMetrics());
      } catch (error) {
        console.error('[Performance] Error capturing page metrics:', error);
      }
    });
  });
}

/**
 * Component render timing - call at start of component render
 */
export function startComponentRender(componentName: string): string | null {
  if (typeof window === 'undefined' || !window.performance) return null;
  
  const markName = `component-start-${componentName}`;
  performance.mark(markName);
  return markName;
}

/**
 * Component render timing - call when component has rendered
 */
export function endComponentRender(componentName: string, startMark?: string | null): void {
  if (typeof window === 'undefined' || !window.performance) return;
  
  try {
    // Use default mark name if startMark is null or undefined
    const markName = startMark ?? `component-start-${componentName}`;
    const endMarkName = `component-end-${componentName}`;
    
    performance.mark(endMarkName);
    performance.measure(`component-${componentName}`, markName, endMarkName);
    
    const measures = performance.getEntriesByName(`component-${componentName}`, 'measure');
    if (measures.length > 0) {
      const duration = measures[0].duration;
      
      // Safely get stored component render times
      let storedComponentTimes: Record<string, number> = {};
      try {
        const storedData = sessionStorage.getItem('componentRenderTimes');
        storedComponentTimes = storedData ? JSON.parse(storedData) : {};
      } catch (error) {
        console.error('[Performance] Error parsing stored component times:', error);
        storedComponentTimes = {};
      }
      
      storedComponentTimes[componentName] = duration;
      sessionStorage.setItem('componentRenderTimes', JSON.stringify(storedComponentTimes));
      
      // Check against budget
      checkComponentAgainstBudget(componentName, duration);
    }
    
    // Clean up marks
    if (markName) {
      performance.clearMarks(markName);
    }
    performance.clearMarks(endMarkName);
    performance.clearMeasures(`component-${componentName}`);
  } catch (error) {
    console.error(`[Performance] Error measuring component ${componentName}:`, error);
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
    const markName = startMark ?? `api-start-${endpoint}`;
    const endMarkName = `api-end-${endpoint}`;
    
    performance.mark(endMarkName);
    performance.measure(`api-${endpoint}`, markName, endMarkName);
    
    const measures = performance.getEntriesByName(`api-${endpoint}`, 'measure');
    if (measures.length > 0) {
      const duration = measures[0].duration;
      
      // Safely get stored API call durations
      let storedApiCalls: Record<string, number> = {};
      try {
        const storedData = sessionStorage.getItem('apiCallDurations');
        storedApiCalls = storedData ? JSON.parse(storedData) : {};
      } catch (error) {
        console.error('[Performance] Error parsing stored API calls:', error);
        storedApiCalls = {};
      }
      
      storedApiCalls[endpoint] = duration;
      sessionStorage.setItem('apiCallDurations', JSON.stringify(storedApiCalls));
      
      // Check against budget
      checkApiAgainstBudget(endpoint, duration);
    }
    
    // Clean up marks
    if (markName) {
      performance.clearMarks(markName);
    }
    performance.clearMarks(endMarkName);
    performance.clearMeasures(`api-${endpoint}`);
  } catch (error) {
    console.error(`[Performance] Error measuring API call ${endpoint}:`, error);
  }
}

/**
 * Check a metric against its budget
 */
function checkAgainstBudget(metricName: keyof typeof PERFORMANCE_BUDGETS, value: number) {
  const budget = PERFORMANCE_BUDGETS[metricName];
  
  // Ensure we're dealing with a numeric budget
  const numericBudget = (typeof budget === 'object') ? 0 : budget;
  
  if (value > numericBudget) {
    reportPerformanceViolation(metricName, value, numericBudget);
  }
}

/**
 * Check component render time against its budget
 */
function checkComponentAgainstBudget(componentName: string, duration: number) {
  const componentBudgets = PERFORMANCE_BUDGETS.components;
  
  if (componentName in componentBudgets) {
    const budget = componentBudgets[componentName as keyof typeof componentBudgets];
    
    if (duration > budget) {
      reportPerformanceViolation(`Component: ${componentName}`, duration, budget);
    }
  }
}

/**
 * Check API call time against its budget
 */
function checkApiAgainstBudget(endpoint: string, duration: number) {
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
  console.warn(`[Performance] Budget exceeded for ${metricName}: ${value.toFixed(2)}ms (budget: ${budget}ms)`);
  
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
  if (process.env.NODE_ENV === 'production') {
    sendViolationToAnalytics(metricName, value, budget);
  }
}

/**
 * Send performance metrics to analytics
 */
function sendPerformanceMetricsToAnalytics(metrics: Partial<PerformanceMetrics> | Partial<PerformanceMetrics>[]): void {
  // Handle both single metrics and arrays
  const metricsArray = Array.isArray(metrics) ? metrics : [metrics];
  
  metricsArray.forEach(metric => {
    // Your analytics implementation here
    console.debug('[Performance] Sending metrics to analytics:', metric);
  });
}

/**
 * Send a performance violation to analytics
 */
function sendViolationToAnalytics(metricName: string, value: number, budget: number) {
  // In a real app, you would send this to your analytics service
  console.log('[Performance] Would send violation to analytics:', {
    metric: metricName,
    value,
    budget,
    url: window.location.pathname,
  });
  
  // Example of sending to analytics:
  // analytics.trackEvent('performance_violation', {
  //   metric: metricName,
  //   value,
  //   budget,
  //   url: window.location.pathname,
  // });
}

/**
 * Get all collected performance metrics
 */
export function getMetrics(): Partial<PerformanceMetrics> {
  if (typeof window === 'undefined') return {};
  
  try {
    // Safely parse JSON items from sessionStorage
    const safeGetItem = (key: string, defaultValue: any): any => {
      const item = sessionStorage.getItem(key);
      if (item === null) return defaultValue;
      
      try {
        return JSON.parse(item);
      } catch (e) {
        return defaultValue;
      }
    };
    
    // Safely get numeric values
    const safeGetNumber = (key: string, defaultValue = 0): number => {
      const value = sessionStorage.getItem(key);
      if (value === null) return defaultValue;
      
      const num = Number(value);
      return isNaN(num) ? defaultValue : num;
    };
    
    return {
      timeToFirstByte: safeGetNumber('ttfb'),
      domContentLoaded: safeGetNumber('dcl'),
      fullPageLoad: safeGetNumber('load'),
      firstContentfulPaint: safeGetNumber('fcp'),
      largestContentfulPaint: safeGetNumber('lcp'),
      firstInputDelay: safeGetNumber('fid'),
      cumulativeLayoutShift: safeGetNumber('cls'),
      componentRenderTime: safeGetItem('componentRenderTimes', {}),
      apiCallDuration: safeGetItem('apiCallDurations', {}),
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

// Add cleanup function
export function cleanupPerformanceMonitoring(): void {
  if (typeof window === 'undefined') return;

  // Disconnect all observers
  observers.forEach(observer => {
    try {
      observer.disconnect();
    } catch (error) {
      console.error('[Performance] Error disconnecting observer:', error);
    }
  });
  observers = [];

  // Clear marks and measures
  if (window.performance && window.performance.clearMarks) {
    window.performance.clearMarks();
  }
  if (window.performance && window.performance.clearMeasures) {
    window.performance.clearMeasures();
  }
}

// Add specific entry type handlers
function handleLCPEntry(entry: LCPEntry) {
  queueMetrics({
    largestContentfulPaint: entry.renderTime || entry.loadTime
  });
}

function handleFIDEntry(entry: FIDEntry) {
  queueMetrics({
    firstInputDelay: entry.processingStart - entry.startTime
  });
}

let cumulativeLayoutShift = 0;
function handleCLSEntry(entry: CLSEntry) {
  if (!entry.hadRecentInput) {
    cumulativeLayoutShift += entry.value;
    queueMetrics({
      cumulativeLayoutShift
    });
  }
}

function handlePaintEntry(entry: PerformanceEntry) {
  if (entry.name === 'first-contentful-paint') {
    queueMetrics({
      firstContentfulPaint: entry.startTime
    });
  }
}

// Create and export the default utility
const performanceMonitoring = {
  startComponentRender,
  endComponentRender,
  startApiCall,
  endApiCall,
  reportPerformanceViolation,
  getMetrics,
  checkBudgets,
  initPerformanceMonitoring
};

export default performanceMonitoring; 