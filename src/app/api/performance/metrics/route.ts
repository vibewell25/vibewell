import { NextResponse } from 'next/server';
import { performanceMonitor } from '@/utils/performanceMonitor';

export async function GET() {
  try {
    // Get all metrics from the performance monitor
    const allMetrics = performanceMonitor.getMetrics();
    
    // Organize metrics by name
    const metrics: Record<string, any[]> = {};
    allMetrics.forEach(metric => {
      if (!metrics[metric.name]) {
        metrics[metric.name] = [];
      }
      metrics[metric.name].push(metric);
    });
    
    return NextResponse.json({ 
      metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance metrics' },
      { status: 500 }
    );
  }
} 