import React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'destructive' | 'warning';
  label?: string;
  className?: string;
}

/**
 * Spinner - A loading indicator component
 * 
 * This component provides a customizable spinner for indicating loading states.
 */
export function Spinner({
  size = 'md',
  variant = 'default',
  label,
  className,
  ...props
}: SpinnerProps) {
  // Map sizes to Tailwind classes
  const sizeClasses = {
    'xs': 'h-3 w-3 border-[1.5px]',
    'sm': 'h-4 w-4 border-2',
    'md': 'h-6 w-6 border-2',
    'lg': 'h-8 w-8 border-[3px]',
    'xl': 'h-12 w-12 border-4',
  };

  // Map variants to Tailwind classes for border colors
  const variantClasses = {
    'default': 'border-muted-foreground/20 border-t-muted-foreground/80',
    'primary': 'border-primary/20 border-t-primary',
    'secondary': 'border-secondary/20 border-t-secondary',
    'success': 'border-green-200 border-t-green-600',
    'destructive': 'border-red-200 border-t-red-600',
    'warning': 'border-yellow-200 border-t-yellow-600',
  };

  // Combine the classes
  const spinnerClasses = cn(
    'animate-spin rounded-full',
    sizeClasses[size],
    variantClasses[variant],
    className
  );

  return (
    <div className="inline-flex items-center" {...props}>
      <div className={spinnerClasses} />
      {label && (
        <span className="ml-2 text-sm text-muted-foreground">{label}</span>
      )}
    </div>
  );
} 