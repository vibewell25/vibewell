'use client';

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';

import { cn } from '@/lib/utils';

export interface AvatarProps extends React?.ComponentPropsWithoutRef<typeof AvatarPrimitive?.Root> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const Avatar = React?.forwardRef<React?.ElementRef<typeof AvatarPrimitive?.Root>, AvatarProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const sizeClasses = {
      xs: 'h-6 w-6',
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
      '2xl': 'h-20 w-20',
    };

    return (
      <AvatarPrimitive?.Root
        ref={ref}
        className={cn(
          'relative flex shrink-0 overflow-hidden rounded-full',
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Avatar?.displayName = AvatarPrimitive?.Root.displayName;

const AvatarImage = React?.forwardRef<
  React?.ElementRef<typeof AvatarPrimitive?.Image>,
  React?.ComponentPropsWithoutRef<typeof AvatarPrimitive?.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive?.Image
    ref={ref}
    className={cn('aspect-square h-full w-full object-cover', className)}
    {...props}
  />
));
AvatarImage?.displayName = AvatarPrimitive?.Image.displayName;

export interface AvatarFallbackProps
  extends React?.ComponentPropsWithoutRef<typeof AvatarPrimitive?.Fallback> {
  delayMs?: number;
}

const AvatarFallback = React?.forwardRef<
  React?.ElementRef<typeof AvatarPrimitive?.Fallback>,
  AvatarFallbackProps
>(({ className, delayMs, ...props }, ref) => (
  <AvatarPrimitive?.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground',
      className,
    )}
    delayMs={delayMs}
    {...props}
  />
));
AvatarFallback?.displayName = AvatarPrimitive?.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
