'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/Button';
import { ARViewerLazy } from '@/components/ar/ARViewerLazy';
import { EventCalendarLazy } from '@/components/event-calendar/EventCalendarLazy';

export default function LazyLoadingDemo() {
  const [showComponents, setShowComponents] = useState(false);

  // Sample events for the calendar
  const events = [
    {
      id: '1',
      title: 'Client Consultation',
      date: new Date(2023, 5, 15),
      time: '10:00 AM',
      description: 'Initial consultation with new client',
      type: 'appointment',
    },
    {
      id: '2',
      title: 'Team Meeting',
      date: new Date(2023, 5, 15),
      time: '2:00 PM',
      description: 'Weekly team sync',
      type: 'meeting',
    },
    {
      id: '3',
      title: 'Yoga Class',
      date: new Date(2023, 5, 17),
      time: '8:00 AM',
      description: 'Morning yoga session',
      type: 'class',
    },
  ];

  return (
    <div className="container mx-auto py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold">Lazy Loading Components Demo</h1>

        <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h2 className="mb-3 text-xl font-semibold">About This Demo</h2>
          <p className="mb-4">
            This page demonstrates lazy loading of heavy components. The components below will only
            be loaded when they're needed, reducing the initial page load time.
          </p>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowComponents(!showComponents)}
              variant={showComponents ? 'destructive' : 'default'}
            >
              {showComponents ? 'Hide Components' : 'Load Components'}
            </Button>
            <p className="text-sm text-gray-600">
              {showComponents
                ? 'Components are now loaded. Notice how they appeared with a loading state.'
                : 'Click to load the heavy components.'}
            </p>
          </div>
        </div>

        {showComponents && (
          <Tabs defaultValue="ar-viewer">
            <TabsList className="mb-4">
              <TabsTrigger value="ar-viewer">AR Viewer</TabsTrigger>
              <TabsTrigger value="event-calendar">Event Calendar</TabsTrigger>
            </TabsList>

            <TabsContent value="ar-viewer" className="rounded-lg border p-4">
              <h2 className="mb-4 text-xl font-semibold">AR Viewer Component</h2>
              <p className="mb-4">This component uses Three.js to render 3D models:</p>
              <ARViewerLazy
                modelUrl="https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/vase-09/model.gltf"
                autoRotate={true}
              />
            </TabsContent>

            <TabsContent value="event-calendar" className="rounded-lg border p-4">
              <h2 className="mb-4 text-xl font-semibold">Event Calendar Component</h2>
              <p className="mb-4">This calendar component handles events and date selection:</p>
              <EventCalendarLazy
                events={events}
                onEventClick={(event) => alert(`Event clicked: ${event.title}`)}
              />
            </TabsContent>
          </Tabs>
        )}

        <div className="mt-12 rounded-lg border bg-gray-50 p-6">
          <h2 className="mb-3 text-xl font-semibold">Implementation Details</h2>
          <p className="mb-2">
            These components are loaded using React's <code>lazy()</code> and <code>Suspense</code>:
          </p>
          <pre className="mb-4 overflow-x-auto rounded-md bg-gray-900 p-4 text-white">
            {`// Lazy loading implementation
import { lazy, Suspense } from 'react';

const ARViewer = lazy(() => import('./ARViewer'));

function ARViewerLazy(props) {
  return (
    <Suspense fallback={<LoadingState />}>
      <ARViewer {...props} />
    </Suspense>
  );
}`}
          </pre>
          <p>
            Benefits include smaller initial bundle size, faster initial page load, and on-demand
            loading of heavy components only when they're needed.
          </p>
        </div>
      </div>
    </div>
  );
}
