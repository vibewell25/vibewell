import * as React from 'react';
import { Input } from '@/components/ui/input';

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function TimeInput({ value, onChange, className }: TimeInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    // Validate time format (HH:mm)
    if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeValue) || timeValue === '') {
      onChange(timeValue);
    }
  };

  return (
    <Input
      type="time"
      value={value}
      onChange={handleChange}
      className={className}
      step="300" // 5-minute intervals
    />
  );
}
