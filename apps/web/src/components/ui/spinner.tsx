import React from 'react';
import { cn } from '@/lib/utils';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The size of the spinner
   * @default "md"
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * The variant/color of the spinner
   * @default "default"
   */
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'destructive' | 'warning';
  
  /**
   * Optional label text to display next to the spinner
   */
  label?: string;
  
  /**
   * Optional custom class names
   */
  className?: string;
  
  /**
   * Show the spinner centered in a full container
   * @default false
   */
  fullCenter?: boolean;
  
  /**
   * Should the spinner be rendered with a Chakra-like wrapper
   * @default false
   */
  legacy?: boolean;
}

/**
 * Spinner - A unified loading indicator component
 *
 * This component provides a customizable spinner for indicating loading states
 * and replaces all other spinner implementations in the codebase.
 */
export function Spinner({
  size = 'md',
  variant = 'primary',
  label,
  className,
  fullCenter = false,
  legacy = false,
  ...props
}: SpinnerProps) {
  // Map sizes to Tailwind classes
  const sizeClasses = {
    xs: 'h-3 w-3 border-[1.5px]',
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-[3px]',
    xl: 'h-12 w-12 border-4',
  };

  // Map variants to Tailwind classes for border colors
  const variantClasses = {
    default: 'border-muted-foreground/20 border-t-muted-foreground/80',
    primary: 'border-primary/20 border-t-primary',
    secondary: 'border-secondary/20 border-t-secondary',
    success: 'border-green-200 border-t-green-600',
    destructive: 'border-red-200 border-t-red-600',
    warning: 'border-yellow-200 border-t-yellow-600',
  };

  // Combine the classes for the spinner
  const spinnerClasses = cn(
    'animate-spin rounded-full',
    sizeClasses[size],
    variantClasses[variant],
    className,
  );

  // Legacy mode for Chakra-like styling
  if (legacy) {
    return (
      <div
        className={cn(
          'flex flex-col justify-center items-center h-[300px] w-full',
          className
        )}
        {...props}
      >
        <div className={spinnerClasses} />
        {label && (
          <div className="mt-4 text-gray-500 text-md">{label}</div>
        )}
      </div>
    );
  }

  // Full center mode (fills parent container)
  if (fullCenter) {
    return (
      <div className="flex h-full items-center justify-center" {...props}>
        <div className={spinnerClasses} />
        {label ? (
          <span className="ml-2 text-sm text-muted-foreground">{label}</span>
        ) : (
          <span className="sr-only">Loading...</span>
        )}
      </div>
    );
  }

  // Default inline spinner
  return (
    <div className="inline-flex items-center" {...props}>
      <div className={spinnerClasses} />
      {label && <span className="ml-2 text-sm text-muted-foreground">{label}</span>}
    </div>
  );
}

// Aliases for backward compatibility
export { Spinner as LoadingSpinner };
export type LoadingSpinnerProps = SpinnerProps;

export default Spinner;
