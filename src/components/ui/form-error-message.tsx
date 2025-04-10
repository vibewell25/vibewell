import React from 'react';
import { cn } from '@/lib/utils';

interface FormErrorMessageProps {
  className?: string;
  id: string;
  children: React.ReactNode;
}

/**
 * FormErrorMessage - Displays form validation errors with proper
 * accessibility support for screen readers.
 */
export function FormErrorMessage({
  className,
  id,
  children,
}: FormErrorMessageProps) {
  if (!children) {
    return null;
  }

  return (
    <div 
      id={id}
      role="alert"
      className={cn(
        'text-destructive text-sm mt-1',
        className
      )}
    >
      {children}
    </div>
  );
} 