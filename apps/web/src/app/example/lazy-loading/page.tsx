import React, { useState } from 'react';
import { withLazyLoading } from '@/utils/lazyLoad';

// Load these components lazily
const LazyResourceDetail = React.lazy(() => import('@/components/resource-detail-template'));
const LazyEventCalendar = React.lazy(() => import('@/components/events-calendar'));

// Or using our HOC
const LazyNotifications = withLazyLoading(
  () => import('@/components/notifications/NotificationCenter'),
export default function LazyLoadingExample() {
  const [showResourceDetail, setShowResourceDetail] = useState(false);
  const [showEventCalendar, setShowEventCalendar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Lazy Loading Example</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <button
          onClick={() => setShowResourceDetail(!showResourceDetail)}
          className="rounded bg-blue-500 p-3 text-white transition-colors hover:bg-blue-600"
        >
          {showResourceDetail ? 'Hide' : 'Show'} Resource Detail
        </button>

        <button
          onClick={() => setShowEventCalendar(!showEventCalendar)}
          className="rounded bg-green-500 p-3 text-white transition-colors hover:bg-green-600"
        >
          {showEventCalendar ? 'Hide' : 'Show'} Event Calendar
        </button>

        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="rounded bg-purple-500 p-3 text-white transition-colors hover:bg-purple-600"
        >
          {showNotifications ? 'Hide' : 'Show'} Notifications
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {showResourceDetail && (
          <div className="rounded border p-4 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Resource Detail (Lazy Loaded)</h2>
            <React.Suspense
              fallback={<div className="h-64 animate-pulse rounded bg-gray-200"></div>}
            >
              <LazyResourceDetail
                title="Sample Resource"
                description="This component was lazy loaded"
                type="guide"
                author="Jane Doe"
                datePublished="2023-05-15"
              />
            </React.Suspense>
          </div>
        )}

        {showEventCalendar && (
          <div className="rounded border p-4 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Event Calendar (Lazy Loaded)</h2>
            <React.Suspense
              fallback={<div className="h-64 animate-pulse rounded bg-gray-200"></div>}
            >
              <LazyEventCalendar />
            </React.Suspense>
          </div>
        )}

        {showNotifications && (
          <div className="rounded border p-4 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Notifications (Lazy Loaded with HOC)</h2>
            <LazyNotifications />
          </div>
        )}
      </div>

      <div className="mt-8 rounded bg-gray-100 p-4">
        <h2 className="mb-2 text-lg font-semibold">Implementation Notes:</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Components are only loaded when they are needed (when buttons are clicked)</li>
          <li>Loading states are shown while components are being fetched</li>
          <li>This reduces initial bundle size and improves performance</li>
          <li>
            There are two ways to implement lazy loading shown here:
            <ol className="mt-2 list-decimal pl-5">
              <li>Using React.lazy directly with Suspense</li>
              <li>Using our custom withLazyLoading HOC that handles Suspense for you</li>
            </ol>
          </li>
        </ul>
      </div>
    </div>
