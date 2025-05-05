import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
from 'recharts';

interface LineChartProps {
  data: Array<{
    [key: string]: any;
>;
  lines: Array<{
    dataKey: string;
    color?: string;
    name?: string;
>;
  xAxisKey: string;
  grid?: boolean;
export default function LineChart({ data, lines, xAxisKey, grid = true }: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No data available
      </div>
return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        {grid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />}
        <XAxis
          dataKey={xAxisKey}
          stroke="#888888"
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: '#e0e0e0' }}
        />
        <YAxis stroke="#888888" tick={{ fontSize: 12 }} tickLine={{ stroke: '#e0e0e0' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: 'none',
/>
        <Legend verticalAlign="bottom" height={36} />

        {lines.map((line, index) => (
          <Line
            key={index}
            type="monotone"
            dataKey={line.dataKey}
            name={line.name || line.dataKey}
            stroke={line.color || `#${Math.floor(Math.random() * 16777215).toString(16)}`}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            animationDuration={750}
            animationBegin={index * 150}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
