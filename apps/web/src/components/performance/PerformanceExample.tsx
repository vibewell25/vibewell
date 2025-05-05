import React, { useState } from 'react';
import usePerformanceMonitoring from '../../hooks/usePerformanceMonitoring';

/**
 * Example component demonstrating the usePerformanceMonitoring hook
 * with automatic and manual performance measurement
 */
export const PerformanceExample: React.FC = () => {
  // Automatic performance monitoring for the whole component lifecycle
  usePerformanceMonitoring({ id: 'PerformanceExample' });

  const [count, setCount] = useState(0);
  const [results, setResults] = useState<string[]>([]);

  // Manual performance monitoring for specific operations
  const { startMeasure, endMeasure } = usePerformanceMonitoring({
    id: 'ExpensiveOperation',
    autoStart: false,
    autoEnd: false,
// Simulate an expensive operation
  const runExpensiveOperation = () => {
    startMeasure();

    // Record start time for display
    const startTime = performance.now();

    // Simulate expensive operation (fibonacci calculation)
    const fibonacci = (n: number): number => {
      if (n <= 1) return n;
      return fibonacci(n - 1) + fibonacci(n - 2);
// Run the operation
    const result = fibonacci(35);

    // Record end time for display
    const endTime = performance.now();
    const duration = endTime - startTime;

    // End the performance measure
    endMeasure();

    // Update state with results
    setResults((prev) => [
      `Operation completed in ${duration.toFixed(2)}ms, result: ${result}`,
      ...prev.slice(0, 4), // Keep only the last 5 results
    ]);

    // Update counter
    setCount((prev) => prev + 1);
return (
    <div className="performance-example">
      <h2>Performance Monitoring Example</h2>

      <div className="controls">
        <button onClick={runExpensiveOperation} className="primary-button">
          Run Expensive Operation
        </button>

        <p>Operations run: {count}</p>
      </div>

      <div className="results">
        <h3>Results:</h3>
        {results.length > 0 ? (
          <ul>
            {results.map((result, index) => (
              <li key={index}>{result}</li>
            ))}
          </ul>
        ) : (
          <p>No operations run yet. Click the button to start.</p>
        )}
      </div>

      <div className="info">
        <h3>How it works:</h3>
        <p>
          This component uses the <code>usePerformanceMonitoring</code> hook in two ways:
        </p>
        <ol>
          <li>Automatic monitoring of the component's entire lifecycle</li>
          <li>Manual monitoring of the expensive operation</li>
        </ol>
        <p>Performance data is captured and can be viewed in:</p>
        <ul>
          <li>Browser DevTools Performance tab</li>
          <li>Application's performance dashboard</li>
          <li>Console logs (for performance budget violations)</li>
        </ul>
      </div>
    </div>
export default PerformanceExample;
