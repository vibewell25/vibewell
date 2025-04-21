'use client';

import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  className?: string;
}

const predefinedColors = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#000000', // Black
];

export function ColorPicker({ color, onChange, className }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('w-10 h-8 p-0 border-2', className)}
          style={{ backgroundColor: color }}
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3">
        <div className="grid grid-cols-5 gap-2">
          {predefinedColors.map(presetColor => (
            <button
              key={presetColor}
              className={cn(
                'w-6 h-6 rounded-md border border-gray-200',
                color === presetColor ? 'ring-2 ring-offset-2 ring-primary' : ''
              )}
              style={{ backgroundColor: presetColor }}
              onClick={() => {
                onChange(presetColor);
                setIsOpen(false);
              }}
            />
          ))}
        </div>
        <div className="flex items-center mt-3">
          <input
            type="color"
            value={color}
            onChange={e => onChange(e.target.value)}
            className="w-8 h-8 cursor-pointer appearance-none bg-transparent border-0"
            id="custom-color-picker"
          />
          <label
            htmlFor="custom-color-picker"
            className="ml-2 text-xs text-muted-foreground cursor-pointer"
          >
            Custom color
          </label>
        </div>
      </PopoverContent>
    </Popover>
  );
}
