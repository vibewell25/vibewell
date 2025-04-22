import type { MonitoringConfig } from '../types/performance';

const METRIC_THRESHOLDS = {
  FCP: 2000,  // First Contentful Paint threshold in ms
  LCP: 2500,  // Largest Contentful Paint threshold in ms
  FID: 100,   // First Input Delay threshold in ms
  CLS: 0.1,   // Cumulative Layout Shift threshold
  TTFB: 600,  // Time to First Byte threshold in ms
  TTI: 3500   // Time to Interactive threshold in ms
};

export const MONITORING_CONFIG: MonitoringConfig = {
  enabled: process.env['ENABLE_PERFORMANCE_MONITORING'] === 'true',
  reportingEndpoint: process.env['MONITORING_ENDPOINT'] || 'http://localhost:8080/metrics',
  
  features: {
    webVitals: true,
    resourceTiming: true,
    jsExceptions: true,
    memoryUsage: true,
    networkRequests: true,
    serverTiming: true
  },
  
  alerting: {
    enabled: true,
    channels: ['slack', 'email'],
    throttleInterval: 300000, // 5 minutes
    retryAttempts: 3,
    criticalAlertThreshold: 0.9
  },
  
  debugging: {
    enabled: process.env['NODE_ENV'] !== 'production',
    verboseLogging: process.env['DEBUG_LEVEL'] === 'verbose',
    stackTraceLimit: 10,
    consoleOutput: process.env['NODE_ENV'] !== 'production'
  },
  
  reporting: {
    interval: 60000, // 1 minute
    batchSize: 100,
    retentionPeriod: 604800, // 7 days in seconds
    compressionEnabled: true,
    format: 'json'
  },
  
  sampling: {
    enabled: true,
    rate: 0.1, // 10% sampling rate
    userIdBased: true,
    excludePaths: ['/health', '/metrics', '/static']
  }
}; 