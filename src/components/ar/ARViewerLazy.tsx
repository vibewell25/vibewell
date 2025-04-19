import React, { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load the heavy component
const ARViewer = lazy(() => import('./ARViewer'));

// Props type should match the underlying component
type ARViewerProps = React.ComponentProps<typeof ARViewer>;

/**
 * Lazy-loaded version of ARViewer
 * This component will only be loaded when it's needed, reducing initial bundle size
 */
export function ARViewerLazy(props: ARViewerProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ARViewer {...props} />
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
