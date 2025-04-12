import React from 'react';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  label: string;
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
  required?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  name,
  options,
  value,
  onChange,
  error,
  className = '',
  required = false,
}) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id={`${name}-${option.value}`}
                name={name}
                type="radio"
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(e.target.value)}
                className={`
                  h-4 w-4 text-indigo-600
                  focus:ring-indigo-500
                  border-gray-300
                  ${error ? 'border-red-300' : 'border-gray-300'}
                `}
                aria-describedby={error ? `${name}-error` : undefined}
              />
            </div>
            <div className="ml-3">
              <label
                htmlFor={`${name}-${option.value}`}
                className="text-sm font-medium text-gray-700"
              >
                {option.label}
              </label>
              {option.description && (
                <p className="text-sm text-gray-500">{option.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${name}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}; 