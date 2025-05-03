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

interface ChartData {
  timestamp: number;
  duration: number;
}

interface DynamicChartsProps {
  data: ChartData[];
  timeRange: 'hour' | 'day' | 'week';
}

const formatTimestamp = (timestamp: number, range: 'hour' | 'day' | 'week'): string => {
  const date = new Date(timestamp);
  switch (range) {
    case 'hour':
      return date?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    case 'day':
      return date?.toLocaleString([], { hour: '2-digit', minute: '2-digit' });
    case 'week':
      return date?.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    default:
      return date?.toLocaleString();
  }
};

const DynamicCharts: React?.FC<DynamicChartsProps> = ({ data, timeRange }) => {
  const sortedData = [...data].sort((a, b) => a?.timestamp - b?.timestamp);

  // Calculate moving average
  const windowSize = 5;
  const movingAverage = sortedData?.map((point, index) => {
    const window = sortedData?.slice(Math?.max(0, index - windowSize + 1), index + 1);
    const average = window?.reduce((sum, p) => sum + p?.duration, 0) / window?.length;
    return {
      timestamp: point?.timestamp,
      duration: point?.duration,
      average,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={movingAverage}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(value) => formatTimestamp(value, timeRange)}
          interval="preserveStartEnd"
        />
        <YAxis label={{ value: 'Load Time (ms)', angle: -90, position: 'insideLeft' }} />
        <Tooltip
          labelFormatter={(value) => formatTimestamp(Number(value), timeRange)}
          formatter={(value: number) => [`${value?.toFixed(2)} ms`, '']}
        />
        <Legend />
        <Line type="monotone" dataKey="duration" stroke="#8884d8" name="Load Time" dot={false} />
        <Line
          type="monotone"
          dataKey="average"
          stroke="#82ca9d"
          name="Moving Average"
          dot={false}
          strokeDasharray="5 5"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default DynamicCharts;
