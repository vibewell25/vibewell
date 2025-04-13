# Vibewell Performance Testing Guide

## Table of Contents
1. [Overview](#overview)
2. [Performance Metrics](#performance-metrics)
3. [AR Performance](#ar-performance)
4. [Load Testing](#load-testing)
5. [Frontend Performance](#frontend-performance)
6. [API Performance](#api-performance)
7. [Monitoring](#monitoring)
8. [Optimization](#optimization)

## Overview

### Performance Goals
- First Contentful Paint (FCP): < 1.5s
- Time to Interactive (TTI): < 3.0s
- AR Model Load Time: < 2.0s
- API Response Time: < 100ms (p95)
- Bundle Size: < 200KB (initial)

### Setup Performance Testing Environment
```bash
# Install performance testing tools
npm install -D autocannon lighthouse puppeteer @playwright/test

# Setup monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Install AR performance utilities
npm install -D @react-three/test-renderer three-stats
```

## Performance Metrics

### Core Web Vitals
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

### AR-Specific Metrics
- Model Load Time
- Frame Rate (FPS)
- Memory Usage
- Texture Load Time
- Animation Performance

### API Metrics
- Response Time
- Throughput
- Error Rate
- Time to First Byte (TTFB)

## AR Performance

### Testing AR Model Performance
```typescript
import { ARPerformanceTest } from '@/test-utils/ar-test-utils';

describe('AR Model Performance', () => {
  const perfTest = new ARPerformanceTest();

  beforeEach(() => {
    perfTest.resetMetrics();
  });

  it('loads model within time budget', async () => {
    const startTime = performance.now();
    await perfTest.loadModel('/models/hairstyle.glb');
    const loadTime = performance.now() - startTime;
    
    expect(loadTime).toBeLessThan(2000); // 2 seconds max
  });

  it('maintains target frame rate during animation', () => {
    perfTest.startMeasurement();
    // Run animation cycle
    perfTest.endMeasurement('animation');
    
    const stats = perfTest.getStats();
    expect(stats.averageFPS).toBeGreaterThan(55); // Target 60fps
  });
});
```

### Memory Monitoring
```typescript
describe('AR Memory Usage', () => {
  it('stays within memory budget', () => {
    const memoryStart = performance.memory.usedJSHeapSize;
    // Perform AR operations
    const memoryEnd = performance.memory.usedJSHeapSize;
    
    const memoryIncrease = memoryEnd - memoryStart;
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB limit
  });
});
```

## Load Testing

### API Endpoint Testing
```javascript
const autocannon = require('autocannon');

const loadTest = async () => {
  const result = await autocannon({
    url: 'http://localhost:3000/api',
    connections: 100,
    duration: 30,
    requests: [
      {
        method: 'GET',
        path: '/services'
      },
      {
        method: 'POST',
        path: '/bookings',
        body: JSON.stringify({
          serviceId: '123',
          date: '2024-03-20'
        }),
        headers: {
          'content-type': 'application/json'
        }
      }
    ]
  });
  
  console.log(result);
};

loadTest();
```

### Running Load Tests
```bash
# Test specific endpoint
npm run test:load -- --endpoint=/api/services

# Test with different concurrency
npm run test:load -- --connections=200

# Generate load test report
npm run test:load -- --report
```

## Frontend Performance

### Bundle Analysis
```bash
# Analyze bundle size
npm run analyze:bundle

# Generate bundle report
npm run analyze:bundle -- --report

# Check specific chunks
npm run analyze:bundle -- --chunk=ar
```

### Lighthouse Testing
```javascript
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch();
  const options = {
    logLevel: 'info',
    output: 'html',
    port: chrome.port,
    onlyCategories: ['performance']
  };
  
  const results = await lighthouse(url, options);
  await chrome.kill();
  
  return results;
}

// Run test
runLighthouse('http://localhost:3000')
  .then(results => console.log(results.lhr.categories.performance.score));
```

## API Performance

### Response Time Monitoring
```typescript
import { performance } from 'perf_hooks';

export const measureApiResponse = async (endpoint: string) => {
  const start = performance.now();
  const response = await fetch(endpoint);
  const end = performance.now();
  
  return {
    responseTime: end - start,
    status: response.status,
    ok: response.ok
  };
};
```

### Throughput Testing
```bash
# Test API throughput
autocannon -c 100 -d 30 http://localhost:3000/api/services

# Test with pipelining
autocannon -c 100 -p 10 -d 30 http://localhost:3000/api/services
```

## Monitoring

### Prometheus & Grafana Setup
```yaml
# docker-compose.monitoring.yml
version: '3'
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
      
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    depends_on:
      - prometheus
```

### Custom Metrics
```typescript
import { Registry, Counter, Histogram } from 'prom-client';

const register = new Registry();

export const arLoadTime = new Histogram({
  name: 'ar_model_load_time',
  help: 'AR model loading time in seconds',
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register]
});

export const apiResponseTime = new Histogram({
  name: 'api_response_time',
  help: 'API response time in milliseconds',
  buckets: [10, 50, 100, 200, 500],
  registers: [register]
});
```

## Optimization

### AR Asset Optimization
```typescript
import { ARAssetOptimizer } from '@/lib/ar/asset-optimizer';

const optimizer = new ARAssetOptimizer();

// Optimize 3D model
await optimizer.optimizeModel('/models/hairstyle.glb', {
  textureCompression: true,
  geometryCompression: true,
  levelOfDetail: true
});

// Get optimization stats
const stats = optimizer.getOptimizationStats();
console.log(`Size reduction: ${stats.sizeReduction}%`);
```

### Bundle Optimization
```javascript
// next.config.js
module.exports = {
  webpack: (config, { dev, isServer }) => {
    // Enable aggressive code splitting
    config.optimization.splitChunks = {
      chunks: 'all',
      minSize: 20000,
      maxSize: 100000,
      cacheGroups: {
        ar: {
          test: /[\\/]ar[\\/]/,
          name: 'ar',
          chunks: 'all',
          priority: 10
        }
      }
    };
    
    return config;
  }
};
```

### Performance Budgets
```json
{
  "budget": {
    "resourceSizes": [
      {
        "resourceType": "script",
        "budget": 200000
      },
      {
        "resourceType": "total",
        "budget": 500000
      }
    ],
    "resourceCounts": [
      {
        "resourceType": "third-party",
        "budget": 10
      }
    ]
  }
}
```

## Additional Resources
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Three.js Performance](https://threejs.org/docs/#manual/en/introduction/How-to-improve-performance)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [WebGL Performance Guide](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices) 