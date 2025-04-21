'use client';

import React from 'react';
import BaseCheckbox from '../BaseCheckbox';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  description?: string;
  variant?: 'default' | 'primary' | 'secondary';
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  description,
  variant = 'default',
  className,
  ...props
}) => {
  const variantClasses = {
    default: 'text-gray-900 focus:ring-gray-900',
    primary: 'text-primary focus:ring-primary',
    secondary: 'text-secondary focus:ring-secondary',
  };

  return (
    <BaseCheckbox
      label={label}
      error={error}
      helperText={description}
      labelPosition="right"
      labelClassName="text-sm font-medium text-gray-700"
      errorClassName="mt-1 text-xs text-red-600"
      helperTextClassName="mt-1 text-xs text-gray-500"
      checkboxClassName={cn(
        'h-4 w-4 rounded border-gray-300',
        error ? 'border-red-300' : 'border-gray-300',
        variantClasses[variant],
        className
      )}
      containerClassName="relative flex items-start"
      {...props}
    />
  );
};

export default Checkbox;
