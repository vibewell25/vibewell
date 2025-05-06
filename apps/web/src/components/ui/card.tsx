/**
 * Card component - A versatile card UI component
 * 
 * @param className - Additional CSS classes
 * @param {boolean} noPadding - Whether to remove default padding
 * @param {boolean} shadow - Whether to add a shadow effect
 * @param {boolean} hover - Whether to add hover effects
 * 
 * @example
 * ```tsx
 * <Card shadow hover>
 *   <h3 className="text-lg font-medium">Card Title</h3>
 *   <p>Card content goes here</p>
 * </Card>
 * ```
 */

import React from 'react';
import { cn } from '@/lib/utils';
/**
 * @deprecated This component is deprecated. Use the standardized Card component from '@/components/ui/Card' instead.
 * This is maintained for backwards compatibility only.
 */



export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  noPadding?: boolean;
  shadow?: boolean;
  hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  children,
  className = '',
  noPadding = false,
  shadow = false,
  hover = false,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border border-gray-200 bg-white',
        !noPadding && 'p-4',
        shadow && 'shadow-sm',
        hover && 'transition-all duration-200 hover:shadow-md',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

// Sub-components for more complex card layouts
export const CardHeader = ({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-4 space-y-1.5', className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({
  className = '',
  children,
  as: Component = 'h3',
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { as?: React.ElementType }) => (
  <Component className={cn('text-lg font-semibold', className)} {...props}>
    {children}
  </Component>
);

export const CardDescription = ({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-gray-500', className)} {...props}>
    {children}
  </p>
);

export const CardContent = ({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mt-4 flex items-center', className)} {...props}>
    {children}
  </div>
);

export default Card;
