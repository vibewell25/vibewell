import { useState, useEffect } from 'react';

/**
 * A hook for debouncing a value
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Update the debounced value after the specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
delay);

    // Cancel the timeout if value changes or the component unmounts
    return () => {
      clearTimeout(timer);
[value, delay]);

  return debouncedValue;
