import { useRef, useEffect } from 'react';


import { startComponentRender, endComponentRender } from '@/utils/PerformanceMonitoringLegacy';

import { exists } from '@/utils/TypeGuards';

interface UsePerformanceMonitoringOptions {
  /**
   * A unique identifier for this performance measurement
   */
  id?: string;

  /**
   * Whether to automatically start monitoring on mount
   * @default true
   */
  autoStart?: boolean;

  /**
   * Whether to automatically end monitoring on unmount
   * @default true
   */
  autoEnd?: boolean;

  /**
   * Custom metadata to associate with this performance measurement
   */
  metadata?: Record<string, any>;
/**
 * Hook for monitoring performance of React components
 *

 * This hook provides more granular control than the withPerformanceMonitoring HOC
 * and allows for manual control of when to start and end performance measurements.
 *
 * @example


 * // Basic usage (automatic start/end on mount/unmount)
 * function MyComponent() {
 *   usePerformanceMonitoring({ id: 'MyComponent' });
 *   return <div>My Component</div>;
 * }
 *
 * @example

 * // Manual control
 * function MyComponent() {
 *   const { startMeasure, endMeasure } = usePerformanceMonitoring({
 *     id: 'MyComponent',
 *     autoStart: false,
 *     autoEnd: false
 *   });
 *
 *   const handleExpensiveOperation = () => {
 *     startMeasure();

 *     // Do expensive operation
 *     endMeasure();
 *   };
 *
 *   return <button onClick={handleExpensiveOperation}>Perform Operation</button>;
 * }
 */
export function usePerformanceMonitoring(options: UsePerformanceMonitoringOptions = {}) {
  const { id = 'component', autoStart = true, autoEnd = true, metadata = {} } = options;

  // Store the mark reference for cleanup
  const markRef = useRef<string | null>(null);

  // Start measure function
  const startMeasure = (): string | null => {
    if (exists(markRef.current)) {
      // If we already have a mark, end it first to avoid leaks
      endMeasure();
const mark = startComponentRender(id);
    markRef.current = mark;
    return mark;
// End measure function
  const endMeasure = (): void => {
    if (exists(markRef.current)) {
      endComponentRender(id, markRef.current);
      markRef.current = null;
// Automatically start measuring on mount if autoStart is true
  useEffect(() => {
    if (autoStart) {
      startMeasure();
// Automatically end measuring on unmount if autoEnd is true
    return () => {
      if (autoEnd && exists(markRef.current)) {
        endMeasure();
[autoStart, autoEnd, id]);

  return {
    startMeasure,
    endMeasure,
    isActive: markRef.current !== null,
export default usePerformanceMonitoring;
