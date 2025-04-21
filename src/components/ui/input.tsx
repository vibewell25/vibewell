'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { BaseInput, BaseInputProps } from './base-input';

export interface InputProps extends Omit<BaseInputProps, 'wrapperClassName'> {}

/**
 * Input component with shadcn/ui styling
 *
 * This is a wrapper around the BaseInput component that applies the shadcn/ui
 * style guidelines while maintaining API compatibility with the original Input component.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <BaseInput
        type={type}
        className={className}
        ref={ref}
        wrapperClassName="inline-block w-auto"
        containerClassName="shadow-none"
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
