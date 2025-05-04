'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { HabitLog, WellnessDay, GoalType } from '@/types/progress';
import { format, parseISO, subDays } from 'date-fns';

interface ProgressChartsProps {
  wellnessDays: WellnessDay[];
  habitLogs: HabitLog[];
  selectedType?: GoalType;
  timeRange?: '7d' | '30d' | '90d';
}

export function ProgressCharts({
  wellnessDays,
  habitLogs,
  selectedType = 'meditation',
  timeRange = '7d',
}: ProgressChartsProps) {
  // Format data for charts
  const formattedData = useMemo(() => {
    // Sort days by date
    const sortedDays = [...wellnessDays].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // Map days to chart-friendly format
    return sortedDays.map((day) => ({
      date: format(parseISO(day.date), 'MMM dd'),
      rawDate: day.date,
      meditation: day.meditation,
      workout: day.workout,
      water: day.water,
      sleep: day.sleep,
      steps: day.steps,
      mood: day.mood,
    }));
  }, [wellnessDays]);

  // Filter data based on time range
  const filteredData = useMemo(() => {
    let days: number;

    switch (timeRange) {
      case '30d':
        days = 30;
        break;
      case '90d':
        days = 90;
        break;
      default: // 7d
        days = 7;
        break;
    }

    const cutoffDate = subDays(new Date(), days).getTime();
    return formattedData.filter((day) => new Date(day.rawDate).getTime() >= cutoffDate);
  }, [formattedData, timeRange]);

  // Determine y-axis label based on selected type
  const getYAxisLabel = () => {
    switch (selectedType) {
      case 'meditation':
      case 'workout':
        return 'Minutes';
      case 'water':
        return 'Glasses';
      case 'sleep':
        return 'Hours';
      case 'steps':
        return 'Steps';
      default:
        return 'Value';
    }
  };

  // Get color for chart based on selected type
  const getTypeColor = () => {
    switch (selectedType) {
      case 'meditation':
        return '#8B5CF6';
      case 'workout':
        return '#EC4899';
      case 'water':
        return '#0EA5E9';
      case 'sleep':
        return '#6366F1';
      case 'steps':
        return '#84CC16';
      default:
        return '#6366F1';
    }
  };

  // Render line chart for the selected type
  const renderLineChart = () => {
    return (
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={10} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickMargin={10}
              label={{
                value: getYAxisLabel(),
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fontSize: 12, fill: '#888' },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey={selectedType}
              stroke={getTypeColor()}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Render bar chart for mood
  const renderMoodChart = () => {
    return (
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={10} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickMargin={10}
              domain={[0, 5]}
              ticks={[1, 2, 3, 4, 5]}
              label={{
                value: 'Mood (1-5)',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fontSize: 12, fill: '#888' },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                fontSize: 12,
              }}
            />
            <Bar dataKey="mood" fill="#F59E0B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Render weekly summary chart
  const renderWeeklySummary = () => {
    // Calculate weekly totals for chart
    const weeklyData = [
      {
        name: 'This Week',
        meditation: filteredData.reduce((sum, day) => sum + day.meditation, 0),
        workout: filteredData.reduce((sum, day) => sum + day.workout, 0),
        water: filteredData.reduce((sum, day) => sum + day.water, 0),
        sleep: (
          filteredData.reduce((sum, day) => sum + day.sleep, 0) / filteredData.length
        ).toFixed(1),
        steps: filteredData.reduce((sum, day) => sum + day.steps, 0),
      },
    ];

    return (
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={weeklyData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 100, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={true} vertical={false} />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                fontSize: 12,
              }}
            />
            <Legend />
            <Bar
              dataKey="meditation"
              name="Meditation (min)"
              fill="#8B5CF6"
              radius={[0, 4, 4, 0]}
            />
            <Bar dataKey="workout" name="Workouts (min)" fill="#EC4899" radius={[0, 4, 4, 0]} />
            <Bar dataKey="water" name="Water (glasses)" fill="#0EA5E9" radius={[0, 4, 4, 0]} />
            <Bar dataKey="sleep" name="Sleep (avg hrs)" fill="#6366F1" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="card">
        <h3 className="mb-4 text-lg font-semibold capitalize">{selectedType} Trend</h3>
        {renderLineChart()}
      </div>

      <div className="card">
        <h3 className="mb-4 text-lg font-semibold">Mood Tracking</h3>
        {renderMoodChart()}
      </div>

      <div className="card">
        <h3 className="mb-4 text-lg font-semibold">Weekly Summary</h3>
        {renderWeeklySummary()}
      </div>
    </div>
  );
}
