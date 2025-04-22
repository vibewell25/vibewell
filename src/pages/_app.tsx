import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Route-based code splitting
const AccessibilityPage = dynamic(() => import('./AccessibilityPage'), {
  loading: () => <LoadingSpinner />
});

const BookingPage = dynamic(() => import('./booking'), {
  loading: () => <LoadingSpinner />
});

function MyApp({ Component, pageProps, router }: AppProps) {
  // Wrap the component with Suspense for smooth loading transitions
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Component {...pageProps} />
    </Suspense>
  );
}

export default MyApp; 