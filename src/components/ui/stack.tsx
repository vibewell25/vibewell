import React from 'react';
import { cn } from '@/lib/utils';

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  className?: string;
}

/**
 * Stack - A flexible layout component for vertical and horizontal stacking
 * 
 * This component provides a simple way to stack elements with consistent spacing
 * in either vertical or horizontal direction.
 */
export function Stack({
  children,
  direction = 'column',
  spacing = 'md',
  align,
  justify,
  wrap = false,
  className,
  ...props
}: StackProps) {
  // Map spacing sizes to Tailwind classes
  const spacingClasses = {
    'none': direction === 'row' ? 'space-x-0' : 'space-y-0',
    'xs': direction === 'row' ? 'space-x-1' : 'space-y-1',
    'sm': direction === 'row' ? 'space-x-2' : 'space-y-2',
    'md': direction === 'row' ? 'space-x-4' : 'space-y-4',
    'lg': direction === 'row' ? 'space-x-6' : 'space-y-6',
    'xl': direction === 'row' ? 'space-x-8' : 'space-y-8',
  };

  // Map alignment to Tailwind classes
  const alignClasses = {
    'start': 'items-start',
    'center': 'items-center',
    'end': 'items-end',
    'stretch': 'items-stretch',
    'baseline': 'items-baseline',
  };

  // Map justification to Tailwind classes
  const justifyClasses = {
    'start': 'justify-start',
    'center': 'justify-center',
    'end': 'justify-end',
    'between': 'justify-between',
    'around': 'justify-around',
    'evenly': 'justify-evenly',
  };

  // Combine classes
  const stackClasses = cn(
    'flex',
    direction === 'row' ? 'flex-row' : 'flex-col',
    wrap && 'flex-wrap',
    spacing !== 'none' ? spacingClasses[spacing] : null,
    align ? alignClasses[align] : null,
    justify ? justifyClasses[justify] : null,
    className
  );

  return (
    <div className={stackClasses} {...props}>
      {children}
    </div>
  );
}

/**
 * VStack - Vertical Stack convenience component
 */
export function VStack({
  children,
  spacing = 'md',
  align,
  justify,
  className,
  ...props
}: Omit<StackProps, 'direction'>) {
  return (
    <Stack
      direction="column"
      spacing={spacing}
      align={align}
      justify={justify}
      className={className}
      {...props}
    >
      {children}
    </Stack>
  );
}

/**
 * HStack - Horizontal Stack convenience component
 */
export function HStack({
  children,
  spacing = 'md',
  align,
  justify,
  wrap,
  className,
  ...props
}: Omit<StackProps, 'direction'>) {
  return (
    <Stack
      direction="row"
      spacing={spacing}
      align={align}
      justify={justify}
      wrap={wrap}
      className={className}
      {...props}
    >
      {children}
    </Stack>
  );
} 