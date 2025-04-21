import React, { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Alert, Card, Grid, Typography } from '@mui/material';
import { performanceMonitor } from '@/utils/performanceMonitor';
import { AlertConfig, DashboardData, PerformanceMetric } from '@/types/monitoring';

interface DashboardProps {
  refreshInterval?: number;
  onAlert?: (alert: AlertConfig) => void;
}

export const MonitoringDashboard: React.FC<DashboardProps> = ({
  refreshInterval = 30000,
  onAlert
}) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/performance/metrics');
      const dashboardData: DashboardData = await response.json();
      setData(dashboardData);
      
      // Check for alerts
      checkAlerts(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    }
  };

  const checkAlerts = (dashboardData: DashboardData) => {
    const { currentMetrics } = dashboardData;
    
    // Define thresholds
    const thresholds = {
      responseTime: 1000, // ms
      errorRate: 1, // %
      cpuUsage: 80, // %
      memoryUsage: 80, // %
      networkLatency: 200 // ms
    };

    // Check each metric against its threshold
    Object.entries(thresholds).forEach(([metric, threshold]) => {
      const value = currentMetrics[metric];
      if (value > threshold) {
        const alert: AlertConfig = {
          id: `${metric}-${Date.now()}`,
          type: 'warning',
          message: `${metric} (${value}) exceeds threshold (${threshold})`,
          timestamp: new Date().toISOString(),
          acknowledged: false
        };
        onAlert?.(alert);
      }
    });
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  const { currentMetrics, alerts, health, performance } = data;

  return (
    <div className="p-4">
      <Typography variant="h4" className="mb-4">Performance Dashboard</Typography>
      
      <Grid container spacing={3}>
        {/* Core Web Vitals */}
        <Grid item xs={12} md={6}>
          <Card className="p-4">
            <Typography variant="h6">Core Web Vitals</Typography>
            <Line
              data={{
                labels: ['LCP', 'FID', 'CLS'],
                datasets: [{
                  label: 'Current',
                  data: [
                    performance.lcp,
                    performance.fid,
                    performance.cls
                  ]
                }]
              }}
            />
          </Card>
        </Grid>

        {/* Server Performance */}
        <Grid item xs={12} md={6}>
          <Card className="p-4">
            <Typography variant="h6">Server Performance</Typography>
            <Bar
              data={{
                labels: ['Response Time', 'CPU Usage', 'Memory Usage'],
                datasets: [{
                  label: 'Current',
                  data: [
                    performance.responseTime,
                    performance.cpuUsage,
                    performance.memoryUsage
                  ]
                }]
              }}
            />
          </Card>
        </Grid>

        {/* Active Alerts */}
        <Grid item xs={12}>
          <Card className="p-4">
            <Typography variant="h6">Active Alerts</Typography>
            {alerts.active.length === 0 ? (
              <Typography>No active alerts</Typography>
            ) : (
              alerts.active.map((alert: AlertConfig) => (
                <Alert
                  key={alert.id}
                  severity={alert.type}
                  className="mb-2"
                >
                  {alert.message}
                  <Typography variant="caption" display="block">
                    {new Date(alert.timestamp).toLocaleString()}
                  </Typography>
                </Alert>
              ))
            )}
          </Card>
        </Grid>

        {/* System Health */}
        <Grid item xs={12}>
          <Card className="p-4">
            <Typography variant="h6">System Health</Typography>
            <Grid container spacing={2}>
              {Object.entries(health).map(([key, value]) => (
                <Grid item xs={6} md={3} key={key}>
                  <Typography variant="subtitle2">{key}</Typography>
                  <Typography
                    variant="h6"
                    color={value > 80 ? 'error' : value > 60 ? 'warning' : 'success'}
                  >
                    {value}%
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}; 