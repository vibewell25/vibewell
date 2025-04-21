import React from 'react';

interface SkeletonLoaderProps {
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ count = 1, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse bg-gray-200 rounded-lg p-4">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-300 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
};
