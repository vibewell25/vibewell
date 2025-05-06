'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Skeleton variant types
 */
export type SkeletonVariant = 
  | 'text' 
  | 'avatar' 
  | 'button' 
  | 'card' 
  | 'image' 
  | 'table-row'
  | 'input'
  | 'circle'
  | 'rectangle';

/**
 * Base skeleton component properties
 */
export interface SkeletonProps {
  /** Custom CSS class names */
  className?: string;
  /** Variant of skeleton to display */
  variant?: SkeletonVariant;
  /** Width of the skeleton (can be number for px or string for custom units) */
  width?: number | string;
  /** Height of the skeleton (can be number for px or string for custom units) */
  height?: number | string;
  /** Whether the skeleton should animate */
  animate?: boolean;
  /** Number of items to repeat (for collections) */
  count?: number;
  /** Whether to render in a circle shape */
  circle?: boolean;
  /** Whether to use a rounded shape */
  rounded?: boolean;
  /** Custom inline styles */
  style?: React.CSSProperties;
}

/**
 * Single skeleton item
 */
const SkeletonItem: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangle',
  width,
  height,
  animate = true,
  circle = false,
  rounded = true,
  style = {},
}) => {
  // Default dimensions based on variant
  const getDefaultDimensions = () => {
    switch (variant) {
      case 'text':
        return { width: width || '100%', height: height || 16 };
      case 'avatar':
        return { width: width || 48, height: height || 48 };
      case 'button':
        return { width: width || 80, height: height || 36 };
      case 'card':
        return { width: width || '100%', height: height || 120 };
      case 'image':
        return { width: width || '100%', height: height || 200 };
      case 'table-row':
        return { width: width || '100%', height: height || 40 };
      case 'input':
        return { width: width || '100%', height: height || 40 };
      case 'circle':
        return { width: width || 40, height: height || 40 };
      case 'rectangle':
      default:
        return { width: width || 100, height: height || 20 };
    }
  };

  const dimensions = getDefaultDimensions();
  const finalWidth = typeof dimensions.width === 'number' ? `${dimensions.width}px` : dimensions.width;
  const finalHeight = typeof dimensions.height === 'number' ? `${dimensions.height}px` : dimensions.height;

  const variantClasses = {
    'text': 'rounded-md',
    'avatar': 'rounded-full',
    'button': 'rounded-md',
    'card': 'rounded-lg',
    'image': 'rounded-md',
    'table-row': 'rounded-sm',
    'input': 'rounded-md',
    'circle': 'rounded-full',
    'rectangle': rounded ? 'rounded-md' : '',
  };

  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-700',
        animate && 'animate-pulse',
        variantClasses[variant],
        circle && 'rounded-full',
        className
      )}
      style={{
        width: finalWidth,
        height: finalHeight,
        ...style,
      }}
      aria-hidden="true"
    />
  );
};

/**
 * Skeleton loader component
 * 
 * Displays placeholder loaders for content that is still loading
 * 
 * @example
 * ```tsx
 * // Simple text skeleton
 * <Skeleton variant="text" />
 * 
 * // Custom dimensions
 * <Skeleton width={200} height={30} />
 * 
 * // Multiple items
 * <Skeleton count={3} className="mb-2" />
 * 
 * // Avatar skeleton
 * <Skeleton variant="avatar" />
 * 
 * // Circle shape
 * <Skeleton circle width={50} height={50} />
 * ```
 */
export const Skeleton: React.FC<SkeletonProps> = ({ count = 1, ...props }) => {
  if (count === 1) {
    return <SkeletonItem {...props} />;
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonItem key={index} {...props} />
      ))}
    </div>
  );
};

/**
 * Text content skeleton with multiple lines
 */
export const TextSkeleton: React.FC<{
  lines?: number;
  className?: string;
  lastLineWidth?: number | string;
}> = ({ lines = 3, className, lastLineWidth = '70%' }) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines - 1 }).map((_, index) => (
        <Skeleton key={index} variant="text" />
      ))}
      <Skeleton 
        variant="text" 
        width={lastLineWidth} 
      />
    </div>
  );
};

/**
 * Card skeleton for content cards
 */
export const CardSkeleton: React.FC<{
  imageHeight?: number;
  hasImage?: boolean;
  hasFooter?: boolean;
  className?: string;
}> = ({ 
  imageHeight = 200, 
  hasImage = true, 
  hasFooter = true,
  className 
}) => {
  return (
    <div className={cn('rounded-lg border border-gray-200 overflow-hidden', className)}>
      {hasImage && (
        <Skeleton variant="image" height={imageHeight} rounded={false} />
      )}
      <div className="p-4 space-y-4">
        <Skeleton variant="text" width="60%" />
        <TextSkeleton lines={2} />
        
        {hasFooter && (
          <div className="pt-2 flex justify-between items-center">
            <Skeleton variant="button" width={100} />
            <Skeleton variant="circle" width={32} height={32} />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Table skeleton for table content
 */
export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
  hasHeader?: boolean;
  className?: string;
}> = ({
  rows = 5,
  columns = 4,
  hasHeader = true,
  className
}) => {
  return (
    <div className={cn('w-full', className)}>
      {hasHeader && (
        <div className="flex gap-4 pb-4 border-b border-gray-200 mb-3">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton 
              key={`header-${i}`} 
              width={`${100 / columns}%`} 
              height={24} 
            />
          ))}
        </div>
      )}
      
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={`row-${rowIdx}`} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton 
              key={`cell-${rowIdx}-${colIdx}`} 
              width={`${100 / columns}%`} 
              height={20} 
            />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Profile skeleton for user profiles
 */
export const ProfileSkeleton: React.FC<{
  className?: string;
}> = ({ className }) => {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center gap-4">
        <Skeleton variant="avatar" width={64} height={64} />
        <div className="space-y-2">
          <Skeleton variant="text" width={150} />
          <Skeleton variant="text" width={100} />
        </div>
      </div>
      
      <TextSkeleton lines={4} />
      
      <div className="flex gap-3">
        <Skeleton variant="button" />
        <Skeleton variant="button" />
      </div>
    </div>
  );
};

/**
 * Product skeleton for e-commerce items
 */
export const ProductSkeleton: React.FC<{
  className?: string;
}> = ({ className }) => {
  return (
    <div className={cn('space-y-4', className)}>
      <Skeleton variant="image" height={300} />
      
      <div className="space-y-3">
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width={120} />
        
        <div className="flex items-center gap-2 pt-2">
          <Skeleton variant="circle" width={20} height={20} />
          <Skeleton variant="circle" width={20} height={20} />
          <Skeleton variant="circle" width={20} height={20} />
        </div>
        
        <Skeleton variant="button" width={150} />
      </div>
    </div>
  );
};

export default Skeleton; 