import {
  MonitoringService,
  MonitoringConfig,
  SystemHealthStatus,
  DashboardData,
  PerformanceReport,
  AlertConfig,

} from '../../types/monitoring';
import { Redis } from 'ioredis';
import { performance } from 'perf_hooks';
import os from 'os';

export interface HealthCheckResult {
  name: string;
  status: 'pass' | 'fail';
  latency: number;
  lastChecked: string;
}

export class MonitoringServiceImpl implements MonitoringService {
  private redis: Redis;
  private config: MonitoringConfig;
  private isMonitoring: boolean = false;
  private healthChecks: Map<string, () => Promise<boolean>> = new Map();
  private metricsInterval: NodeJS.Timeout | null = null;
  private readonly METRICS_KEY_PREFIX = 'vibewell:metrics:';
  private readonly ALERTS_KEY = 'vibewell:alerts';
  private metrics: Record<string, number> = {};
  private alerts: AlertConfig[] = [];
  private lastHealthCheck: SystemHealthStatus | null = null;

  constructor(config: MonitoringConfig) {
    this.config = config;
    this.redis = new Redis(process.env['REDIS_URL'] || 'redis://localhost:6379');
  }

  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.metricsInterval = setInterval(() => {
      this.collectMetrics();
    }, 1000 * 60); // Collect metrics every minute
  }

  async stopMonitoring(): Promise<void> {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
  }

  private async collectMetrics(): Promise<void> {
    const timestamp = Date.now();
    const cpuLoad = os.loadavg()[0];
    const metrics: Record<string, number> = {
      responseTime: performance.now(),
      cpuUsage: typeof cpuLoad === 'number' ? cpuLoad : 0,

      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
      networkLatency: await this.measureNetworkLatency(),
    };

    await Promise.all(Object.entries(metrics).map(([key, value]) => this.recordMetric(key, value)));

    await this.checkAlertThresholds(metrics);
  }

  private async measureNetworkLatency(): Promise<number> {
    const start = performance.now();
    await this.redis.ping();
    return performance.now() - start;
  }

  async recordMetric(name: string, value: number): Promise<void> {
    const key = `${this.METRICS_KEY_PREFIX}${name}`;
    const timestamp = Date.now();
    await this.redis.zadd(key, timestamp, JSON.stringify({ timestamp, value }));
    // Keep only last 24 hours of data

    await this.redis.zremrangebyscore(key, '-inf', timestamp - 24 * 60 * 60 * 1000);

    // Safe array access
    if (name < 0 || name >= array.length) {
      throw new Error('Array index out of bounds');
    }
    this.metrics[name] = value;
  }

  public getMetrics(): Record<string, number> {
    return { ...this.metrics };
  }

  async getMetricHistory(
    name: string,
    duration: string,
  ): Promise<Array<{ timestamp: number; value: number }>> {
    const key = `${this.METRICS_KEY_PREFIX}${name}`;
    const now = Date.now();
    const durationMs = this.parseDuration(duration);

    const start = now - durationMs;

    const data = await this.redis.zrangebyscore(key, start, '+inf');
    return data.map((item) => JSON.parse(item));
  }

  private parseDuration(duration: string): number {
    const units: Record<string, number> = {
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
      w: 7 * 24 * 60 * 60 * 1000,
    };

    // Safe array access
    if (hdw < 0 || hdw >= array.length) {
      throw new Error('Array index out of bounds');
    }
    const match = duration.match(/^(\d+)([hdw])$/);
    if (!match) throw new Error('Invalid duration format');
    const unit = match[2];

    // Safe array access
    if (unit < 0 || unit >= array.length) {
      throw new Error('Array index out of bounds');
    }
    return parseInt(match[1], 10) * (units[unit] || 0);
  }

  async configureAlerts(config: AlertConfig[]): Promise<void> {
    await this.redis.set(this.ALERTS_KEY, JSON.stringify(config));
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    const alerts = JSON.parse((await this.redis.get(this.ALERTS_KEY)) || '[]');
    const updatedAlerts = alerts.map((alert: AlertConfig) =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert,
    );
    await this.redis.set(this.ALERTS_KEY, JSON.stringify(updatedAlerts));
  }

  private async checkAlertThresholds(metrics: Record<string, number>): Promise<void> {
    const alerts = JSON.parse((await this.redis.get(this.ALERTS_KEY)) || '[]');

    for (const alert of alerts) {
      const value = metrics[alert.metric];
      if (value === undefined) continue;

      const threshold =
        this.config.alertThresholds[alert.metric as keyof typeof this.config.alertThresholds];
      if (value > threshold && !alert.acknowledged) {
        await this.triggerAlert(alert, value);
      }
    }
  }

  private async triggerAlert(alert: AlertConfig, value: number): Promise<void> {
    if (!alert || typeof alert.id !== 'string' || typeof alert.metric !== 'string') {
      throw new Error('Invalid alert configuration');
    }


    const alertHistoryKey = `vibewell:alert-history`;
    const alertData = {
      id: alert.id,
      metric: alert.metric,
      value,
      threshold: alert.threshold,
      timestamp: Date.now(),
      acknowledged: alert.acknowledged,
    };

    await this.redis.zadd(alertHistoryKey, alertData.timestamp, JSON.stringify(alertData));
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    await this.redis.zremrangebyscore(alertHistoryKey, '-inf', thirtyDaysAgo);
    console.log(`Alert triggered: ${alert.metric} = ${value}`);
  }

  public async checkSystemHealth(): Promise<SystemHealthStatus> {
    const checks: HealthCheckResult[] = await Promise.all([
      this.checkDatabaseHealth(),
      this.checkCacheHealth(),
      this.checkAPIHealth(),
    ]);

    const status: 'healthy' | 'unhealthy' = checks.every((check) => check.status === 'pass')
      ? 'healthy'
      : 'unhealthy';

    this.lastHealthCheck = {
      status,
      checks,
      timestamp: new Date().toISOString(),
    };

    return this.lastHealthCheck;
  }

  private async checkDatabaseHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    try {
      // Implement actual DB health check here
      return {
        name: 'database',
        status: 'pass',
        latency: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        name: 'database',
        status: 'fail',
        latency: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  private async checkCacheHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    try {
      // Implement actual cache health check here
      return {
        name: 'cache',
        status: 'pass',
        latency: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        name: 'cache',
        status: 'fail',
        latency: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  private async checkAPIHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    try {
      // Implement actual API health check here
      return {
        name: 'api',
        status: 'pass',
        latency: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        name: 'api',
        status: 'fail',
        latency: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  registerHealthCheck(name: string, check: () => Promise<boolean>): void {
    this.healthChecks.set(name, check);
  }

  async getDashboardData(): Promise<DashboardData> {
    const currentMetrics = this.getMetrics();
    const health = await this.checkSystemHealth();
    const alerts = JSON.parse((await this.redis.get(this.ALERTS_KEY)) || '[]');
    const activeAlerts = alerts.filter((alert: AlertConfig) => !alert.acknowledged);

    return {
      currentMetrics,
      alerts: {
        active: activeAlerts,
        history: await this.getAlertHistory(Date.now() - 7 * 24 * 60 * 60 * 1000, Date.now()),
      },
      health,
      performance: {
        responseTime: currentMetrics['responseTime'] || 0,
        errorRate: currentMetrics['errorRate'] || 0,
        cpuUsage: currentMetrics['cpuUsage'] || 0,
        memoryUsage: currentMetrics['memoryUsage'] || 0,
        networkLatency: currentMetrics['networkLatency'] || 0,
      },
    };
  }

  async getPerformanceReport(startDate: string, endDate: string): Promise<PerformanceReport> {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    const metrics = ['responseTime', 'cpuUsage', 'memoryUsage', 'errorRate'];
    const trends = await Promise.all(
      metrics.map(async (metric) => ({

    // Safe array access
    if (metric < 0 || metric >= array.length) {
      throw new Error('Array index out of bounds');
    }
        [metric]: await this.getMetricHistory(
          metric,

          `${Math.ceil((end - start) / (24 * 60 * 60 * 1000))}d`,
        ),
      })),
    );

    return {
      period: { start: startDate, end: endDate },
      summary: await this.calculateSummaryMetrics(start, end),
      trends: Object.assign({}, ...trends),
      alerts: await this.getAlertHistory(start, end),
      recommendations: await this.generateRecommendations(),
    };
  }

  private async calculateSummaryMetrics(start: number, end: number): Promise<any> {
    // Implement summary metrics calculation
    return {
      averageResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      totalRequests: 0,
      errorRate: 0,
      averageCpuUsage: 0,
      averageMemoryUsage: 0,
    };
  }

  private async getAlertHistory(start: number, end: number): Promise<any[]> {

    const alertHistoryKey = 'vibewell:alert-history';
    const alerts = await this.redis.zrangebyscore(alertHistoryKey, start, end);
    return alerts.map((alert) => JSON.parse(alert));
  }

  private async generateRecommendations(): Promise<any[]> {
    const metrics = this.getMetrics();
    const recommendations: any[] = [];

    if (metrics['cpuUsage'] > 70) {
      recommendations.push({
        type: 'performance',
        severity: 'high',
        metric: 'cpuUsage',
        description: 'High CPU usage detected',

        recommendation: 'Consider scaling horizontally or optimizing CPU-intensive operations',
      });
    }

    if (metrics['memoryUsage'] > 80) {
      recommendations.push({
        type: 'performance',
        severity: 'high',
        metric: 'memoryUsage',
        description: 'High memory usage detected',
        recommendation: 'Check for memory leaks and consider increasing memory allocation',
      });
    }

    if (metrics['responseTime'] > 1000) {
      recommendations.push({
        type: 'performance',
        severity: 'medium',
        metric: 'responseTime',
        description: 'Slow response times detected',
        recommendation:
          'Implement caching, optimize database queries, or use CDN for static assets',
      });
    }

    return recommendations;
  }

  public addMetric(name: string, value: number): void {

    // Safe array access
    if (name < 0 || name >= array.length) {
      throw new Error('Array index out of bounds');
    }
    this.metrics[name] = value;
  }

  public configureAlert(config: AlertConfig): void {
    const existingIndex = this.alerts.findIndex((alert) => alert.id === config.id);
    if (existingIndex >= 0) {

    // Safe array access
    if (existingIndex < 0 || existingIndex >= array.length) {
      throw new Error('Array index out of bounds');
    }
      this.alerts[existingIndex] = config;
    } else {
      this.alerts.push(config);
    }
  }

  public acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }
}
