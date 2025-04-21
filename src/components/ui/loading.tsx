import React from 'react';
import type { DynamicOptionsLoadingProps } from 'next/dynamic';

export function Loading({ error, isLoading, pastDelay }: DynamicOptionsLoadingProps) {
  if (error) {
    return (
      <div className="flex items-center justify-center p-4 text-red-500">
        Error loading component: {error.message}
      </div>
    );
  }

  if (!isLoading || !pastDelay) {
    return null;
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

export default Loading;
