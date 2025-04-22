'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type BackupStats = {
  totalRecords: number;
  backedUpRecords: number;
  lastBackupDate: string | null;
  status: 'idle' | 'in_progress' | 'completed' | 'failed';
};

export function BackupStatistics() {
  const [stats, setStats] = useState<BackupStats>({
    totalRecords: 0,
    backedUpRecords: 0,
    lastBackupDate: null,
    status: 'idle',
  });

  useEffect(() => {
    async function fetchBackupStats() {
      try {
        const response = await fetch('/api/admin/backup/stats');
        if (!response.ok) throw new Error('Failed to fetch backup stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching backup stats:', error);
      }
    }

    fetchBackupStats();
    const interval = setInterval(fetchBackupStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const progress = stats.totalRecords > 0
    ? Math.round((stats.backedUpRecords / stats.totalRecords) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backup Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Records</p>
              <p className="text-2xl font-bold">{stats.totalRecords}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Backed Up</p>
              <p className="text-2xl font-bold">{stats.backedUpRecords}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Last Backup</p>
            <p className="text-lg">
              {stats.lastBackupDate
                ? new Date(stats.lastBackupDate).toLocaleString()
                : 'Never'}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="text-lg capitalize">{stats.status.replace('_', ' ')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
