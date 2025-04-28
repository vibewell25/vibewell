import React, { useEffect, useState } from 'react';
import type { LoadMetrics } from '@/utils/performanceMonitor';
import performanceMonitor from '@/utils/performanceMonitor';
import dynamic from 'next/dynamic';

// Dynamically import recharts components to reduce initial bundle size
const DynamicCharts = dynamic(() => import('./DynamicCharts'), {
  ssr: false,
  loading: () => <div>Loading charts...</div>,
});

interface MetricsData {
  name: string;
  avgLoadTime: number;
  totalLoads: number;
  lastLoadTime: number;
  trend: Array<{ timestamp: number; duration: number }>;
}

const PerformanceDashboard: React.FC = () => {
  const [metricsData, setMetricsData] = useState<MetricsData[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'hour' | 'day' | 'week'>('day');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const allMetrics = performanceMonitor.getAllMetrics();

      const processedData: MetricsData[] = Array.from(allMetrics.entries()).map(
        ([name, metrics]: [string, LoadMetrics[]]) => {
          const filteredMetrics = getTimeRangeData(metrics, timeRange);
          const loadTimes = filteredMetrics.map((m) => m.loadDuration);
          const avgLoadTime =
            loadTimes.length > 0
              ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length
              : 0;
          const lastLoadTime = filteredMetrics[filteredMetrics.length - 1]?.loadDuration || 0;

          // Create trend data
          const trend = filteredMetrics.map((m) => ({
            timestamp: m.loadStartTime,
            duration: m.loadDuration,
          }));

          return {
            name,
            avgLoadTime,
            totalLoads: filteredMetrics.length,
            lastLoadTime,
            trend,
          };
        },
      );

      setMetricsData(processedData);
      setError(null);
    } catch (err) {
      setError('Failed to load performance metrics');
      console.error('Error loading metrics:', err);
    }
  }, [timeRange]);

  const getTimeRangeData = (
    metrics: LoadMetrics[],
    range: 'hour' | 'day' | 'week',
  ): LoadMetrics[] => {
    const now = Date.now();
    const ranges = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
    };

    return metrics.filter((metric) => now - metric.loadStartTime <= ranges[range]);
  };

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="performance-dashboard">
      <h2>Component Performance Dashboard</h2>

      <div className="controls">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as 'hour' | 'day' | 'week')}
        >
          <option value="hour">Last Hour</option>
          <option value="day">Last 24 Hours</option>
          <option value="week">Last Week</option>
        </select>
      </div>

      <div className="metrics-grid">
        {metricsData.map((metric) => (
          <div
            key={metric.name}
            className={`metric-card ${selectedMetric === metric.name ? 'selected' : ''}`}
            onClick={() => setSelectedMetric(metric.name)}
          >
            <h3>{metric.name}</h3>
            <div className="metric-details">
              <div>
                <span>Avg Load Time:</span>
                <span>{metric.avgLoadTime.toFixed(2)}ms</span>
              </div>
              <div>
                <span>Total Loads:</span>
                <span>{metric.totalLoads}</span>
              </div>
              <div>
                <span>Last Load:</span>
                <span>{metric.lastLoadTime.toFixed(2)}ms</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedMetric && (
        <div className="chart-container">
          <h3>Load Time Trend - {selectedMetric}</h3>
          <DynamicCharts
            data={metricsData.find((m) => m.name === selectedMetric)?.trend || []}
            timeRange={timeRange}
          />
        </div>
      )}

      <style jsx>{`
        .performance-dashboard {
          padding: 2rem;
          background: var(--background-primary);
        }

        .error-container {
          padding: 2rem;
          text-align: center;
        }

        .error-message {
          color: var(--error);
          margin-bottom: 1rem;
        }

        .controls {
          margin-bottom: 2rem;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .metric-card {
          background: var(--background-secondary);
          border-radius: 8px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .metric-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .metric-card.selected {
          border: 2px solid var(--primary);
        }

        .metric-details {
          display: grid;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .metric-details > div {
          display: flex;
          justify-content: space-between;
          color: var(--text-secondary);
        }

        .chart-container {
          margin-top: 2rem;
          padding: 1.5rem;
          background: var(--background-secondary);
          border-radius: 8px;
        }

        h2 {
          margin-bottom: 2rem;
          color: var(--text-primary);
        }

        h3 {
          margin: 0;
          color: var(--text-primary);
        }

        select {
          padding: 0.5rem;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          background: var(--background-secondary);
          color: var(--text-primary);
        }

        button {
          padding: 0.5rem 1rem;
          border-radius: 4px;
          border: none;
          background: var(--primary);
          color: white;
          cursor: pointer;
        }

        button:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
};

export default PerformanceDashboard;
