import React from 'react';

interface AccessibleToggleProps {
  label: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  checked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  className?: string;
}

export const AccessibleToggle: React.FC<AccessibleToggleProps> = ({
  label,
  error,
  helperText,
  size = 'md',
  id,
  className = '',
  required,
  checked,
  onChange,
  disabled,
}) => {
  const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${toggleId}-error` : undefined;
  const helperId = helperText ? `${toggleId}-helper` : undefined;

  const sizeStyles = {
    sm: 'h-4 w-7',
    md: 'h-5 w-9',
    lg: 'h-6 w-11',
  };

  const dotSizeStyles = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className="w-full">
      <div className="flex items-center">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-labelledby={`${toggleId}-label`}
          aria-describedby={`${errorId} ${helperId}`}
          className={`
            relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
            ${checked ? 'bg-primary' : 'bg-gray-200'}
            ${error ? 'focus:ring-red-500' : 'focus:ring-primary'}
            ${sizeStyles[size]}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${className}
          `}
          onClick={() => {
            if (onChange) {
              const event = {
                target: { checked: !checked },
              } as React.ChangeEvent<HTMLInputElement>;
              onChange(event);
            }
          }}
          disabled={disabled}
        >
          <span
            aria-hidden="true"
            className={`
              inline-block transform rounded-full bg-white shadow transition duration-200 ease-in-out
              ${checked ? 'translate-x-full' : 'translate-x-0'}
              ${dotSizeStyles[size]}
            `}
          />
        </button>
        <label
          id={`${toggleId}-label`}
          htmlFor={toggleId}
          className="ml-3 block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>

      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p id={helperId} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default AccessibleToggle;
