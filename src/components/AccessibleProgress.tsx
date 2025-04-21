import React from 'react';

interface AccessibleProgressProps {
  value: number;
  max?: number;
  min?: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AccessibleProgress: React.FC<AccessibleProgressProps> = ({
  value,
  max = 100,
  min = 0,
  label,
  showValue = true,
  size = 'md',
  className = '',
}) => {
  const progressId = `progress-${Math.random().toString(36).substr(2, 9)}`;
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-4',
  };

  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <label htmlFor={progressId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
          {showValue && <span className="text-sm text-gray-500">{value}%</span>}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-labelledby={label ? progressId : undefined}
        className={`
          w-full bg-gray-200 rounded-full overflow-hidden
          ${sizeStyles[size]}
        `}
      >
        <div
          className={`
            bg-primary transition-all duration-300 ease-in-out
            ${sizeStyles[size]}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default AccessibleProgress;
