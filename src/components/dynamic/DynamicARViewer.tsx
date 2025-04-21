import React, { Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import the AR components with no SSR
// This significantly reduces the initial bundle size
const AdaptiveARViewer = dynamic(
  () => import('@/components/ar/AdaptiveARViewer').then(mod => ({ default: mod.AdaptiveARViewer })),
  {
    ssr: false,
    loading: () => <ARViewerSkeleton />,
  }
);

// Optional components that may be needed depending on use case
const OptimizedModelLoader = dynamic(
  () =>
    import('@/components/ar/OptimizedModelLoader').then(mod => ({
      default: mod.OptimizedModelLoader,
    })),
  { ssr: false }
);

// Loading skeleton for AR viewer
function ARViewerSkeleton() {
  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
      <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Skeleton className="h-8 w-8 rounded-full mb-2" />
          <div className="text-sm text-gray-500">Loading AR Experience...</div>
        </div>
      </div>
    </div>
  );
}

interface ARErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

// Error fallback component for AR viewer
function ARErrorFallback({ error, resetErrorBoundary }: ARErrorFallbackProps) {
  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden bg-gray-50 border border-red-200">
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        <div className="text-red-500 text-lg font-medium mb-2">Something went wrong</div>
        <div className="text-sm text-gray-600 mb-4 text-center">
          {error.message ||
            'Failed to load AR experience. Your device may not support AR features.'}
        </div>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

// Performance monitoring for AR components - loaded only when AR is active
const ARPerformanceMonitor = dynamic(
  () =>
    import('@/components/ar/ARResourceMonitor').then(mod => ({ default: mod.ARResourceMonitor })),
  { ssr: false }
);

export interface DynamicARViewerProps {
  /** ID of the model to display */
  modelId: string;
  /** Optional className for the container */
  className?: string;
  /** Whether to prioritize battery over quality on mobile */
  prioritizeBattery?: boolean;
  /** Whether to enable progressive loading */
  enableProgressiveLoading?: boolean;
  /** Whether to show performance monitoring */
  showPerformanceStats?: boolean;
  /** Callback when the model is loaded */
  onModelLoaded?: () => void;
  /** Callback when a performance warning occurs */
  onPerformanceWarning?: (metrics: any) => void;
  /** Error handler callback */
  onError?: (error: Error) => void;
  /** Canvas height */
  height?: string | number;
  /** Canvas width */
  width?: string | number;
}

/**
 * DynamicARViewer - A dynamically loaded AR viewer component
 *
 * This component uses code splitting to only load AR-related code when needed,
 * significantly reducing the initial bundle size for users who don't use AR features.
 *
 * @example
 * ```tsx
 * <DynamicARViewer
 *   modelId="lipstick-red"
 *   prioritizeBattery={true}
 * />
 * ```
 */
export function DynamicARViewer(props: DynamicARViewerProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Error handling for AR component
  const handleError = (error: Error) => {
    setHasError(true);
    setError(error);
    props.onError?.(error);
  };

  // Reset error state
  const resetErrorBoundary = () => {
    setHasError(false);
    setError(null);
  };

  // If there's an error, show the error fallback
  if (hasError && error) {
    return <ARErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />;
  }

  return (
    <Suspense fallback={<ARViewerSkeleton />}>
      <ErrorBoundary onError={handleError}>
        <AdaptiveARViewer {...props} />
      </ErrorBoundary>
    </Suspense>
  );
}

// Simple error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: (error: Error) => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return null; // The parent component will show the error UI
    }

    return this.props.children;
  }
}
