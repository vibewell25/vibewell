import { performance } from 'perf_hooks';
import { MonitoringService } from '../../types/monitoring';
import { createTestClient } from '../../utils/test-utils';
import { config } from '../../config';

interface PerformanceTestResult {
  name: string;
  duration: number;
  memoryUsage: number;
  success: boolean;
  error?: string;
}

export class PerformanceTestSuite {
  private monitoringService: MonitoringService;
  private testClient: any;
  private results: PerformanceTestResult[] = [];
  private readonly thresholds = config.testing.performance.thresholds;

  constructor(monitoringService: MonitoringService) {
    this.monitoringService = monitoringService;
    this.testClient = createTestClient();
  }

  async runAll(): Promise<PerformanceTestResult[]> {
    await this.monitoringService.startMonitoring();
    
    try {
      // Perform warmup runs
      for (let i = 0; i < config.testing.performance.warmupRuns; i++) {
        await this.testPageLoad();
      }

      // Clear results from warmup runs
      this.results = [];

      // Run actual tests
      for (let i = 0; i < config.testing.performance.samples; i++) {
        await this.testPageLoad();
        await this.testApiLatency();
        await this.testDatabaseQueries();
        await this.testImageOptimization();
        await this.testCachePerformance();
        await this.testServerSideRendering();
        await this.testMobileOptimization();
        await this.testBundleSize();
      }
    } finally {
      await this.monitoringService.stopMonitoring();
    }

    return this.results;
  }

  private async measurePerformance(name: string, fn: () => Promise<void>): Promise<void> {
    const startMemory = process.memoryUsage().heapUsed;
    const startTime = performance.now();

    try {
      await fn();
      const duration = performance.now() - startTime;
      const memoryUsage = process.memoryUsage().heapUsed - startMemory;
      
      // Record metrics
      await this.monitoringService.recordMetric(`${name}_duration`, duration);
      await this.monitoringService.recordMetric(`${name}_memory`, memoryUsage);

      this.results.push({
        name,
        duration,
        memoryUsage,
        success: true
      });
    } catch (error) {
      this.results.push({
        name,
        duration: performance.now() - startTime,
        memoryUsage: process.memoryUsage().heapUsed - startMemory,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async testPageLoad(): Promise<void> {
    await this.measurePerformance('Page Load Test', async () => {
      const response = await this.testClient.get('/');
      if (response.status !== 200) {
        throw new Error(`Page load failed with status ${response.status}`);
      }
      if (response.headers['time-to-first-byte']) {
        await this.monitoringService.recordMetric('ttfb', parseInt(response.headers['time-to-first-byte']));
      }
    });
  }

  private async testApiLatency(): Promise<void> {
    await this.measurePerformance('API Latency Test', async () => {
      const endpoints = ['/api/health', '/api/metrics', '/api/status'];
      const results = await Promise.all(endpoints.map(endpoint => 
        this.testClient.get(endpoint)
      ));
      
      results.forEach((response, index) => {
        if (response.status !== 200) {
          throw new Error(`API endpoint ${endpoints[index]} failed with status ${response.status}`);
        }
      });
    });
  }

  private async testDatabaseQueries(): Promise<void> {
    await this.measurePerformance('Database Query Performance', async () => {
      const operations = [
        this.testClient.post('/api/test/db/read'),
        this.testClient.post('/api/test/db/write'),
        this.testClient.post('/api/test/db/query')
      ];

      const results = await Promise.all(operations);
      results.forEach((response, index) => {
        if (response.status !== 200) {
          throw new Error(`Database operation ${index} failed with status ${response.status}`);
        }
        if (response.headers['query-time']) {
          this.monitoringService.recordMetric(`db_operation_${index}`, parseInt(response.headers['query-time']));
        }
      });
    });
  }

  private async testImageOptimization(): Promise<void> {
    await this.measurePerformance('Image Optimization Pipeline', async () => {
      const testImages = [
        '/test-assets/large-image.jpg',
        '/test-assets/medium-image.png',
        '/test-assets/small-image.webp'
      ];

      const results = await Promise.all(testImages.map(image =>
        this.testClient.get(`/api/optimize-image?src=${image}`)
      ));

      results.forEach((response, index) => {
        if (response.status !== 200) {
          throw new Error(`Image optimization for ${testImages[index]} failed with status ${response.status}`);
        }
        if (response.headers['optimization-time']) {
          this.monitoringService.recordMetric(`image_optimization_${index}`, parseInt(response.headers['optimization-time']));
        }
      });
    });
  }

  private async testCachePerformance(): Promise<void> {
    await this.measurePerformance('Cache Performance', async () => {
      const results = [];
      for (let i = 0; i < 5; i++) {
        const start = performance.now();
        const response = await this.testClient.get('/api/cached-endpoint');
        results.push(performance.now() - start);
        
        if (response.status !== 200) {
          throw new Error(`Cache request failed with status ${response.status}`);
        }
      }

      const avgTime = results.reduce((a, b) => a + b, 0) / results.length;
      await this.monitoringService.recordMetric('cache_avg_response_time', avgTime);
    });
  }

  private async testServerSideRendering(): Promise<void> {
    await this.measurePerformance('Server-Side Rendering', async () => {
      const ssrPages = [
        '/dashboard',
        '/profile',
        '/settings'
      ];

      const results = await Promise.all(ssrPages.map(page =>
        this.testClient.get(page, { 
          headers: { 
            'User-Agent': 'Googlebot',
            'Accept': 'text/html'
          }
        })
      ));

      results.forEach((response, index) => {
        if (response.status !== 200) {
          throw new Error(`SSR for ${ssrPages[index]} failed with status ${response.status}`);
        }
        if (response.headers['ssr-time']) {
          this.monitoringService.recordMetric(`ssr_time_${index}`, parseInt(response.headers['ssr-time']));
        }
      });
    });
  }

  private async testMobileOptimization(): Promise<void> {
    await this.measurePerformance('Mobile Optimization', async () => {
      const mobileUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';
      const pages = ['/dashboard', '/profile', '/settings'];
      
      const results = await Promise.all(pages.map(page =>
        this.testClient.get(page, {
          headers: {
            'User-Agent': mobileUserAgent,
            'Accept': 'text/html',
            'Save-Data': '1'
          }
        })
      ));

      results.forEach((response, index) => {
        if (response.status !== 200) {
          throw new Error(`Mobile page load for ${pages[index]} failed with status ${response.status}`);
        }
        
        // Check response size
        const contentLength = parseInt(response.headers['content-length'] || '0');
        this.monitoringService.recordMetric(`mobile_page_size_${index}`, contentLength);
        
        // Check image optimization
        const imageCount = (response.data.match(/<img[^>]+>/g) || []).length;
        this.monitoringService.recordMetric(`mobile_image_count_${index}`, imageCount);
        
        // Check if proper viewport meta tag exists
        const hasViewportMeta = response.data.includes('viewport');
        if (!hasViewportMeta) {
          throw new Error(`Missing viewport meta tag on ${pages[index]}`);
        }
      });
    });
  }

  private async testBundleSize(): Promise<void> {
    await this.measurePerformance('Bundle Size Analysis', async () => {
      const response = await this.testClient.get('/_next/static/chunks/main.js');
      if (response.status !== 200) {
        throw new Error(`Failed to fetch main bundle with status ${response.status}`);
      }

      const mainBundleSize = parseInt(response.headers['content-length'] || '0');
      this.monitoringService.recordMetric('main_bundle_size', mainBundleSize);

      // Check if bundle size exceeds threshold (500KB)
      if (mainBundleSize > 500 * 1024) {
        throw new Error(`Main bundle size (${mainBundleSize} bytes) exceeds threshold of 500KB`);
      }

      // Test code splitting
      const dynamicChunks = await this.testClient.get('/_next/static/chunks/pages/');
      const chunkCount = (dynamicChunks.data.match(/chunk.*\.js/g) || []).length;
      this.monitoringService.recordMetric('dynamic_chunk_count', chunkCount);
    });
  }

  async generateReport(): Promise<string> {
    const totalTests = this.results.length;
    const successfulTests = this.results.filter(r => r.success).length;
    const averageDuration = this.results.reduce((acc, r) => acc + r.duration, 0) / totalTests;
    const totalMemoryUsage = this.results.reduce((acc, r) => acc + r.memoryUsage, 0);

    const testsByType = this.results.reduce((acc: Record<string, PerformanceTestResult[]>, result) => {
      if (!result || !result.name) return acc;
      const parts = result.name.split(' ');
      const type = parts[0]?.toLowerCase() || 'unknown';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(result);
      return acc;
    }, {} as Record<string, PerformanceTestResult[]>);

    let report = `
Performance Test Report
----------------------
Total Tests: ${totalTests}
Successful Tests: ${successfulTests}
Failed Tests: ${totalTests - successfulTests}
Average Duration: ${averageDuration.toFixed(2)}ms
Total Memory Usage: ${(totalMemoryUsage / 1024 / 1024).toFixed(2)}MB

Detailed Results:
`;

    for (const [type, results] of Object.entries(testsByType)) {
      const avgDuration = results.reduce((acc, r) => acc + r.duration, 0) / results.length;
      const thresholdKey = type.toLowerCase() as keyof typeof this.thresholds;
      const threshold = this.thresholds[thresholdKey] || Number.MAX_VALUE;
      const status = avgDuration <= threshold ? 'PASS' : 'FAIL';

      report += `\n${type} Tests:
  Average Duration: ${avgDuration.toFixed(2)}ms
  Threshold: ${threshold === Number.MAX_VALUE ? 'Not Set' : `${threshold}ms`}
  Status: ${status}
  Tests: ${results.length}
  Success Rate: ${(results.filter(r => r.success).length / results.length * 100).toFixed(2)}%\n`;

      for (const result of results) {
        if (!result.success) {
          report += `  Error in test: ${result.error}\n`;
        }
      }
    }

    return report;
  }
} 