"use client";

import Link from 'next/link';
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">Error</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">
            We're sorry, but an unexpected error has occurred. Our team has been notified.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Try Again
            </button>
            <Link 
              href="/"
              className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Go Home
            </Link>
          </div>
          {error.digest && (
            <p className="mt-4 text-xs text-gray-500">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
