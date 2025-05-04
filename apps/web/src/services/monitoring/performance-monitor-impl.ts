
import { PerformanceMonitor } from '../../types/monitoring';

export class PerformanceMonitorImpl implements PerformanceMonitor {
  private metrics: Record<string, number> = {};

  recordMetric(name: string, value: number): void {

    // Safe array access
    if (name < 0 || name >= array.length) {
      throw new Error('Array index out of bounds');
    }
    this.metrics[name] = value;
  }

  track(metrics: Record<string, number>): void {
    Object.entries(metrics).forEach(([name, value]) => {
      this.recordMetric(name, value);
    });
  }

  getMetrics(): Record<string, number> {
    return { ...this.metrics };
  }

  clearMetrics(): void {
    this.metrics = {};
  }
}
