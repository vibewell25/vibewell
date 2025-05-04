'use client';

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 rounded-md px-3 text-xs',
        md: 'h-9 rounded-md px-4 py-2',
        lg: 'h-10 rounded-md px-6 py-2',
        icon: 'h-9 w-9 p-0',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      fullWidth: false,
    },
  },
);

export interface BaseButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  iconClassName?: string;
  wrapperClassName?: string;
  children?: React.ReactNode;
}

/**
 * BaseButton - A foundational button component that can be extended by other button components
 *
 * This component provides common button functionality with support for:
 * - Multiple visual variants (primary, secondary, outline, ghost, etc.)
 * - Multiple sizes
 * - Loading state
 * - Left and right icons
 * - Full width option
 * - Custom styling via className props
 * - All standard button attributes
 * - Can render as a child component with asChild
 */
export const BaseButton = React.forwardRef<HTMLButtonElement, BaseButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      leftIcon,
      rightIcon,
      isLoading = false,
      loadingText,
      iconClassName = '',
      wrapperClassName = '',
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    // If button is a child component
    const Comp = asChild ? Slot : 'button';

    // Determine if button should be disabled (either from props or loading state)
    const isDisabled = disabled || isLoading;

    // Create loading spinner element
    const LoadingSpinner = () => (
      <svg
        className={cn('-ml-1 mr-2 h-4 w-4 animate-spin', iconClassName)}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    );

    // Render the content
    const renderContent = () => {
      if (isLoading && loadingText) {
        return loadingText;
      }
      return children;
    };

    return (
      <div className={cn(fullWidth && 'w-full', wrapperClassName)}>
        <Comp
          className={cn(buttonVariants({ variant, size, fullWidth, className }))}
          ref={ref}
          disabled={isDisabled}
          {...props}
        >
          {isLoading && <LoadingSpinner />}
          {leftIcon && !isLoading && <span className={cn('mr-2', iconClassName)}>{leftIcon}</span>}
          {renderContent()}
          {rightIcon && <span className={cn('ml-2', iconClassName)}>{rightIcon}</span>}
        </Comp>
      </div>
    );
  },
);

BaseButton.displayName = 'BaseButton';

export { buttonVariants };
