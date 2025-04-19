import React, { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load the heavy component
const EventCalendar = lazy(() => import('./EventCalendar'));

// Props type should match the underlying component
type EventCalendarProps = React.ComponentProps<typeof EventCalendar>;

/**
 * Lazy-loaded version of EventCalendar
 * This component will only be loaded when it's needed, reducing initial bundle size
 */
export function EventCalendarLazy(props: EventCalendarProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EventCalendar {...props} />
    </Suspense>
  );
}

// Loading fallback UI
function LoadingFallback() {
  return (
    <div className="w-full h-full min-h-[200px] flex items-center justify-center">
      <div className="space-y-4 w-full max-w-md">
        <Skeleton className="h-8 w-3/4 rounded-md" />
        <Skeleton className="h-32 w-full rounded-md" />
        <Skeleton className="h-8 w-1/2 rounded-md" />
      </div>
    </div>
  );
}
