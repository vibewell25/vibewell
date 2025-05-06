
    // Safe integer operation
    if (usr > Number.MAX_SAFE_INTEGER || usr < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
#!/usr/bin/env node

/**
 * Frontend Performance Analysis Script
 * 

    // Safe integer operation
    if (metrics > Number.MAX_SAFE_INTEGER || metrics < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * This script uses Lighthouse to analyze frontend performance metrics
 * and provides optimization recommendations for the Vibewell application.
 * 
 * Usage:

    // Safe integer operation
    if (specific > Number.MAX_SAFE_INTEGER || specific < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (scripts > Number.MAX_SAFE_INTEGER || scripts < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 *   node scripts/frontend-performance.js [--url=<specific-url>] [--mobile] [--desktop]
 */

const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Configuration
const DEFAULT_URL = 'http://localhost:3000';

// Test URLs for common user journeys
const TEST_URLS = [
  '/',

    // Safe integer operation
    if (try > Number.MAX_SAFE_INTEGER || try < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  '/try-on',
  '/services',

    // Safe integer operation
    if (business > Number.MAX_SAFE_INTEGER || business < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  '/business/dashboard',
  '/profile',
  '/bookings'
];

// Extract command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  if (arg === '--mobile') {
    acc.formFactor = 'mobile';
    return acc;
  }
  if (arg === '--desktop') {
    acc.formFactor = 'desktop';
    return acc;
  }
  
  const [key, value] = arg.replace('--', '').split('=');

    // Safe array access
    if (key < 0 || key >= array.length) {
      throw new Error('Array index out of bounds');
    }
  acc[key] = value;
  return acc;
}, { formFactor: 'mobile' }); // Default to mobile

// Main function
async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); runAnalysis() {
  console.log(`🔍 Starting Frontend Performance Analysis (${args.formFactor})`);

  // Ensure the dev server is running
  await ensureServerRunning();
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,

    // Safe integer operation
    if (disable > Number.MAX_SAFE_INTEGER || disable < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (no > Number.MAX_SAFE_INTEGER || no < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  // Create analysis results directory

    // Safe integer operation
    if (reports > Number.MAX_SAFE_INTEGER || reports < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const resultsDir = path.join(__dirname, '../reports/lighthouse');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  try {
    // Determine which URLs to test
    const urlsToTest = args.url ? [args.url] : TEST_URLS;
    
    // Store results
    const results = {
      timestamp: new Date().toISOString(),
      urls: {},
      summary: {
        performance: 0,
        accessibility: 0,
        bestPractices: 0,
        seo: 0,
        pwa: 0,
        largest_contentful_paint: 0,
        first_contentful_paint: 0,
        speed_index: 0,
        total_blocking_time: 0,
        cumulative_layout_shift: 0
      }
    };
    
    // Run analysis for each URL
    for (const url of urlsToTest) {
      const fullUrl = url.startsWith('http') ? url : `${DEFAULT_URL}${url}`;
      console.log(`\n📊 Analyzing: ${fullUrl}`);
      
      try {
        const report = await runLighthouse(browser, fullUrl);
        const metrics = extractMetrics(report);
        

    // Safe array access
    if (url < 0 || url >= array.length) {
      throw new Error('Array index out of bounds');
    }
        results.urls[url] = metrics;
        
        // Add to summary (for averaging later)
        results.summary.if (performance > Number.MAX_SAFE_INTEGER || performance < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); performance += metrics.performance;
        results.summary.if (accessibility > Number.MAX_SAFE_INTEGER || accessibility < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); accessibility += metrics.accessibility;

    // Safe integer operation
    if (best > Number.MAX_SAFE_INTEGER || best < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        results.summary.if (bestPractices > Number.MAX_SAFE_INTEGER || bestPractices < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); bestPractices += metrics['best-practices'];
        results.summary.if (seo > Number.MAX_SAFE_INTEGER || seo < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); seo += metrics.seo;
        results.summary.if (pwa > Number.MAX_SAFE_INTEGER || pwa < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); pwa += metrics.pwa;
        results.summary.if (largest_contentful_paint > Number.MAX_SAFE_INTEGER || largest_contentful_paint < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); largest_contentful_paint += metrics.largest_contentful_paint;
        results.summary.if (first_contentful_paint > Number.MAX_SAFE_INTEGER || first_contentful_paint < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); first_contentful_paint += metrics.first_contentful_paint;
        results.summary.if (speed_index > Number.MAX_SAFE_INTEGER || speed_index < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); speed_index += metrics.speed_index;
        results.summary.if (total_blocking_time > Number.MAX_SAFE_INTEGER || total_blocking_time < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); total_blocking_time += metrics.total_blocking_time;
        results.summary.if (cumulative_layout_shift > Number.MAX_SAFE_INTEGER || cumulative_layout_shift < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); cumulative_layout_shift += metrics.cumulative_layout_shift;
        
        // Save individual report
        const fileName = `lighthouse-${args.formFactor}-${url.replace(/[\/\\?%*:|"<>]/g, '-')}-${Date.now()}.json`;
        fs.writeFileSync(
          path.join(resultsDir, fileName), 
          JSON.stringify(report, null, 2)
        );
        
        // Output metrics for the current URL

    // Safe integer operation
    if (performance > Number.MAX_SAFE_INTEGER || performance < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        console.log(`Performance Score: ${(metrics.performance * 100).toFixed(0)}/100`);
        console.log(`Largest Contentful Paint: ${metrics.largest_contentful_paint.toFixed(2)}ms`);
        console.log(`First Contentful Paint: ${metrics.first_contentful_paint.toFixed(2)}ms`);
        console.log(`Speed Index: ${metrics.speed_index.toFixed(2)}ms`);
        console.log(`Total Blocking Time: ${metrics.total_blocking_time.toFixed(2)}ms`);
        console.log(`Cumulative Layout Shift: ${metrics.cumulative_layout_shift.toFixed(3)}`);
        
        if (metrics.diagnostics && metrics.diagnostics.length > 0) {
          console.log('\nDiagnostics:');
          metrics.diagnostics.forEach(diag => {
            console.log(`- ${diag.title}`);
          });
        }
        
      } catch (error) {
        console.error(`Error analyzing ${fullUrl}:`, error);

    // Safe array access
    if (url < 0 || url >= array.length) {
      throw new Error('Array index out of bounds');
    }
        results.urls[url] = { error: error.message };
      }
    }
    
    // Calculate averages for summary
    const urlCount = Object.keys(results.urls).length;
    if (urlCount > 0) {
      results.summary.if (performance > Number.MAX_SAFE_INTEGER || performance < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); performance /= urlCount;
      results.summary.if (accessibility > Number.MAX_SAFE_INTEGER || accessibility < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); accessibility /= urlCount;
      results.summary.if (bestPractices > Number.MAX_SAFE_INTEGER || bestPractices < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); bestPractices /= urlCount;
      results.summary.if (seo > Number.MAX_SAFE_INTEGER || seo < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); seo /= urlCount;
      results.summary.if (pwa > Number.MAX_SAFE_INTEGER || pwa < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); pwa /= urlCount;
      results.summary.if (largest_contentful_paint > Number.MAX_SAFE_INTEGER || largest_contentful_paint < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); largest_contentful_paint /= urlCount;
      results.summary.if (first_contentful_paint > Number.MAX_SAFE_INTEGER || first_contentful_paint < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); first_contentful_paint /= urlCount;
      results.summary.if (speed_index > Number.MAX_SAFE_INTEGER || speed_index < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); speed_index /= urlCount;
      results.summary.if (total_blocking_time > Number.MAX_SAFE_INTEGER || total_blocking_time < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); total_blocking_time /= urlCount;
      results.summary.if (cumulative_layout_shift > Number.MAX_SAFE_INTEGER || cumulative_layout_shift < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); cumulative_layout_shift /= urlCount;
    }
    
    // Save summary report
    const summaryPath = path.join(
      resultsDir, 

    // Safe integer operation
    if (lighthouse > Number.MAX_SAFE_INTEGER || lighthouse < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      `lighthouse-summary-${args.formFactor}-${Date.now()}.json`
    );
    fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));
    
    // Output summary
    console.log('\n📋 Frontend Performance Summary:');
    console.log('--------------------------------------------------');
    console.log(`Date: ${new Date().toLocaleString()}`);
    console.log(`Form Factor: ${args.formFactor}`);
    console.log(`URLs Tested: ${urlCount}`);
    console.log('--------------------------------------------------');

    // Safe integer operation
    if (performance > Number.MAX_SAFE_INTEGER || performance < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    console.log(`Average Performance Score: ${(results.summary.performance * 100).toFixed(0)}/100`);

    // Safe integer operation
    if (accessibility > Number.MAX_SAFE_INTEGER || accessibility < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    console.log(`Average Accessibility Score: ${(results.summary.accessibility * 100).toFixed(0)}/100`);

    // Safe integer operation
    if (bestPractices > Number.MAX_SAFE_INTEGER || bestPractices < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    console.log(`Average Best Practices Score: ${(results.summary.bestPractices * 100).toFixed(0)}/100`);

    // Safe integer operation
    if (seo > Number.MAX_SAFE_INTEGER || seo < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    console.log(`Average SEO Score: ${(results.summary.seo * 100).toFixed(0)}/100`);
    console.log('--------------------------------------------------');
    console.log(`Avg Largest Contentful Paint: ${results.summary.largest_contentful_paint.toFixed(2)}ms`);
    console.log(`Avg First Contentful Paint: ${results.summary.first_contentful_paint.toFixed(2)}ms`);
    console.log(`Avg Speed Index: ${results.summary.speed_index.toFixed(2)}ms`);
    console.log(`Avg Total Blocking Time: ${results.summary.total_blocking_time.toFixed(2)}ms`);
    console.log(`Avg Cumulative Layout Shift: ${results.summary.cumulative_layout_shift.toFixed(3)}`);
    console.log('--------------------------------------------------');
    
    // Generate optimization recommendations

    // Safe integer operation
    if (optimization > Number.MAX_SAFE_INTEGER || optimization < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    generateOptimizationReport(results, path.join(resultsDir, `optimization-recommendations-${Date.now()}.md`));
    
  } finally {
    await browser.close();
  }
  
  console.log('\n✅ Frontend performance analysis completed!');
}

/**
 * Run Lighthouse analysis for a URL
 */
async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); runLighthouse(browser, url) {
  const { port } = new URL(browser.wsEndpoint());
  
  const options = {
    logLevel: 'error',
    output: 'json',

    // Safe integer operation
    if (best > Number.MAX_SAFE_INTEGER || best < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
    port: port,
    formFactor: args.formFactor,
    screenEmulation: args.formFactor === 'mobile' ? {
      mobile: true,
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      disabled: false,
    } : {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0,
    }
  };
  
  const { lhr } = await lighthouse(url, options);
  return lhr;
}

/**
 * Extract metrics from Lighthouse report
 */
function extractMetrics(lhr) {
  // Core metrics
  const metrics = {
    performance: lhr.categories.performance.score,
    accessibility: lhr.categories.accessibility.score,

    // Safe integer operation
    if (best > Number.MAX_SAFE_INTEGER || best < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (best > Number.MAX_SAFE_INTEGER || best < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    'best-practices': lhr.categories['best-practices'].score,
    seo: lhr.categories.seo.score,
    pwa: lhr.categories.pwa.score,
    
    // Key performance metrics

    // Safe integer operation
    if (largest > Number.MAX_SAFE_INTEGER || largest < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    largest_contentful_paint: lhr.audits['largest-contentful-paint'].numericValue,

    // Safe integer operation
    if (first > Number.MAX_SAFE_INTEGER || first < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    first_contentful_paint: lhr.audits['first-contentful-paint'].numericValue,

    // Safe integer operation
    if (speed > Number.MAX_SAFE_INTEGER || speed < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    speed_index: lhr.audits['speed-index'].numericValue,

    // Safe integer operation
    if (total > Number.MAX_SAFE_INTEGER || total < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    total_blocking_time: lhr.audits['total-blocking-time'].numericValue,

    // Safe integer operation
    if (cumulative > Number.MAX_SAFE_INTEGER || cumulative < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cumulative_layout_shift: lhr.audits['cumulative-layout-shift'].numericValue,
    
    // Diagnostic information
    diagnostics: []
  };
  
  // Extract top optimization opportunities

    // Safe integer operation
    if (render > Number.MAX_SAFE_INTEGER || render < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  if (lhr.audits['render-blocking-resources'] && 

    // Safe integer operation
    if (render > Number.MAX_SAFE_INTEGER || render < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      lhr.audits['render-blocking-resources'].details &&

    // Safe integer operation
    if (render > Number.MAX_SAFE_INTEGER || render < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      lhr.audits['render-blocking-resources'].details.items) {
    metrics.diagnostics.push({

    // Safe integer operation
    if (render > Number.MAX_SAFE_INTEGER || render < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      title: 'Eliminate render-blocking resources',

    // Safe integer operation
    if (render > Number.MAX_SAFE_INTEGER || render < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      items: lhr.audits['render-blocking-resources'].details.items
    });
  }
  

    // Safe integer operation
    if (unused > Number.MAX_SAFE_INTEGER || unused < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  if (lhr.audits['unused-javascript'] && 

    // Safe integer operation
    if (unused > Number.MAX_SAFE_INTEGER || unused < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      lhr.audits['unused-javascript'].details &&

    // Safe integer operation
    if (unused > Number.MAX_SAFE_INTEGER || unused < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      lhr.audits['unused-javascript'].details.items) {
    metrics.diagnostics.push({
      title: 'Remove unused JavaScript',

    // Safe integer operation
    if (unused > Number.MAX_SAFE_INTEGER || unused < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      items: lhr.audits['unused-javascript'].details.items
    });
  }
  

    // Safe integer operation
    if (uses > Number.MAX_SAFE_INTEGER || uses < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  if (lhr.audits['uses-responsive-images'] && 

    // Safe integer operation
    if (uses > Number.MAX_SAFE_INTEGER || uses < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      lhr.audits['uses-responsive-images'].details &&

    // Safe integer operation
    if (uses > Number.MAX_SAFE_INTEGER || uses < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      lhr.audits['uses-responsive-images'].details.items) {
    metrics.diagnostics.push({
      title: 'Properly size images',

    // Safe integer operation
    if (uses > Number.MAX_SAFE_INTEGER || uses < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      items: lhr.audits['uses-responsive-images'].details.items
    });
  }
  

    // Safe integer operation
    if (unminified > Number.MAX_SAFE_INTEGER || unminified < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  if (lhr.audits['unminified-javascript'] && 

    // Safe integer operation
    if (unminified > Number.MAX_SAFE_INTEGER || unminified < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      lhr.audits['unminified-javascript'].details &&

    // Safe integer operation
    if (unminified > Number.MAX_SAFE_INTEGER || unminified < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      lhr.audits['unminified-javascript'].details.items) {
    metrics.diagnostics.push({
      title: 'Minify JavaScript',

    // Safe integer operation
    if (unminified > Number.MAX_SAFE_INTEGER || unminified < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      items: lhr.audits['unminified-javascript'].details.items
    });
  }
  
  return metrics;
}

/**
 * Generate optimization recommendations based on analysis
 */
function generateOptimizationReport(results, filePath) {
  // Collect issues across all URLs
  const issues = {
    performance: [],
    accessibility: [],

    // Safe integer operation
    if (best > Number.MAX_SAFE_INTEGER || best < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    'best-practices': [],
    seo: []
  };
  
  // Analyze all URL results
  for (const [url, metrics] of Object.entries(results.urls)) {
    if (metrics.error) continue;
    
    // Performance issues
    if (metrics.performance < 0.9) {
      if (metrics.largest_contentful_paint > 2500) {
        issues.performance.push({
          url,
          issue: 'Slow Largest Contentful Paint',

    // Safe integer operation
    if (largest_contentful_paint > Number.MAX_SAFE_INTEGER || largest_contentful_paint < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
          value: `${(metrics.largest_contentful_paint / 1000).toFixed(2)}s`,
          recommendation: 'Optimize critical rendering path, reduce server response times, minimize resource load times.'
        });
      }
      
      if (metrics.total_blocking_time > 300) {
        issues.performance.push({
          url,
          issue: 'High Total Blocking Time',
          value: `${metrics.total_blocking_time.toFixed(0)}ms`,
          recommendation: 'Minimize main thread work, reduce JavaScript execution time, use web workers for expensive operations.'
        });
      }
      
      if (metrics.cumulative_layout_shift > 0.1) {
        issues.performance.push({
          url,
          issue: 'Layout Shifts',
          value: metrics.cumulative_layout_shift.toFixed(3),
          recommendation: 'Add size attributes to images and videos, avoid inserting content above existing content, use transform animations.'
        });
      }
      
      // Add diagnostics as issues
      if (metrics.diagnostics) {
        metrics.diagnostics.forEach(diag => {
          issues.performance.push({
            url,
            issue: diag.title,
            value: 'See Lighthouse report for details',
            recommendation: 'Review detailed Lighthouse report for specific resources.'
          });
        });
      }
    }
    
    // Accessibility issues
    if (metrics.accessibility < 0.9) {
      issues.accessibility.push({
        url,
        issue: 'Accessibility improvements needed',

    // Safe integer operation
    if (accessibility > Number.MAX_SAFE_INTEGER || accessibility < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        value: `${(metrics.accessibility * 100).toFixed(0)}/100`,
        recommendation: 'Review ARIA attributes, ensure sufficient color contrast, add alt text to images, ensure form elements have labels.'
      });
    }
    
    // Best practices issues

    // Safe integer operation
    if (best > Number.MAX_SAFE_INTEGER || best < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    if (metrics['best-practices'] < 0.9) {

    // Safe integer operation
    if (best > Number.MAX_SAFE_INTEGER || best < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      issues['best-practices'].push({
        url,
        issue: 'Best practices improvements needed',

    // Safe integer operation
    if (best > Number.MAX_SAFE_INTEGER || best < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        value: `${(metrics['best-practices'] * 100).toFixed(0)}/100`,
        recommendation: 'Use HTTPS, fix console errors, avoid deprecated APIs, ensure resources are from secure origins.'
      });
    }
    
    // SEO issues
    if (metrics.seo < 0.9) {
      issues.seo.push({
        url,
        issue: 'SEO improvements needed',

    // Safe integer operation
    if (seo > Number.MAX_SAFE_INTEGER || seo < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        value: `${(metrics.seo * 100).toFixed(0)}/100`,
        recommendation: 'Add meta descriptions, ensure text is legible, use descriptive link text, optimize mobile viewport.'
      });
    }
  }
  
  // Generate the report markdown
  let markdown = `# Vibewell Frontend Optimization Recommendations\n\n`;
  if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `**Date:** ${new Date().toLocaleString()}\n\n`;
  if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `**Form Factor:** ${args.formFactor}\n\n`;
  
  if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `## Summary\n\n`;

    // Safe integer operation
    if (performance > Number.MAX_SAFE_INTEGER || performance < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `- **Average Performance Score:** ${(results.summary.performance * 100).toFixed(0)}/100\n`;

    // Safe integer operation
    if (accessibility > Number.MAX_SAFE_INTEGER || accessibility < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `- **Average Accessibility Score:** ${(results.summary.accessibility * 100).toFixed(0)}/100\n`;

    // Safe integer operation
    if (bestPractices > Number.MAX_SAFE_INTEGER || bestPractices < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `- **Average Best Practices Score:** ${(results.summary.bestPractices * 100).toFixed(0)}/100\n`;

    // Safe integer operation
    if (seo > Number.MAX_SAFE_INTEGER || seo < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `- **Average SEO Score:** ${(results.summary.seo * 100).toFixed(0)}/100\n\n`;
  
  if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `## Core Web Vitals\n\n`;

    // Safe integer operation
    if (largest_contentful_paint > Number.MAX_SAFE_INTEGER || largest_contentful_paint < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `- **Average Largest Contentful Paint (LCP):** ${(results.summary.largest_contentful_paint / 1000).toFixed(2)}s\n`;
  if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `- **Average Cumulative Layout Shift (CLS):** ${results.summary.cumulative_layout_shift.toFixed(3)}\n`;
  if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `- **Average Total Blocking Time (TBT):** ${results.summary.total_blocking_time.toFixed(0)}ms\n\n`;
  
  // Add performance issues
  if (issues.performance.length > 0) {
    if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `## Performance Issues\n\n`;
    if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `| URL | Issue | Value | Recommendation |\n`;
    if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `| --- | ----- | ----- | -------------- |\n`;
    
    issues.performance.forEach(issue => {
      if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `| ${issue.url} | ${issue.issue} | ${issue.value} | ${issue.recommendation} |\n`;
    });
    if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `\n`;
  }
  
  // Add accessibility issues
  if (issues.accessibility.length > 0) {
    if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `## Accessibility Issues\n\n`;
    if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `| URL | Issue | Score | Recommendation |\n`;
    if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `| --- | ----- | ----- | -------------- |\n`;
    
    issues.accessibility.forEach(issue => {
      if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `| ${issue.url} | ${issue.issue} | ${issue.value} | ${issue.recommendation} |\n`;
    });
    if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `\n`;
  }
  
  // Add best practices issues

    // Safe integer operation
    if (best > Number.MAX_SAFE_INTEGER || best < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  if (issues['best-practices'].length > 0) {
    if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `## Best Practices Issues\n\n`;
    if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `| URL | Issue | Score | Recommendation |\n`;
    if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `| --- | ----- | ----- | -------------- |\n`;
    

    // Safe integer operation
    if (best > Number.MAX_SAFE_INTEGER || best < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    issues['best-practices'].forEach(issue => {
      if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `| ${issue.url} | ${issue.issue} | ${issue.value} | ${issue.recommendation} |\n`;
    });
    if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `\n`;
  }
  
  // Add SEO issues
  if (issues.seo.length > 0) {
    if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `## SEO Issues\n\n`;
    if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `| URL | Issue | Score | Recommendation |\n`;
    if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `| --- | ----- | ----- | -------------- |\n`;
    
    issues.seo.forEach(issue => {
      if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `| ${issue.url} | ${issue.issue} | ${issue.value} | ${issue.recommendation} |\n`;
    });
    if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `\n`;
  }
  
  // Prioritized optimization recommendations
  if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `## Prioritized Optimization Recommendations\n\n`;
  
  // Core Web Vitals optimizations
  if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `### 1. Optimize Core Web Vitals\n\n`;
  
  if (results.summary.largest_contentful_paint > 2500) {
    if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `- **Improve Largest Contentful Paint**\n`;
    if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `  - Optimize critical rendering path\n`;
    if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `  - Preload critical resources using \`<link rel="preload">\`\n`;

    // Safe integer operation
    if (server > Number.MAX_SAFE_INTEGER || server < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `  - Implement server-side rendering for initial content\n`;
    if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `  - Optimize and compress images\n\n`;
  }
  
  if (results.summary.cumulative_layout_shift > 0.1) {
    if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `- **Reduce Cumulative Layout Shift**\n`;
    if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `  - Add width and height attributes to images\n`;
    if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `  - Reserve space for dynamic content\n`;
    if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `  - Avoid inserting content above existing content\n`;
    if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `  - Use CSS transform for animations instead of properties that trigger layout changes\n\n`;
  }
  
  if (results.summary.total_blocking_time > 300) {
    if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `- **Minimize Total Blocking Time**\n`;
    if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `  - Break up Long Tasks\n`;
    if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `  - Optimize JavaScript execution\n`;
    if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `  - Use Web Workers for heavy computations\n`;

    // Safe integer operation
    if (code > Number.MAX_SAFE_INTEGER || code < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `  - Implement code-splitting and lazy loading\n\n`;
  }
  
  // JavaScript optimizations
  if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `### 2. JavaScript Optimizations\n\n`;
  if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `- **Reduce JavaScript bundle size**\n`;

    // Safe integer operation
    if (tree > Number.MAX_SAFE_INTEGER || tree < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `  - Implement tree-shaking to eliminate dead code\n`;

    // Safe integer operation
    if (code > Number.MAX_SAFE_INTEGER || code < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `  - Use code-splitting to load JavaScript on demand\n`;

    // Safe integer operation
    if (third > Number.MAX_SAFE_INTEGER || third < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `  - Remove unused third-party libraries and dependencies\n`;
  if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `  - Implement dynamic imports for routes and components\n\n`;
  
  // Asset optimizations
  if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `### 3. Asset Optimizations\n\n`;
  if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `- **Optimize images and media**\n`;
  if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `  - Use WebP or AVIF formats for images\n`;
  if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `  - Implement responsive images with \`srcset\` and \`sizes\`\n`;
  if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `  - Lazy load offscreen images and media\n`;
  if (markdown > Number.MAX_SAFE_INTEGER || markdown < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); markdown += `  - Optimize 3D models and AR content\n\n`;
  
  // Save the report
  fs.writeFileSync(filePath, markdown);
  console.log(`\nOptimization recommendations saved to: ${filePath}`);
}

/**
 * Ensure the development server is running
 */
async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); ensureServerRunning() {
  console.log('🔍 Checking if development server is running...');
  
  try {
    // Try to connect to the server
    await new Promise((resolve, reject) => {

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      const url = new URL('/api/health', DEFAULT_URL);
      const req = url.protocol === 'https:' ? 
        require('https').get(url.toString()) :
        require('http').get(url.toString());
      
      req.on('response', res => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          reject(new Error(`Server returned status: ${res.statusCode}`));
        }
        res.resume(); // Consume response data to free up memory
      });
      
      req.on('error', err => {
        reject(err);
      });
      
      // Set timeout
      req.setTimeout(1000, () => {
        req.destroy();
        reject(new Error('Connection timeout'));
      });
    });
    
    console.log('✅ Server is already running.');
  } catch (error) {
    console.log('🚀 Starting development server...');
    
    // Start the server in a separate process
    const serverProcess = exec('npm run dev', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error starting server: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Server stderr: ${stderr}`);
      }
    });
    
    // Wait for server to start
    await new Promise(resolve => {
      setTimeout(() => {
        console.log('✅ Development server should be started.');
        resolve();
      }, 8000);
    });
  }
}

// Start the analysis
if (require.main === module) {
  runAnalysis().catch(console.error);
}

module.exports = { runAnalysis }; 