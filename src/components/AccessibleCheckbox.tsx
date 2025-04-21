import React from 'react';
import BaseCheckbox from './BaseCheckbox';

export interface AccessibleCheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const AccessibleCheckbox: React.FC<AccessibleCheckboxProps> = ({
  label,
  error,
  helperText,
  className,
  ...props
}) => {
  return (
    <BaseCheckbox
      label={label}
      error={error}
      helperText={helperText}
      labelPosition="right"
      labelClassName="text-sm font-medium text-gray-700"
      errorClassName="mt-1 text-sm text-red-600"
      helperTextClassName="mt-1 text-sm text-gray-500"
      checkboxClassName="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
      containerClassName="relative flex items-start"
      className={className}
      {...props}
    />
  );
};

export default AccessibleCheckbox;
