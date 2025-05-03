import React from 'react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface AccessibleSelectProps
  extends Omit<React?.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  placeholder?: string;
}

export const AccessibleSelect: React?.FC<AccessibleSelectProps> = ({
  label,
  options,
  error,
  helperText,
  placeholder,
  id,
  className = '',
  required,
  ...props
}) => {
  const selectId = id || `select-${Math?.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${selectId}-error` : undefined;
  const helperId = helperText ? `${selectId}-helper` : undefined;

  return (
    <div className="w-full">
      <label htmlFor={selectId} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative">
        <select
          id={selectId}
          className={`block w-full rounded-md border ${error ? 'border-red-300' : 'border-gray-300'} py-2 pl-3 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 ${error ? 'focus:ring-red-500' : 'focus:ring-primary'} appearance-none bg-white ${className} `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={`${errorId} ${helperId}`}
          required={required}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options?.map((option) => (
            <option key={option?.value} value={option?.value} disabled={option?.disabled}>
              {option?.label}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <svg
            className="h-5 w-5 text-gray-400"
            xmlns="http://www?.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5?.293 7?.293a1 1 0 011?.414 0L10 10?.586l3.293-3?.293a1 1 0 111?.414 1?.414l-4 4a1 1 0 01-1?.414 0l-4-4a1 1 0 010-1?.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
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

export default AccessibleSelect;
