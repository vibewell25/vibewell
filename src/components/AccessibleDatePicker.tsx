import React, { useState, useRef, useEffect } from 'react';

interface AccessibleDatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
}

export const AccessibleDatePicker: React.FC<AccessibleDatePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  className = '',
  label,
  required = false,
  disabled = false,
  error,
  helperText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(value || null);
  const [focusedDate, setFocusedDate] = useState<Date | null>(value || new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const handleDateSelect = (date: Date) => {
    if (!isDateDisabled(date)) {
      setSelectedDate(date);
      onChange(date);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    const currentDate = focusedDate || new Date();
    let newDate = new Date(currentDate);

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        newDate.setDate(currentDate.getDate() - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        newDate.setDate(currentDate.getDate() + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        newDate.setDate(currentDate.getDate() - 7);
        break;
      case 'ArrowDown':
        e.preventDefault();
        newDate.setDate(currentDate.getDate() + 7);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleDateSelect(currentDate);
        return;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        return;
    }

    if (!isDateDisabled(newDate)) {
      setFocusedDate(newDate);
    }
  };

  const renderCalendar = () => {
    if (!isOpen) return null;

    const currentDate = focusedDate || new Date();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isDisabled = isDateDisabled(date);
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      const isFocused = focusedDate && date.toDateString() === focusedDate.toDateString();

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(date)}
          disabled={isDisabled}
          className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm
            ${isDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}
            ${isSelected ? 'bg-primary text-white' : ''}
            ${isFocused ? 'ring-2 ring-primary' : ''}
            focus:outline-none
          `}
          aria-label={`${day} ${currentDate.toLocaleString('default', { month: 'long' })}`}
          aria-selected={isSelected || false}
          aria-disabled={isDisabled}
        >
          {day}
        </button>
      );
    }

    return (
      <div
        className="absolute z-10 mt-1 bg-white rounded-lg shadow-lg p-4"
        role="dialog"
        aria-label="Calendar"
        aria-modal="true"
      >
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={selectedDate ? formatDate(selectedDate) : ''}
          readOnly
          onClick={() => !disabled && setIsOpen(true)}
          className={`
            w-full px-3 py-2 border rounded-md
            ${
              error
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-primary focus:border-primary'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            focus:outline-none
          `}
          aria-invalid={!!error}
          aria-describedby={error ? 'error-message' : helperText ? 'helper-text' : undefined}
          disabled={disabled}
          required={required}
        />
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
          aria-label="Open calendar"
          disabled={disabled}
        >
          📅
        </button>
      </div>
      {error && (
        <p id="error-message" className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id="helper-text" className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
      {renderCalendar()}
    </div>
  );
};

export default AccessibleDatePicker;
