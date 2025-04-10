import React from 'react';
import { cn } from '@/lib/utils';

interface VisuallyHiddenProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

/**
 * VisuallyHidden - Hides content visually but keeps it accessible to screen readers
 * This is a more semantic way to hide content than using sr-only utility classes
 */
export function VisuallyHidden({
  children,
  className,
  asChild = false,
}: VisuallyHiddenProps) {
  const Comp = asChild ? React.Fragment : 'span';
  
  return (
    <Comp
      className={cn(
        'absolute w-[1px] h-[1px] p-0 -m-[1px] overflow-hidden',
        'clip-rect-0 border-0',
        'whitespace-nowrap',
        className
      )}
    >
      {children}
    </Comp>
  );
} 