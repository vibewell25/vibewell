#!/usr/bin/env node

/**
 * Frontend Performance Analysis Script
 * 
 * This script uses Lighthouse to analyze frontend performance metrics
 * and provides optimization recommendations for the Vibewell application.
 * 
 * Usage:
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
  '/try-on',
  '/services',
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
  acc[key] = value;
  return acc;
}, { formFactor: 'mobile' }); // Default to mobile

// Main function
async function runAnalysis() {
  console.log(`🔍 Starting Frontend Performance Analysis (${args.formFactor})`);

  // Ensure the dev server is running
  await ensureServerRunning();
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  // Create analysis results directory
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
        
        results.urls[url] = metrics;
        
        // Add to summary (for averaging later)
        results.summary.performance += metrics.performance;
        results.summary.accessibility += metrics.accessibility;
        results.summary.bestPractices += metrics['best-practices'];
        results.summary.seo += metrics.seo;
        results.summary.pwa += metrics.pwa;
        results.summary.largest_contentful_paint += metrics.largest_contentful_paint;
        results.summary.first_contentful_paint += metrics.first_contentful_paint;
        results.summary.speed_index += metrics.speed_index;
        results.summary.total_blocking_time += metrics.total_blocking_time;
        results.summary.cumulative_layout_shift += metrics.cumulative_layout_shift;
        
        // Save individual report
        const fileName = `lighthouse-${args.formFactor}-${url.replace(/[\/\\?%*:|"<>]/g, '-')}-${Date.now()}.json`;
        fs.writeFileSync(
          path.join(resultsDir, fileName), 
          JSON.stringify(report, null, 2)
        );
        
        // Output metrics for the current URL
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
        results.urls[url] = { error: error.message };
      }
    }
    
    // Calculate averages for summary
    const urlCount = Object.keys(results.urls).length;
    if (urlCount > 0) {
      results.summary.performance /= urlCount;
      results.summary.accessibility /= urlCount;
      results.summary.bestPractices /= urlCount;
      results.summary.seo /= urlCount;
      results.summary.pwa /= urlCount;
      results.summary.largest_contentful_paint /= urlCount;
      results.summary.first_contentful_paint /= urlCount;
      results.summary.speed_index /= urlCount;
      results.summary.total_blocking_time /= urlCount;
      results.summary.cumulative_layout_shift /= urlCount;
    }
    
    // Save summary report
    const summaryPath = path.join(
      resultsDir, 
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
    console.log(`Average Performance Score: ${(results.summary.performance * 100).toFixed(0)}/100`);
    console.log(`Average Accessibility Score: ${(results.summary.accessibility * 100).toFixed(0)}/100`);
    console.log(`Average Best Practices Score: ${(results.summary.bestPractices * 100).toFixed(0)}/100`);
    console.log(`Average SEO Score: ${(results.summary.seo * 100).toFixed(0)}/100`);
    console.log('--------------------------------------------------');
    console.log(`Avg Largest Contentful Paint: ${results.summary.largest_contentful_paint.toFixed(2)}ms`);
    console.log(`Avg First Contentful Paint: ${results.summary.first_contentful_paint.toFixed(2)}ms`);
    console.log(`Avg Speed Index: ${results.summary.speed_index.toFixed(2)}ms`);
    console.log(`Avg Total Blocking Time: ${results.summary.total_blocking_time.toFixed(2)}ms`);
    console.log(`Avg Cumulative Layout Shift: ${results.summary.cumulative_layout_shift.toFixed(3)}`);
    console.log('--------------------------------------------------');
    
    // Generate optimization recommendations
    generateOptimizationReport(results, path.join(resultsDir, `optimization-recommendations-${Date.now()}.md`));
    
  } finally {
    await browser.close();
  }
  
  console.log('\n✅ Frontend performance analysis completed!');
}

/**
 * Run Lighthouse analysis for a URL
 */
async function runLighthouse(browser, url) {
  const { port } = new URL(browser.wsEndpoint());
  
  const options = {
    logLevel: 'error',
    output: 'json',
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
    'best-practices': lhr.categories['best-practices'].score,
    seo: lhr.categories.seo.score,
    pwa: lhr.categories.pwa.score,
    
    // Key performance metrics
    largest_contentful_paint: lhr.audits['largest-contentful-paint'].numericValue,
    first_contentful_paint: lhr.audits['first-contentful-paint'].numericValue,
    speed_index: lhr.audits['speed-index'].numericValue,
    total_blocking_time: lhr.audits['total-blocking-time'].numericValue,
    cumulative_layout_shift: lhr.audits['cumulative-layout-shift'].numericValue,
    
    // Diagnostic information
    diagnostics: []
  };
  
  // Extract top optimization opportunities
  if (lhr.audits['render-blocking-resources'] && 
      lhr.audits['render-blocking-resources'].details &&
      lhr.audits['render-blocking-resources'].details.items) {
    metrics.diagnostics.push({
      title: 'Eliminate render-blocking resources',
      items: lhr.audits['render-blocking-resources'].details.items
    });
  }
  
  if (lhr.audits['unused-javascript'] && 
      lhr.audits['unused-javascript'].details &&
      lhr.audits['unused-javascript'].details.items) {
    metrics.diagnostics.push({
      title: 'Remove unused JavaScript',
      items: lhr.audits['unused-javascript'].details.items
    });
  }
  
  if (lhr.audits['uses-responsive-images'] && 
      lhr.audits['uses-responsive-images'].details &&
      lhr.audits['uses-responsive-images'].details.items) {
    metrics.diagnostics.push({
      title: 'Properly size images',
      items: lhr.audits['uses-responsive-images'].details.items
    });
  }
  
  if (lhr.audits['unminified-javascript'] && 
      lhr.audits['unminified-javascript'].details &&
      lhr.audits['unminified-javascript'].details.items) {
    metrics.diagnostics.push({
      title: 'Minify JavaScript',
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
        value: `${(metrics.accessibility * 100).toFixed(0)}/100`,
        recommendation: 'Review ARIA attributes, ensure sufficient color contrast, add alt text to images, ensure form elements have labels.'
      });
    }
    
    // Best practices issues
    if (metrics['best-practices'] < 0.9) {
      issues['best-practices'].push({
        url,
        issue: 'Best practices improvements needed',
        value: `${(metrics['best-practices'] * 100).toFixed(0)}/100`,
        recommendation: 'Use HTTPS, fix console errors, avoid deprecated APIs, ensure resources are from secure origins.'
      });
    }
    
    // SEO issues
    if (metrics.seo < 0.9) {
      issues.seo.push({
        url,
        issue: 'SEO improvements needed',
        value: `${(metrics.seo * 100).toFixed(0)}/100`,
        recommendation: 'Add meta descriptions, ensure text is legible, use descriptive link text, optimize mobile viewport.'
      });
    }
  }
  
  // Generate the report markdown
  let markdown = `# Vibewell Frontend Optimization Recommendations\n\n`;
  markdown += `**Date:** ${new Date().toLocaleString()}\n\n`;
  markdown += `**Form Factor:** ${args.formFactor}\n\n`;
  
  markdown += `## Summary\n\n`;
  markdown += `- **Average Performance Score:** ${(results.summary.performance * 100).toFixed(0)}/100\n`;
  markdown += `- **Average Accessibility Score:** ${(results.summary.accessibility * 100).toFixed(0)}/100\n`;
  markdown += `- **Average Best Practices Score:** ${(results.summary.bestPractices * 100).toFixed(0)}/100\n`;
  markdown += `- **Average SEO Score:** ${(results.summary.seo * 100).toFixed(0)}/100\n\n`;
  
  markdown += `## Core Web Vitals\n\n`;
  markdown += `- **Average Largest Contentful Paint (LCP):** ${(results.summary.largest_contentful_paint / 1000).toFixed(2)}s\n`;
  markdown += `- **Average Cumulative Layout Shift (CLS):** ${results.summary.cumulative_layout_shift.toFixed(3)}\n`;
  markdown += `- **Average Total Blocking Time (TBT):** ${results.summary.total_blocking_time.toFixed(0)}ms\n\n`;
  
  // Add performance issues
  if (issues.performance.length > 0) {
    markdown += `## Performance Issues\n\n`;
    markdown += `| URL | Issue | Value | Recommendation |\n`;
    markdown += `| --- | ----- | ----- | -------------- |\n`;
    
    issues.performance.forEach(issue => {
      markdown += `| ${issue.url} | ${issue.issue} | ${issue.value} | ${issue.recommendation} |\n`;
    });
    markdown += `\n`;
  }
  
  // Add accessibility issues
  if (issues.accessibility.length > 0) {
    markdown += `## Accessibility Issues\n\n`;
    markdown += `| URL | Issue | Score | Recommendation |\n`;
    markdown += `| --- | ----- | ----- | -------------- |\n`;
    
    issues.accessibility.forEach(issue => {
      markdown += `| ${issue.url} | ${issue.issue} | ${issue.value} | ${issue.recommendation} |\n`;
    });
    markdown += `\n`;
  }
  
  // Add best practices issues
  if (issues['best-practices'].length > 0) {
    markdown += `## Best Practices Issues\n\n`;
    markdown += `| URL | Issue | Score | Recommendation |\n`;
    markdown += `| --- | ----- | ----- | -------------- |\n`;
    
    issues['best-practices'].forEach(issue => {
      markdown += `| ${issue.url} | ${issue.issue} | ${issue.value} | ${issue.recommendation} |\n`;
    });
    markdown += `\n`;
  }
  
  // Add SEO issues
  if (issues.seo.length > 0) {
    markdown += `## SEO Issues\n\n`;
    markdown += `| URL | Issue | Score | Recommendation |\n`;
    markdown += `| --- | ----- | ----- | -------------- |\n`;
    
    issues.seo.forEach(issue => {
      markdown += `| ${issue.url} | ${issue.issue} | ${issue.value} | ${issue.recommendation} |\n`;
    });
    markdown += `\n`;
  }
  
  // Prioritized optimization recommendations
  markdown += `## Prioritized Optimization Recommendations\n\n`;
  
  // Core Web Vitals optimizations
  markdown += `### 1. Optimize Core Web Vitals\n\n`;
  
  if (results.summary.largest_contentful_paint > 2500) {
    markdown += `- **Improve Largest Contentful Paint**\n`;
    markdown += `  - Optimize critical rendering path\n`;
    markdown += `  - Preload critical resources using \`<link rel="preload">\`\n`;
    markdown += `  - Implement server-side rendering for initial content\n`;
    markdown += `  - Optimize and compress images\n\n`;
  }
  
  if (results.summary.cumulative_layout_shift > 0.1) {
    markdown += `- **Reduce Cumulative Layout Shift**\n`;
    markdown += `  - Add width and height attributes to images\n`;
    markdown += `  - Reserve space for dynamic content\n`;
    markdown += `  - Avoid inserting content above existing content\n`;
    markdown += `  - Use CSS transform for animations instead of properties that trigger layout changes\n\n`;
  }
  
  if (results.summary.total_blocking_time > 300) {
    markdown += `- **Minimize Total Blocking Time**\n`;
    markdown += `  - Break up Long Tasks\n`;
    markdown += `  - Optimize JavaScript execution\n`;
    markdown += `  - Use Web Workers for heavy computations\n`;
    markdown += `  - Implement code-splitting and lazy loading\n\n`;
  }
  
  // JavaScript optimizations
  markdown += `### 2. JavaScript Optimizations\n\n`;
  markdown += `- **Reduce JavaScript bundle size**\n`;
  markdown += `  - Implement tree-shaking to eliminate dead code\n`;
  markdown += `  - Use code-splitting to load JavaScript on demand\n`;
  markdown += `  - Remove unused third-party libraries and dependencies\n`;
  markdown += `  - Implement dynamic imports for routes and components\n\n`;
  
  // Asset optimizations
  markdown += `### 3. Asset Optimizations\n\n`;
  markdown += `- **Optimize images and media**\n`;
  markdown += `  - Use WebP or AVIF formats for images\n`;
  markdown += `  - Implement responsive images with \`srcset\` and \`sizes\`\n`;
  markdown += `  - Lazy load offscreen images and media\n`;
  markdown += `  - Optimize 3D models and AR content\n\n`;
  
  // Save the report
  fs.writeFileSync(filePath, markdown);
  console.log(`\nOptimization recommendations saved to: ${filePath}`);
}

/**
 * Ensure the development server is running
 */
async function ensureServerRunning() {
  console.log('🔍 Checking if development server is running...');
  
  try {
    // Try to connect to the server
    await new Promise((resolve, reject) => {
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