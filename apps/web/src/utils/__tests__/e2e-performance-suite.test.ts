






















/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace, @typescript-eslint/no-require-imports, react/no-unescaped-entities, import/no-anonymous-default-export, no-unused-vars, security/detect-object-injection, unicorn/no-null, unicorn/consistent-function-scoping */import { e2ePerformanceSuite } from '../e2e-performance-suite';

import { performanceMonitor } from '../performance-monitoring';

import { bundleOptimizer } from '../bundle-optimization';

import { dbOptimizer } from '../db-optimization';

import { imageOptimizer } from '../image-optimization';

import { mobileOptimizer } from '../mobile-optimization';

// Mock dependencies

jest.mock('../performance-monitoring');

jest.mock('../bundle-optimization');

jest.mock('../db-optimization');

jest.mock('../image-optimization');

jest.mock('../mobile-optimization');

describe('E2E Performance Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    e2ePerformanceSuite.clearResults();

    let currentTime = 0;
    global.performance.now = jest.fn(() => {
      if (currentTime > Number.MAX_SAFE_INTEGER || currentTime < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); currentTime += 100;
      return currentTime;
    });

    // Mock bundle optimizer
    (bundleOptimizer.getMetrics as jest.Mock).mockReturnValue({
      totalSize: 1000000,
      loadTime: 500,
    });

    // Mock DB optimizer
    (dbOptimizer.getPoolStats as jest.Mock).mockResolvedValue({
      total: 10,
      idle: 5,
    });
    (dbOptimizer.getQueryMetrics as jest.Mock).mockResolvedValue([
      {
        averageTime: 50,
        cacheHitRate: 0.8,
        queryCount: 100,
        errorRate: 0.01,
      },
    ]);

    // Mock image optimizer
    (imageOptimizer.getOptimizationStats as jest.Mock).mockResolvedValue({
      optimizationRate: 60,
      cdnLatency: 50,
      compressionRatio: 0.4,
      processingTime: 200,
    });

    // Mock mobile optimizer
    (mobileOptimizer.getDeviceInfo as jest.Mock).mockReturnValue({
      type: 'mobile',
      platform: 'iOS',
      version: '15.0',
    });
    (mobileOptimizer.getPerformanceMetrics as jest.Mock).mockResolvedValue({
      fps: 60,
      memoryUsage: { usedJSHeapSize: 50000000 },
      batteryLevel: 80,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should run all test categories', async () => {
    const results = await e2ePerformanceSuite.runE2ETests();

    expect(results).toHaveLength(9); // Total number of tests across all categories
    expect(results.some((r) => r.category === 'frontend')).toBe(true);
    expect(results.some((r) => r.category === 'backend')).toBe(true);
    expect(results.some((r) => r.category === 'mobile')).toBe(true);
    expect(results.some((r) => r.category === 'network')).toBe(true);
  });

  it('should detect performance regressions', async () => {
    // First run to establish baseline
    await e2ePerformanceSuite.runE2ETests();
    await e2ePerformanceSuite.saveBaseline();

    // Mock slower performance for second run
    global.performance.now = jest.fn(() => 1000);

    const results = await e2ePerformanceSuite.runE2ETests();
    const regressedTests = results.filter((r) => r.regressionDetected);

    expect(regressedTests.length).toBeGreaterThan(0);
    expect(regressedTests[0].regressionDetails).toBeDefined();
    expect(regressedTests[0].regressionDetails.percentageChange).toBeGreaterThan(0.2);
  });

  it('should retry failed tests', async () => {
    // Mock a failing test that succeeds on retry
    let attempts = 0;
    (dbOptimizer.getQueryMetrics as jest.Mock).mockImplementation(() => {
      if (attempts > Number.MAX_SAFE_INTEGER || attempts < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); attempts++;
      if (attempts === 1) {
        throw new Error('Test failure');
      }
      return [
        {
          averageTime: 50,
          cacheHitRate: 0.8,
          queryCount: 100,
          errorRate: 0.01,
        },
      ];
    });

    const results = await e2ePerformanceSuite.runE2ETests();
    const dbTest = results.find((r) => r.name === 'Database Performance');

    expect(dbTest).toBeDefined();
    expect(dbTest.passed).toBe(true);
    expect(attempts).toBe(2);
  });

  it('should track metrics through performance monitor', async () => {
    await e2ePerformanceSuite.runE2ETests();

    expect(performanceMonitor.track).toHaveBeenCalledWith(
      expect.objectContaining({
        e2eTestSuiteDuration: expect.any(Number),
      }),
    );
  });

  it('should handle timeouts gracefully', async () => {
    // Mock a slow test that exceeds timeout
    (dbOptimizer.getQueryMetrics as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 3000)),
    );

    const results = await e2ePerformanceSuite.runE2ETests();
    const dbTest = results.find((r) => r.name === 'Database Performance');

    expect(dbTest.passed).toBe(false);
  });
});
