'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import { getTrainingAnalytics } from '@/lib/api/training';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = {
  NOT_STARTED: '#9CA3AF',
  IN_PROGRESS: '#60A5FA',
  COMPLETED: '#34D399',
  FAILED: '#EF4444',
  UNDER_REVIEW: '#FBBF24',
};

interface TrainingAnalyticsProps {
  staffId: string;
}

export default function TrainingAnalytics({ staffId }: TrainingAnalyticsProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const data = await getTrainingAnalytics(staffId);
        setAnalytics(data);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [staffId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const statusData = Object.entries(analytics.moduleBreakdown).map(([status, count]) => ({
    name: status.replace('_', ' '),
    value: count,
  }));

  const progressData = [
    {
      name: 'Completion',
      completed: analytics.completedModules,
      total: analytics.totalModules,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Progress Overview */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Training Progress</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#34D399" name="Completed" />
                <Bar dataKey="total" fill="#9CA3AF" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Module Status Distribution */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Module Status Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.name.replace(' ', '_') as keyof typeof COLORS]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Detailed Stats */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Training Statistics</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="text-sm font-medium text-gray-500">Completion Rate</h3>
            <p className="mt-1 text-2xl font-semibold">{analytics.completionRate.toFixed(1)}%</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="text-sm font-medium text-gray-500">Average Score</h3>
            <p className="mt-1 text-2xl font-semibold">{analytics.averageScore.toFixed(1)}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="text-sm font-medium text-gray-500">Total Time Spent</h3>
            <p className="mt-1 text-2xl font-semibold">
              {Math.round(analytics.totalTimeSpent / 60)} hrs
            </p>
          </div>
        </div>
      </Card>

      {/* Status Breakdown */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Module Status Breakdown</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {statusData.map((status) => (
            <div
              key={status.name}
              className="rounded-lg p-4"
              style={{
                backgroundColor:
                  COLORS[status.name.replace(' ', '_') as keyof typeof COLORS] + '20',
              }}
            >
              <h3 className="text-sm font-medium text-gray-500">{status.name}</h3>
              <p className="mt-1 text-2xl font-semibold">{status.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
