className - Additional CSS classes for the select element
 * @param {string} wrapperClassName - Additional CSS classes for the wrapper div
 * @param {string} labelClassName - Additional CSS classes for the label
 * 
 * @example
 * ```tsx
 * <Select 
 *   label="Country"
 *   options={[
 *     { value: "us", label: "United States" },
 *     { value: "ca", label: "Canada" },
 *     { value: "mx", label: "Mexico" }
 *   ]}
 *   placeholder="Select a country"
 *   onChange={(e) => setCountry(e.target.value)}
 *   required
 * />
 * ```
 */

import React from 'react';
import { cn } from '@/lib/utils';
/**
 * @deprecated This component is deprecated. Use the standardized Select component from '@/components/ui/Select' instead.
 * This is maintained for backwards compatibility only.
 */



export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'placeholder'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  wrapperClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  options,
  placeholder,
  className = '',
  wrapperClassName = '',
  labelClassName = '',
  errorClassName = '',
  id,
  ...props
ref) => {
  // Generate a unique ID if none provided
  const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={cn('space-y-2', wrapperClassName)}>
      {label && (
        <label 
          htmlFor={selectId} 
          className={cn(
            'text-sm font-medium text-gray-700',
            labelClassName
          )}
        >
          {label}
          {props.required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      
      <select
        id={selectId}
        ref={ref}
        className={cn(
          'block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
          'appearance-none',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value} 
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className={cn('text-sm text-red-500', errorClassName)}>
          {error}
        </p>
      )}
    </div>
Select.displayName = 'Select';

export default Select;
