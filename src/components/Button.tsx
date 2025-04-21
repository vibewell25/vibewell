/**
 * @deprecated This component is deprecated. Use the standardized Button component from '@/components/ui/button' instead.
 * This is maintained for backwards compatibility only.
 */

import React from 'react';
import clsx from 'clsx';
import { Button as UIButton } from './ui/button';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}) => {
  console.warn(
    'Warning: The Button component from @/components/Button is deprecated. ' +
      'Use the standardized Button component from @/components/ui/button instead.'
  );

  // Map variant to standardized variant
  const mappedVariant = variant === 'primary' ? 'default' : variant;

  // Use the standard Button component
  return (
    <UIButton
      variant={mappedVariant}
      size={size}
      isLoading={loading}
      fullWidth={fullWidth}
      className={className}
      disabled={disabled}
      {...props}
    >
      {children}
    </UIButton>
  );
};
