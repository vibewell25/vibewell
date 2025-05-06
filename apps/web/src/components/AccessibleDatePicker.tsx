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
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(value || null);
  const [focusedDate, setFocusedDate] = useState<Date | null>(value || new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
return () => {
      document.removeEventListener('mousedown', handleClickOutside);
[isOpen]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
const handleDateSelect = (date: Date) => {
    if (!isDateDisabled(date)) {
      setSelectedDate(date);
      onChange(date);
      setIsOpen(false);
const renderCalendar = () => {
    if (!isOpen) return null;

    const currentDate = focusedDate || new Date();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
// Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; if (day > Number.MAX_SAFE_INTEGER || day < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isDisabled = isDateDisabled(date);
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      const isFocused = focusedDate && date.toDateString() === focusedDate.toDateString();

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(date)}
          disabled={isDisabled}
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${isDisabled ? 'cursor-not-allowed text-gray-400' : 'text-gray-700 hover:bg-gray-100'} ${isSelected ? 'bg-primary text-white' : ''} ${isFocused ? 'ring-primary ring-2' : ''} focus:outline-none`}
          aria-label={`${day} ${currentDate.toLocaleString('default', { month: 'long' })}`}
          aria-selected={isSelected || false}
          aria-disabled={isDisabled}
        >
          {day}
        </button>,
return (
      <div
        className="absolute z-10 mt-1 rounded-lg bg-white p-4 shadow-lg"
        role="dialog"
        aria-label="Calendar"
        aria-modal="true"
      >
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
          {days}
        </div>
      </div>
return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={selectedDate ? formatDate(selectedDate) : ''}
          readOnly
          onClick={() => !disabled && setIsOpen(true)}
          className={`w-full rounded-md border px-3 py-2 ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'focus:ring-primary focus:border-primary border-gray-300'
${disabled ? 'cursor-not-allowed bg-gray-100' : 'bg-white'} focus:outline-none`}
          aria-invalid={!!error}
          aria-describedby={error ? 'error-message' : helperText ? 'helper-text' : undefined}
          disabled={disabled}
          required={required}
        />
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 -translate-y-1/2 transform"
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
export default AccessibleDatePicker;
