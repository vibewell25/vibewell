import React from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import { TouchPosition, TouchGesture } from './utils';
import { useTouchEvents } from './use-touch-events';

export interface TouchHandlerProps {
  children: React.ReactNode;
  onGesture?: (gesture: TouchGesture) => void;
  onTap?: (position: TouchPosition) => void;
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down', distance: number) => void;
  onPinch?: (scale: number) => void;
  onRotate?: (angle: number) => void;
  onLongPress?: (position: TouchPosition) => void;
  longPressThreshold?: number; // in milliseconds
  enabled?: boolean;
  className?: string;
}

/**
 * TouchHandler - A component that provides enhanced touch interaction support
 *
 * This component captures and processes touch events to provide high-level
 * gesture support like swipes, pinches, rotates, and long presses.
 */
export function TouchHandler({
  children,
  onGesture,
  onTap,
  onSwipe,
  onPinch,
  onRotate,
  onLongPress,
  longPressThreshold = 500,
  enabled = true,
  className,
}: TouchHandlerProps) {
  const { isTouch } = useResponsive();

  // Use the custom hook to handle touch events
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchEvents({
    onGesture,
    onTap,
    onSwipe,
    onPinch,
    onRotate,
    onLongPress,
    longPressThreshold,
  });

  // Don't add handlers if not a touch device or component is disabled
  if (!isTouch || !enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {children}
    </div>
  );
}

// Re-export types and utilities for easy access
export * from './utils';
export * from './gesture-handlers';
export * from './use-touch-events';
