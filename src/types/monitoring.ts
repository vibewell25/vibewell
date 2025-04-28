export interface AlertConfig {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface AlertingSystem {
  sendAlert(name: string, config: AlertConfig): Promise<void>;
}

export interface PerformanceMonitor {
  recordMetric(name: string, value: number): void;
  track(metrics: Record<string, number>): void;
  getMetrics(): Record<string, number>;
  clearMetrics(): void;
  getActiveAlerts(): AlertConfig[];
  getAlertHistory(startTime: number, endTime: number): AlertConfig[];
  getCPUUsage(): Promise<number>;
  getMemoryUsage(): Promise<number>;
  getDiskUsage(): Promise<number>;
  getNetworkHealth(): Promise<number>;
}

export interface JobMetrics {
  jobEnqueueTime: number;
  jobProcessingTime: number;
  jobSuccess: number;
  jobError: number;
}

export interface QueryMetrics {
  averageTime: number;
  cacheHitRate: number;
  queryCount: number;
  errorRate: number;
}

export interface PerformanceResult {
  [key: string]: number;
  executionTime: number;
  memoryUsed?: number;
  fps?: number;
}

export interface ImageOptimizationStats {
  optimizationRate: number;
  cdnLatency: number;
  compressionRatio: number;
  processingTime: number;
}

export interface MonitoringConfig {
  metrics: {
    responseTime: boolean;
    memoryUsage: boolean;
    cpuUsage: boolean;
    networkLatency: boolean;
  };
  alertThresholds: {
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
    networkLatency: number;
  };
  samplingRate: number;
  notifications: {
    email: boolean;
    slack: boolean;
    pagerduty: boolean;
  };
}

export interface MonitoringService {
  // Core monitoring
  startMonitoring(): Promise<void>;
  stopMonitoring(): Promise<void>;

  // Metrics
  recordMetric(name: string, value: number): Promise<void>;
  getMetrics(): Record<string, number>;
  getMetricHistory(
    name: string,
    duration: string,
  ): Promise<Array<{ timestamp: number; value: number }>>;

  // Alerts
  configureAlerts(config: AlertConfig[]): Promise<void>;
  acknowledgeAlert(alertId: string): Promise<void>;

  // Health checks
  checkSystemHealth(): Promise<SystemHealthStatus>;
  registerHealthCheck(name: string, check: () => Promise<boolean>): void;

  // Dashboard data
  getDashboardData(): Promise<DashboardData>;
  getPerformanceReport(startDate: string, endDate: string): Promise<PerformanceReport>;
}

export interface SystemHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Array<{
    name: string;
    status: 'pass' | 'fail';
    latency: number;
    lastChecked: string;
  }>;
  timestamp: string;
}

export interface PerformanceMetrics {
  lcp: number;
  fid: number;
  cls: number;
  responseTime: number;
  cpuUsage: number;
  memoryUsage: number;
}

export interface SystemHealth {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

export interface DashboardData {
  currentMetrics: Record<string, number>;
  alerts: {
    active: AlertConfig[];
    history: AlertConfig[];
  };
  health: SystemHealth;
  performance: PerformanceMetrics;
}

export interface PerformanceReport {
  period: {
    start: string;
    end: string;
  };
  summary: {
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    totalRequests: number;
    errorRate: number;
    averageCpuUsage: number;
    averageMemoryUsage: number;
  };
  trends: {
    responseTime: Array<{ timestamp: string; value: number }>;
    cpuUsage: Array<{ timestamp: string; value: number }>;
    memoryUsage: Array<{ timestamp: string; value: number }>;
    errorRate: Array<{ timestamp: string; value: number }>;
  };
  alerts: Array<{
    config: AlertConfig;
    triggeredAt: string;
    resolvedAt?: string;
    duration: number;
  }>;
  recommendations: Array<{
    type: 'performance' | 'security' | 'reliability';
    priority: 'low' | 'medium' | 'high';
    description: string;
    impact: string;
    action: string;
  }>;
}
