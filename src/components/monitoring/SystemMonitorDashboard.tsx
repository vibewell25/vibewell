import React, { useEffect, useState } from 'react';
import performanceMonitor from '@/utils/performanceMonitor';
import dynamic from 'next/dynamic';
import { MetricDataPoint } from './SystemMetricsChart';

const DynamicGaugeChart = dynamic(() => import('./GaugeChart'), {
  ssr: false,
  loading: () => <div>Loading gauge...</div>,
});

const DynamicSystemMetricsChart = dynamic(() => import('./SystemMetricsChart'), {
  ssr: false,
  loading: () => <div>Loading metrics chart...</div>,
});

const DynamicAlertList = dynamic(() => import('./AlertList'), {
  ssr: false,
  loading: () => <div>Loading alerts...</div>,
});

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkHealth: number;
}

const SystemMonitorDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkHealth: 100,
  });
  const [historicalData, setHistoricalData] = useState<MetricDataPoint[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d'>('24h');
  const [selectedMetrics, setSelectedMetrics] = useState<Array<keyof SystemMetrics>>([
    'cpuUsage',
    'memoryUsage',
    'diskUsage',
    'networkHealth',
  ]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const cpuUsage = await performanceMonitor.getCPUUsage();
        const memoryUsage = await performanceMonitor.getMemoryUsage();
        const diskUsage = await performanceMonitor.getDiskUsage();
        const networkHealth = await performanceMonitor.getNetworkHealth();

        const currentMetrics = {
          cpuUsage,
          memoryUsage,
          diskUsage,
          networkHealth,
        };

        setMetrics(currentMetrics);

        // Update historical data
        setHistoricalData((prevData) => {
          const newDataPoint: MetricDataPoint = {
            timestamp: Date.now(),
            ...currentMetrics,
          };

          // Keep last 24 hours of minute data, or 7 days of hourly data
          const maxDataPoints =
            selectedTimeRange === '1h' ? 60 : selectedTimeRange === '24h' ? 1440 : 168;
          const newData = [...prevData, newDataPoint];
          return newData.slice(-maxDataPoints);
        });

        // Get active alerts
        const activeAlerts = performanceMonitor.getActiveAlerts();
        setAlerts(activeAlerts);
      } catch (error) {
        console.error('Error fetching system metrics:', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [selectedTimeRange]);

  const getAlertSeverity = (value: number, threshold: number): 'low' | 'medium' | 'high' => {
    if (value >= threshold * 0.9) return 'high';
    if (value >= threshold * 0.7) return 'medium';
    return 'low';
  };

  const handleDismissAlert = (alertId: string) => {
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== alertId));
  };

  const handleMetricToggle = (metric: keyof SystemMetrics) => {
    setSelectedMetrics((prev) =>
      prev.includes(metric) ? prev.filter((m) => m !== metric) : [...prev, metric],
    );
  };

  return (
    (<div className="system-monitor">
      <h2>System Health Monitor</h2>
      <div className="controls">
        <div className="time-range-selector">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as '1h' | '24h' | '7d')}
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
            value={metrics.cpuUsage}
            maxValue={100}
            label="CPU"
            severity={getAlertSeverity(metrics.cpuUsage, 80)}
          />
        </div>

        <div className="metric-card">
          <h3>Memory Usage</h3>
          <DynamicGaugeChart
            value={metrics.memoryUsage}
            maxValue={100}
            label="Memory"
            severity={getAlertSeverity(metrics.memoryUsage, 80)}
          />
        </div>

        <div className="metric-card">
          <h3>Disk Usage</h3>
          <DynamicGaugeChart
            value={metrics.diskUsage}
            maxValue={100}
            label="Disk"
            severity={getAlertSeverity(metrics.diskUsage, 80)}
          />
        </div>

        <div className="metric-card">
          <h3>Network Health</h3>
          <DynamicGaugeChart
            value={metrics.networkHealth}
            maxValue={100}
            label="Network"
            severity={getAlertSeverity(100 - metrics.networkHealth, 50)}
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

        h2,
        h3 {
          color: var(--text-primary);
          margin: 0 0 1rem;
        }
      `}</style>
    </div>)
  );
};

export default SystemMonitorDashboard;
