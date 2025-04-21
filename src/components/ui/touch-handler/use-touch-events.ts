import { useRef, useCallback } from 'react';
import { TouchPosition, getDistance } from './utils';
import {
  handleTapGesture,
  handleSwipeGesture,
  handlePinchGesture,
  handleRotateGesture,
  handleLongPressGesture,
} from './gesture-handlers';

interface UseTouchEventsProps {
  onGesture?: (gesture: import('./utils').TouchGesture) => void;
  onTap?: (position: TouchPosition) => void;
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down', distance: number) => void;
  onPinch?: (scale: number) => void;
  onRotate?: (angle: number) => void;
  onLongPress?: (position: TouchPosition) => void;
  longPressThreshold?: number;
}

/**
 * Hook for handling touch events and recognizing gestures
 */
export const useTouchEvents = ({
  onGesture,
  onTap,
  onSwipe,
  onPinch,
  onRotate,
  onLongPress,
  longPressThreshold = 500,
}: UseTouchEventsProps) => {
  // Refs to track touch state
  const touchStartRef = useRef<TouchPosition | null>(null);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimestampRef = useRef<number>(0);
  const initialTouchesRef = useRef<React.Touch[]>([]);

  // Handle touch start event
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
        startTimestampRef.current = Date.now();

        // Set timeout for long press
        if (onLongPress) {
          touchTimeoutRef.current = setTimeout(() => {
            if (touchStartRef.current) {
              handleLongPressGesture(
                touchStartRef.current,
                longPressThreshold,
                onLongPress,
                onGesture
              );
            }
          }, longPressThreshold);
        }
      } else if (e.touches.length === 2) {
        // Store initial positions for pinch/rotation
        initialTouchesRef.current = [e.touches[0], e.touches[1]];
      }
    },
    [onLongPress, longPressThreshold, onGesture]
  );

  // Handle touch move event
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      // Clear long press timeout on movement
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
        touchTimeoutRef.current = null;
      }

      if (e.touches.length === 2 && initialTouchesRef.current.length === 2) {
        // Process pinch gesture
        handlePinchGesture(
          [e.touches[0], e.touches[1]],
          initialTouchesRef.current,
          onPinch,
          onGesture
        );

        // Process rotation gesture
        handleRotateGesture(
          [e.touches[0], e.touches[1]],
          initialTouchesRef.current,
          onRotate,
          onGesture
        );
      }
    },
    [onPinch, onRotate, onGesture]
  );

  // Handle touch end event
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      // Clear long press timeout
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
        touchTimeoutRef.current = null;
      }

      if (touchStartRef.current) {
        const touchDuration = Date.now() - startTimestampRef.current;

        // Process as tap or swipe
        if (e.changedTouches.length === 1) {
          const touch = e.changedTouches[0];
          const touchEnd = { x: touch.clientX, y: touch.clientY };
          const distance = getDistance(touchStartRef.current, touchEnd);

          // Determine if this is a tap (small movement) or swipe
          if (distance < 10 && touchDuration < 300) {
            // It's a tap
            handleTapGesture(touchEnd, onTap, onGesture);
          } else if (distance >= 50) {
            // It's a swipe
            handleSwipeGesture(touchStartRef.current, touchEnd, distance, onSwipe, onGesture);
          }
        }
      }

      // Reset
      touchStartRef.current = null;
      initialTouchesRef.current = [];
    },
    [onTap, onSwipe, onGesture]
  );

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};
