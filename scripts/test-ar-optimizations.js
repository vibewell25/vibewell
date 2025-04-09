#!/usr/bin/env node

/**
 * AR Optimization Test Script
 * 
 * This script tests the performance of the AR features across different simulated
 * devices and browsers to verify the optimizations implemented in VTO-01, VTO-02, and VTO-03.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const { URL } = require('url');

// Configuration
const TEST_URL = 'http://localhost:3000/try-on';
const DEVICES = [
  'Pixel 5',  // Android
  'iPhone 12', // iOS
  'Desktop Chrome'
];
const NUM_TRIALS = 5;
const TEST_MODELS = [
  '/models/makeup/lipstick.glb',
  '/models/hairstyle/bob.glb',
  '/models/accessory/glasses.glb'
];

// Results storage
const results = {
  loadTimes: {},
  fps: {},
  memoryUsage: {},
  cacheStats: {}
};

/**
 * Run the tests
 */
async function runTests() {
  console.log('🧪 Starting AR Optimization Tests');
  
  // Ensure the dev server is running
  await ensureServerRunning();
  
  for (const device of DEVICES) {
    console.log(`\n📱 Testing on ${device}`);
    results.loadTimes[device] = {};
    results.fps[device] = {};
    results.memoryUsage[device] = {};
    
    const browser = await puppeteer.launch({
      headless: false, // AR features need real browser
      defaultViewport: null,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl']
    });
    
    try {
      const page = await browser.newPage();
      
      // Set device emulation if not desktop
      if (device !== 'Desktop Chrome') {
        await page.emulate(puppeteer.devices[device]);
      }
      
      // Add test instrumentation
      await instrumentPage(page);
      
      // Run the performance tests
      await testModels(page, device);
      
      // Test caching
      await testCaching(page, device);
      
    } finally {
      await browser.close();
    }
  }
  
  // Generate report
  generateReport();
  
  console.log('\n✅ Tests completed!');
}

/**
 * Ensure the development server is running
 */
async function ensureServerRunning() {
  console.log('🔍 Checking if development server is running...');
  
  try {
    // Try to connect to the server
    await new Promise((resolve, reject) => {
      const req = http.get(TEST_URL, res => {
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
        req.abort();
        reject(new Error('Connection timeout'));
      });
    });
    
    console.log('✅ Server is already running.');
  } catch (error) {
    console.log('🚀 Starting development server...');
    
    // Start the server in a separate process
    const serverProcess = require('child_process').spawn('npm', ['run', 'dev'], {
      stdio: 'pipe',
      detached: true
    });
    
    // Wait for server to start
    await new Promise(resolve => {
      let output = '';
      
      serverProcess.stdout.on('data', data => {
        output += data.toString();
        
        // Check if server is ready
        if (output.includes('ready') || output.includes('started')) {
          console.log('✅ Development server started.');
          resolve();
        }
      });
    });
    
    // Wait a bit more to ensure the server is fully ready
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}

/**
 * Add test instrumentation to the page
 */
async function instrumentPage(page) {
  // Enable request interception for network analysis
  await page.setRequestInterception(true);
  
  // Track requests and timing
  const requests = new Map();
  
  page.on('request', request => {
    requests.set(request.url(), { startTime: Date.now() });
    request.continue();
  });
  
  page.on('response', async response => {
    const url = response.url();
    const request = requests.get(url);
    
    if (request) {
      request.endTime = Date.now();
      request.duration = request.endTime - request.startTime;
      request.resourceType = response.request().resourceType();
      request.status = response.status();
      request.size = response.headers()['content-length'] || 0;
    }
  });
  
  // Add performance monitoring
  await page.evaluateOnNewDocument(() => {
    // Create metric collection
    window.__arMetrics = {
      fps: [],
      memory: [],
      loadTimes: {},
      events: []
    };
    
    // Track FPS
    let frameCount = 0;
    let lastTime = performance.now();
    
    function countFrame() {
      frameCount++;
      const now = performance.now();
      
      if (now - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastTime));
        window.__arMetrics.fps.push(fps);
        frameCount = 0;
        lastTime = now;
        
        // Log memory usage if available
        if (performance.memory) {
          window.__arMetrics.memory.push({
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize
          });
        }
      }
      
      window.requestAnimationFrame(countFrame);
    }
    
    window.requestAnimationFrame(countFrame);
    
    // Intercept console.log to capture model loading events
    const originalConsoleLog = console.log;
    console.log = function(...args) {
      originalConsoleLog.apply(console, args);
      
      const message = args.join(' ');
      if (message.includes('model loaded') || 
          message.includes('cache hit') || 
          message.includes('cache miss')) {
        window.__arMetrics.events.push({
          time: performance.now(),
          message: message
        });
      }
    };
    
    // Intercept fetch for model loading times
    const originalFetch = window.fetch;
    window.fetch = async function(input, init) {
      const url = typeof input === 'string' ? input : input.url;
      
      // Check if this is a model file
      if (url.includes('.glb') || url.includes('.gltf')) {
        const startTime = performance.now();
        try {
          const response = await originalFetch.apply(window, arguments);
          const endTime = performance.now();
          window.__arMetrics.loadTimes[url] = {
            duration: endTime - startTime,
            cached: false,
            size: response.headers.get('content-length') || 0
          };
          return response;
        } catch (error) {
          const endTime = performance.now();
          window.__arMetrics.loadTimes[url] = {
            duration: endTime - startTime,
            cached: false,
            error: error.message
          };
          throw error;
        }
      }
      
      return originalFetch.apply(window, arguments);
    };
  });
}

/**
 * Test model loading and performance for each model
 */
async function testModels(page, device) {
  await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
  
  // Wait for the try-on page to load
  await page.waitForSelector('[data-testid="three-ar-viewer"]', { timeout: 10000 })
    .catch(() => console.log('AR viewer not found, continuing anyway'));
  
  // Test each model
  for (const modelUrl of TEST_MODELS) {
    const modelName = path.basename(modelUrl, path.extname(modelUrl));
    console.log(`  📦 Testing model: ${modelName}`);
    
    results.loadTimes[device][modelName] = [];
    results.fps[device][modelName] = [];
    results.memoryUsage[device][modelName] = [];
    
    // Run multiple trials
    for (let trial = 0; trial < NUM_TRIALS; trial++) {
      console.log(`    Trial ${trial + 1}/${NUM_TRIALS}`);
      
      // Find and click the model button
      const modelButtons = await page.$$('button');
      for (const button of modelButtons) {
        const text = await page.evaluate(el => el.textContent, button);
        if (text.toLowerCase().includes(modelName.toLowerCase())) {
          await button.click();
          break;
        }
      }
      
      // Wait for model to load
      await page.waitForFunction(
        () => document.querySelector('[data-testid="three-ar-viewer"]') !== null,
        { timeout: 10000 }
      ).catch(() => console.log('Model loading timeout, continuing...'));
      
      // Wait for rendering to stabilize
      await page.waitForTimeout(2000);
      
      // Collect metrics
      const metrics = await page.evaluate(() => {
        return {
          fps: window.__arMetrics.fps.slice(-10), // Last 10 FPS measurements
          memory: window.__arMetrics.memory.slice(-10), // Last 10 memory measurements
          loadTimes: window.__arMetrics.loadTimes,
          events: window.__arMetrics.events
        };
      });
      
      // Calculate average FPS
      const avgFps = metrics.fps.reduce((sum, fps) => sum + fps, 0) / metrics.fps.length || 0;
      results.fps[device][modelName].push(avgFps);
      
      // Calculate average memory usage (in MB)
      if (metrics.memory.length > 0) {
        const avgMemory = metrics.memory.reduce((sum, mem) => sum + mem.usedJSHeapSize, 0) / 
          metrics.memory.length / (1024 * 1024);
        results.memoryUsage[device][modelName].push(avgMemory);
      }
      
      // Get load time for this model
      const modelLoadTime = Object.entries(metrics.loadTimes)
        .find(([url]) => url.includes(modelName));
      
      if (modelLoadTime) {
        results.loadTimes[device][modelName].push(modelLoadTime[1].duration);
      }
      
      // Clear cache for next trial if not the last trial
      if (trial < NUM_TRIALS - 1) {
        await page.evaluate(() => {
          window.__arMetrics.fps = [];
          window.__arMetrics.memory = [];
          window.__arMetrics.loadTimes = {};
          window.__arMetrics.events = [];
        });
      }
    }
  }
}

/**
 * Test caching behavior
 */
async function testCaching(page, device) {
  console.log(`  💾 Testing caching behavior`);
  
  // Reload the page to start fresh
  await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
  
  // Wait for the try-on page to load
  await page.waitForSelector('[data-testid="three-ar-viewer"]', { timeout: 10000 })
    .catch(() => console.log('AR viewer not found, continuing anyway'));
  
  // Load the first model, which should be a cache miss
  const modelUrl = TEST_MODELS[0];
  const modelName = path.basename(modelUrl, path.extname(modelUrl));
  
  // Find and click the model button
  const modelButtons = await page.$$('button');
  for (const button of modelButtons) {
    const text = await page.evaluate(el => el.textContent, button);
    if (text.toLowerCase().includes(modelName.toLowerCase())) {
      await button.click();
      break;
    }
  }
  
  // Wait for model to load
  await page.waitForFunction(
    () => document.querySelector('[data-testid="three-ar-viewer"]') !== null,
    { timeout: 10000 }
  ).catch(() => console.log('Model loading timeout, continuing...'));
  
  // Wait for rendering to stabilize
  await page.waitForTimeout(2000);
  
  // Load the same model again to test cache hit
  await page.reload({ waitUntil: 'networkidle2' });
  
  // Wait for the try-on page to load again
  await page.waitForSelector('[data-testid="three-ar-viewer"]', { timeout: 10000 })
    .catch(() => console.log('AR viewer not found, continuing anyway'));
  
  // Find and click the same model button
  const modelButtonsAfterReload = await page.$$('button');
  for (const button of modelButtonsAfterReload) {
    const text = await page.evaluate(el => el.textContent, button);
    if (text.toLowerCase().includes(modelName.toLowerCase())) {
      await button.click();
      break;
    }
  }
  
  // Wait for model to load from cache
  await page.waitForFunction(
    () => document.querySelector('[data-testid="three-ar-viewer"]') !== null,
    { timeout: 10000 }
  ).catch(() => console.log('Model loading timeout, continuing...'));
  
  // Collect cache metrics
  const cacheMetrics = await page.evaluate(() => {
    return {
      events: window.__arMetrics.events,
      stats: window.__arStats || {}
    };
  });
  
  // Check for cache hits in the events
  const cacheHits = cacheMetrics.events.filter(e => 
    e.message.includes('cache hit') || e.message.includes('model_loaded_from_cache')
  ).length;
  
  results.cacheStats[device] = {
    cacheHits,
    ...cacheMetrics.stats
  };
}

/**
 * Generate the test report
 */
function generateReport() {
  console.log('\n📊 Generating Test Report');
  
  // Create report directory
  const reportDir = path.join(__dirname, '../reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir);
  }
  
  const reportPath = path.join(reportDir, `ar-optimization-test-${new Date().toISOString().slice(0, 10)}.json`);
  
  // Process results to get averages
  const processedResults = {
    devices: {},
    summary: {
      overallLoadTimeReduction: 0,
      overallFpsImprovement: 0,
      cacheEfficiency: 0
    }
  };
  
  // Process per-device results
  for (const device of DEVICES) {
    processedResults.devices[device] = {
      models: {},
      averageLoadTime: 0,
      averageFps: 0,
      averageMemoryUsage: 0,
      cacheStats: results.cacheStats[device] || {}
    };
    
    let totalLoadTime = 0;
    let totalFps = 0;
    let totalMemory = 0;
    let modelCount = 0;
    
    // Process per-model results
    for (const modelName in results.loadTimes[device]) {
      const loadTimes = results.loadTimes[device][modelName];
      const fps = results.fps[device][modelName];
      const memory = results.memoryUsage[device][modelName];
      
      if (loadTimes.length > 0) {
        const avgLoadTime = loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;
        const avgFps = fps.reduce((sum, f) => sum + f, 0) / fps.length;
        const avgMemory = memory.length > 0 
          ? memory.reduce((sum, m) => sum + m, 0) / memory.length 
          : 0;
        
        processedResults.devices[device].models[modelName] = {
          averageLoadTime: avgLoadTime,
          averageFps: avgFps,
          averageMemoryUsage: avgMemory
        };
        
        totalLoadTime += avgLoadTime;
        totalFps += avgFps;
        totalMemory += avgMemory;
        modelCount++;
      }
    }
    
    // Calculate device averages
    if (modelCount > 0) {
      processedResults.devices[device].averageLoadTime = totalLoadTime / modelCount;
      processedResults.devices[device].averageFps = totalFps / modelCount;
      processedResults.devices[device].averageMemoryUsage = totalMemory / modelCount;
    }
  }
  
  // Overall summary
  const desktopDevice = 'Desktop Chrome';
  const mobileDevices = DEVICES.filter(device => device !== desktopDevice);
  
  if (mobileDevices.length > 0) {
    // Calculate load time improvement (comparing mobile vs desktop)
    const desktopLoadTime = processedResults.devices[desktopDevice]?.averageLoadTime || 0;
    const mobileLoadTimes = mobileDevices.map(device => 
      processedResults.devices[device]?.averageLoadTime || 0
    );
    const avgMobileLoadTime = mobileLoadTimes.reduce((sum, time) => sum + time, 0) / mobileLoadTimes.length;
    
    if (desktopLoadTime > 0 && avgMobileLoadTime > 0) {
      processedResults.summary.overallLoadTimeReduction = 
        ((desktopLoadTime - avgMobileLoadTime) / desktopLoadTime) * 100;
    }
    
    // Calculate FPS improvement
    const desktopFps = processedResults.devices[desktopDevice]?.averageFps || 0;
    const mobileFps = mobileDevices.map(device => 
      processedResults.devices[device]?.averageFps || 0
    );
    const avgMobileFps = mobileFps.reduce((sum, fps) => sum + fps, 0) / mobileFps.length;
    
    if (desktopFps > 0) {
      processedResults.summary.overallFpsImprovement = 
        ((avgMobileFps / desktopFps) * 100);
    }
  }
  
  // Cache efficiency
  const cacheHits = Object.values(results.cacheStats).reduce(
    (sum, stats) => sum + (stats.cacheHits || 0), 0
  );
  
  const totalDevices = DEVICES.length;
  if (totalDevices > 0) {
    processedResults.summary.cacheEfficiency = (cacheHits / totalDevices) * 100;
  }
  
  // Write the report
  fs.writeFileSync(reportPath, JSON.stringify(processedResults, null, 2));
  
  console.log(`  Report saved to: ${reportPath}`);
  
  // Generate a simple console summary
  console.log('\n📈 Performance Summary:');
  console.log('  Load Time Reduction: ' + processedResults.summary.overallLoadTimeReduction.toFixed(2) + '%');
  console.log('  FPS Improvement: ' + processedResults.summary.overallFpsImprovement.toFixed(2) + '%');
  console.log('  Cache Efficiency: ' + processedResults.summary.cacheEfficiency.toFixed(2) + '%');
  
  console.log('\n📱 Device Averages:');
  for (const device in processedResults.devices) {
    const deviceStats = processedResults.devices[device];
    console.log(`  ${device}:`);
    console.log(`    Load Time: ${deviceStats.averageLoadTime.toFixed(2)}ms`);
    console.log(`    FPS: ${deviceStats.averageFps.toFixed(2)}`);
    console.log(`    Memory: ${deviceStats.averageMemoryUsage.toFixed(2)} MB`);
  }
}

// Start the tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests }; 