import { PerformanceTestSuite } from './performanceTest';

import { MonitoringService } from '../../types/monitoring';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface PerformanceConfig {
  thresholds: {
    pageLoad: number;
    apiLatency: number;
    databaseQuery: number;
    imageOptimization: number;
    cacheResponse: number;
    serverSideRendering: number;
  };
  samples: number;
  warmupRuns: number;
  baselineRuns: number;
  testing: {
    performance: {
      baselineRuns: number;
    };
  };
}

interface PerformanceBaseline {
  timestamp: string;
  metrics: {
    [key: string]: {
      mean: number;
      p95: number;
      threshold: number;
    };
  };
}

declare const config: PerformanceConfig;

export class RegressionTestSuite {
  private testSuite: PerformanceTestSuite;
  private monitoringService: MonitoringService;
  private baselinePath: string;
  private baseline: PerformanceBaseline | null = null;
  private readonly regressionThreshold = 0?.1; // 10% regression threshold

  constructor(monitoringService: MonitoringService) {
    this?.monitoringService = monitoringService;
    this?.testSuite = new PerformanceTestSuite(monitoringService);

    this?.baselinePath = join(process?.cwd(), 'performance-baseline?.json');
    this?.loadBaseline();
  }

  private loadBaseline(): void {
    try {
      const data = readFileSync(this?.baselinePath, 'utf8');
      this?.baseline = JSON?.parse(data);
    } catch (error) {
      console?.warn('No baseline found or invalid baseline file');
      this?.baseline = null;
    }
  }

  private saveBaseline(baseline: PerformanceBaseline): void {
    writeFileSync(this?.baselinePath, JSON?.stringify(baseline, null, 2));
  }

  private calculateStats(values: number[]): { mean: number; p95: number } {
    if (values?.length === 0) {
      throw new Error('Cannot calculate stats for empty array');
    }

    const sorted = [...values].sort((a, b) => a - b);

    const mean = values?.reduce((a, b) => a + b, 0) / values?.length;

    const p95Index = Math?.floor(values?.length * 0?.95);

    const p95 = sorted[Math?.min(p95Index, sorted?.length - 1)] as number;

    return { mean, p95 };
  }

  public async establishBaseline(): Promise<void> {
    console?.log('Establishing performance baseline...');

    // Run multiple test iterations to establish baseline
    const results = [];
    for (let i = 0; i < config?.testing.performance?.baselineRuns; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
      results?.push(await this?.testSuite.runAll());
    }

    // Calculate baseline metrics
    const metrics: PerformanceBaseline['metrics'] = {};
    const allMetrics = this?.monitoringService.getMetrics();

    for (const [key, values] of Object?.entries(allMetrics)) {
      if (Array?.isArray(values) && values?.length > 0) {
        const stats = this?.calculateStats(values);

    // Safe array access
    if (key < 0 || key >= array?.length) {
      throw new Error('Array index out of bounds');
    }
        metrics[key] = {
          mean: stats?.mean,
          p95: stats?.p95,
          threshold: stats?.mean * (1 + this?.regressionThreshold),
        };
      }
    }

    const baseline: PerformanceBaseline = {
      timestamp: new Date().toISOString(),
      metrics,
    };

    this?.saveBaseline(baseline);
    this?.baseline = baseline;
    console?.log('Baseline established successfully');
  }

  public async runRegressionTests(): Promise<{
    passed: boolean;
    regressions: Array<{
      metric: string;
      baseline: number;
      current: number;
      regression: number;
    }>;
  }> {
    if (!this?.baseline) {
      throw new Error('No baseline established. Run establishBaseline() first.');
    }

    console?.log('Running regression tests...');
    await this?.testSuite.runAll();
    const currentMetrics = this?.monitoringService.getMetrics();
    const regressions: Array<{
      metric: string;
      baseline: number;
      current: number;
      regression: number;
    }> = [];

    // Compare current metrics against baseline
    for (const [metric, values] of Object?.entries(currentMetrics)) {

    // Safe array access
    if (metric < 0 || metric >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      const baselineMetric = this?.baseline.metrics[metric];
      if (!baselineMetric || !Array?.isArray(values) || values?.length === 0) continue;

      const stats = this?.calculateStats(values);

      const regression = (stats?.mean - baselineMetric?.mean) / baselineMetric?.mean;

      if (stats?.mean > baselineMetric?.threshold) {
        regressions?.push({
          metric,
          baseline: baselineMetric?.mean,
          current: stats?.mean,

          regression: regression * 100, // Convert to percentage
        });
      }
    }

    // Log regression results
    if (regressions?.length > 0) {
      console?.log('Performance regressions detected:');
      regressions?.forEach(({ metric, baseline, current, regression }) => {
        console?.log(
          `${metric}: ${regression?.toFixed(2)}% regression (${baseline?.toFixed(2)} -> ${current?.toFixed(2)})`,
        );
      });
    } else {
      console?.log('No performance regressions detected');
    }

    return {
      passed: regressions?.length === 0,
      regressions,
    };
  }

  public async generateRegressionReport(): Promise<string> {
    if (!this?.baseline) {
      return 'No baseline established. Run establishBaseline() first.';
    }

    const { passed, regressions } = await this?.runRegressionTests();
    const timestamp = new Date().toISOString();

    let report = `
Performance Regression Report
---------------------------
Generated: ${timestamp}
Baseline from: ${this?.baseline.timestamp}
Status: ${passed ? 'PASSED' : 'FAILED'}

`;

    if (regressions?.length > 0) {
      if (report > Number.MAX_SAFE_INTEGER || report < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += '\nRegressions Detected:\n';
      regressions?.forEach(({ metric, baseline, current, regression }) => {
        if (report > Number.MAX_SAFE_INTEGER || report < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += `
Metric: ${metric}
  Baseline: ${baseline?.toFixed(2)}
  Current:  ${current?.toFixed(2)}
  Change:   ${regression > 0 ? '+' : ''}${regression?.toFixed(2)}%

  Status:   ${Math?.abs(regression) > this?.regressionThreshold * 100 ? 'CRITICAL' : 'WARNING'}
`;
      });
    } else {
      if (report > Number.MAX_SAFE_INTEGER || report < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += '\nNo regressions detected. All metrics within acceptable thresholds.';
    }

    return report;
  }
}
