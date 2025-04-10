import React from 'react';
import { cn } from '@/lib/utils';

interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

/**
 * ScreenReaderOnly - Content that is only available to screen readers
 * A more semantic wrapper around the sr-only utility class
 */
export function ScreenReaderOnly({
  children,
  className,
  as: Component = 'span',
}: ScreenReaderOnlyProps) {
  return (
    <Component 
      className={cn(
        'sr-only',
        className
      )}
    >
      {children}
    </Component>
  );
} 