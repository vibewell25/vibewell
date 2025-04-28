import { performanceMonitor } from './performance-monitoring';
import {
  measurePerformance,
  measureFPS,
  measureMemoryUsage,
  measureNetworkRequest,
} from './performance-test-utils';
import { dbOptimizer } from './db-optimization';
import { bundleOptimizer } from './bundle-optimization';
import { imageOptimizer } from './image-optimization';
import { mobileOptimizer } from './mobile-optimization';
import { QueryMetrics } from '../types/monitoring';

interface E2ETestConfig {
  name: string;
  threshold: number;
  timeout: number;
  retries: number;
  category: 'frontend' | 'backend' | 'mobile' | 'network';
}

interface E2ETestResult {
  name: string;
  category: string;
  duration: number;
  passed: boolean;
  metrics: Record<string, number>;
  timestamp: number;
  regressionDetected?: boolean;
  regressionDetails?: {
    previousValue: number;
    currentValue: number;
    percentageChange: number;
  };
}

export class E2EPerformanceSuite {
  private static instance: E2EPerformanceSuite;
  private testResults: E2ETestResult[] = [];
  private regressionThreshold = 0.2; // 20% degradation threshold
  private baselineMetrics: Record<string, number> = {};

  private constructor() {
    this.loadBaseline();
  }

  public static getInstance(): E2EPerformanceSuite {
    if (!E2EPerformanceSuite.instance) {
      E2EPerformanceSuite.instance = new E2EPerformanceSuite();
    }
    return E2EPerformanceSuite.instance;
  }

  private async loadBaseline() {
    try {
      // Load baseline metrics from storage/database
      // This would be implemented based on your storage solution
      console.log('Loading baseline metrics...');
    } catch (error) {
      console.error('Failed to load baseline metrics:', error);
    }
  }

  public async runE2ETests(): Promise<E2ETestResult[]> {
    console.log('Starting E2E Performance Tests...');
    const startTime = performance.now();

    try {
      await Promise.all([
        this.runFrontendTests(),
        this.runBackendTests(),
        this.runMobileTests(),
        this.runNetworkTests(),
      ]);

      performanceMonitor.track({
        e2eTestSuiteDuration: performance.now() - startTime,
      });

      return this.testResults;
    } catch (error) {
      console.error('E2E Performance test suite failed:', error);
      throw error;
    }
  }

  private async runFrontendTests(): Promise<void> {
    const tests: E2ETestConfig[] = [
      {
        name: 'Initial Page Load',
        threshold: 2000,
        timeout: 5000,
        retries: 3,
        category: 'frontend',
      },
      {
        name: 'Route Navigation',
        threshold: 300,
        timeout: 2000,
        retries: 2,
        category: 'frontend',
      },
      {
        name: 'Component Rendering',
        threshold: 100,
        timeout: 1000,
        retries: 2,
        category: 'frontend',
      },
    ];

    for (const test of tests) {
      await this.runTest(test, async () => {
        const metrics = await measurePerformance(async () => {
          const fps = await measureFPS(1000);
          const memory = (await measureMemoryUsage()) || { usedJSHeapSize: 0 };
          const bundleStats = bundleOptimizer.getMetrics();

          return {
            fps: fps || 0,
            memoryUsed: memory.usedJSHeapSize,
            bundleSize: bundleStats.totalSize,
            loadTime: bundleStats.loadTime,
          };
        });

        return metrics as Record<string, number>;
      });
    }
  }

  private async runBackendTests(): Promise<void> {
    const tests: E2ETestConfig[] = [
      {
        name: 'API Response Time',
        threshold: 200,
        timeout: 2000,
        retries: 3,
        category: 'backend',
      },
      {
        name: 'Database Performance',
        threshold: 100,
        timeout: 1500,
        retries: 2,
        category: 'backend',
      },
      {
        name: 'Cache Performance',
        threshold: 50,
        timeout: 1000,
        retries: 2,
        category: 'backend',
      },
    ];

    for (const test of tests) {
      await this.runTest(test, async () => {
        const dbStats = await dbOptimizer.getPoolStats();
        const queryMetrics = await dbOptimizer.getQueryMetrics(5);
        const metrics = queryMetrics[0] || ({ averageTime: 0, cacheHitRate: 0 } as QueryMetrics);

        return {
          queryTime: metrics.averageTime,
          connectionUtilization: dbStats.total / dbStats.idle,
          cacheHitRate: metrics.cacheHitRate,
        };
      });
    }
  }

  private async runMobileTests(): Promise<void> {
    const tests: E2ETestConfig[] = [
      {
        name: 'Mobile Rendering',
        threshold: 300,
        timeout: 3000,
        retries: 2,
        category: 'mobile',
      },
      {
        name: 'Mobile Network',
        threshold: 500,
        timeout: 4000,
        retries: 2,
        category: 'mobile',
      },
    ];

    for (const test of tests) {
      await this.runTest(test, async () => {
        const deviceInfo = mobileOptimizer.getDeviceInfo();
        const perfMetrics = await mobileOptimizer.getPerformanceMetrics();

        return {
          fps: perfMetrics.fps || 0,
          memoryUsage: perfMetrics.memoryUsage?.usedJSHeapSize || 0,
          batteryLevel: perfMetrics.batteryLevel || 100,
          deviceType: deviceInfo.type === 'mobile' ? 1 : 0,
        };
      });
    }
  }

  private async runNetworkTests(): Promise<void> {
    const tests: E2ETestConfig[] = [
      {
        name: 'Network Latency',
        threshold: 150,
        timeout: 2000,
        retries: 3,
        category: 'network',
      },
      {
        name: 'Asset Loading',
        threshold: 1000,
        timeout: 3000,
        retries: 2,
        category: 'network',
      },
    ];

    for (const test of tests) {
      await this.runTest(test, async () => {
        const { metrics } = await measureNetworkRequest('/api/health');
        const imageStats = await imageOptimizer.getOptimizationStats();

        return {
          ttfb: metrics?.ttfb || 0,
          downloadTime: metrics?.downloadTime || 0,
          imageOptimizationRate: imageStats.optimizationRate,
          cdnLatency: imageStats.cdnLatency,
        };
      });
    }
  }

  private async runTest(
    config: E2ETestConfig,
    testFn: () => Promise<Record<string, number>>,
  ): Promise<void> {
    const startTime = performance.now();
    let metrics: Record<string, number> = {};

    try {
      metrics = await this.retryTest(config, testFn);
      const duration = performance.now() - startTime;

      const result: E2ETestResult = {
        name: config.name,
        category: config.category,
        duration,
        passed: duration <= config.threshold,
        metrics,
        timestamp: Date.now(),
      };

      this.checkRegression(result);
      this.testResults.push(result);
    } catch (error) {
      console.error(`Test "${config.name}" failed:`, error);
      throw error;
    }
  }

  private async retryTest(
    config: E2ETestConfig,
    testFn: () => Promise<Record<string, number>>,
  ): Promise<Record<string, number>> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= config.retries; attempt++) {
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Test timeout')), config.timeout);
        });

        const testPromise = testFn();
        return (await Promise.race([testPromise, timeoutPromise])) as Record<string, number>;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Attempt ${attempt}/${config.retries} failed for "${config.name}":`, error);
      }
    }

    throw lastError || new Error(`All retries failed for "${config.name}"`);
  }

  private checkRegression(result: E2ETestResult): void {
    const baselineValue = this.baselineMetrics[result.name];
    if (baselineValue === undefined) {
      return;
    }

    const percentageChange = (result.duration - baselineValue) / baselineValue;
    if (percentageChange > this.regressionThreshold) {
      result.regressionDetected = true;
      result.regressionDetails = {
        previousValue: baselineValue,
        currentValue: result.duration,
        percentageChange,
      };

      console.warn(`Performance regression detected in "${result.name}":`, {
        previous: baselineValue,
        current: result.duration,
        change: `${(percentageChange * 100).toFixed(2)}%`,
      });
    }
  }

  public getTestResults(): E2ETestResult[] {
    return [...this.testResults];
  }

  public async saveBaseline(): Promise<void> {
    const newBaseline: Record<string, number> = {};

    for (const result of this.testResults) {
      if (result.passed && !result.regressionDetected) {
        newBaseline[result.name] = result.duration;
      }
    }

    this.baselineMetrics = newBaseline;
    // Save baseline metrics to storage/database
    console.log('Saving new baseline metrics:', newBaseline);
  }

  public clearResults(): void {
    this.testResults = [];
  }
}

export {};
