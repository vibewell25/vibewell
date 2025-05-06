/**
 * Button component
 * 
 * A customizable button component with various styles and sizes.
 * 
 * @props
 * variant - (optional) The button style variant
 * size - (optional) The button size
 * asChild - (optional) Whether to render as a child component
 * className - (optional) Additional CSS classes to apply
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" onClick={() => console.log('Clicked!')}>
 *   Click Me
 * </Button>
 * ```
 *
 * @example
 * ```tsx
 * <Button variant="destructive" disabled>
 *   Delete Item
 * </Button>
 * ```
 */

'use client';

import * as React from 'react';
import { BaseButton, type BaseButtonProps } from './BaseButton';
import { cn } from '@/lib/utils';
/**
 * @deprecated This component is deprecated. Use the standardized Button component from '@/components/ui/Button' instead.
 * This is maintained for backwards compatibility only.
 */

export interface ButtonProps extends BaseButtonProps {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return <BaseButton className={cn(className)} ref={ref} {...props} />;
  }
);

Button.displayName = 'Button';
