import React from 'react';
import { cn } from '@/lib/utils';

interface SkipLinkProps {
  className?: string;
  targetId?: string;
}

/**
 * SkipLink - Provides keyboard users a way to skip navigation
 * and jump directly to the main content
 */
export function SkipLink({
  className,
  targetId = 'main-content',
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground',
        'focus:outline-none focus:ring-2 focus:ring-primary',
        className
      )}
    >
      Skip to main content
    </a>
  );
} 