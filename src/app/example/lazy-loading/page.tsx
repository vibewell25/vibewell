'use client';

import React, { useState } from 'react';
import { withLazyLoading } from '@/utils/lazyLoad';

// Load these components lazily
const LazyResourceDetail = React.lazy(() => import('@/components/resource-detail-template'));
const LazyEventCalendar = React.lazy(() => import('@/components/events-calendar'));

// Or using our HOC
const LazyNotifications = withLazyLoading(
  () => import('@/components/notifications/NotificationCenter')
);

export default function LazyLoadingExample() {
  const [showResourceDetail, setShowResourceDetail] = useState(false);
  const [showEventCalendar, setShowEventCalendar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Lazy Loading Example</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => setShowResourceDetail(!showResourceDetail)}
          className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {showResourceDetail ? 'Hide' : 'Show'} Resource Detail
        </button>

        <button
          onClick={() => setShowEventCalendar(!showEventCalendar)}
          className="p-3 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          {showEventCalendar ? 'Hide' : 'Show'} Event Calendar
        </button>

        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="p-3 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        >
          {showNotifications ? 'Hide' : 'Show'} Notifications
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {showResourceDetail && (
          <div className="border p-4 rounded shadow-md">
            <h2 className="text-xl font-semibold mb-4">Resource Detail (Lazy Loaded)</h2>
            <React.Suspense
              fallback={<div className="animate-pulse bg-gray-200 h-64 rounded"></div>}
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
          <div className="border p-4 rounded shadow-md">
            <h2 className="text-xl font-semibold mb-4">Event Calendar (Lazy Loaded)</h2>
            <React.Suspense
              fallback={<div className="animate-pulse bg-gray-200 h-64 rounded"></div>}
            >
              <LazyEventCalendar />
            </React.Suspense>
          </div>
        )}

        {showNotifications && (
          <div className="border p-4 rounded shadow-md">
            <h2 className="text-xl font-semibold mb-4">Notifications (Lazy Loaded with HOC)</h2>
            <LazyNotifications />
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Implementation Notes:</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Components are only loaded when they are needed (when buttons are clicked)</li>
          <li>Loading states are shown while components are being fetched</li>
          <li>This reduces initial bundle size and improves performance</li>
          <li>
            There are two ways to implement lazy loading shown here:
            <ol className="list-decimal pl-5 mt-2">
              <li>Using React.lazy directly with Suspense</li>
              <li>Using our custom withLazyLoading HOC that handles Suspense for you</li>
            </ol>
          </li>
        </ul>
      </div>
    </div>
  );
}
