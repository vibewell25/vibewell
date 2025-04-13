import * as React from 'react';
import { startComponentRender, endComponentRender } from './performance-monitoring';

/**
 * Higher-Order Component for monitoring component performance
 * @param Component The component to wrap with performance monitoring
 * @param componentName Name to identify this component in performance metrics
 */
export function withPerformanceMonitoring<P extends object>(Component: React.ComponentType<P>, componentName: string) {
  return function PerformanceMonitoredComponent(props: P) {
    const startMark = React.useRef<string | null>(null);
    
    React.useEffect(() => {
      startMark.current = startComponentRender(componentName);
      
      return () => {
        if (startMark.current) {
          endComponentRender(componentName, startMark.current);
        }
      };
    }, []);
    
    return React.createElement(Component, props);
  };
} 