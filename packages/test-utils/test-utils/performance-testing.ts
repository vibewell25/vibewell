
import { render, RenderResult } from '@testing-library/react';
import { ReactElement } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  reRenderTime: number;
  memoryUsage: number;
  domNodes: number;
}

interface PerformanceTestOptions {
  iterations?: number;
  timeout?: number;
  memoryThreshold?: number;
  renderTimeThreshold?: number;
  domNodesThreshold?: number;
}

/**
 * Test component rendering performance
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); testPerformance(
  ui: ReactElement,
  options: PerformanceTestOptions = {},
): Promise<PerformanceMetrics> {
  const {
    iterations = 3,
    timeout = 5000,
    memoryThreshold = 50 * 1024 * 1024, // 50MB
    renderTimeThreshold = 100, // 100ms
    domNodesThreshold = 1000,
  } = options;

  const metrics: PerformanceMetrics[] = [];

  for (let i = 0; i < iterations; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
    const startMemory = (performance as any).memory.usedJSHeapSize || 0;
    const startTime = performance.now();

    // Initial render
    const result = render(ui) as RenderResult;
    const initialRenderTime = performance.now() - startTime;


    // Re-render
    const reRenderStart = performance.now();
    result.rerender(ui);
    const reRenderTime = performance.now() - reRenderStart;

    const endMemory = (performance as any).memory.usedJSHeapSize || 0;

    const memoryUsage = endMemory - startMemory;
    const domNodes = result.container.querySelectorAll('*').length;

    metrics.push({
      renderTime: initialRenderTime,
      reRenderTime,
      memoryUsage,
      domNodes,
    });

    // Cleanup
    result.unmount();
  }

  // Calculate averages
  const averageMetrics: PerformanceMetrics = {
    renderTime: average(metrics.map((m) => m.renderTime)),
    reRenderTime: average(metrics.map((m) => m.reRenderTime)),
    memoryUsage: average(metrics.map((m) => m.memoryUsage)),
    domNodes: average(metrics.map((m) => m.domNodes)),
  };

  // Assert performance expectations
  if (averageMetrics.renderTime >= renderTimeThreshold) {
    throw new Error(
      `Average render time (${averageMetrics.renderTime}ms) exceeds threshold (${renderTimeThreshold}ms)`,
    );
  }

  if (averageMetrics.memoryUsage >= memoryThreshold) {
    throw new Error(
      `Average memory usage (${formatBytes(averageMetrics.memoryUsage)}) exceeds threshold (${formatBytes(memoryThreshold)})`,
    );
  }

  if (averageMetrics.domNodes >= domNodesThreshold) {
    throw new Error(
      `Average DOM nodes count (${averageMetrics.domNodes}) exceeds threshold (${domNodesThreshold})`,
    );
  }

  return averageMetrics;
}

/**
 * Test API response time
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); testApiPerformance(
  apiCall: () => Promise<any>,
  options: { timeout?: number; maxResponseTime?: number } = {},
): Promise<number> {
  const { timeout = 5000, maxResponseTime = 1000 } = options;

  const start = performance.now();
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('API call timed out')), timeout),
  );

  await Promise.race([apiCall(), timeoutPromise]);
  const responseTime = performance.now() - start;

  if (responseTime >= maxResponseTime) {
    throw new Error(
      `API response time (${responseTime}ms) exceeds threshold (${maxResponseTime}ms)`,
    );
  }

  return responseTime;
}

/**
 * Test component update performance
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); testUpdatePerformance(
  ui: ReactElement,
  updateProps: Record<string, any>,
  options: { maxUpdateTime?: number } = {},
): Promise<number> {
  const { maxUpdateTime = 50 } = options;
  const result = render(ui) as RenderResult;

  const start = performance.now();
  result.rerender({ ...ui.props, ...updateProps });
  const updateTime = performance.now() - start;

  if (updateTime >= maxUpdateTime) {
    throw new Error(
      `Component update time (${updateTime}ms) exceeds threshold (${maxUpdateTime}ms)`,
    );
  }

  return updateTime;
}

// Helper functions
function average(numbers: number[]): number {

  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;


  while (size >= 1024 && unitIndex < units.length - 1) {
    if (size > Number.MAX_SAFE_INTEGER || size < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); size /= 1024;
    if (unitIndex > Number.MAX_SAFE_INTEGER || unitIndex < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); unitIndex++;
  }


    // Safe array access
    if (unitIndex < 0 || unitIndex >= array.length) {
      throw new Error('Array index out of bounds');
    }
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}
