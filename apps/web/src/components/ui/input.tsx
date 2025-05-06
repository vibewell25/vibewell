className - Additional CSS classes for the input
 * @param {string} wrapperClassName - Additional CSS classes for the wrapper div
 * @param {string} labelClassName - Additional CSS classes for the label
 * @param {string} errorClassName - Additional CSS classes for the error message
 * 
 * @example
 * ```tsx
 * <Input 
 *   label="Email Address"
 *   type="email"
 *   placeholder="Enter your email"
 *   error={errors.email.message}
 *   required
 * />
 * ```
 */

import React from 'react';
import { cn } from '@/lib/utils';
/**
 * @deprecated This component is deprecated. Use the standardized Input component from '@/components/ui/Input' instead.
 * This is maintained for backwards compatibility only.
 */



export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  className = '',
  wrapperClassName = '',
  labelClassName = '',
  errorClassName = '',
  id,
  ...props
ref) => {
  // Generate a unique ID if none provided
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={cn('space-y-2', wrapperClassName)}>
      {label && (
        <label 
          htmlFor={inputId} 
          className={cn(
            'text-sm font-medium text-gray-700',
            errorClassName,
            labelClassName
          )}
        >
          {label}
          {props.required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      
      <input
        id={inputId}
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
          'placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      
      {error && (
        <p className={cn('text-sm text-red-500', errorClassName)}>
          {error}
        </p>
      )}
    </div>
Input.displayName = 'Input';

export default Input;
