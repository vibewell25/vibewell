'use client';

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva('rounded-lg border bg-card text-card-foreground shadow-sm', {
  variants: {
    variant: {
      default: 'border-border',
      outline: 'border-border bg-transparent',
      ghost: 'border-transparent bg-transparent shadow-none',
      elevated: 'border-transparent shadow-md',
    },
    padding: {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    },
    size: {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'w-full',
    },
    rounded: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full',
    },
  },
  defaultVariants: {
    variant: 'default',
    padding: 'md',
    size: 'md',
    rounded: 'lg',
  },
});

export interface BaseCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  header?: ReactNode;
  footer?: ReactNode;
  headerClassName?: string;
  footerClassName?: string;
  bodyClassName?: string;
  wrapperClassName?: string;
  isHoverable?: boolean;
  isClickable?: boolean;
  isCollapsible?: boolean;
  isCollapsed?: boolean;
  onCollapse?: () => void;
}

/**
 * BaseCard - A foundational card component that can be extended by other card components
 *
 * This component provides common card functionality with support for:
 * - Headers and footers
 * - Multiple visual variants
 * - Multiple sizes and padding options
 * - Rounded corners options
 * - Hoverable and clickable states
 * - Collapsible functionality
 * - Custom styling via className props
 * - All standard div attributes
 */
export const BaseCard = React.forwardRef<HTMLDivElement, BaseCardProps>(
  (
    {
      className,
      variant,
      padding,
      size,
      rounded,
      header,
      footer,
      headerClassName,
      footerClassName,
      bodyClassName,
      wrapperClassName,
      isHoverable = false,
      isClickable = false,
      isCollapsible = false,
      isCollapsed = false,
      onCollapse,
      children,
      ...props
    },
    ref
  ) => {
    // Handle collapse toggle
    const handleToggleCollapse = () => {
      if (isCollapsible && onCollapse) {
        onCollapse();
      }
    };

    return (
      <div className={cn(wrapperClassName)} ref={ref}>
        <div
          className={cn(
            cardVariants({ variant, padding, size, rounded }),
            isHoverable && 'transition-shadow hover:shadow-md',
            isClickable && 'cursor-pointer hover:shadow-md',
            className
          )}
          {...props}
        >
          {header && (
            <div
              className={cn(
                'flex items-center justify-between border-b px-4 py-3',
                headerClassName
              )}
            >
              <div className="flex-1">{header}</div>
              {isCollapsible && (
                <button
                  type="button"
                  onClick={handleToggleCollapse}
                  className="ml-2 rounded-md p-1 hover:bg-muted/50"
                  aria-expanded={!isCollapsed}
                  aria-label={isCollapsed ? 'Expand' : 'Collapse'}
                >
                  <svg
                    className={cn('h-4 w-4 transition-transform', isCollapsed && 'rotate-180')}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M18 15l-6-6-6 6"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          {!isCollapsed && (
            <div
              className={cn(
                'card-body',
                !header && !padding && 'pt-4',
                !footer && !padding && 'pb-4',
                bodyClassName
              )}
            >
              {children}
            </div>
          )}

          {footer && !isCollapsed && (
            <div className={cn('border-t px-4 py-3', footerClassName)}>{footer}</div>
          )}
        </div>
      </div>
    );
  }
);

BaseCard.displayName = 'BaseCard';

export interface BaseCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export const BaseCardHeader = React.forwardRef<HTMLDivElement, BaseCardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-4 py-3 border-b', className)} {...props} />
  )
);
BaseCardHeader.displayName = 'BaseCardHeader';

export interface BaseCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
export const BaseCardTitle = React.forwardRef<HTMLHeadingElement, BaseCardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-lg font-medium', className)} {...props} />
  )
);
BaseCardTitle.displayName = 'BaseCardTitle';

export interface BaseCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
export const BaseCardDescription = React.forwardRef<HTMLParagraphElement, BaseCardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
);
BaseCardDescription.displayName = 'BaseCardDescription';

export interface BaseCardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
export const BaseCardContent = React.forwardRef<HTMLDivElement, BaseCardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-4', className)} {...props} />
  )
);
BaseCardContent.displayName = 'BaseCardContent';

export interface BaseCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
export const BaseCardFooter = React.forwardRef<HTMLDivElement, BaseCardFooterProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-4 py-3 border-t', className)} {...props} />
  )
);
BaseCardFooter.displayName = 'BaseCardFooter';
