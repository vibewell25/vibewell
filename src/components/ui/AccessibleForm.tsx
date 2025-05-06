import React, { forwardRef, HTMLAttributes } from 'react';
import clsx from 'clsx';

/* -------------------------------------------------------------------------------------------------
 * FormField
 * -----------------------------------------------------------------------------------------------*/

interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Unique identifier for the form field
   */
  id: string;
  
  /**
   * Label text for the form field
   */
  label: string;
  
  /**
   * Whether the field is required
   */
  required?: boolean;
  
  /**
   * Optional help text that appears below the field
   */
  description?: string;
  
  /**
   * Error message to display
   */
  error?: string;
  
  /**
   * The form control component (input, select, etc.)
   */
  children: React.ReactNode;
}

const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ id, label, required, description, error, className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={clsx('space-y-2', className)} {...props}>
        <div className="flex justify-between">
          <label 
            htmlFor={id}
            className={clsx(
              'text-sm font-medium', 
              error ? 'text-red-500' : 'text-gray-700'
            )}
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        </div>
        
        {description && (
          <p className="text-sm text-gray-500" id={`${id}-description`}>
            {description}
          </p>
        )}
        
        {children}
        
        {error && (
          <p 
            className="text-sm text-red-500" 
            id={`${id}-error`} 
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

/* -------------------------------------------------------------------------------------------------
 * FormInput
 * -----------------------------------------------------------------------------------------------*/

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Error message to display
   */
  error?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, id, error, 'aria-describedby': ariaDescribedBy, ...props }, ref) => {
    // Manage description references for accessibility
    const describedBy = [
      ariaDescribedBy,
      props['aria-describedby'],
      id && error ? `${id}-error` : undefined,
      id && props.required ? `${id}-required` : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <input
        ref={ref}
        id={id}
        className={clsx(
          'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground focus-visible:outline-none',
          'transition-colors focus-visible:ring-2 focus-visible:ring-offset-2',
          error 
            ? 'border-red-500 focus-visible:ring-red-500' 
            : 'border-gray-300 focus-visible:ring-primary-500',
          className
        )}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        {...props}
      />
    );
  }
);

FormInput.displayName = 'FormInput';

/* -------------------------------------------------------------------------------------------------
 * FormSelect
 * -----------------------------------------------------------------------------------------------*/

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /**
   * Error message to display
   */
  error?: string;
  
  /**
   * Options for the select element
   */
  options: Array<{ value: string; label: string }>;
}

const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ className, id, error, options, 'aria-describedby': ariaDescribedBy, ...props }, ref) => {
    // Manage description references for accessibility
    const describedBy = [
      ariaDescribedBy,
      props['aria-describedby'],
      id && error ? `${id}-error` : undefined,
      id && props.required ? `${id}-required` : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <select
        ref={ref}
        id={id}
        className={clsx(
          'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background',
          'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          error 
            ? 'border-red-500 focus-visible:ring-red-500' 
            : 'border-gray-300 focus-visible:ring-primary-500',
          className
        )}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);

FormSelect.displayName = 'FormSelect';

/* -------------------------------------------------------------------------------------------------
 * FormCheckbox
 * -----------------------------------------------------------------------------------------------*/

interface FormCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * Label text for the checkbox
   */
  label: string;
  
  /**
   * Error message to display
   */
  error?: string;
}

const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ className, id, label, error, 'aria-describedby': ariaDescribedBy, ...props }, ref) => {
    // Manage description references for accessibility
    const describedBy = [
      ariaDescribedBy,
      props['aria-describedby'],
      id && error ? `${id}-error` : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div className="flex items-center space-x-2">
        <input
          ref={ref}
          type="checkbox"
          id={id}
          className={clsx(
            'h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500',
            error && 'border-red-500',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          {...props}
        />
        <label 
          htmlFor={id}
          className={clsx(
            'text-sm font-medium',
            error ? 'text-red-500' : 'text-gray-700'
          )}
        >
          {label}
        </label>
      </div>
    );
  }
);

FormCheckbox.displayName = 'FormCheckbox';

// Export all form components
export {
  FormField,
  FormInput,
  FormSelect,
  FormCheckbox,
}; 