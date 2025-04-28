import { ComponentType, useEffect } from 'react';
import { PerformanceMonitor, AlertConfig } from '@/types/monitoring';
import os from 'os';
import { performance } from 'perf_hooks';

export interface LoadMetrics {
  componentName: string;
  loadStartTime: number;
  loadEndTime: number;
  loadDuration: number;
  chunkSize?: number;
}

export interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
  };
  timestamp: number;
}

interface WithPerformanceMonitoringProps {
  componentName?: string;
}

function withPerformanceMonitoring<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithPerformanceMonitoringProps = {},
) {
  const componentName =
    options.componentName || WrappedComponent.displayName || WrappedComponent.name;

  function MonitoredComponent(props: P) {
    useEffect(() => {
      const startTime = performance.now();
      const memoryStart = process.memoryUsage();

      return () => {
        const endTime = performance.now();
        const memoryEnd = process.memoryUsage();

        const metrics: PerformanceMetrics = {
          componentName,
          renderTime: endTime - startTime,
          memoryUsage: {
            heapUsed: memoryEnd.heapUsed - memoryStart.heapUsed,
            heapTotal: memoryEnd.heapTotal,
          },
          timestamp: Date.now(),
        };

        // Log metrics or send to monitoring service
        console.log('Component Performance Metrics:', metrics);
      };
    }, []);

    return <WrappedComponent {...props} />;
  }

  MonitoredComponent.displayName = `withPerformanceMonitoring(${componentName})`;
  return MonitoredComponent;
}

class PerformanceMonitor implements PerformanceMetrics {
  private static instance: PerformanceMonitor;
  public metrics: Map<string, LoadMetrics[]>;
  private readonly METRICS_STORAGE_KEY = 'vibewell_load_metrics';
  private alerts: AlertConfig[] = [];
  private readonly alertThresholds: Map<string, number> = new Map([
    ['responseTime', 1000], // ms
    ['cpuUsage', 80], // %
    ['memoryUsage', 80], // %
    ['diskUsage', 80], // %
    ['networkLatency', 200], // ms
    ['LCP', 2500], // ms
    ['FID', 100], // ms
    ['CLS', 0.1], // score
  ]);

  private constructor() {
    this.metrics = new Map();
    this.loadStoredMetrics();
    this.setupMetricsCollection();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private loadStoredMetrics(): void {
    if (typeof window !== 'undefined') {
      try {
        const storedMetrics = localStorage.getItem(this.METRICS_STORAGE_KEY);
        if (storedMetrics) {
          const parsed = JSON.parse(storedMetrics);
          this.metrics = new Map(Object.entries(parsed));
        }
      } catch (error) {
        console.error('Failed to load stored metrics:', error);
      }
    }
  }

  private saveMetrics(): void {
    if (typeof window !== 'undefined') {
      try {
        const metricsObj = Object.fromEntries(this.metrics);
        localStorage.setItem(this.METRICS_STORAGE_KEY, JSON.stringify(metricsObj));
      } catch (error) {
        console.error('Failed to save metrics:', error);
      }
    }
  }

  private setupMetricsCollection() {
    // Collect metrics every minute
    setInterval(() => {
      this.collectSystemMetrics();
    }, 60000);
  }

  private async collectSystemMetrics() {
    const cpuUsage = await this.getCPUUsage();
    const memoryUsage = await this.getMemoryUsage();
    const diskUsage = await this.getDiskUsage();
    const networkHealth = await this.getNetworkHealth();

    this.recordMetric('cpuUsage', cpuUsage);
    this.recordMetric('memoryUsage', memoryUsage);
    this.recordMetric('diskUsage', diskUsage);
    this.recordMetric('networkHealth', networkHealth);

    // Check for threshold violations
    this.checkThresholds();
  }

  private checkThresholds() {
    Array.from(this.metrics.entries()).forEach(([metric, value]) => {
      const threshold = this.alertThresholds.get(metric);
      if (threshold && value > threshold) {
        const alert: AlertConfig = {
          id: `${metric}-${Date.now()}`,
          type: 'warning',
          message: `${metric} (${value}) exceeds threshold (${threshold})`,
          timestamp: new Date().toISOString(),
          acknowledged: false,
        };
        this.alerts.push(alert);
        this.emit('alert', alert);
      }
    });
  }

  public recordMetric(name: string, value: number): void {
    const componentMetrics = this.metrics.get(name) || [];
    const metric: LoadMetrics = {
      componentName: name,
      loadStartTime: performance.now(),
      loadEndTime: 0,
      loadDuration: 0,
    };
    componentMetrics.push(metric);
    this.metrics.set(name, componentMetrics);
    this.checkThresholds();
  }

  public track(metrics: Record<string, number>): void {
    Object.entries(metrics).forEach(([name, value]) => {
      this.recordMetric(name, value);
    });
  }

  public getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  public clearMetrics(): void {
    this.metrics.clear();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.METRICS_STORAGE_KEY);
    }
  }

  public getActiveAlerts(): AlertConfig[] {
    return this.alerts.filter((alert) => !alert.acknowledged);
  }

  public getAlertHistory(startTime: number, endTime: number): AlertConfig[] {
    return this.alerts.filter((alert) => {
      const timestamp = new Date(alert.timestamp).getTime();
      return timestamp >= startTime && timestamp <= endTime;
    });
  }

  public async getCPUUsage(): Promise<number> {
    const cpus = os.cpus();
    const totalCPU = cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((sum, time) => sum + time, 0);
      const idle = cpu.times.idle;
      return acc + ((total - idle) / total) * 100;
    }, 0);
    return totalCPU / cpus.length;
  }

  public async getMemoryUsage(): Promise<number> {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    return ((totalMem - freeMem) / totalMem) * 100;
  }

  public async getDiskUsage(): Promise<number> {
    // This is a placeholder. In a real implementation, you would use a package
    // like `disk-space` or make a system call to get actual disk usage
    return 50; // Return a default value for now
  }

  public async getNetworkHealth(): Promise<number> {
    try {
      const startTime = performance.now();
      await fetch('https://www.google.com');
      const endTime = performance.now();
      const latency = endTime - startTime;

      // Convert latency to a health score (0-100)
      // Lower latency = higher score
      const maxAcceptableLatency = 1000; // 1 second
      const score = Math.max(0, 100 - (latency / maxAcceptableLatency) * 100);
      return score;
    } catch (error) {
      return 0; // Return 0 if network check fails
    }
  }

  public startLoadMetric(componentName: string): void {
    const metric: LoadMetrics = {
      componentName,
      loadStartTime: performance.now(),
      loadEndTime: 0,
      loadDuration: 0,
    };

    const componentMetrics = this.metrics.get(componentName) || [];
    componentMetrics.push(metric);
    this.metrics.set(componentName, componentMetrics);
  }

  public endLoadMetric(componentName: string): void {
    const componentMetrics = this.metrics.get(componentName);
    if (componentMetrics && componentMetrics.length > 0) {
      const currentMetric = componentMetrics[componentMetrics.length - 1];
      currentMetric.loadEndTime = performance.now();
      currentMetric.loadDuration = currentMetric.loadEndTime - currentMetric.loadStartTime;
      this.saveMetrics();
    }
  }

  public getAverageLoadTime(componentName: string): number {
    const componentMetrics = this.metrics.get(componentName);
    if (!componentMetrics || componentMetrics.length === 0) return 0;

    const loadTimes = componentMetrics.map((m) => m.loadDuration);
    return loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;
  }

  public getAllMetrics(): Map<string, LoadMetrics[]> {
    return new Map(this.metrics);
  }
}

export { withPerformanceMonitoring, type PerformanceMetrics };
export default PerformanceMonitor.getInstance();
