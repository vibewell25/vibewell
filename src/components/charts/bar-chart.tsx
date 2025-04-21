'use client';

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BarChartProps {
  data: Array<{
    [key: string]: any;
  }>;
  bars: Array<{
    dataKey: string;
    color?: string;
    name?: string;
  }>;
  xAxisKey: string;
  grid?: boolean;
  layout?: 'vertical' | 'horizontal';
  stackId?: string | number | undefined;
}

export default function BarChart({
  data,
  bars,
  xAxisKey,
  grid = true,
  layout = 'horizontal',
  stackId,
}: BarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={data}
        layout={layout}
        margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
      >
        {grid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />}
        {layout === 'horizontal' ? (
          <>
            <XAxis
              dataKey={xAxisKey}
              stroke="#888888"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e0e0e0' }}
            />
            <YAxis stroke="#888888" tick={{ fontSize: 12 }} tickLine={{ stroke: '#e0e0e0' }} />
          </>
        ) : (
          <>
            <XAxis
              type="number"
              stroke="#888888"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e0e0e0' }}
            />
            <YAxis
              dataKey={xAxisKey}
              type="category"
              stroke="#888888"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e0e0e0' }}
              width={120}
            />
          </>
        )}
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: 'none',
          }}
        />
        <Legend verticalAlign="bottom" height={36} />

        {bars.map((bar, index) => (
          <Bar
            key={index}
            dataKey={bar.dataKey}
            name={bar.name || bar.dataKey}
            fill={bar.color || `#${Math.floor(Math.random() * 16777215).toString(16)}`}
            stackId={stackId}
            radius={[4, 4, 0, 0]}
            animationDuration={750}
            animationBegin={index * 150}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
