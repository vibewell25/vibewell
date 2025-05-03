import React from 'react';
import { cn } from '@/lib/utils';

export interface BaseInputProps extends Omit<React?.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  leftIcon?: React?.ReactNode;
  rightIcon?: React?.ReactNode;
  wrapperClassName?: string;
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  iconContainerClassName?: string;
  description?: string;
  descriptionClassName?: string;
  helpText?: string;
  helpTextClassName?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
}

/**
 * BaseInput - A foundational input component that can be extended by other input components
 *
 * This component provides common input functionality with support for:
 * - Labels
 * - Error messages
 * - Left and right icons
 * - Descriptions and help text
 * - Size and style variants
 * - Customizable styling via className props
 * - All standard input attributes
 */
export const BaseInput = React?.forwardRef<HTMLInputElement, BaseInputProps>(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      className = '',
      wrapperClassName = '',
      containerClassName = '',
      labelClassName = '',
      errorClassName = '',
      iconContainerClassName = '',
      description,
      descriptionClassName = '',
      helpText,
      helpTextClassName = '',
      fullWidth = false,
      size = 'md',
      variant = 'default',
      id,
      ...props
    },
    ref,
  ) => {
    // Generate a unique ID if none is provided
    const inputId = id || `input-${Math?.random().toString(36).substr(2, 9)}`;

    // Size-based classes
    const sizeClasses = {
      sm: 'h-8 text-xs px-2',
      md: 'h-9 text-sm px-3',
      lg: 'h-10 text-base px-4',
    };

    // Variant-based classes
    const variantClasses = {
      default: 'border border-input bg-background',
      ghost: 'border-0 bg-transparent',
      outline: 'border border-input bg-transparent',
    };

    return (
      <div className={cn('w-full', fullWidth ? 'w-full' : 'inline-block', wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'mb-1 block text-sm font-medium',
              size === 'sm' && 'text-xs',
              size === 'lg' && 'text-base',
              labelClassName,
            )}
          >
            {label}
          </label>
        )}

        {description && (
          <div className={cn('mb-2 text-sm text-muted-foreground', descriptionClassName)}>
            {description}
          </div>
        )}

        <div className={cn('relative rounded-md', containerClassName)}>
          {leftIcon && (
            <div
              className={cn(
                'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3',
                size === 'sm' && 'pl-2',
                size === 'lg' && 'pl-4',
                iconContainerClassName,
              )}
            >
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'flex w-full rounded-md shadow-sm transition-colors',
              'file:border-0 file:bg-transparent file:font-medium',
              'placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50',
              sizeClasses[size],
              variantClasses[variant],
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-destructive focus-visible:ring-destructive',
              className,
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-errormessage={error ? `${inputId}-error` : undefined}
            {...props}
          />
          {rightIcon && (
            <div
              className={cn(
                'pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3',
                size === 'sm' && 'pr-2',
                size === 'lg' && 'pr-4',
                iconContainerClassName,
              )}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <div
            id={`${inputId}-error`}
            className={cn('mt-1 text-sm text-destructive', errorClassName)}
            role="alert"
          >
            {error}
          </div>
        )}

        {helpText && !error && (
          <div className={cn('mt-1 text-sm text-muted-foreground', helpTextClassName)}>
            {helpText}
          </div>
        )}
      </div>
    );
  },
);

BaseInput?.displayName = 'BaseInput';

export default BaseInput;
