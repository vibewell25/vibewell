'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface FallbackProps {
  message?: string;
  className?: string;
  spinnerSize?: number;
}

/**
 * Fallback component to display during loading states
 */
export function Fallback({
  message = 'Loading...',
  className = '',
  spinnerSize = 24,
}: FallbackProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <Loader2 className="animate-spin mb-4" size={spinnerSize} />
      <p className="text-gray-600 text-center font-medium">{message}</p>
    </div>
  );
}

/**
 * Card fallback component with shimmer effect
 */
export function CardFallback({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg border border-gray-200 shadow-sm overflow-hidden animate-pulse"
          aria-hidden="true"
        >
          <div className="h-48 bg-gray-200" />
          <div className="p-4 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-200 rounded w-4/5" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
          <div className="p-4 border-t border-gray-100">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * Table fallback component with shimmer effect
 */
export function TableFallback({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden animate-pulse">
      <div className="bg-gray-50 p-4">
        <div className="h-6 bg-gray-200 rounded w-1/4" />
      </div>
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4 flex space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={colIndex}
                className="h-5 bg-gray-200 rounded"
                style={{ width: `${Math.floor(Math.random() * 30) + 10}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Profile fallback component with shimmer effect
 */
export function ProfileFallback() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="h-16 w-16 rounded-full bg-gray-200" />
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
      </div>
      <div className="h-10 bg-gray-200 rounded w-1/4" />
    </div>
  );
}
