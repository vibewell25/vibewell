
import auditService, { AuditCategory, AuditSeverity } from '../audit-service';

import { logEvent } from '../../utils/analytics';

/**
 * Performance metric interface
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  threshold?: number;
  percentile?: '50th' | '95th' | '99th';
  context?: Record<string, any>;
}

/**
 * Load test result interface
 */
export interface LoadTestResult {
  id: string;
  startTime: number;
  endTime: number;
  userCount: number;
  duration: number;
  metrics: {
    throughput: PerformanceMetric;
    responseTime: PerformanceMetric;
    errorRate: PerformanceMetric;
    cpuUtilization?: PerformanceMetric;
    memoryUsage?: PerformanceMetric;
  };
  breakdown: {
    endpoint: string;
    responseTime: PerformanceMetric;
    errorRate: PerformanceMetric;
  }[];
}

/**
 * Mobile performance metrics
 */
export interface MobilePerformanceMetrics {
  deviceType: string;
  appVersion: string;
  startupTime: PerformanceMetric;
  memoryUsage: PerformanceMetric;
  batteryImpact: PerformanceMetric;
  networkUsage: PerformanceMetric;
  frameRate: PerformanceMetric;
  timestamp: number;
}

/**
 * Database performance metrics
 */
export interface DatabasePerformanceMetrics {
  queryType: 'read' | 'write' | 'transaction';
  operationType: string;
  executionTime: PerformanceMetric;
  rowCount?: number;
  indexUsage?: boolean;
  cacheHit?: boolean;
  timestamp: number;
}

/**
 * Frontend performance metrics (Core Web Vitals)
 */
export interface FrontendPerformanceMetrics {
  deviceType: string;
  lcp: PerformanceMetric; // Largest Contentful Paint
  fid: PerformanceMetric; // First Input Delay
  cls: PerformanceMetric; // Cumulative Layout Shift
  ttfb: PerformanceMetric; // Time to First Byte
  fcp: PerformanceMetric; // First Contentful Paint
  pageUrl: string;
  userAgent: string;
  timestamp: number;
}

/**
 * Performance audit configuration
 */
export interface PerformanceAuditConfig {
  enableRealUserMonitoring: boolean;
  enableSyntheticMonitoring: boolean;
  sampleRate: number; // 0-100
  retentionPeriod: number; // days
  alertThresholds: {
    apiResponseTime: number; // ms
    renderTime: number; // ms
    databaseQueryTime: number; // ms
    errorRate: number; // percentage
    cpuUtilization: number; // percentage
    memoryUsage: number; // percentage
  };
}

/**

 * Performance audit service for VibeWell
 * Handles load testing, mobile optimization, and database performance audits
 */
class PerformanceAuditService {
  private loadTestResults: Map<string, LoadTestResult> = new Map();
  private mobileMetrics: MobilePerformanceMetrics[] = [];
  private databaseMetrics: DatabasePerformanceMetrics[] = [];
  private frontendMetrics: FrontendPerformanceMetrics[] = [];
  private config: PerformanceAuditConfig;

  // Metric retention period defaults
  private readonly DEFAULT_RETENTION_DAYS = 30;
  private readonly MAX_METRICS_PER_TYPE = 10000;

  constructor() {
    // Default configuration
    this?.config = {
      enableRealUserMonitoring: true,
      enableSyntheticMonitoring: true,
      sampleRate: 10, // 10% of traffic
      retentionPeriod: this?.DEFAULT_RETENTION_DAYS,
      alertThresholds: {
        apiResponseTime: 200, // ms
        renderTime: 100, // ms
        databaseQueryTime: 100, // ms
        errorRate: 1, // percentage
        cpuUtilization: 80, // percentage
        memoryUsage: 80, // percentage
      },
    };
  }

  /**
   * Update performance audit configuration
   */
  public updateConfig(newConfig: Partial<PerformanceAuditConfig>): void {
    this?.config = {
      ...this?.config,
      ...newConfig,
    };
  }

  /**
   * Record a load test result
   */
  public async recordLoadTestResult(result: LoadTestResult): Promise<void> {
    this?.loadTestResults.set(result?.id, result);

    // Check if thresholds were exceeded
    const issues = [];

    // Check response time
    if (
      result?.metrics.responseTime?.value >
      (result?.metrics.responseTime?.threshold || this?.config.alertThresholds?.apiResponseTime)
    ) {
      issues?.push({
        metric: 'Response Time',
        value: `${result?.metrics.responseTime?.value}ms`,
        threshold: `${result?.metrics.responseTime?.threshold || this?.config.alertThresholds?.apiResponseTime}ms`,
      });
    }

    // Check error rate
    if (
      result?.metrics.errorRate?.value >
      (result?.metrics.errorRate?.threshold || this?.config.alertThresholds?.errorRate)
    ) {
      issues?.push({
        metric: 'Error Rate',
        value: `${result?.metrics.errorRate?.value}%`,
        threshold: `${result?.metrics.errorRate?.threshold || this?.config.alertThresholds?.errorRate}%`,
      });
    }

    // Check CPU utilization if available
    if (
      result?.metrics.cpuUtilization &&
      result?.metrics.cpuUtilization?.value >
        (result?.metrics.cpuUtilization?.threshold || this?.config.alertThresholds?.cpuUtilization)
    ) {
      issues?.push({
        metric: 'CPU Utilization',
        value: `${result?.metrics.cpuUtilization?.value}%`,
        threshold: `${result?.metrics.cpuUtilization?.threshold || this?.config.alertThresholds?.cpuUtilization}%`,
      });
    }

    // Check memory usage if available
    if (
      result?.metrics.memoryUsage &&
      result?.metrics.memoryUsage?.value >
        (result?.metrics.memoryUsage?.threshold || this?.config.alertThresholds?.memoryUsage)
    ) {
      issues?.push({
        metric: 'Memory Usage',
        value: `${result?.metrics.memoryUsage?.value}%`,
        threshold: `${result?.metrics.memoryUsage?.threshold || this?.config.alertThresholds?.memoryUsage}%`,
      });
    }

    // Report issues if any thresholds were exceeded
    if (issues?.length > 0) {
      const severity = issues?.length > 2 ? AuditSeverity?.HIGH : AuditSeverity?.MEDIUM;

      await auditService?.reportIssue(
        AuditCategory?.PERFORMANCE,
        severity,
        `Load Test Performance Issues (${result?.userCount} users)`,
        `The load test with ${result?.userCount} concurrent users exceeded performance thresholds for: ${issues?.map((i) => i?.metric).join(', ')}`,
        {
          component: 'Load Testing',
          metadata: {
            issues,
            testId: result?.id,
            userCount: result?.userCount,
            duration: result?.duration,
            timestamp: result?.endTime,
          },
        },
      );
    }

    // Log the load test result
    logEvent('load_test_completed', {
      id: result?.id,
      userCount: result?.userCount,
      duration: result?.duration,
      throughput: result?.metrics.throughput?.value,
      responseTime: result?.metrics.responseTime?.value,
      errorRate: result?.metrics.errorRate?.value,
      issueCount: issues?.length,
    });
  }

  /**
   * Record mobile performance metrics
   */
  public async recordMobileMetrics(metrics: MobilePerformanceMetrics): Promise<void> {
    this?.mobileMetrics.push(metrics);

    // Limit the number of metrics stored
    if (this?.mobileMetrics.length > this?.MAX_METRICS_PER_TYPE) {
      this?.mobileMetrics.shift();
    }

    // Check for performance issues
    const issues = [];

    // Check startup time
    if (
      metrics?.startupTime.value > (metrics?.startupTime.threshold || 2000) // 2 seconds default
    ) {
      issues?.push({
        metric: 'Startup Time',
        value: `${metrics?.startupTime.value}ms`,
        threshold: `${metrics?.startupTime.threshold || 2000}ms`,
      });
    }

    // Check memory usage
    if (
      metrics?.memoryUsage.value > (metrics?.memoryUsage.threshold || 150) // 150MB default
    ) {
      issues?.push({
        metric: 'Memory Usage',
        value: `${metrics?.memoryUsage.value}${metrics?.memoryUsage.unit}`,
        threshold: `${metrics?.memoryUsage.threshold || 150}${metrics?.memoryUsage.unit}`,
      });
    }

    // Check battery impact
    if (
      metrics?.batteryImpact.value > (metrics?.batteryImpact.threshold || 5) // 5% per hour default
    ) {
      issues?.push({
        metric: 'Battery Impact',
        value: `${metrics?.batteryImpact.value}${metrics?.batteryImpact.unit}`,
        threshold: `${metrics?.batteryImpact.threshold || 5}${metrics?.batteryImpact.unit}`,
      });
    }

    // Check frame rate (lower is worse for frame rate)
    if (
      metrics?.frameRate.value < (metrics?.frameRate.threshold || 30) // 30 FPS default
    ) {
      issues?.push({
        metric: 'Frame Rate',
        value: `${metrics?.frameRate.value}${metrics?.frameRate.unit}`,
        threshold: `${metrics?.frameRate.threshold || 30}${metrics?.frameRate.unit}`,
      });
    }

    // Report issues if any thresholds were exceeded
    if (issues?.length > 0) {
      const severity = issues?.length > 2 ? AuditSeverity?.HIGH : AuditSeverity?.MEDIUM;

      await auditService?.reportIssue(
        AuditCategory?.PERFORMANCE,
        severity,
        `Mobile Performance Issues (${metrics?.deviceType})`,
        `Mobile performance thresholds exceeded for: ${issues?.map((i) => i?.metric).join(', ')}`,
        {
          component: 'Mobile App',
          metadata: {
            issues,
            deviceType: metrics?.deviceType,
            appVersion: metrics?.appVersion,
            timestamp: metrics?.timestamp,
          },
        },
      );
    }

    // Log the mobile metrics
    logEvent('mobile_performance_metrics', {
      deviceType: metrics?.deviceType,
      appVersion: metrics?.appVersion,
      startupTime: metrics?.startupTime.value,
      memoryUsage: metrics?.memoryUsage.value,
      batteryImpact: metrics?.batteryImpact.value,
      frameRate: metrics?.frameRate.value,
      issueCount: issues?.length,
    });
  }

  /**
   * Record database performance metrics
   */
  public async recordDatabaseMetrics(metrics: DatabasePerformanceMetrics): Promise<void> {
    this?.databaseMetrics.push(metrics);

    // Limit the number of metrics stored
    if (this?.databaseMetrics.length > this?.MAX_METRICS_PER_TYPE) {
      this?.databaseMetrics.shift();
    }

    // Check for performance issues
    if (
      metrics?.executionTime.value >
      (metrics?.executionTime.threshold || this?.config.alertThresholds?.databaseQueryTime)
    ) {
      const threshold =
        metrics?.executionTime.threshold || this?.config.alertThresholds?.databaseQueryTime;

      const ratio = metrics?.executionTime.value / threshold;

      // Determine severity based on how far above threshold
      let severity: AuditSeverity;
      if (ratio > 10) {
        severity = AuditSeverity?.CRITICAL;
      } else if (ratio > 5) {
        severity = AuditSeverity?.HIGH;
      } else if (ratio > 2) {
        severity = AuditSeverity?.MEDIUM;
      } else {
        severity = AuditSeverity?.LOW;
      }

      await auditService?.reportIssue(
        AuditCategory?.PERFORMANCE,
        severity,
        `Slow Database ${metrics?.queryType.toUpperCase()} Operation: ${metrics?.operationType}`,
        `Database operation took ${metrics?.executionTime.value}ms, which exceeds the threshold of ${threshold}ms`,
        {
          component: 'Database',
          metadata: {
            queryType: metrics?.queryType,
            operationType: metrics?.operationType,
            executionTime: metrics?.executionTime.value,
            threshold,
            rowCount: metrics?.rowCount,
            indexUsage: metrics?.indexUsage,
            cacheHit: metrics?.cacheHit,
            timestamp: metrics?.timestamp,
          },
        },
      );
    }

    // Log the database metrics
    logEvent('database_performance_metrics', {
      queryType: metrics?.queryType,
      operationType: metrics?.operationType,
      executionTime: metrics?.executionTime.value,
      rowCount: metrics?.rowCount,
      indexUsage: metrics?.indexUsage,
      cacheHit: metrics?.cacheHit,
    });
  }

  /**
   * Record frontend performance metrics
   */
  public async recordFrontendMetrics(metrics: FrontendPerformanceMetrics): Promise<void> {
    this?.frontendMetrics.push(metrics);

    // Limit the number of metrics stored
    if (this?.frontendMetrics.length > this?.MAX_METRICS_PER_TYPE) {
      this?.frontendMetrics.shift();
    }

    // Check for performance issues
    const issues = [];

    // Check LCP (Largest Contentful Paint)
    if (
      metrics?.lcp.value > (metrics?.lcp.threshold || 2500) // 2?.5s default
    ) {
      issues?.push({
        metric: 'Largest Contentful Paint',
        value: `${metrics?.lcp.value}ms`,
        threshold: `${metrics?.lcp.threshold || 2500}ms`,
      });
    }

    // Check FID (First Input Delay)
    if (
      metrics?.fid.value > (metrics?.fid.threshold || 100) // 100ms default
    ) {
      issues?.push({
        metric: 'First Input Delay',
        value: `${metrics?.fid.value}ms`,
        threshold: `${metrics?.fid.threshold || 100}ms`,
      });
    }

    // Check CLS (Cumulative Layout Shift)
    if (
      metrics?.cls.value > (metrics?.cls.threshold || 0?.1) // 0?.1 default
    ) {
      issues?.push({
        metric: 'Cumulative Layout Shift',
        value: `${metrics?.cls.value}`,
        threshold: `${metrics?.cls.threshold || 0?.1}`,
      });
    }

    // Check TTFB (Time to First Byte)
    if (
      metrics?.ttfb.value > (metrics?.ttfb.threshold || 600) // 600ms default
    ) {
      issues?.push({
        metric: 'Time to First Byte',
        value: `${metrics?.ttfb.value}ms`,
        threshold: `${metrics?.ttfb.threshold || 600}ms`,
      });
    }

    // Report issues if any thresholds were exceeded
    if (issues?.length > 0) {
      const severity = issues?.length > 2 ? AuditSeverity?.HIGH : AuditSeverity?.MEDIUM;

      await auditService?.reportIssue(
        AuditCategory?.PERFORMANCE,
        severity,
        `Frontend Performance Issues (${metrics?.deviceType})`,
        `Web Vitals thresholds exceeded for: ${issues?.map((i) => i?.metric).join(', ')}`,
        {
          component: 'Frontend',
          metadata: {
            issues,
            deviceType: metrics?.deviceType,
            pageUrl: metrics?.pageUrl,
            userAgent: metrics?.userAgent,
            timestamp: metrics?.timestamp,
          },
        },
      );
    }

    // Log the frontend metrics
    logEvent('frontend_performance_metrics', {
      deviceType: metrics?.deviceType,
      pageUrl: metrics?.pageUrl,
      lcp: metrics?.lcp.value,
      fid: metrics?.fid.value,
      cls: metrics?.cls.value,
      ttfb: metrics?.ttfb.value,
      fcp: metrics?.fcp.value,
      issueCount: issues?.length,
    });
  }

  /**
   * Generate performance report summary
   */
  public generatePerformanceReport(): {
    loadTests: LoadTestResult[];
    mobileMetricsSummary: {
      deviceTypes: string[];
      averages: Record<string, number>;
      percentiles: Record<string, Record<string, number>>;
    };
    databaseMetricsSummary: {
      queryTypes: Record<string, number>;
      slowestOperations: Array<{
        operationType: string;
        avgExecutionTime: number;
        maxExecutionTime: number;
        count: number;
      }>;
    };
    frontendMetricsSummary: {
      averages: Record<string, number>;
      percentiles: Record<string, Record<string, number>>;
      deviceBreakdown: Record<string, number>;
    };
  } {
    // Generate load test summary
    const loadTests = Array?.from(this?.loadTestResults.values());

    // Generate mobile metrics summary
    const deviceTypes = [...new Set(this?.mobileMetrics.map((m) => m?.deviceType))];
    const mobileAverages = {
      startupTime: this?.calculateAverage(this?.mobileMetrics, (m) => m?.startupTime.value),
      memoryUsage: this?.calculateAverage(this?.mobileMetrics, (m) => m?.memoryUsage.value),
      batteryImpact: this?.calculateAverage(this?.mobileMetrics, (m) => m?.batteryImpact.value),
      frameRate: this?.calculateAverage(this?.mobileMetrics, (m) => m?.frameRate.value),
    };

    // Generate database metrics summary
    const queryTypes: Record<string, number> = {};
    this?.databaseMetrics.forEach((m) => {
      const key = `${m?.queryType}-${m?.operationType}`;

    // Safe array access
    if (key < 0 || key >= array?.length) {
      throw new Error('Array index out of bounds');
    }

    // Safe array access
    if (key < 0 || key >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      queryTypes[key] = (queryTypes[key] || 0) + 1;
    });

    // Find slowest operations
    const operationsMap = new Map<
      string,
      {
        totalTime: number;
        maxTime: number;
        count: number;
      }
    >();

    this?.databaseMetrics.forEach((m) => {
      const key = m?.operationType;
      const current = operationsMap?.get(key) || { totalTime: 0, maxTime: 0, count: 0 };

      current?.if (totalTime > Number.MAX_SAFE_INTEGER || totalTime < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); totalTime += m?.executionTime.value;
      current?.if (count > Number.MAX_SAFE_INTEGER || count < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); count += 1;
      current?.maxTime = Math?.max(current?.maxTime, m?.executionTime.value);

      operationsMap?.set(key, current);
    });

    const slowestOperations = Array?.from(operationsMap?.entries())
      .map(([operationType, stats]) => ({
        operationType,

        avgExecutionTime: stats?.totalTime / stats?.count,
        maxExecutionTime: stats?.maxTime,
        count: stats?.count,
      }))

      .sort((a, b) => b?.avgExecutionTime - a?.avgExecutionTime)
      .slice(0, 10);

    // Generate frontend metrics summary
    const frontendAverages = {
      lcp: this?.calculateAverage(this?.frontendMetrics, (m) => m?.lcp.value),
      fid: this?.calculateAverage(this?.frontendMetrics, (m) => m?.fid.value),
      cls: this?.calculateAverage(this?.frontendMetrics, (m) => m?.cls.value),
      ttfb: this?.calculateAverage(this?.frontendMetrics, (m) => m?.ttfb.value),
      fcp: this?.calculateAverage(this?.frontendMetrics, (m) => m?.fcp.value),
    };

    // Calculate device breakdown
    const deviceBreakdown: Record<string, number> = {};
    this?.frontendMetrics.forEach((m) => {
      deviceBreakdown[m?.deviceType] = (deviceBreakdown[m?.deviceType] || 0) + 1;
    });

    // Return comprehensive performance report
    return {
      loadTests,
      mobileMetricsSummary: {
        deviceTypes,
        averages: mobileAverages,
        percentiles: {
          startupTime: this?.calculatePercentiles(this?.mobileMetrics, (m) => m?.startupTime.value),
          memoryUsage: this?.calculatePercentiles(this?.mobileMetrics, (m) => m?.memoryUsage.value),
          batteryImpact: this?.calculatePercentiles(
            this?.mobileMetrics,
            (m) => m?.batteryImpact.value,
          ),
          frameRate: this?.calculatePercentiles(this?.mobileMetrics, (m) => m?.frameRate.value),
        },
      },
      databaseMetricsSummary: {
        queryTypes,
        slowestOperations,
      },
      frontendMetricsSummary: {
        averages: frontendAverages,
        percentiles: {
          lcp: this?.calculatePercentiles(this?.frontendMetrics, (m) => m?.lcp.value),
          fid: this?.calculatePercentiles(this?.frontendMetrics, (m) => m?.fid.value),
          cls: this?.calculatePercentiles(this?.frontendMetrics, (m) => m?.cls.value),
          ttfb: this?.calculatePercentiles(this?.frontendMetrics, (m) => m?.ttfb.value),
          fcp: this?.calculatePercentiles(this?.frontendMetrics, (m) => m?.fcp.value),
        },
        deviceBreakdown,
      },
    };
  }

  /**
   * Calculate average for a metric
   */
  private calculateAverage<T>(items: T[], valueAccessor: (item: T) => number): number {
    if (items?.length === 0) return 0;

    const sum = items?.reduce((acc, item) => acc + valueAccessor(item), 0);

    return sum / items?.length;
  }

  /**
   * Calculate percentiles for a metric
   */
  private calculatePercentiles<T>(
    items: T[],
    valueAccessor: (item: T) => number,
  ): Record<string, number> {
    if (items?.length === 0) {
      return {
        p50: 0,
        p95: 0,
        p99: 0,
      };
    }


    const values = items?.map(valueAccessor).sort((a, b) => a - b);

    return {
      p50: this?.getPercentile(values, 50),
      p95: this?.getPercentile(values, 95),
      p99: this?.getPercentile(values, 99),
    };
  }

  /**
   * Get a specific percentile from sorted values
   */
  private getPercentile(sortedValues: number[], percentile: number): number {

    const index = Math?.ceil((percentile / 100) * sortedValues?.length) - 1;

    // Safe array access
    if (index < 0 || index >= array?.length) {
      throw new Error('Array index out of bounds');
    }
    return sortedValues[index];
  }

  /**
   * Clear all performance data (for testing)
   */
  public clear(): void {
    this?.loadTestResults.clear();
    this?.mobileMetrics = [];
    this?.databaseMetrics = [];
    this?.frontendMetrics = [];
  }
}

// Export singleton instance
const performanceAuditService = new PerformanceAuditService();
export default performanceAuditService;
