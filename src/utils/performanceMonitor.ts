import { PerformanceMonitor, AlertConfig } from '@/types/monitoring';
import os from 'os';
import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

class PerformanceMonitorImpl extends EventEmitter implements PerformanceMonitor {
  private metrics: Map<string, number> = new Map();
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

  constructor() {
    super();
    this.setupMetricsCollection();
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
          acknowledged: false
        };
        this.alerts.push(alert);
        this.emit('alert', alert);
      }
    });
  }

  public recordMetric(name: string, value: number): void {
    this.metrics.set(name, value);
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
  }

  public getActiveAlerts(): AlertConfig[] {
    return this.alerts.filter(alert => !alert.acknowledged);
  }

  public getAlertHistory(startTime: number, endTime: number): AlertConfig[] {
    return this.alerts.filter(alert => {
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
      const score = Math.max(0, 100 - (latency / maxAcceptableLatency * 100));
      return score;
    } catch (error) {
      return 0; // Return 0 if network check fails
    }
  }
}

// Export a singleton instance
export const performanceMonitor = new PerformanceMonitorImpl(); 