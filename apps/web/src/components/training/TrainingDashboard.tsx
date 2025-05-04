'use client';

import { useState, useEffect } from 'react';
import { Card, Progress, Badge, Button } from '@/components/ui';
import { getStaffTrainingProgress, getTrainingAnalytics } from '@/lib/api/training';
import { ModuleStatus } from '@prisma/client';
import { ChartBarIcon, ClockIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

const statusColors = {
  NOT_STARTED: 'gray',
  IN_PROGRESS: 'blue',
  COMPLETED: 'green',
  FAILED: 'red',
  UNDER_REVIEW: 'yellow',
};

interface TrainingDashboardProps {
  staffId: string;
}

export default function TrainingDashboard({ staffId }: TrainingDashboardProps) {
  const [progress, setProgress] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); loadData() {
      try {
        const [progressData, analyticsData] = await Promise.all([
          getStaffTrainingProgress(staffId),
          getTrainingAnalytics(staffId),
        ]);
        setProgress(progressData);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Error loading training data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [staffId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <AcademicCapIcon className="h-8 w-8 text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold">Completion Rate</h3>
              <p className="text-2xl font-bold">{analytics.completionRate.toFixed(1)}%</p>
            </div>
          </div>
          <Progress value={analytics.completionRate} className="mt-2" />
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="h-8 w-8 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold">Average Score</h3>
              <p className="text-2xl font-bold">{analytics.averageScore.toFixed(1)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <ClockIcon className="h-8 w-8 text-purple-500" />
            <div>
              <h3 className="text-lg font-semibold">Time Spent</h3>
              <p className="text-2xl font-bold">{Math.round(analytics.totalTimeSpent / 60)} hrs</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Module Progress List */}
      <Card className="overflow-hidden">
        <div className="border-b p-4">
          <h2 className="text-xl font-semibold">Training Modules</h2>
        </div>
        <div className="divide-y">
          {progress.map((item) => (
            <div key={item.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{item.module.name}</h3>
                  <p className="text-sm text-gray-500">{item.module.description}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge color={statusColors[item.status as ModuleStatus]}>
                    {item.status.replace('_', ' ')}
                  </Badge>
                  {item.score && (
                    <span className="text-sm font-medium">Score: {item.score.toFixed(1)}%</span>
                  )}
                  <Button variant="outline" size="sm" href={`/training/module/${item.module.id}`}>
                    {item.status === 'NOT_STARTED' ? 'Start' : 'Continue'}
                  </Button>
                </div>
              </div>
              {item.status === 'IN_PROGRESS' && (
                <Progress value={(item.timeSpent / item.module.duration) * 100} className="mt-2" />
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
