import { Suspense } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import {
  EventManagement,
  EventOrganizerDashboard,
  EventMaterialsAgenda,
  EventAnalytics
} from '@/utils/dynamicImports';

interface EventDashboardProps {
  eventId: string;
}

export const EventDashboard: React.FC<EventDashboardProps> = ({ eventId }) => {
  return (
    <div className="event-dashboard">
      <h1>Event Dashboard</h1>
      
      <div className="dashboard-grid">
        {/* Each section is wrapped in Suspense for independent loading */}
        <section className="management">
          <Suspense fallback={<LoadingSpinner />}>
            <EventManagement eventId={eventId} />
          </Suspense>
        </section>

        <section className="organizer">
          <Suspense fallback={<LoadingSpinner />}>
            <EventOrganizerDashboard eventId={eventId} />
          </Suspense>
        </section>

        <section className="materials">
          <Suspense fallback={<LoadingSpinner />}>
            <EventMaterialsAgenda eventId={eventId} />
          </Suspense>
        </section>

        <section className="analytics">
          <Suspense fallback={<LoadingSpinner />}>
            <EventAnalytics eventId={eventId} />
          </Suspense>
        </section>
      </div>

      <style jsx>{`
        .event-dashboard {
          padding: 2rem;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }

        section {
          background: var(--background-secondary);
          border-radius: 8px;
          padding: 1.5rem;
          min-height: 300px;
        }
      `}</style>
    </div>
  );
}; 