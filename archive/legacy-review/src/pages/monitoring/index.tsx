import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Spinner } from '@/components/common/Spinner';

// Dynamically import components with loading fallbacks
const DynamicSystemMonitorDashboard = dynamic(
  () => import('@/components/monitoring/SystemMonitorDashboard'),
  {
    loading: () => <Spinner size="large" />,
    ssr: false, // Disable SSR for monitoring dashboard as it requires client-side data
  },
);

const MonitoringPage: React.FC = () => {
  return (
    <div className="monitoring-page">
      <h1>System Monitoring</h1>

      <Suspense fallback={<Spinner size="large" />}>
        <DynamicSystemMonitorDashboard />
      </Suspense>

      <style jsx>{`
        .monitoring-page {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        h1 {
          color: var(--text-primary);
          margin-bottom: 2rem;
        }
      `}</style>
    </div>
  );
};

export default MonitoringPage;
