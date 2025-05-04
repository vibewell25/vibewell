import React from 'react';

interface AccessibleTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const AccessibleTextarea: React.FC<AccessibleTextareaProps> = ({
  label,
  error,
  helperText,
  resize = 'vertical',
  id,
  className = '',
  required,
  ...props
}) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${textareaId}-error` : undefined;
  const helperId = helperText ? `${textareaId}-helper` : undefined;

  const resizeStyles = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize',
  };

  return (
    <div className="w-full">
      <label htmlFor={textareaId} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <textarea
        id={textareaId}
        className={`block w-full rounded-md border ${error ? 'border-red-300' : 'border-gray-300'} px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 ${error ? 'focus:ring-red-500' : 'focus:ring-primary'} ${resizeStyles[resize]} ${className} `}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={`${errorId} ${helperId}`}
        required={required}
        {...props}
      />

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

export default AccessibleTextarea;
