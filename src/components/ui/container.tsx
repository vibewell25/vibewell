import React from 'react';
import { cn } from '@/lib/utils';

type MaxWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

interface ContainerProps {
  children: React?.ReactNode;
  maxWidth?: MaxWidth;
  className?: string;
}

const maxWidthClasses: Record<MaxWidth, string> = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full',
};

/**
 * Container - A simple container component for layout structure
 *
 * This component provides a simple container with configurable max-width
 * and padding settings for consistent layout.
 */
export function Container({ children, maxWidth = 'xl', className }: ContainerProps) {
  return (
    <div className={cn('container mx-auto px-4 md:px-6', maxWidthClasses[maxWidth], className)}>
      {children}
    </div>
  );
}
