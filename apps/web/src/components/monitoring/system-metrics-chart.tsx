import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface MetricDataPoint {
  timestamp: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkHealth: number;
}

interface SystemMetricsChartProps {
  data: MetricDataPoint[];
  timeRange: '1h' | '24h' | '7d';
  metrics: Array<'cpuUsage' | 'memoryUsage' | 'diskUsage' | 'networkHealth'>;
}

const SystemMetricsChart: React.FC<SystemMetricsChartProps> = ({ data, timeRange, metrics }) => {
  const formatXAxis = (timestamp: number) => {
    const date = new Date(timestamp);
    switch (timeRange) {
      case '1h':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case '24h':
        return date.toLocaleString([], {
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
        });
      case '7d':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      default:
        return '';
    }
  };

  const COLORS = {
    cpuUsage: '#2196F3', // Blue
    memoryUsage: '#4CAF50', // Green
    diskUsage: '#FFA726', // Orange
    networkHealth: '#AB47BC', // Purple
  };

  const METRIC_LABELS = {
    cpuUsage: 'CPU Usage',
    memoryUsage: 'Memory Usage',
    diskUsage: 'Disk Usage',
    networkHealth: 'Network Health',
  };

  return (
    <div className="metrics-chart">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis dataKey="timestamp" tickFormatter={formatXAxis} stroke="var(--text-secondary)" />
          <YAxis
            domain={[0, 100]}
            stroke="var(--text-secondary)"
            label={{ value: '%', position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--background-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
            }}
            labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              color: 'var(--text-primary)',
            }}
          />
          {metrics.map((metric) => (
            <Line
              key={metric}
              type="monotone"
              dataKey={metric}
              name={METRIC_LABELS[metric]}
              stroke={COLORS[metric]}
              dot={false}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <style jsx>{`
        .metrics-chart {
          background: var(--background-secondary);
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        /* Override Recharts tooltip styles */
        :global(.recharts-tooltip-label) {
          color: var(--text-primary) !important;
        }
        :global(.recharts-tooltip-item-list) {
          color: var(--text-primary) !important;
        }
      `}</style>
    </div>
  );
};

export default SystemMetricsChart;
