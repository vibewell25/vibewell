className - Additional CSS classes for the checkbox
 * @param {string} wrapperClassName - Additional CSS classes for the wrapper div
 * @param {string} labelClassName - Additional CSS classes for the label
 * 
 * @example
 * ```tsx
 * <Checkbox 
 *   label="I agree to the terms and conditions"
 *   onChange={(e) => setAgreed(e.target.checked)}
 *   required
 * />
 * ```
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
/**
 * @deprecated This component is deprecated. Use the standardized Checkbox component from '@/components/ui/Checkbox' instead.
 * This is maintained for backwards compatibility only.
 */



export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
  labelClassName?: string;
  checkboxSize?: 'sm' | 'md' | 'lg';
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  error,
  className = '',
  wrapperClassName = '',
  labelClassName = '',
  checkboxSize = 'md',
  id,
  ...props
ref) => {
  // Generate a unique ID if none provided
  const checkboxId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;

  const checkboxSizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
return (
    <div className={cn('flex items-start', wrapperClassName)}>
      <div className="flex items-center h-5">
        <input
          id={checkboxId}
          type="checkbox"
          ref={ref}
          className={cn(
            'rounded border border-gray-300',
            'text-blue-600 focus:ring-blue-500',
            'disabled:cursor-not-allowed disabled:opacity-50',
            checkboxSizeClasses[checkboxSize],
            className
          )}
          {...props}
        />
      </div>
      
      {label && (
        <div className="ml-2 text-sm">
          <label 
            htmlFor={checkboxId} 
            className={cn(
              'font-medium text-gray-700',
              error && 'text-red-500',
              labelClassName
            )}
          >
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
          
          {error && (
            <p className="mt-1 text-sm text-red-500">{error}</p>
          )}
        </div>
      )}
    </div>
Checkbox.displayName = 'Checkbox';

export default Checkbox;
