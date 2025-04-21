'use client';

import * as React from 'react';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TimePickerDemo } from '../ui/time-picker';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  disabled?: boolean;
}

export function DateTimePicker({ date, setDate, disabled }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);

  // Update the parent component state when the internal state changes
  React.useEffect(() => {
    setDate(selectedDate);
  }, [selectedDate, setDate]);

  // Update the internal state when the parent prop changes
  React.useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !selectedDate && 'text-muted-foreground',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, 'PPP p') : <span>Pick a date and time</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
        {selectedDate && (
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Time</span>
            </div>
            <TimePickerDemo
              setDate={function (date: Date): void {
                setSelectedDate(date);
              }}
              date={selectedDate}
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// time-picker.tsx component for selecting hours, minutes and AM/PM

interface TimePickerDemoProps {
  date: Date;
  setDate: (date: Date) => void;
  className?: string;
}

export function TimePickerDemo({ date, setDate, className }: TimePickerDemoProps) {
  // Helper functions for time manipulations
  function getHours(date: Date) {
    let hours = date.getHours();
    if (hours === 0) {
      return 12;
    }
    if (hours > 12) {
      return hours - 12;
    }
    return hours;
  }

  function getMinutes(date: Date) {
    return date.getMinutes();
  }

  function getPeriod(date: Date) {
    return date.getHours() >= 12 ? 'PM' : 'AM';
  }

  function setHours(hours: number, period: 'AM' | 'PM') {
    if (period === 'PM' && hours < 12) {
      hours += 12;
    }
    if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    const newDate = new Date(date);
    newDate.setHours(hours);
    setDate(newDate);
    return newDate;
  }

  function setMinutes(minutes: number) {
    const newDate = new Date(date);
    newDate.setMinutes(minutes);
    setDate(newDate);
    return newDate;
  }

  function handleHoursChange(e: React.ChangeEvent<HTMLInputElement>) {
    const hours = parseInt(e.target.value, 10);
    if (isNaN(hours)) return;
    if (hours < 1 || hours > 12) return;
    setHours(hours, getPeriod(date));
  }

  function handleMinutesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const minutes = parseInt(e.target.value, 10);
    if (isNaN(minutes)) return;
    if (minutes < 0 || minutes > 59) return;
    setMinutes(minutes);
  }

  function handlePeriodChange(value: string) {
    if (value !== 'AM' && value !== 'PM') return;
    setHours(getHours(date), value);
  }

  return (
    <div className={cn('flex justify-between items-end gap-2 pt-2', className)}>
      <div className="grid gap-1">
        <Label htmlFor="hours" className="text-xs">
          Hours
        </Label>
        <Input
          id="hours"
          className="w-16"
          value={getHours(date).toString().padStart(2, '0')}
          onChange={handleHoursChange}
          min={1}
          max={12}
        />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="minutes" className="text-xs">
          Minutes
        </Label>
        <Input
          id="minutes"
          className="w-16"
          value={getMinutes(date).toString().padStart(2, '0')}
          onChange={handleMinutesChange}
          min={0}
          max={59}
        />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="period" className="text-xs">
          Period
        </Label>
        <Select value={getPeriod(date)} onValueChange={handlePeriodChange}>
          <SelectTrigger id="period" className="w-[70px]">
            <SelectValue placeholder="AM/PM" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
