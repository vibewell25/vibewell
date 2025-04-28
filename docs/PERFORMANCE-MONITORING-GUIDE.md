# Performance Monitoring and Optimization Guide

This guide outlines the performance monitoring strategy for the Vibewell platform, including tools, metrics, and optimization techniques. Implementing these recommendations will help ensure a responsive, efficient application for all users.

## Performance Monitoring Strategy

### Key Performance Metrics

1. **Frontend Metrics**
   - **Core Web Vitals**
     - Largest Contentful Paint (LCP): < 2.5s
     - First Input Delay (FID): < 100ms
     - Cumulative Layout Shift (CLS): < 0.1
   - **Additional Metrics**
     - Time to Interactive (TTI): < 3.5s
     - First Contentful Paint (FCP): < 1.8s
     - Total Blocking Time (TBT): < 300ms
     - Speed Index: < 3.4s

2. **API Performance Metrics**
   - Response time: < 200ms (p95)
   - Error rate: < 0.1%
   - Throughput: Monitor requests per second
   - Time to First Byte (TTFB): < 100ms

3. **AR Component Metrics**
   - Initialization time: < 2s
   - Frame rate: > 30 FPS (ideally 60 FPS)
   - Model loading time: < 3s
   - Memory usage: < 200MB

4. **Mobile-Specific Metrics**
   - Battery usage
   - Network payload size
   - JavaScript execution time

## Implementing Performance Monitoring

### 1. Real User Monitoring (RUM)

Implement RUM to collect performance data from actual users:

```javascript
// src/utils/performance-monitoring.js
export function initPerformanceMonitoring() {
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    // Core Web Vitals
    const vitalsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        // Report to analytics
        reportPerformanceMetric(entry.name, entry.value, entry.id);
      }
    });
    
    vitalsObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    vitalsObserver.observe({ type: 'first-input', buffered: true });
    vitalsObserver.observe({ type: 'layout-shift', buffered: true });
    
    // Navigation timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paintEntries = performance.getEntriesByType('paint');
        
        const metrics = {
          DNS: navigation.domainLookupEnd - navigation.domainLookupStart,
          TLS: navigation.connectEnd - navigation.secureConnectionStart,
          TTFB: navigation.responseStart - navigation.requestStart,
          FCP: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
          DOMLoad: navigation.domContentLoadedEventEnd - navigation.navigationStart,
          WindowLoad: navigation.loadEventEnd - navigation.navigationStart
        };
        
        // Report metrics
        Object.entries(metrics).forEach(([name, value]) => {
          reportPerformanceMetric(name, value);
        });
      }, 0);
    });
  }
}

function reportPerformanceMetric(name, value, id = null) {
  // Send to analytics service
  console.log(`[Performance] ${name}: ${value}${id ? ` (${id})` : ''}`);
  
  // Example with Google Analytics
  if (window.gtag) {
    window.gtag('event', 'performance_metric', {
      metric_name: name,
      metric_value: value,
      metric_id: id
    });
  }
}
```

### 2. Synthetic Monitoring

Set up synthetic monitoring to regularly test performance from different locations:

```javascript
// scripts/synthetic-monitoring.js
const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');

async function runSyntheticTest(url, deviceType = 'desktop') {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  
  if (deviceType === 'mobile') {
    await page.emulate(puppeteer.devices['Pixel 2']);
  }
  
  const { lhr } = await lighthouse(url, {
    port: (new URL(browser.wsEndpoint())).port,
    output: 'json',
    logLevel: 'info',
    onlyCategories: ['performance'],
    emulatedFormFactor: deviceType
  });
  
  await browser.close();
  
  return {
    url,
    deviceType,
    timestamp: new Date().toISOString(),
    scores: {
      performance: lhr.categories.performance.score * 100
    },
    metrics: {
      FCP: lhr.audits['first-contentful-paint'].numericValue,
      LCP: lhr.audits['largest-contentful-paint'].numericValue,
      CLS: lhr.audits['cumulative-layout-shift'].numericValue,
      TBT: lhr.audits['total-blocking-time'].numericValue,
      TTI: lhr.audits['interactive'].numericValue,
      SpeedIndex: lhr.audits['speed-index'].numericValue
    }
  };
}

// Run tests for key pages
async function runAllTests() {
  const pages = [
    'https://vibewell.com',
    'https://vibewell.com/booking',
    'https://vibewell.com/profile',
    'https://vibewell.com/ar-experience'
  ];
  
  const results = {
    desktop: [],
    mobile: []
  };
  
  for (const page of pages) {
    results.desktop.push(await runSyntheticTest(page, 'desktop'));
    results.mobile.push(await runSyntheticTest(page, 'mobile'));
  }
  
  // Save results to file
  const fs = require('fs');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.writeFileSync(
    `reports/synthetic-${timestamp}.json`,
    JSON.stringify(results, null, 2)
  );
  
  // Output summary
  console.log('Synthetic Testing Results:');
  for (const device of ['desktop', 'mobile']) {
    console.log(`\n${device.toUpperCase()} Results:`);
    results[device].forEach(result => {
      console.log(`${result.url}: ${result.scores.performance}/100`);
    });
  }
}

runAllTests().catch(console.error);
```

### 3. API Performance Monitoring

Implement middleware to track API performance:

```typescript
// src/middleware/api-performance.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { performance } from 'perf_hooks';

export default function apiPerformanceMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  // Start timer
  const start = performance.now();
  
  // Track response size
  let originalEnd = res.end;
  let responseSize = 0;
  
  // Override res.write to track response size
  const originalWrite = res.write;
  res.write = function(chunk) {
    responseSize += chunk.length;
    return originalWrite.apply(res, arguments);
  };
  
  // Override res.end to track timing
  res.end = function(...args) {
    // Calculate duration
    const duration = performance.now() - start;
    
    // Log performance data
    console.log(`[API] ${req.method} ${req.url} - ${duration.toFixed(2)}ms - ${responseSize} bytes`);
    
    // Send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      reportApiMetrics({
        method: req.method,
        path: req.url,
        statusCode: res.statusCode,
        duration,
        responseSize,
        timestamp: new Date().toISOString()
      });
    }
    
    return originalEnd.apply(res, args);
  };
  
  next();
}

function reportApiMetrics(metrics) {
  // Send metrics to monitoring system
  // Example implementation
}
```

### 4. Performance Budget Monitoring

Create and enforce performance budgets:

```javascript
// performance-budget.config.js
module.exports = {
  resourceSizes: {
    total: 1000, // KB
    javascript: 300,
    css: 50,
    image: 500,
    font: 100,
    thirdParty: 200
  },
  timing: {
    fcp: 1800, // ms
    lcp: 2500,
    tti: 3500,
    tbt: 300
  },
  // Rule to fail build if thresholds are exceeded
  failBuild: process.env.NODE_ENV === 'production'
};
```

## Performance Optimization Techniques

### 1. Bundle Size Optimization

#### Implement Code Splitting

```javascript
// Next.js already supports code splitting for pages
// For component-level code splitting:
import dynamic from 'next/dynamic';

// Use dynamic imports for large components
const ARExperience = dynamic(() => import('../components/ARExperience'), {
  loading: () => <ARLoading />,
  ssr: false // Disable SSR for AR components
});
```

#### Analyze Bundle Size

```bash
# Add to package.json scripts
"analyze:bundle": "ANALYZE=true next build"
```

Use tools like `webpack-bundle-analyzer` to identify large dependencies and unused code.

#### Implement Import Optimization

```javascript
// Instead of importing entire libraries
import _ from 'lodash';

// Import only what you need
import throttle from 'lodash/throttle';
```

### 2. Image Optimization

#### Implement Responsive Images

```jsx
// Use Next.js Image component
import Image from 'next/image';

function ProductImage({ product }) {
  return (
    <Image
      src={product.image}
      alt={product.name}
      width={600}
      height={400}
      placeholder="blur"
      blurDataURL={product.thumbnailDataUrl}
      priority={product.featured}
    />
  );
}
```

#### Create Image Optimization Service

```javascript
// src/utils/image-optimization.js
export function getOptimizedImageUrl(url, { width, height, quality = 80 }) {
  // If using a cloud provider like Cloudinary
  return `https://res.cloudinary.com/vibewell/image/fetch/f_auto,q_${quality},w_${width},h_${height}/${encodeURIComponent(url)}`;
}
```

### 3. React Performance Optimization

#### Implement Memoization

```jsx
// Use React.memo for component memoization
const ProductCard = React.memo(function ProductCard({ product }) {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>{product.description}</p>
    </div>
  );
});

// Use useMemo for expensive calculations
function ProductList({ products, category }) {
  const filteredProducts = useMemo(() => {
    return products.filter(product => product.category === category);
  }, [products, category]);
  
  return (
    <div>
      {filteredProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

#### Implement Virtualization for Long Lists

```jsx
// Use react-window for long lists
import { FixedSizeList } from 'react-window';

function ProductList({ products }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <ProductCard product={products[index]} />
    </div>
  );
  
  return (
    <FixedSizeList
      height={600}
      width="100%"
      itemCount={products.length}
      itemSize={150}
    >
      {Row}
    </FixedSizeList>
  );
}
```

### 4. Mobile Experience Optimization

#### Implement Mobile-First CSS

```css
/* Base styles for mobile */
.container {
  padding: 1rem;
}

/* Tablet styles */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}

/* Desktop styles */
@media (min-width: 1024px) {
  .container {
    padding: 3rem;
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

#### Optimize Touch Interactions

```jsx
// src/components/ui/touch-handler/index.tsx
import React, { useEffect, useRef, useState } from 'react';

export interface TouchHandlerProps {
  onTap?: (event: React.TouchEvent) => void;
  onDoubleTap?: (event: React.TouchEvent) => void;
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down', distance: number) => void;
  onPinch?: (scale: number) => void;
  onRotate?: (angle: number) => void;
  onLongPress?: (event: React.TouchEvent) => void;
  longPressThreshold?: number; // ms
  enabled?: boolean;
  children: React.ReactNode;
}

export const TouchHandler: React.FC<TouchHandlerProps> = ({
  onTap,
  onDoubleTap,
  onSwipe,
  onPinch,
  onRotate,
  onLongPress,
  longPressThreshold = 500,
  enabled = true,
  children
}) => {
  // Implementation for efficient touch handling
  // ...
  
  return (
    <div 
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
};
```

#### Implement Mobile-Specific Performance Optimizations

```javascript
// src/utils/mobile-optimizations.js
export function applyMobileOptimizations() {
  if (typeof window === 'undefined') return;
  
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  if (isMobile) {
    // Reduce animation complexity
    document.body.classList.add('reduced-motion');
    
    // Defer non-critical resources
    document.querySelectorAll('img:not([loading="eager"])')
      .forEach(img => {
        img.loading = 'lazy';
      });
    
    // Reduce background processes
    window.addEventListener('pageshow', () => {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => {
          // Run low-priority tasks when idle
        });
      }
    });
  }
}
```

### 5. AR Component Optimization

#### Implement Progressive Loading for 3D Models

```javascript
// src/hooks/use-progressive-model.js
import { useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';

export function useProgressiveModel(url, options = {}) {
  const [quality, setQuality] = useState('low');
  const lowQualityUrl = url.replace('.glb', '-low.glb');
  const mediumQualityUrl = url.replace('.glb', '-medium.glb');
  
  // Use the appropriate model based on quality
  const modelUrl = quality === 'low' 
    ? lowQualityUrl 
    : quality === 'medium'
      ? mediumQualityUrl
      : url;
  
  const model = useGLTF(modelUrl, options);
  
  useEffect(() => {
    // Start with low quality
    setQuality('low');
    
    // Load medium quality after initial render
    const mediumTimer = setTimeout(() => {
      setQuality('medium');
    }, 1000);
    
    // Load high quality when user is interacting
    const highTimer = setTimeout(() => {
      setQuality('high');
    }, 3000);
    
    return () => {
      clearTimeout(mediumTimer);
      clearTimeout(highTimer);
    };
  }, [url]);
  
  return { model, quality };
}
```

#### Implement Texture Compression and Caching

```javascript
// src/utils/texture-optimization.js
import * as THREE from 'three';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';

// Texture cache
const textureCache = new Map();

export function getOptimizedTexture(url, renderer) {
  // Check cache first
  if (textureCache.has(url)) {
    return textureCache.get(url);
  }
  
  // Use compressed textures where supported
  const ktx2Loader = new KTX2Loader()
    .setTranscoderPath('/basis/')
    .detectSupport(renderer);
  
  const texturePromise = new Promise((resolve, reject) => {
    const ktxUrl = url.replace(/\.(jpe?g|png)$/, '.ktx2');
    
    ktx2Loader.load(ktxUrl, 
      (texture) => {
        textureCache.set(url, texture);
        resolve(texture);
      },
      undefined,
      (error) => {
        // Fallback to standard texture loading
        const loader = new THREE.TextureLoader();
        loader.load(url, 
          (texture) => {
            textureCache.set(url, texture);
            resolve(texture);
          },
          undefined,
          reject
        );
      }
    );
  });
  
  return texturePromise;
}
```

## Performance Monitoring Dashboard

Create a performance dashboard to track metrics over time. Use Grafana or similar tools:

```javascript
// Example dashboard configuration for Grafana
const dashboardConfig = {
  title: 'Vibewell Performance Dashboard',
  panels: [
    {
      title: 'Core Web Vitals',
      type: 'graph',
      metrics: ['LCP', 'FID', 'CLS'],
      thresholds: {
        LCP: 2500,
        FID: 100,
        CLS: 0.1
      }
    },
    {
      title: 'API Response Times',
      type: 'heatmap',
      metrics: ['api_response_time'],
      dimensions: ['endpoint', 'method']
    },
    {
      title: 'Bundle Sizes',
      type: 'gauge',
      metrics: ['js_size', 'css_size', 'image_size', 'total_size'],
      thresholds: {
        js_size: 300000,
        css_size: 50000
      }
    },
    {
      title: 'Mobile Performance',
      type: 'graph',
      metrics: ['mobile_lcp', 'mobile_fid', 'mobile_cls'],
      compare: ['desktop_lcp', 'desktop_fid', 'desktop_cls']
    }
  ]
};
```

## CI/CD Integration

### GitHub Actions Workflow for Performance Testing

```yaml
# .github/workflows/performance.yml
name: Performance Testing

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build project
        run: npm run build
        
      - name: Analyze bundle size
        run: npm run analyze:bundle
        
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v8
        with:
          urls: |
            https://staging.vibewell.com/
            https://staging.vibewell.com/booking
          budgetPath: ./performance-budget.config.js
          uploadArtifacts: true
          
      - name: Check performance regression
        if: github.event_name == 'pull_request'
        run: node scripts/compare-performance.js
```

## Conclusion

This performance monitoring and optimization guide provides a comprehensive approach to ensuring the Vibewell platform delivers a fast, responsive experience for all users. By implementing the tools, metrics, and optimization techniques outlined here, we can continuously monitor and improve performance as the application evolves.

Key takeaways:

1. **Monitor Real User Experience**: Implement RUM to understand how actual users experience the application.
2. **Set Performance Budgets**: Establish clear thresholds and monitor them over time.
3. **Optimize Critical Rendering Path**: Focus on improving Core Web Vitals.
4. **Mobile Optimization**: Ensure the application performs well on mobile devices.
5. **Progressive Enhancement**: Implement progressive loading for heavy components, especially AR.
6. **Continuous Monitoring**: Integrate performance testing into the CI/CD pipeline.

Regular performance reviews should be conducted to ensure the application meets or exceeds the established performance targets. 