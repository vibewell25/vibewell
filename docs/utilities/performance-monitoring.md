# Performance Monitoring System

The Vibewell Performance Monitoring System provides comprehensive tools for tracking, measuring, and reporting performance metrics across both client and server-side components of the application.

## Overview

This utility helps identify performance bottlenecks, set performance budgets, and implement optimizations to enhance user experience. It covers:

- Component render times
- API call durations
- Core web vitals (LCP, FCP, CLS)
- JavaScript execution times
- Resource loading
- Network requests

## Getting Started

### Installation

The performance monitoring system is built into the Vibewell platform. No additional installation is required.

### Basic Usage

#### Monitoring Component Performance

```tsx
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';

function MyComponent() {
  // The hook automatically tracks render performance
  usePerformanceMonitoring('MyComponent');
  
  return (
    <div>
      {/* Component content */}
    </div>
  );
}
```

#### Monitoring API Calls

```tsx
import { startApiCall, endApiCall } from '@/utils/performance-monitoring';

async function fetchData() {
  const markId = startApiCall('/api/data');
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } finally {
    endApiCall('/api/data', markId);
  }
}
```

#### Higher-Order Component for Performance Monitoring

```tsx
import { withPerformanceMonitoring } from '@/utils/performance-monitoring';

// Your component
function DataTable({ data }) {
  return (
    <table>
      {/* Table content */}
    </table>
  );
}

// Export with performance monitoring
export default withPerformanceMonitoring(DataTable, 'DataTable');
```

## API Reference

### Hooks

#### `usePerformanceMonitoring(componentId: string): void`

A React hook that automatically measures component render time.

- **Parameters**:
  - `componentId`: A unique identifier for the component

- **Example**:
  ```tsx
  function ExpensiveComponent() {
    usePerformanceMonitoring('ExpensiveComponent');
    // Component implementation
  }
  ```

### Higher-Order Components

#### `withPerformanceMonitoring<P>(Component: React.ComponentType<P>, componentId?: string): React.ComponentType<P>`

Wraps a component with performance monitoring.

- **Parameters**:
  - `Component`: The React component to wrap
  - `componentId`: Optional identifier (defaults to Component.displayName)

- **Returns**: A wrapped component with performance monitoring

### Functions

#### `startComponentRender(componentId: string): string`

Manually start measuring a component render.

- **Parameters**:
  - `componentId`: A unique identifier for the component
- **Returns**: A mark ID to be used with `endComponentRender`

#### `endComponentRender(componentId: string, markId: string): void`

End a component render measurement.

- **Parameters**:
  - `componentId`: The component identifier
  - `markId`: The mark ID returned from `startComponentRender`

#### `startApiCall(endpoint: string): string`

Start measuring an API call.

- **Parameters**:
  - `endpoint`: The API endpoint being called
- **Returns**: A mark ID to be used with `endApiCall`

#### `endApiCall(endpoint: string, markId: string): void`

End an API call measurement.

- **Parameters**:
  - `endpoint`: The API endpoint
  - `markId`: The mark ID returned from `startApiCall`

#### `reportPerformanceViolation(target: string, type: string, value: number, threshold: number): void`

Report a performance budget violation.

- **Parameters**:
  - `target`: The target (component, API, etc.) that violated the budget
  - `type`: Type of violation (render, api, etc.)
  - `value`: The measured value
  - `threshold`: The threshold that was exceeded

#### `getMetrics(): PerformanceMetrics`

Get the current performance metrics.

- **Returns**: An object containing collected metrics for components, API calls, and core web vitals

#### `checkBudgets(): void`

Check all collected metrics against defined performance budgets.

#### `initPerformanceMonitoring(options?: PerformanceMonitoringOptions): void`

Initialize the performance monitoring system.

- **Parameters**:
  - `options`: Configuration options

## Performance Budgets

The system uses performance budgets to establish acceptable thresholds:

```tsx
const DEFAULT_PERFORMANCE_BUDGETS = {
  components: {
    default: 100, // 100ms
    DataTable: 200, // 200ms for DataTable component
    UserProfile: 150, // 150ms for UserProfile component
  },
  api: {
    default: 300, // 300ms
    '/api/products': 500, // 500ms for products API
    '/api/user/profile': 200, // 200ms for user profile API
  },
  core: {
    FCP: 1800, // 1.8s First Contentful Paint
    LCP: 2500, // 2.5s Largest Contentful Paint
    CLS: 0.1, // 0.1 Cumulative Layout Shift
  },
};
```

You can customize these budgets during initialization:

```tsx
import { initPerformanceMonitoring } from '@/utils/performance-monitoring';

initPerformanceMonitoring({
  budgets: {
    components: {
      default: 80, // Lower the default component budget to 80ms
      ComplexChart: 300, // Allow more time for ComplexChart
    },
    // Other budget configurations...
  },
  enableLogging: true,
  sampleRate: 0.5, // Only measure 50% of renders
});
```

## Advanced Usage

### Custom Performance Measurements

```tsx
import { 
  startMark, 
  endMark, 
  measurePerformance 
} from '@/utils/performance-monitoring';

function complexOperation() {
  const markId = startMark('complexCalculation');
  
  // Perform complex operation
  const result = performHeavyCalculation();
  
  endMark('complexCalculation', markId);
  return result;
}

// Alternative pattern using higher-order function
const optimizedFunction = measurePerformance(
  originalFunction, 
  'optimizedFunction'
);
```

### Real User Monitoring (RUM)

The performance monitoring system can be integrated with analytics tools for Real User Monitoring:

```tsx
import { initPerformanceMonitoring } from '@/utils/performance-monitoring';
import { analyticsService } from '@/services/analytics';

initPerformanceMonitoring({
  onViolation: (target, type, value, threshold) => {
    analyticsService.trackPerformanceViolation({
      target,
      type,
      value,
      threshold,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    });
  },
  onReport: (metrics) => {
    analyticsService.trackPerformanceMetrics(metrics);
  }
});
```

## Performance Dashboard

Vibewell includes a Performance Dashboard available in development mode at `/dev/performance` that shows:

- Real-time performance metrics
- Performance history charts
- Budget violation alerts
- Component render time breakdown
- API call durations
- Core Web Vitals

To access the dashboard in production, you need appropriate permissions.

## Best Practices

1. **Focus on user-facing components first** - Prioritize optimizing components that users interact with frequently.

2. **Set realistic budgets** - Start with default budgets and adjust based on real usage data.

3. **Monitor continuously** - Performance can degrade over time with new features.

4. **Test on multiple devices** - Performance varies significantly between devices.

5. **Use with caution in production** - Performance monitoring itself has a small cost; consider sampling in production.

6. **Combine with server monitoring** - For a comprehensive view, combine with backend performance monitoring.

## Troubleshooting

### Common Issues

- **Increased memory usage**: If you notice increased memory usage, check your sampling rate and consider reducing it.

- **Missing measurements**: Ensure components are correctly wrapped with the monitoring hooks or HOCs.

- **False positives**: Occasionally, browser extensions or background tasks can cause false budget violations. Configure a tolerance factor in the initialization options.

## Integration with Other Tools

The performance monitoring system integrates with:

- Lighthouse CI
- WebPageTest
- Google Analytics
- Custom Dashboards
- Error reporting systems

## Browser Support

The performance monitoring system supports all modern browsers with the Performance API:

- Chrome 60+
- Firefox 57+
- Safari 11+
- Edge 16+

For older browsers, a lightweight polyfill is automatically included.

## License

This performance monitoring utility is part of the Vibewell platform and is covered by the same license. 