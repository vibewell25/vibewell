import React, { useEffect, useState, useCallback, useMemo } from 'react';
import performanceMonitor from '@/utils/performanceMonitor';
import dynamic from 'next/dynamic';
import { MetricDataPoint } from './SystemMetricsChart';
import { logger, safeOperation } from '@/utils/shared';

// Load components dynamically to improve initial load time
const DynamicGaugeChart = dynamic(() => import('./GaugeChart'), {
  ssr: false,
  loading: () => <div className="loading-placeholder">Loading gauge...</div>,
});

const DynamicSystemMetricsChart = dynamic(() => import('./SystemMetricsChart'), {
  ssr: false,
  loading: () => <div className="loading-placeholder">Loading metrics chart...</div>,
});

const DynamicAlertList = dynamic(() => import('./AlertList'), {
  ssr: false,
  loading: () => <div className="loading-placeholder">Loading alerts...</div>,
});

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkHealth: number;
}

interface Alert {
  id: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
}

const DEFAULT_METRICS: SystemMetrics = {
  cpuUsage: 0,
  memoryUsage: 0,
  diskUsage: 0,
  networkHealth: 100,
};

const SystemMonitorDashboard: React.FC = () => {
  // State management
  const [metrics, setMetrics] = useState<SystemMetrics>(DEFAULT_METRICS);
  const [historicalData, setHistoricalData] = useState<MetricDataPoint[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d'>('24h');
  const [selectedMetrics, setSelectedMetrics] = useState<Array<keyof SystemMetrics>>([
    'cpuUsage',
    'memoryUsage',
    'diskUsage',
    'networkHealth',
  ]);

  // Memoize the max data points based on selected time range to prevent recalculation
  const maxDataPoints = useMemo(() => {
    switch (selectedTimeRange) {
      case '1h': return 60;    // One point per minute
      case '24h': return 144;  // One point per 10 minutes
      case '7d': return 168;   // One point per hour
      default: return 144;
    }
  }, [selectedTimeRange]);

  // Memoize the update interval based on selected time range
  const updateInterval = useMemo(() => {
    switch (selectedTimeRange) {
      case '1h': return 10 * 1000;     // Every 10 seconds
      case '24h': return 60 * 1000;    // Every minute
      case '7d': return 5 * 60 * 1000; // Every 5 minutes
      default: return 60 * 1000;
    }
  }, [selectedTimeRange]);

  // Fetch metrics function - wrapped in useCallback to prevent recreation on each render
  const fetchMetrics = useCallback(async () => {
    try {
      // Use Promise.all to fetch all metrics in parallel
      const [cpuUsage, memoryUsage, diskUsage, networkHealth, activeAlerts] = await Promise.all([
        performanceMonitor.getCPUUsage(),
        performanceMonitor.getMemoryUsage(),
        performanceMonitor.getDiskUsage(),
        performanceMonitor.getNetworkHealth(),
        performanceMonitor.getActiveAlerts()
      ]);

      // Create new metrics object
      const currentMetrics = {
        cpuUsage,
        memoryUsage,
        diskUsage,
        networkHealth,
      };

      // Update metrics state - only if changed
      setMetrics(prevMetrics => {
        // Only update if values have changed
        if (
          prevMetrics.cpuUsage !== cpuUsage ||
          prevMetrics.memoryUsage !== memoryUsage ||
          prevMetrics.diskUsage !== diskUsage ||
          prevMetrics.networkHealth !== networkHealth
        ) {
          return currentMetrics;
        }
        return prevMetrics;
      });

      // Update historical data using callback to avoid stale state references
      setHistoricalData(prevData => {
        const newDataPoint: MetricDataPoint = {
          timestamp: Date.now(),
          ...currentMetrics,
        };
        
        // Optimize by avoiding unnecessary array creations if at limit
        if (prevData.length >= maxDataPoints) {
          // Use efficient array operations - create new array with last N-1 items plus new item
          return [...prevData.slice(-(maxDataPoints - 1)), newDataPoint];
        } else {
          return [...prevData, newDataPoint];
        }
      });

      // Update alerts - only if changed
      setAlerts(prevAlerts => {
        // Check if alerts have changed by comparing IDs
        const currentAlertIds = new Set(activeAlerts.map(alert => alert.id));
        const prevAlertIds = new Set(prevAlerts.map(alert => alert.id));
        
        // Only update if alerts have changed
        if (
          currentAlertIds.size !== prevAlertIds.size ||
          ![...currentAlertIds].every(id => prevAlertIds.has(id))
        ) {
          return activeAlerts;
        }
        return prevAlerts;
      });
    } catch (error) {
      logger.error('Error fetching system metrics:', error);
    }
  }, [maxDataPoints]);

  // Setup the metrics polling interval
  useEffect(() => {
    // Fetch immediately on mount or time range change
    fetchMetrics();

    // Setup interval based on selected time range
    const interval = setInterval(fetchMetrics, updateInterval);

    // Cleanup function
    return () => clearInterval(interval);
  }, [fetchMetrics, updateInterval]);

  // Memoized utility functions
  const getAlertSeverity = useCallback((value: number, threshold: number): 'low' | 'medium' | 'high' => {
    if (value >= threshold * 0.9) return 'high';
    if (value >= threshold * 0.7) return 'medium';
    return 'low';
  }, []);

  const handleDismissAlert = useCallback((alertId: string) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
  }, []);

  const handleMetricToggle = useCallback((metric: keyof SystemMetrics) => {
    setSelectedMetrics(prev =>
      prev.includes(metric) ? prev.filter(m => m !== metric) : [...prev, metric]
    );
  }, []);

  const handleTimeRangeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTimeRange(e.target.value as '1h' | '24h' | '7d');
  }, []);

  // Memoize the gauge severity calculations
  const gaugeMetrics = useMemo(() => ({
    cpu: {
      value: metrics.cpuUsage,
      severity: getAlertSeverity(metrics.cpuUsage, 80)
    },
    memory: {
      value: metrics.memoryUsage,
      severity: getAlertSeverity(metrics.memoryUsage, 80)
    },
    disk: {
      value: metrics.diskUsage,
      severity: getAlertSeverity(metrics.diskUsage, 80)
    },
    network: {
      value: metrics.networkHealth,
      severity: getAlertSeverity(100 - metrics.networkHealth, 50)
    }
  }), [metrics, getAlertSeverity]);

  return (
    <div className="system-monitor">
      <h2>System Health Monitor</h2>
      <div className="controls">
        <div className="time-range-selector">
          <select
            value={selectedTimeRange}
            onChange={handleTimeRangeChange}
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
        </div>

        <div className="metric-toggles">
          {Object.keys(metrics).map((metric) => (
            <label key={metric} className="metric-toggle">
              <input
                type="checkbox"
                checked={selectedMetrics.includes(metric as keyof SystemMetrics)}
                onChange={() => handleMetricToggle(metric as keyof SystemMetrics)}
              />
              {metric.replace(/([A-Z])/g, ' $1').trim()}
            </label>
          ))}
        </div>
      </div>
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>CPU Usage</h3>
          <DynamicGaugeChart
            value={gaugeMetrics.cpu.value}
            maxValue={100}
            label="CPU"
            severity={gaugeMetrics.cpu.severity}
          />
        </div>

        <div className="metric-card">
          <h3>Memory Usage</h3>
          <DynamicGaugeChart
            value={gaugeMetrics.memory.value}
            maxValue={100}
            label="Memory"
            severity={gaugeMetrics.memory.severity}
          />
        </div>

        <div className="metric-card">
          <h3>Disk Usage</h3>
          <DynamicGaugeChart
            value={gaugeMetrics.disk.value}
            maxValue={100}
            label="Disk"
            severity={gaugeMetrics.disk.severity}
          />
        </div>

        <div className="metric-card">
          <h3>Network Health</h3>
          <DynamicGaugeChart
            value={gaugeMetrics.network.value}
            maxValue={100}
            label="Network"
            severity={gaugeMetrics.network.severity}
          />
        </div>
      </div>
      <div className="metrics-chart-section">
        <h3>Historical Metrics</h3>
        <DynamicSystemMetricsChart
          data={historicalData}
          timeRange={selectedTimeRange}
          metrics={selectedMetrics}
        />
      </div>
      <div className="alerts-section">
        <h3>Active Alerts</h3>
        <DynamicAlertList alerts={alerts} onDismiss={handleDismissAlert} />
      </div>
      <style jsx>{`
        .system-monitor {
          padding: 2rem;
          background: var(--background-primary);
        }
        .controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .metric-toggles {
          display: flex;
          gap: 1rem;
        }
        .metric-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-primary);
          cursor: pointer;
        }
        .metric-toggle input {
          cursor: pointer;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .metric-card {
          background: var(--background-secondary);
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .metrics-chart-section {
          background: var(--background-secondary);
          border-radius: 8px;
          padding: 1.5rem;
          margin: 2rem 0;
        }
        .alerts-section {
          background: var(--background-secondary);
          border-radius: 8px;
          padding: 1.5rem;
          margin-top: 2rem;
        }
        select {
          padding: 0.5rem;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          background: var(--background-secondary);
          color: var(--text-primary);
        }
        h2, h3 {
          color: var(--text-primary);
          margin: 0 0 1rem;
        }
        .loading-placeholder {
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--background-tertiary);
          border-radius: 8px;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
};

export default SystemMonitorDashboard;
