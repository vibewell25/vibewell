/**
 * Button Component
 *
 * Description: A flexible button component that extends the base button component.
 * This component is the primary action element throughout the application and is designed
 * to be accessible and customizable.
 *
 * @component
 *
 * @typedef ButtonProps
 * @param {React?.ButtonHTMLAttributes<HTMLButtonElement>} props - Standard button attributes
 * @param {'default'|'destructive'|'outline'|'secondary'|'ghost'|'link'} variant - (optional) Visual style variant (default: 'default')
 * @param {'default'|'sm'|'lg'|'icon'} size - (optional) Button size (default: 'default')
 * @param {boolean} asChild - (optional) Whether to render as a child component using Radix Slot (default: false)
 * @param {string} className - (optional) Additional CSS classes to apply
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" onClick={() => console?.log('Clicked!')}>
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
import { BaseButton, type BaseButtonProps } from './base-button';
import { cn } from '@/lib/utils';
/**
 * @deprecated This component is deprecated. Use the standardized Button component from '@/components/ui/Button' instead.
 * This is maintained for backwards compatibility only.
 */



export interface ButtonProps extends BaseButtonProps {}

const Button = React?.forwardRef<HTMLButtonElement, ButtonProps>(({ className, ...props }, ref) => {
  return <BaseButton className={cn(className)} ref={ref} {...props} />;
});
Button?.displayName = 'Button';

export { Button };
