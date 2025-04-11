'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown, Database, HardDrive } from 'lucide-react';

interface BackupStatistics {
  type: string;
  total_backups: number;
  total_size: number;
  oldest_backup: string;
  latest_backup: string;
  failed_backups: number;
  successful_backups: number;
}

interface BackupSummary {
  day: string;
  total_backups: number;
  successful_backups: number;
  failed_backups: number;
  total_size: number;
}

export function BackupStatistics() {
  const [statistics, setStatistics] = useState<BackupStatistics[]>([]);
  const [summary, setSummary] = useState<BackupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');

  useEffect(() => {
    loadStatistics();
    loadSummary();
  }, [timeRange]);

  const loadStatistics = async () => {
    try {
      const { data, error } = await supabase
        .from('backup_statistics')
        .select('*');

      if (error) throw error;
      setStatistics(data || []);
    } catch (err) {
      console.error('Error loading backup statistics:', err);
      setError('Failed to load backup statistics');
    }
  };

  const loadSummary = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_backup_summary', { days: parseInt(timeRange) });

      if (error) throw error;
      setSummary(data || []);
    } catch (err) {
      console.error('Error loading backup summary:', err);
      setError('Failed to load backup summary');
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  const getSuccessRate = (successful: number, total: number) => {
    if (total === 0) return 0;
    return (successful / total) * 100;
  };

  const chartData = summary.map(day => ({
    ...day,
    date: format(new Date(day.day), 'MMM dd'),
    success_rate: getSuccessRate(day.successful_backups, day.total_backups),
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statistics.map((stat) => (
          <Card key={stat.type}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.type.charAt(0).toUpperCase() + stat.type.slice(1)} Backups
              </CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{stat.total_backups}</div>
                <div className="text-xs text-muted-foreground">
                  {formatSize(stat.total_size)} total size
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={stat.failed_backups === 0 ? "success" : "destructive"}>
                    {getSuccessRate(stat.successful_backups, stat.total_backups).toFixed(1)}% success rate
                  </Badge>
                  {stat.failed_backups > 0 && (
                    <Badge variant="destructive">
                      {stat.failed_backups} failed
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backup Trends</CardTitle>
          <CardDescription>
            View backup success rates and storage usage over time
          </CardDescription>
          <Tabs
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as '7' | '30' | '90')}
          >
            <TabsList>
              <TabsTrigger value="7">7 days</TabsTrigger>
              <TabsTrigger value="30">30 days</TabsTrigger>
              <TabsTrigger value="90">90 days</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" orientation="left" stroke="#82ca9d" />
                  <YAxis yAxisId="right" orientation="right" stroke="#8884d8" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="success_rate"
                    name="Success Rate (%)"
                    fill="#82ca9d"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="total_size"
                    name="Total Size (bytes)"
                    fill="#8884d8"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Storage Trends</CardTitle>
            <CardDescription>
              Total backup storage usage over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="total_size"
                    name="Storage Used"
                    fill="#8884d8"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Success Rate Trends</CardTitle>
            <CardDescription>
              Backup success rate over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="success_rate"
                    name="Success Rate"
                    fill="#82ca9d"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 