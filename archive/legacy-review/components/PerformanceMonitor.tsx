import React from 'react';
import { startComponentRender, endComponentRender } from '../../utils/performance-monitoring';

/**
 * Higher-order component for monitoring performance of React components
 * @param Component The component to wrap with performance monitoring
 * @param componentName Name to identify this component in performance metrics
 */
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string,
): React.FC<P> {
  const displayName = Component.displayName || Component.name || componentName;

  // Create a monitored component
  const MonitoredComponent: React.FC<P> = (props) => {
    // Start measuring component render time
    const startMark = startComponentRender(componentName);

    // Reference for cleanup - explicitly store as string | null
    const markRef = React.useRef<string | null>(startMark);

    // Effect to end measurement after render
    React.useEffect(() => {
      // We need to check if markRef.current exists
      if (markRef.current) {
        // Pass the string, not null
        endComponentRender(componentName, markRef.current);
else {
        // If we don't have a mark, just use the name
        endComponentRender(componentName);
// Cleanup on unmount
      return () => {
        if (markRef.current) {
          // Pass the string, not null
          endComponentRender(`${componentName}-unmount`, markRef.current);
else {
          // If we don't have a mark, just use the name
          endComponentRender(`${componentName}-unmount`);
[]);

    // Render the wrapped component
    return <Component {...props} />;
// Set display name for debugging
  MonitoredComponent.displayName = `WithPerformanceMonitoring(${displayName})`;

  return MonitoredComponent;
/**
 * Component to measure performance between mount and unmount
 * Useful for measuring page or section performance
 */
export {};
