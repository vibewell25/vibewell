export interface ServerTiming {
  TTFB: number;
  DATABASE_QUERY: number;
  API_RESPONSE: number;
  REDIS_OPERATION: number;
}

export interface MetricThresholds {
  // Core Web Vitals
  LCP: number;
  FID: number;
  CLS: number;
  FCP: number;
  TTI: number;
  TBT: number;

  // Bundle sizes
  TOTAL_BUNDLE_SIZE: number;
  INITIAL_JS_SIZE: number;
  INITIAL_CSS_SIZE: number;
  CHUNK_SIZE: number;

  // Performance budgets
  SERVER_TIMING: ServerTiming;

  // Resource limits
  MEMORY_USAGE: number;
  CPU_USAGE: number;
  HEAP_SIZE: number;

  // Cache performance
  CACHE_HIT_RATE: number;
  CACHE_LATENCY: number;

  // Image optimization
  IMAGE_SIZE_LIMIT: number;
  IMAGE_LOAD_TIME: number;
  IMAGE_OPTIMIZATION_RATE: number;
}

export interface MonitoringFeatures {
  webVitals: boolean;
  resourceTiming: boolean;
  jsExceptions: boolean;
  apiPerformance: boolean;
  bundleSize: boolean;
  memoryUsage: boolean;
  longTasks: boolean;
}

export interface AlertChannelConfig {
  email?: string[];
  slack?: string[];
  webhook?: string;
  customChannel?: string;
}

export interface AlertConfig {
  enabled: boolean;
  channels: AlertChannelConfig;
  throttleInterval: number;
  retryAttempts: number;
  criticalAlertThreshold: number;
}

export interface DebugConfig {
  enabled: boolean;
  verboseLogging: boolean;
  stackTraceLimit: number;
  consoleOutput: 'none' | 'errors' | 'warnings' | 'all';
}

export type ReportingFormat = 'json' | 'csv' | 'prometheus';

export interface ReportingConfig {
  interval: number;
  batchSize: number;
  retentionPeriod: number;
  compressionEnabled: boolean;
  format: ReportingFormat;
}

export interface SamplingConfig {
  enabled: boolean;
  rate: number;
  userIdBased: boolean;
  excludePaths: string[];
}

export interface MonitoringConfig {
  enabled: boolean;
  reportingEndpoint: string;
  features: MonitoringFeatures;
  alerting: AlertConfig;
  debugging: DebugConfig;
  reporting: ReportingConfig;
  sampling: SamplingConfig;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface BundleMetrics {
  totalSize: number;
  jsSize: number;
  cssSize: number;
  chunks: {
    name: string;
    size: number;
    type: string;
  }[];
}

export interface ResourceMetrics {
  url: string;
  initiatorType: string;
  duration: number;
  transferSize: number;
  encodedBodySize: number;
  decodedBodySize: number;
}

export interface WebVitalMetrics {
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  tti: number;
  tbt: number;
}

export interface CacheMetrics {
  hitRate: number;
  missRate: number;
  latency: number;
  size: number;
  evictions: number;
}

export interface ImageMetrics {
  url: string;
  originalSize: number;
  optimizedSize: number;
  loadTime: number;
  format: string;
  dimensions: {
    width: number;
    height: number;
  };
}

export interface PerformanceReport {
  timestamp: number;
  webVitals: WebVitalMetrics;
  bundle: BundleMetrics;
  resources: ResourceMetrics[];
  cache: CacheMetrics;
  images: ImageMetrics[];
  memory: {
    usage: number;
    heapSize: number;
    cpuUsage: number;
  };
  server: {
    timing: ServerTiming;
    status: number;
    endpoint: string;
  };
}

export interface ResourceMetric extends PerformanceMetric {
  resourceType: 'script' | 'style' | 'image' | 'font' | 'other';
  url: string;
  duration: number;
  size?: number;
  protocol?: string;
}

export interface WebVitalMetric extends PerformanceMetric {
  name: 'FCP' | 'LCP' | 'CLS' | 'FID' | 'TTFB';
  rating: 'good' | 'needs-improvement' | 'poor';
}

export interface ErrorMetric extends PerformanceMetric {
  message: string;
  stack?: string;
  type: string;
  count: number;
}

export interface CustomMetric extends PerformanceMetric {
  category: string;
  subCategory?: string;
  metadata?: Record<string, unknown>;
}

export type MetricType = PerformanceMetric | ResourceMetric | WebVitalMetric | ErrorMetric | CustomMetric; 