import React from 'react';
import { cn } from '@/lib/utils';

interface VisuallyHiddenProps {
  children: React?.ReactNode;
  className?: string;
  asChild?: boolean;
}

/**
 * VisuallyHidden - Hides content visually but keeps it accessible to screen readers
 * This is a more semantic way to hide content than using sr-only utility classes
 */
export function VisuallyHidden({ children, className, asChild = false }: VisuallyHiddenProps) {
  const Comp = asChild ? React?.Fragment : 'span';

  return (
    <Comp
      className={cn(
        'absolute -m-[1px] h-[1px] w-[1px] overflow-hidden p-0',
        'clip-rect-0 border-0',
        'whitespace-nowrap',
        className,
      )}
    >
      {children}
    </Comp>
  );
}
