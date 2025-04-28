import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  value?: number[];
  onValueChange?: (value: number[]) => void;
  className?: string;
}

export function Slider({
  defaultValue = [0, 100],
  min = 0,
  max = 100,
  step = 1,
  value,
  onValueChange,
  className,
  ...props
}: SliderProps) {
  // Use controlled or uncontrolled state
  const [internalValues, setInternalValues] = useState<number[]>(defaultValue);
  const currentValues = value !== undefined ? value : internalValues;

  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean[]>([false, false]);
  const startPositions = useRef<number[]>([0, 0]);

  // Handle value change
  const handleValueChange = (newValues: number[]) => {
    // Ensure min doesn't exceed max
    if (newValues[0] > newValues[1]) {
      return;
    }

    const clampedValues = newValues.map((v) => Math.max(min, Math.min(max, v)));

    setInternalValues(clampedValues);
    onValueChange?.(clampedValues);
  };

  // Convert value to percentage of track width
  const valueToPercent = (val: number) => {
    return ((val - min) / (max - min)) * 100;
  };

  // Convert percentage to value
  const percentToValue = (percent: number) => {
    const rawValue = (percent / 100) * (max - min) + min;
    const steppedValue = Math.round(rawValue / step) * step;
    return steppedValue;
  };

  // Handle mouse/touch events
  const handlePointerDown = (e: React.PointerEvent, index: number) => {
    e.preventDefault();
    isDragging.current[index] = true;
    startPositions.current[index] = e.clientX;
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!trackRef.current || (!isDragging.current[0] && !isDragging.current[1])) return;

    const trackRect = trackRef.current.getBoundingClientRect();
    const trackWidth = trackRect.width;

    // Handle thumb movement for each thumb
    const newValues = [...currentValues];

    for (let i = 0; i < 2; i++) {
      if (isDragging.current[i]) {
        const pointerPos = e.clientX;
        const pointerPercent = Math.max(
          0,
          Math.min(100, ((pointerPos - trackRect.left) / trackWidth) * 100),
        );
        newValues[i] = percentToValue(pointerPercent);
      }
    }

    // Ensure values are in ascending order
    if (newValues[0] > newValues[1]) {
      if (isDragging.current[0]) {
        newValues[0] = newValues[1];
      } else {
        newValues[1] = newValues[0];
      }
    }

    handleValueChange(newValues);
  };

  const handlePointerUp = () => {
    isDragging.current = [false, false];
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
  };

  // Clean up event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  return (
    <div className={cn('relative w-full touch-none py-2', className)} {...props}>
      <div ref={trackRef} className="relative h-2 w-full rounded-full bg-gray-200">
        {/* Track highlight */}
        <div
          className="absolute h-full rounded-full bg-indigo-500"
          style={{
            left: `${valueToPercent(currentValues[0])}%`,
            width: `${valueToPercent(currentValues[1]) - valueToPercent(currentValues[0])}%`,
          }}
        />

        {/* Thumbs */}
        {currentValues.map((val, index) => (
          <div
            key={index}
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-2 border-indigo-500 bg-white shadow focus:outline-none"
            style={{ left: `${valueToPercent(val)}%` }}
            onPointerDown={(e) => handlePointerDown(e, index)}
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={val}
            tabIndex={0}
          />
        ))}
      </div>
    </div>
  );
}
