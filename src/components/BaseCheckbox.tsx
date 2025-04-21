import React from 'react';

interface BaseCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  labelPosition?: 'left' | 'right';
  labelClassName?: string;
  checkboxClassName?: string;
  containerClassName?: string;
  errorClassName?: string;
  helperTextClassName?: string;
}

export const BaseCheckbox: React.FC<BaseCheckboxProps> = ({
  label,
  error,
  helperText,
  id,
  className = '',
  required,
  labelPosition = 'right',
  labelClassName = 'text-sm font-medium text-gray-700',
  checkboxClassName = '',
  containerClassName = 'w-full',
  errorClassName = 'mt-1 text-sm text-red-600',
  helperTextClassName = 'mt-1 text-sm text-gray-500',
  ...props
}) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${checkboxId}-error` : undefined;
  const helperId = helperText ? `${checkboxId}-helper` : undefined;

  const checkboxElement = (
    <input
      id={checkboxId}
      type="checkbox"
      className={`
        h-4 w-4 rounded
        ${error ? 'border-red-300' : 'border-gray-300'}
        text-primary focus:ring-primary
        ${checkboxClassName}
        ${className}
      `}
      aria-invalid={error ? 'true' : 'false'}
      aria-describedby={`${errorId || ''} ${helperId || ''}`}
      required={required}
      {...props}
    />
  );

  const labelElement = label && (
    <label htmlFor={checkboxId} className={labelClassName}>
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );

  return (
    <div className={containerClassName}>
      <div className="flex items-start">
        {labelPosition === 'left' && labelElement && <div className="mr-3">{labelElement}</div>}

        <div className="flex items-center h-5">{checkboxElement}</div>

        {labelPosition === 'right' && labelElement && <div className="ml-3">{labelElement}</div>}
      </div>

      {error && (
        <p id={errorId} className={errorClassName}>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p id={helperId} className={helperTextClassName}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default BaseCheckbox;
