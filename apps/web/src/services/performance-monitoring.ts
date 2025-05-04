
import { METRIC_THRESHOLDS, MONITORING_CONFIG } from '../config/performance-monitoring';
import type {
  PerformanceMetric,
  BundleMetrics,
  ResourceMetrics,
  WebVitalMetrics,
  CacheMetrics,
  ImageMetrics,
  PerformanceReport,
  MonitoringConfig,

} from '../types/performance';

export class PerformanceMonitoringService {
  private static instance: PerformanceMonitoringService;
  private config: MonitoringConfig;
  private metrics: PerformanceMetric[] = [];
  private reportingInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = MONITORING_CONFIG;
    this.initializeMonitoring();
  }

  public static getInstance(): PerformanceMonitoringService {
    if (!PerformanceMonitoringService.instance) {
      PerformanceMonitoringService.instance = new PerformanceMonitoringService();
    }
    return PerformanceMonitoringService.instance;
  }

  private initializeMonitoring(): void {
    if (!this.config.enabled) return;

    if (this.config.features.webVitals) {
      this.initializeWebVitals();
    }

    if (this.config.features.resourceTiming) {
      this.initializeResourceTiming();
    }

    if (this.config.features.jsExceptions) {
      this.initializeErrorTracking();
    }

    this.startReporting();
  }

  private initializeWebVitals(): void {
    if (typeof window !== 'undefined') {

      import('web-vitals').then(({ onLCP, onFID, onCLS, onFCP, onTTI }) => {
        onLCP((metric) => this.recordMetric('LCP', metric.value));
        onFID((metric) => this.recordMetric('FID', metric.value));
        onCLS((metric) => this.recordMetric('CLS', metric.value));
        onFCP((metric) => this.recordMetric('FCP', metric.value));
        onTTI((metric) => this.recordMetric('TTI', metric.value));
      });
    }
  }

  private initializeResourceTiming(): void {
    if (typeof window !== 'undefined') {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            this.recordResourceMetric(entry as PerformanceResourceTiming);
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
    }
  }

  private initializeErrorTracking(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.recordMetric('JS_ERROR', 1, {
          message: event.error.message,
          stack: event.error.stack,
        });
      });
    }
  }

  private recordMetric(name: string, value: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);
    this.checkThresholds(metric);
  }

  private recordResourceMetric(entry: PerformanceResourceTiming): void {
    const resourceMetric: ResourceMetrics = {
      url: entry.name,
      initiatorType: entry.initiatorType,
      duration: entry.duration,
      transferSize: entry.transferSize,
      encodedBodySize: entry.encodedBodySize,
      decodedBodySize: entry.decodedBodySize,
    };

    this.recordMetric('RESOURCE', entry.duration, resourceMetric);
  }

  private checkThresholds(metric: PerformanceMetric): void {
    if (!this.config.alerting.enabled) return;

    const threshold = (METRIC_THRESHOLDS as any)[metric.name];
    if (threshold && metric.value > threshold) {
      this.triggerAlert(metric);
    }
  }

  private triggerAlert(metric: PerformanceMetric): void {
    // Implement alert triggering logic (e.g., send to monitoring service)
    console.warn(`Performance threshold exceeded: ${metric.name} = ${metric.value}`);
  }

  private startReporting(): void {
    this.reportingInterval = setInterval(() => {
      this.sendReport();
    }, this.config.reporting.interval);
  }

  private async sendReport(): Promise<void> {
    if (this.metrics.length === 0) return;

    const report = this.generateReport();

    try {
      const response = await fetch(this.config.reportingEndpoint, {
        method: 'POST',
        headers: {


          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });

      if (response.ok) {
        this.metrics = [];
      }
    } catch (error) {
      console.error('Failed to send performance report:', error);
    }
  }

  private generateReport(): PerformanceReport {
    const now = Date.now();
    const webVitals = this.getWebVitalMetrics();
    const bundle = this.getBundleMetrics();
    const resources = this.getResourceMetrics();
    const cache = this.getCacheMetrics();
    const images = this.getImageMetrics();
    const memory = this.getMemoryMetrics();
    const server = this.getServerMetrics();

    return {
      timestamp: now,
      webVitals,
      bundle,
      resources,
      cache,
      images,
      memory,
      server,
    };
  }

  private getWebVitalMetrics(): WebVitalMetrics {
    const getMetricValue = (name: string) => {
      const metric = this.metrics.find((m) => m.name === name);
      return metric.value || 0;
    };

    return {
      lcp: getMetricValue('LCP'),
      fid: getMetricValue('FID'),
      cls: getMetricValue('CLS'),
      fcp: getMetricValue('FCP'),
      tti: getMetricValue('TTI'),
      tbt: getMetricValue('TBT'),
    };
  }

  private getBundleMetrics(): BundleMetrics {
    // Implement bundle size tracking logic
    return {
      totalSize: 0,
      jsSize: 0,
      cssSize: 0,
      chunks: [],
    };
  }

  private getResourceMetrics(): ResourceMetrics[] {
    return this.metrics
      .filter((m) => m.name === 'RESOURCE')
      .map((m) => m.metadata as ResourceMetrics);
  }

  private getCacheMetrics(): CacheMetrics {
    // Implement cache performance tracking logic
    return {
      hitRate: 0,
      missRate: 0,
      latency: 0,
      size: 0,
      evictions: 0,
    };
  }

  private getImageMetrics(): ImageMetrics[] {
    return this.metrics.filter((m) => m.name === 'IMAGE').map((m) => m.metadata as ImageMetrics);
  }

  private getMemoryMetrics(): { usage: number; heapSize: number; cpuUsage: number } {
    if (typeof window !== 'undefined') {
      const memory = (performance as any).memory;
      return {
        usage: memory.usedJSHeapSize || 0,
        heapSize: memory.totalJSHeapSize || 0,
        cpuUsage: 0, // Implement CPU usage tracking if available
      };
    }
    return { usage: 0, heapSize: 0, cpuUsage: 0 };
  }

  private getServerMetrics(): { timing: any; status: number; endpoint: string } {

    // Implement server-side metrics collection
    return {
      timing: {},
      status: 200,
      endpoint: '',
    };
  }

  public stopMonitoring(): void {
    if (this.reportingInterval) {
      clearInterval(this.reportingInterval);
      this.reportingInterval = null;
    }
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public clearMetrics(): void {
    this.metrics = [];
  }
}
