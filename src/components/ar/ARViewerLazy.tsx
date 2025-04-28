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
    <div className="flex h-full min-h-[200px] w-full items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        <Skeleton className="h-8 w-3/4 rounded-md" />
        <Skeleton className="h-32 w-full rounded-md" />
        <Skeleton className="h-8 w-1/2 rounded-md" />
      </div>
    </div>
  );
}
