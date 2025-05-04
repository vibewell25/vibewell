





















/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace, @typescript-eslint/no-require-imports, react/no-unescaped-entities, import/no-anonymous-default-export, no-unused-vars, security/detect-object-injection, unicorn/no-null, unicorn/consistent-function-scoping */import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { performanceMonitor } from '@/utils/performanceMonitor';

describe('Performance Monitor', () => {
  beforeEach(() => {
    performanceMonitor.clearMetrics();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Metric Recording', () => {
    it('should record and retrieve metrics', () => {
      performanceMonitor.recordMetric('test', 100);
      const metrics = performanceMonitor.getMetrics();
      expect(metrics['test']).toBe(100);
    });

    it('should track multiple metrics', () => {
      performanceMonitor.track({
        metric1: 100,
        metric2: 200,
      });
      const metrics = performanceMonitor.getMetrics();
      expect(metrics['metric1']).toBe(100);
      expect(metrics['metric2']).toBe(200);
    });

    it('should clear metrics', () => {
      performanceMonitor.recordMetric('test', 100);
      performanceMonitor.clearMetrics();
      const metrics = performanceMonitor.getMetrics();
      expect(Object.keys(metrics).length).toBe(0);
    });
  });

  describe('Alert Management', () => {
    it('should generate alerts when thresholds are exceeded', () => {
      const alertListener = vi.fn();
      performanceMonitor.on('alert', alertListener);

      performanceMonitor.recordMetric('cpuUsage', 90);
      expect(alertListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
          message: expect.stringContaining('cpuUsage'),
        }),
      );
    });

    it('should track alert history', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      performanceMonitor.recordMetric('cpuUsage', 90);
      performanceMonitor.recordMetric('memoryUsage', 85);



      const history = performanceMonitor.getAlertHistory(now - 1000, now + 1000);
      expect(history.length).toBe(2);
    });

    it('should filter active alerts', () => {
      performanceMonitor.recordMetric('cpuUsage', 90);
      const activeAlerts = performanceMonitor.getActiveAlerts();
      expect(activeAlerts.length).toBe(1);
      expect(activeAlerts[0].acknowledged).toBe(false);
    });
  });

  describe('System Metrics', () => {
    it('should measure CPU usage', async () => {
      const cpuUsage = await performanceMonitor.getCPUUsage();
      expect(cpuUsage).toBeGreaterThanOrEqual(0);
      expect(cpuUsage).toBeLessThanOrEqual(100);
    });

    it('should measure memory usage', async () => {
      const memoryUsage = await performanceMonitor.getMemoryUsage();
      expect(memoryUsage).toBeGreaterThanOrEqual(0);
      expect(memoryUsage).toBeLessThanOrEqual(100);
    });

    it('should check network health', async () => {
      const networkHealth = await performanceMonitor.getNetworkHealth();
      expect(networkHealth).toBeGreaterThanOrEqual(0);
      expect(networkHealth).toBeLessThanOrEqual(100);
    });
  });

  describe('Automatic Metrics Collection', () => {
    it('should collect metrics periodically', async () => {
      const collectSpy = vi.spyOn(performanceMonitor as any, 'collectSystemMetrics');


      // Fast-forward time by 2 minutes
      vi.advanceTimersByTime(2 * 60 * 1000);

      expect(collectSpy).toHaveBeenCalledTimes(2);
    });
  });
});
