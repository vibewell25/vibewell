import { performance } from 'perf_hooks';
import { EventEmitter } from 'events';

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor extends EventEmitter {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private thresholds: Map<string, number> = new Map();
  private notificationService: any | null = null;
  private isNotificationEnabled = false;
  private alertCooldowns: Map<string, number> = new Map();
  private readonly alertCooldownPeriod = 5 * 60 * 1000; // 5 minutes
  private readonly maxRetainedMetrics = 1000; // Maximum metrics to retain per type

  constructor() {
    super();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.on('metric', (metric: PerformanceMetric) => {
      const { name, duration } = metric;
      const threshold = this.thresholds.get(name);

      if (threshold && duration > threshold) {
        this.emit('thresholdExceeded', metric);
        this.handleThresholdExceeded(metric, threshold);
      }

      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }

      // Add metric to the collection
      const metricList = this.metrics.get(name)!;
      metricList.push(metric);
      
      // Prune old metrics if we've exceeded the limit
      if (metricList.length > this.maxRetainedMetrics) {
        this.metrics.set(name, metricList.slice(-this.maxRetainedMetrics));
      }
    });
    
    this.on('error', (error: any) => {
      console.error('Performance monitoring error:', error);
      this.notifyError(error);
    });
  }

  setThreshold(name: string, thresholdMs: number) {
    this.thresholds.set(name, thresholdMs);
  }

  async measure<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;

      const metric: PerformanceMetric = {
        name,
        duration,
        timestamp: Date.now(),
        metadata,
      };

      this.emit('metric', metric);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.emit('error', { name, duration, error, metadata });
      throw error;
    }
  }

  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.get(name) || [];
    }

    return Array.from(this.metrics.values()).flat();
  }

  getAverageDuration(name: string): number {
    const metrics = this.metrics.get(name) || [];
    if (metrics.length === 0) return 0;

    const total = metrics.reduce((sum, metric) => sum + metric.duration, 0);
    return total / metrics.length;
  }

  getPercentile(name: string, percentile: number): number {
    const metrics = this.metrics.get(name) || [];
    if (metrics.length === 0) return 0;

    const sorted = metrics.map(m => m.duration).sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  reset() {
    this.metrics.clear();
  }
  
  /**
   * Enable notifications for performance alerts
   */
  enableNotifications(enabled = true) {
    this.isNotificationEnabled = enabled;
    return this;
  }
  
  /**
   * Handle threshold exceeded events and send notifications if enabled
   */
  private async handleThresholdExceeded(metric: PerformanceMetric, threshold: number) {
    if (!this.isNotificationEnabled) return;
    
    // Check if we're in a cooldown period for this metric type
    const lastNotified = this.alertCooldowns.get(metric.name) || 0;
    const now = Date.now();
    
    if (now - lastNotified < this.alertCooldownPeriod) {
      // Still in cooldown, don't send another notification
      return;
    }
    
    // Set cooldown
    this.alertCooldowns.set(metric.name, now);
    
    try {
      // Lazily load notification service to avoid circular dependencies
      if (!this.notificationService) {
        const { NotificationService } = await import('@/services/notification-service');
        this.notificationService = new NotificationService();
      }
      
      // Get admin users for system notifications
      const { data: adminUsers } = await fetch('/api/users/admins').then(res => res.json());
      
      if (!adminUsers || !Array.isArray(adminUsers)) {
        console.warn('No admin users found for performance alerts');
        return;
      }
      
      // Create notification content
      const exceedPercent = ((metric.duration - threshold) / threshold * 100).toFixed(0);
      const subject = `Performance Alert: ${metric.name} threshold exceeded`;
      const message = `${metric.name} performance metric exceeded the threshold by ${exceedPercent}% (${metric.duration.toFixed(2)}ms vs ${threshold}ms threshold).${
        metric.metadata ? ` Context: ${JSON.stringify(metric.metadata)}` : ''
      }`;
      
      // Send notification to each admin
      for (const adminUser of adminUsers) {
        await this.notificationService.notifyUser(adminUser.id, {
          type: 'system',
          subject,
          message,
          data: {
            metricName: metric.name,
            duration: metric.duration,
            threshold,
            timestamp: new Date().toISOString(),
            metadata: metric.metadata
          }
        });
      }
      
      // Also log the alert
      console.warn(`[Performance Alert] ${message}`);
      
    } catch (error) {
      console.error('Failed to send performance alert notification:', error);
    }
  }
  
  /**
   * Notify about performance monitoring errors
   */
  private async notifyError(error: any) {
    if (!this.isNotificationEnabled) return;
    
    try {
      // Lazily load notification service to avoid circular dependencies
      if (!this.notificationService) {
        const { NotificationService } = await import('@/services/notification-service');
        this.notificationService = new NotificationService();
      }
      
      // Get admin users for system notifications
      const { data: adminUsers } = await fetch('/api/users/admins').then(res => res.json());
      
      if (!adminUsers || !Array.isArray(adminUsers)) {
        console.warn('No admin users found for performance alerts');
        return;
      }
      
      // Create notification content
      const subject = `Performance Monitoring Error`;
      const message = `Error in performance monitoring: ${
        error.message || JSON.stringify(error)
      }`;
      
      // Send notification to each admin
      for (const adminUser of adminUsers) {
        await this.notificationService.notifyUser(adminUser.id, {
          type: 'system',
          subject,
          message,
          data: {
            error: error.message || JSON.stringify(error),
            timestamp: new Date().toISOString()
          }
        });
      }
    } catch (notifyError) {
      console.error('Failed to send performance error notification:', notifyError);
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Enable notifications by default in production
if (process.env.NODE_ENV === 'production') {
  performanceMonitor.enableNotifications();
}

// Example usage:
/*
performanceMonitor.setThreshold('databaseQuery', 1000);
performanceMonitor.setThreshold('apiRequest', 500);

await performanceMonitor.measure('databaseQuery', async () => {
  // Database query
});

await performanceMonitor.measure('apiRequest', async () => {
  // API request
}, { endpoint: '/users' });

// Listen for threshold exceeded events
performanceMonitor.on('thresholdExceeded', (metric) => {
  console.warn(`Performance threshold exceeded: ${metric.name} (${metric.duration}ms)`);
});

// Get metrics
const metrics = performanceMonitor.getMetrics();
const avgDuration = performanceMonitor.getAverageDuration('databaseQuery');
const p95 = performanceMonitor.getPercentile('apiRequest', 95);
*/ 