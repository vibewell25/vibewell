# Performance Monitoring Hooks

This document describes the React hooks available for performance monitoring in the Vibewell platform.

## usePerformanceMonitoring

The `usePerformanceMonitoring` hook provides a simple way to measure and track the performance of React components and specific operations within them.

### Import

```tsx
import usePerformanceMonitoring from '../../hooks/usePerformanceMonitoring';
```

### API

```tsx
function usePerformanceMonitoring(options?: UsePerformanceMonitoringOptions): {
  startMeasure: () => string | null;
  endMeasure: () => void;
  isActive: boolean;
}
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | `string` | `'component'` | A unique identifier for this performance measurement |
| `autoStart` | `boolean` | `true` | Whether to automatically start monitoring on mount |
| `autoEnd` | `boolean` | `true` | Whether to automatically end monitoring on unmount |
| `metadata` | `Record<string, any>` | `{}` | Custom metadata to associate with this performance measurement |

### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `startMeasure` | `() => string \| null` | Function to manually start a performance measurement |
| `endMeasure` | `() => void` | Function to manually end a performance measurement |
| `isActive` | `boolean` | Whether a measurement is currently active |

### Usage Examples

#### Basic Usage (Automatic Component Lifecycle Monitoring)

In this example, the hook automatically measures the performance of the component from mount to unmount.

```tsx
import React from 'react';
import usePerformanceMonitoring from '../../hooks/usePerformanceMonitoring';

function MyComponent() {
  // Automatically monitor component render performance
  usePerformanceMonitoring({ id: 'MyComponent' });
  
  return (
    <div>Component Content</div>
  );
}
```

#### Manual Control for Specific Operations

In this example, we manually control when to start and end the performance measurement.

```tsx
import React from 'react';
import usePerformanceMonitoring from '../../hooks/usePerformanceMonitoring';

function DataProcessingComponent({ data }) {
  const { startMeasure, endMeasure } = usePerformanceMonitoring({
    id: 'DataProcessing',
    autoStart: false, // Don't start automatically
    autoEnd: true     // But do clean up on unmount if needed
  });
  
  const processData = () => {
    // Start measuring
    startMeasure();
    
    // Perform expensive operation
    const result = data.map(item => /* complex transformation */);
    
    // End measuring
    endMeasure();
    
    return result;
  };
  
  return (
    <button onClick={processData}>Process Data</button>
  );
}
```

#### Monitoring Async Operations

The hook can also be used to monitor asynchronous operations:

```tsx
import React, { useState, useEffect } from 'react';
import usePerformanceMonitoring from '../../hooks/usePerformanceMonitoring';

function DataFetchingComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { startMeasure, endMeasure } = usePerformanceMonitoring({
    id: 'DataFetching',
    autoStart: false
  });
  
  const fetchData = async () => {
    setLoading(true);
    startMeasure();
    
    try {
      const response = await fetch('/api/data');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      endMeasure();
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  return (
    <div>
      {loading ? <p>Loading...</p> : null}
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : null}
    </div>
  );
}
```

### Integration with Performance Budgets

The `usePerformanceMonitoring` hook integrates with the Vibewell performance budget system. If a component or operation exceeds its performance budget, a warning will be logged to the console, and in production, the violation will be reported to analytics.

Performance budgets are defined in `/src/utils/performanceMonitor.ts` as `PERFORMANCE_BUDGETS`.

### Best Practices

1. **Choose meaningful IDs**: Use descriptive IDs that make it easy to identify the component or operation in performance reports.

2. **Monitor critical interactions**: Focus on monitoring operations that are performance-sensitive or critical to the user experience.

3. **Don't over-measure**: Excessive performance monitoring can itself impact performance. Focus on what matters.

4. **Use automatic monitoring** for component-level performance and **manual monitoring** for specific operations within components.

5. **Include useful metadata**: When measuring performance, include metadata that will help with debugging and analysis.

### Implementation Details

The `usePerformanceMonitoring` hook is built on top of the Vibewell performance monitoring system. It leverages the browser's Performance API and integrates with our analytics system to track and report on performance metrics.

Under the hood, it uses:

- `performance.mark()` to create markers
- `performance.measure()` to measure between markers
- `sessionStorage` to store measurements for analysis
- Custom logging and analytics for reporting violations

For more details on the implementation, see the source code in `/src/hooks/usePerformanceMonitoring.ts`.

## Related Documentation

- [Performance Monitoring Guide](../performance-monitoring-guide.md)
- [Performance Budgets](./performance-budgets.md)
- [Analytics Integration](../guides/integrating-analytics.md) 