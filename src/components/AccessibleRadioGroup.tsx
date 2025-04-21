import React from 'react';

interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface AccessibleRadioGroupProps {
  label: string;
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
}

export const AccessibleRadioGroup: React.FC<AccessibleRadioGroupProps> = ({
  label,
  name,
  options,
  value,
  onChange,
  error,
  helperText,
  required,
  className = '',
}) => {
  const groupId = `radio-group-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${groupId}-error` : undefined;
  const helperId = helperText ? `${groupId}-helper` : undefined;

  return (
    <div className={className}>
      <div
        role="radiogroup"
        aria-labelledby={`${groupId}-label`}
        aria-describedby={`${errorId} ${helperId}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-required={required}
      >
        <label id={`${groupId}-label`} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <div className="space-y-2">
          {options.map(option => (
            <div key={option.value} className="flex items-center">
              <input
                id={`${groupId}-${option.value}`}
                name={name}
                type="radio"
                value={option.value}
                checked={value === option.value}
                onChange={e => onChange?.(e.target.value)}
                disabled={option.disabled}
                className={`
                  h-4 w-4 border-gray-300
                  ${error ? 'border-red-300' : 'border-gray-300'}
                  text-primary focus:ring-primary
                  ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                aria-describedby={error ? errorId : undefined}
              />
              <label
                htmlFor={`${groupId}-${option.value}`}
                className={`
                  ml-3 block text-sm font-medium
                  ${option.disabled ? 'text-gray-400' : 'text-gray-700'}
                `}
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>

        {error && (
          <p id={errorId} className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={helperId} className="mt-2 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    </div>
  );
};

export default AccessibleRadioGroup;
