/**
 * @deprecated This component is deprecated. Use the standardized Button component from '@/components/ui/Button' instead.
 * This is maintained for backwards compatibility only.
 */

import React from 'react';
import { Button as UIButton } from '../ui/Button';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  console.warn(
    'Warning: The Button component from @/components/common/Button is deprecated. ' +
      'Use the standardized Button component from @/components/ui/Button instead.',
  );

  // Map variant to standardized variant
  let mappedVariant: any = variant;
  if (variant === 'primary') mappedVariant = 'default';
  if (variant === 'text') mappedVariant = 'ghost';

  // Use the standardized Button component
  return (
    <UIButton
      variant={mappedVariant}
      size={size}
      isLoading={isLoading}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      className={className}
      disabled={disabled}
      {...props}
    >
      {children as React.ReactNode}
    </UIButton>
  );
};
