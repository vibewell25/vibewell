import { NextResponse } from 'next/server';
import { performanceMonitor } from '@/utils/performanceMonitor';
import { DashboardData, AlertConfig, SystemHealth, PerformanceMetrics } from '@/types/monitoring';

export async function GET() {
  try {
    // Get current metrics from the performance monitor
    const metrics = performanceMonitor.getMetrics();
    
    // Get active alerts
    const activeAlerts = performanceMonitor.getActiveAlerts();
    
    // Get alert history for the last 24 hours
    const alertHistory = performanceMonitor.getAlertHistory(
      Date.now() - 24 * 60 * 60 * 1000,
      Date.now()
    );

    // Get system health metrics
    const health: SystemHealth = {
      cpu: await performanceMonitor.getCPUUsage(),
      memory: await performanceMonitor.getMemoryUsage(),
      disk: await performanceMonitor.getDiskUsage(),
      network: await performanceMonitor.getNetworkHealth()
    };

    // Get core web vitals and other performance metrics
    const performance: PerformanceMetrics = {
      lcp: metrics.LCP || 0,
      fid: metrics.FID || 0,
      cls: metrics.CLS || 0,
      responseTime: metrics.responseTime || 0,
      cpuUsage: metrics.cpuUsage || 0,
      memoryUsage: metrics.memoryUsage || 0
    };

    const dashboardData: DashboardData = {
      currentMetrics: metrics,
      alerts: {
        active: activeAlerts,
        history: alertHistory
      },
      health,
      performance
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance metrics' },
      { status: 500 }
    );
  }
}
