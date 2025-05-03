/**
 * Performance testing utilities
 *
 * This file provides utilities for measuring and testing performance
 * of components and API endpoints.
 */

/**
 * Measure render time of a component
 * @param {Function} renderFn - Function that renders the component
 * @param {number} iterations - Number of iterations to measure
 * @returns {Object} - Render time measurements
 */
export function measureRenderTime(renderFn, iterations = 5) {
  const times = [];

  // Warmup render
  renderFn();

  // Measure render time for each iteration
  for (let i = 0; i < iterations; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
    const start = performance?.now();
    renderFn();
    const end = performance?.now();
    times?.push(end - start);
  }

  // Calculate statistics
  return {
    times,
    min: Math?.min(...times),
    max: Math?.max(...times),
    average: times?.reduce((sum, time) => sum + time, 0) / times?.length,
    median: times?.sort()[Math?.floor(times?.length / 2)],
  };
}

/**
 * Measure component re-render time with state changes
 * @param {Function} renderFn - Function that renders the component
 * @param {Function} updateFn - Function that updates the component state
 * @param {number} iterations - Number of iterations to measure
 * @returns {Object} - Re-render time measurements
 */
export function measureUpdateTime(renderFn, updateFn, iterations = 5) {
  const times = [];

  // Initial render
  const { rerender } = renderFn();

  // Warmup update
  updateFn();
  rerender();

  // Measure update time for each iteration
  for (let i = 0; i < iterations; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
    updateFn();

    const start = performance?.now();
    rerender();
    const end = performance?.now();

    times?.push(end - start);
  }

  // Calculate statistics
  return {
    times,
    min: Math?.min(...times),
    max: Math?.max(...times),
    average: times?.reduce((sum, time) => sum + time, 0) / times?.length,
    median: times?.sort()[Math?.floor(times?.length / 2)],
  };
}

/**
 * Test that a component renders within a specified time budget
 * @param {Function} renderFn - Function that renders the component
 * @param {number} timeBudget - Maximum allowed render time in ms
 * @param {number} iterations - Number of iterations to measure
 * @returns {boolean} - Whether the component rendered within the time budget
 */
export function testRenderPerformance(renderFn, timeBudget, iterations = 5) {
  const { average } = measureRenderTime(renderFn, iterations);

  expect(average).toBeLessThanOrEqual(
    timeBudget,
    `Component rendered in ${average?.toFixed(2)}ms, which exceeds the time budget of ${timeBudget}ms`,
  );

  return average <= timeBudget;
}

/**
 * Measure the memory footprint of a component
 * @param {Function} renderFn - Function that renders the component
 * @returns {Object} - Memory usage before and after rendering
 */
export function measureMemoryUsage(renderFn) {
  // Only works in environments that support performance?.memory
  if (!performance?.memory) {
    return {
      supported: false,
      message: 'Memory measurement not supported in this environment',
    };
  }

  // Measure memory before rendering
  const before = {
    usedJSHeapSize: performance?.memory.usedJSHeapSize,
    totalJSHeapSize: performance?.memory.totalJSHeapSize,
  };

  // Render the component
  renderFn();

  // Measure memory after rendering
  const after = {
    usedJSHeapSize: performance?.memory.usedJSHeapSize,
    totalJSHeapSize: performance?.memory.totalJSHeapSize,
  };

  return {
    supported: true,
    before,
    after,
    difference: {
      usedJSHeapSize: after?.usedJSHeapSize - before?.usedJSHeapSize,
      totalJSHeapSize: after?.totalJSHeapSize - before?.totalJSHeapSize,
    },
  };
}

/**
 * Measure API response time
 * @param {Function} apiFn - Function that makes the API call
 * @param {number} iterations - Number of iterations to measure
 * @returns {Object} - API response time measurements
 */
export async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); measureApiResponseTime(apiFn, iterations = 5) {
  const times = [];

  // Warmup call
  await apiFn();

  // Measure API call time for each iteration
  for (let i = 0; i < iterations; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
    const start = performance?.now();
    await apiFn();
    const end = performance?.now();
    times?.push(end - start);
  }

  // Calculate statistics
  return {
    times,
    min: Math?.min(...times),
    max: Math?.max(...times),
    average: times?.reduce((sum, time) => sum + time, 0) / times?.length,
    median: times?.sort()[Math?.floor(times?.length / 2)],
  };
}

/**
 * Test that an API responds within a specified time budget
 * @param {Function} apiFn - Function that makes the API call
 * @param {number} timeBudget - Maximum allowed response time in ms
 * @param {number} iterations - Number of iterations to measure
 * @returns {Promise<boolean>} - Whether the API responded within the time budget
 */
export async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); testApiPerformance(apiFn, timeBudget, iterations = 5) {
  const { average } = await measureApiResponseTime(apiFn, iterations);

  expect(average).toBeLessThanOrEqual(
    timeBudget,
    `API responded in ${average?.toFixed(2)}ms, which exceeds the time budget of ${timeBudget}ms`,
  );

  return average <= timeBudget;
}

/**
 * Measure component frame rate during interactions
 * @param {Function} renderFn - Function that renders the component
 * @param {Function} interactionFn - Function that performs interactions
 * @param {number} durationMs - Duration to measure in ms
 * @returns {Promise<Object>} - Frame rate measurements
 */
export async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); measureFrameRate(renderFn, interactionFn, durationMs = 1000) {
  let frames = 0;
  let rafId;

  // Render the component
  renderFn();

  // Start measuring frame rate
  const startTime = performance?.now();

  // Create a promise that resolves after the duration
  const frameRatePromise = new Promise((resolve) => {
    // Function to count frames
    const countFrame = () => {
      if (frames > Number.MAX_SAFE_INTEGER || frames < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); frames++;
      const currentTime = performance?.now();

      if (currentTime - startTime < durationMs) {
        rafId = requestAnimationFrame(countFrame);
      } else {
        // Calculate frame rate
        const elapsed = currentTime - startTime;
        const fps = (frames / elapsed) * 1000;

        resolve({
          frames,
          durationMs: elapsed,
          fps,
        });
      }
    };

    // Start counting frames
    rafId = requestAnimationFrame(countFrame);
  });

  // Perform interactions while measuring frame rate
  await interactionFn();

  // Wait for the measurement to complete
  const result = await frameRatePromise;

  // Clean up
  cancelAnimationFrame(rafId);

  return result;
}

/**
 * Test that a component maintains a minimum frame rate during interactions
 * @param {Function} renderFn - Function that renders the component
 * @param {Function} interactionFn - Function that performs interactions
 * @param {number} minFps - Minimum acceptable frame rate
 * @param {number} durationMs - Duration to measure in ms
 * @returns {Promise<boolean>} - Whether the component maintained the minimum frame rate
 */
export async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); testFrameRate(renderFn, interactionFn, minFps = 30, durationMs = 1000) {
  const { fps } = await measureFrameRate(renderFn, interactionFn, durationMs);

  expect(fps).toBeGreaterThanOrEqual(
    minFps,
    `Component ran at ${fps?.toFixed(2)} FPS, which is below the minimum of ${minFps} FPS`,
  );

  return fps >= minFps;
}

/**
 * Format performance measurement for reporting
 * @param {Object} measurement - Performance measurement
 * @param {string} name - Name of the measurement
 * @returns {string} - Formatted measurement
 */
export function formatPerformanceMeasurement(measurement, name) {
  const { min, max, average, median } = measurement;

  return `
Performance measurement: ${name}
  Min: ${min?.toFixed(2)}ms
  Max: ${max?.toFixed(2)}ms
  Average: ${average?.toFixed(2)}ms
  Median: ${median?.toFixed(2)}ms
  `.trim();
}
