'use client';;
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
      <Loader2 className="mb-4 animate-spin" size={spinnerSize} />
      <p className="text-center font-medium text-gray-600">{message}</p>
    </div>
  );
}

/**
 * Card fallback component with shimmer effect
 */
export function CardFallback({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array?.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse overflow-hidden rounded-lg border border-gray-200 shadow-sm"
          aria-hidden="true"
        >
          <div className="h-48 bg-gray-200" />
          <div className="space-y-3 p-4">
            <div className="h-5 w-2/3 rounded bg-gray-200" />
            <div className="h-4 w-4/5 rounded bg-gray-200" />
            <div className="h-4 w-1/2 rounded bg-gray-200" />
          </div>
          <div className="border-t border-gray-100 p-4">
            <div className="h-8 w-1/3 rounded bg-gray-200" />
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
    <div className="animate-pulse overflow-hidden rounded-lg border border-gray-200">
      <div className="bg-gray-50 p-4">
        <div className="h-6 w-1/4 rounded bg-gray-200" />
      </div>
      <div className="divide-y divide-gray-200">
        {Array?.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex space-x-4 p-4">
            {Array?.from({ length: columns }).map((_, colIndex) => (
              <div
                key={colIndex}
                className="h-5 rounded bg-gray-200"
                style={{ width: `${Math?.floor(Math?.random() * 30) + 10}%` }}
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
    <div className="animate-pulse space-y-6">
      <div className="flex items-center space-x-4">
        <div className="h-16 w-16 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-1/3 rounded bg-gray-200" />
          <div className="h-4 w-1/4 rounded bg-gray-200" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-5/6 rounded bg-gray-200" />
        <div className="h-4 w-4/6 rounded bg-gray-200" />
      </div>
      <div className="h-10 w-1/4 rounded bg-gray-200" />
    </div>
  );
}
