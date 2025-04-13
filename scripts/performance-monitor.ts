import lighthouse from 'lighthouse';
import puppeteer from 'puppeteer';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { performance } from 'perf_hooks';

interface PerformanceMetrics {
  timestamp: string;
  url: string;
  metrics: {
    FCP: number;
    LCP: number;
    CLS: number;
    FID: number;
    TTFB: number;
    TBT: number;
  };
  lighthouse: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    pwa: number;
  };
  resourceSizes: {
    js: number;
    css: number;
    images: number;
    fonts: number;
    total: number;
  };
}

async function runLighthouse(url: string): Promise<any> {
  const browser = await puppeteer.launch({ headless: 'new' });
  const { port } = new URL(browser.wsEndpoint());

  const results = await lighthouse(url, {
    port: parseInt(port),
    output: 'json',
    logLevel: 'error',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
  });

  await browser.close();
  return results;
}

async function getResourceSizes(url: string): Promise<PerformanceMetrics['resourceSizes']> {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Enable request interception
  await page.setRequestInterception(true);
  
  const resources = {
    js: 0,
    css: 0,
    images: 0,
    fonts: 0,
    total: 0,
  };

  page.on('request', request => {
    const type = request.resourceType();
    const size = parseInt(request.headers()['content-length'] || '0');
    
    switch (type) {
      case 'script':
        resources.js += size;
        break;
      case 'stylesheet':
        resources.css += size;
        break;
      case 'image':
        resources.images += size;
        break;
      case 'font':
        resources.fonts += size;
        break;
    }
    resources.total += size;
    
    request.continue();
  });

  await page.goto(url, { waitUntil: 'networkidle0' });
  await browser.close();
  
  return resources;
}

async function measurePerformance(url: string): Promise<PerformanceMetrics> {
  console.log(`Measuring performance for ${url}...`);
  const startTime = performance.now();

  // Run Lighthouse audit
  const lighthouseResults = await runLighthouse(url);
  const lhr = lighthouseResults.lhr;

  // Get resource sizes
  const resourceSizes = await getResourceSizes(url);

  const metrics: PerformanceMetrics = {
    timestamp: new Date().toISOString(),
    url,
    metrics: {
      FCP: lhr.audits['first-contentful-paint'].numericValue,
      LCP: lhr.audits['largest-contentful-paint'].numericValue,
      CLS: lhr.audits['cumulative-layout-shift'].numericValue,
      FID: lhr.audits['max-potential-fid'].numericValue,
      TTFB: lhr.audits['server-response-time'].numericValue,
      TBT: lhr.audits['total-blocking-time'].numericValue,
    },
    lighthouse: {
      performance: lhr.categories.performance.score * 100,
      accessibility: lhr.categories.accessibility.score * 100,
      bestPractices: lhr.categories['best-practices'].score * 100,
      seo: lhr.categories.seo.score * 100,
      pwa: lhr.categories.pwa.score * 100,
    },
    resourceSizes,
  };

  const endTime = performance.now();
  console.log(`Performance measurement completed in ${((endTime - startTime) / 1000).toFixed(2)}s`);

  return metrics;
}

async function generateReport(metrics: PerformanceMetrics) {
  const reportDir = join(process.cwd(), 'reports', 'performance');
  const reportPath = join(reportDir, `performance-report-${metrics.timestamp}.json`);

  try {
    await mkdir(reportDir, { recursive: true });
    await writeFile(reportPath, JSON.stringify(metrics, null, 2));
    console.log(`Performance report generated: ${reportPath}`);

    // Check if performance scores are below thresholds
    const thresholds = {
      performance: 90,
      accessibility: 90,
      bestPractices: 90,
      seo: 90,
    };

    const failedMetrics = Object.entries(thresholds).filter(
      ([key, threshold]) => metrics.lighthouse[key as keyof typeof metrics.lighthouse] < threshold
    );

    if (failedMetrics.length > 0) {
      console.warn('Performance issues detected:');
      failedMetrics.forEach(([metric, threshold]) => {
        console.warn(`- ${metric}: ${metrics.lighthouse[metric as keyof typeof metrics.lighthouse]}% (threshold: ${threshold}%)`);
      });
    }
  } catch (error) {
    console.error('Error generating report:', error);
    process.exit(1);
  }
}

async function main() {
  const urls = [
    'http://localhost:3000',
    'http://localhost:3000/beauty-wellness',
    // Add more URLs to test
  ];

  for (const url of urls) {
    try {
      const metrics = await measurePerformance(url);
      await generateReport(metrics);
    } catch (error) {
      console.error(`Error measuring performance for ${url}:`, error);
    }
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
} 