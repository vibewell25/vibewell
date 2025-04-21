import React, { useState, useRef, useEffect } from 'react';

interface AccessibleSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  label?: string;
  className?: string;
  disabled?: boolean;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

export const AccessibleSlider: React.FC<AccessibleSliderProps> = ({
  min,
  max,
  value,
  onChange,
  step = 1,
  label,
  className = '',
  disabled = false,
  showValue = true,
  formatValue = val => val.toString(),
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  const percentage = ((value - min) / (max - min)) * 100;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    updateValue(e);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    updateValue(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    let newValue = value;

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        newValue = Math.max(min, value - step);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        newValue = Math.min(max, value + step);
        break;
      case 'Home':
        e.preventDefault();
        newValue = min;
        break;
      case 'End':
        e.preventDefault();
        newValue = max;
        break;
      default:
        return;
    }

    onChange(newValue);
  };

  const updateValue = (e: MouseEvent | React.MouseEvent) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newValue = min + percentage * (max - min);
    const steppedValue = Math.round(newValue / step) * step;

    onChange(steppedValue);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          {showValue && <span className="text-sm text-gray-500">{formatValue(value)}</span>}
        </div>
      )}
      <div
        ref={sliderRef}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={formatValue(value)}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        onMouseDown={handleMouseDown}
        className={`
          relative h-2 bg-gray-200 rounded-full
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div
          className="absolute h-full bg-primary rounded-full"
          style={{ width: `${percentage}%` }}
        />
        <div
          ref={thumbRef}
          className={`
            absolute top-0 w-4 h-4 bg-white rounded-full
            border-2 border-primary
            ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          `}
          style={{ left: `${percentage}%`, transform: 'translateX(-50%)' }}
          tabIndex={-1}
        />
      </div>
    </div>
  );
};

export default AccessibleSlider;
