import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Type definitions for performance metrics
 */
export interface ComponentRenderMetrics {
  componentName: string;
  renderTime: number;
  renderCount: number;
  firstRender: number;
  slowestRender: number;
  lastRenderTimestamp: number;
}

/**
 * Global registry to store performance metrics for each component
 */
class PerformanceRegistry {
  private metrics: Map<string, ComponentRenderMetrics> = new Map();
  private subscribers: Array<(metrics: Map<string, ComponentRenderMetrics>) => void> = [];
  private isEnabled: boolean = process.env.NODE_ENV !== 'production' || !!process.env.NEXT_PUBLIC_ENABLE_PERF_MONITORING;
  private slowThreshold: number = 16; // 16ms = 60fps threshold

  /**
   * Record a component render
   */
  recordRender(componentName: string, renderTime: number): void {
    if (!this.isEnabled) return;

    const entry = this.metrics.get(componentName) || {
      componentName,
      renderTime: 0,
      renderCount: 0,
      firstRender: renderTime,
      slowestRender: 0,
      lastRenderTimestamp: Date.now()
    };

    entry.renderTime += renderTime;
    entry.renderCount += 1;
    entry.slowestRender = Math.max(entry.slowestRender, renderTime);
    entry.lastRenderTimestamp = Date.now();

    this.metrics.set(componentName, entry);

    // Notify subscribers of the update
    this.notifySubscribers();

    // Log slow renders in development
    if (renderTime > this.slowThreshold && process.env.NODE_ENV !== 'production') {
      console.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms to render`);
    }
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Map<string, ComponentRenderMetrics> {
    return new Map(this.metrics);
  }

  /**
   * Get metrics for a specific component
   */
  getComponentMetrics(componentName: string): ComponentRenderMetrics | undefined {
    return this.metrics.get(componentName);
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
    this.notifySubscribers();
  }

  /**
   * Subscribe to metrics changes
   */
  subscribe(callback: (metrics: Map<string, ComponentRenderMetrics>) => void): () => void {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all subscribers of metrics changes
   */
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      callback(this.getAllMetrics());
    });
  }

  /**
   * Enable or disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    
    if (!enabled) {
      this.clearMetrics();
    }
  }

  /**
   * Set the threshold for slow render warnings
   */
  setSlowThreshold(threshold: number): void {
    this.slowThreshold = threshold;
  }
}

// Create singleton instance
export const performanceRegistry = new PerformanceRegistry();

/**
 * Higher-order component to track component rendering performance
 * 
 * @example
 * ```tsx
 * const MyPerformantComponent = withPerformanceTracking(MyComponent);
 * ```
 */
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  options?: { name?: string }
): React.ComponentType<P> {
  const componentName = options?.name || Component.displayName || Component.name || 'AnonymousComponent';
  
  const WrappedComponent = (props: P) => {
    const renderStart = useRef<number>(0);
    
    useEffect(() => {
      const renderTime = performance.now() - renderStart.current;
      performanceRegistry.recordRender(componentName, renderTime);
    });
    
    renderStart.current = performance.now();
    return <Component {...props} />;
  };
  
  WrappedComponent.displayName = `PerformanceTracked(${componentName})`;
  
  return WrappedComponent;
}

/**
 * Hook for monitoring function component performance
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   usePerformanceTracking('MyComponent');
 *   // ... component logic
 * }
 * ```
 */
export function usePerformanceTracking(componentName: string): void {
  const renderStart = useRef<number>(performance.now());
  
  useEffect(() => {
    const renderTime = performance.now() - renderStart.current;
    performanceRegistry.recordRender(componentName, renderTime);
    
    return () => {
      // Record unmount time if needed
    };
  });
  
  // Update render start time for re-renders
  renderStart.current = performance.now();
}

/**
 * Component to display performance metrics for monitored components
 */
export function PerformanceMonitor({ 
  showInProduction = false
}: { showInProduction?: boolean }) {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<ComponentRenderMetrics[]>([]);
  
  // Don't show in production unless explicitly enabled
  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return null;
  }
  
  useEffect(() => {
    // Subscribe to metrics updates
    const unsubscribe = performanceRegistry.subscribe((metricsMap) => {
      setMetrics(Array.from(metricsMap.values()));
    });
    
    // Initialize metrics
    setMetrics(Array.from(performanceRegistry.getAllMetrics().values()));
    
    return unsubscribe;
  }, []);
  
  const toggleVisibility = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);
  
  const clearMetrics = useCallback(() => {
    performanceRegistry.clearMetrics();
  }, []);
  
  if (!isVisible) {
    return (
      <button 
        onClick={toggleVisibility}
        className="fixed bottom-2 right-2 z-50 bg-gray-800 text-white text-xs p-1 rounded opacity-50 hover:opacity-100"
        aria-label="Show performance metrics"
      >
        📊
      </button>
    );
  }
  
  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 bg-white shadow-lg border rounded-lg max-h-[80vh] overflow-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Component Performance</h3>
        <div>
          <button onClick={clearMetrics} className="text-xs bg-red-600 text-white px-2 py-1 rounded mr-2">
            Clear
          </button>
          <button onClick={toggleVisibility} className="text-xs bg-gray-800 text-white px-2 py-1 rounded">
            Close
          </button>
        </div>
      </div>
      
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-1 text-left">Component</th>
            <th className="border p-1 text-right">Renders</th>
            <th className="border p-1 text-right">Avg Time</th>
            <th className="border p-1 text-right">Total Time</th>
            <th className="border p-1 text-right">Slowest</th>
          </tr>
        </thead>
        <tbody>
          {metrics.length === 0 ? (
            <tr>
              <td colSpan={5} className="border p-1 text-center">No data yet</td>
            </tr>
          ) : (
            metrics
              .sort((a, b) => b.renderTime - a.renderTime)
              .map(metric => (
                <tr key={metric.componentName} className="hover:bg-gray-50">
                  <td className="border p-1 font-mono">{metric.componentName}</td>
                  <td className="border p-1 text-right">{metric.renderCount}</td>
                  <td className="border p-1 text-right">
                    {(metric.renderTime / metric.renderCount).toFixed(2)}ms
                  </td>
                  <td className="border p-1 text-right">{metric.renderTime.toFixed(2)}ms</td>
                  <td className="border p-1 text-right">{metric.slowestRender.toFixed(2)}ms</td>
                </tr>
              ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default {
  withPerformanceTracking,
  usePerformanceTracking,
  PerformanceMonitor,
  registry: performanceRegistry
}; 