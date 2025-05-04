import React, { useRef } from 'react';
import { useResponsive } from '@/hooks/useResponsive';

export interface TouchPosition {
  x: number;
  y: number;
}

export interface TouchGesture {
  type: 'tap' | 'swipe' | 'pinch' | 'rotate' | 'longpress';
  direction?: 'left' | 'right' | 'up' | 'down';
  scale?: number;
  rotation?: number;
  duration?: number;
}

interface TouchHandlerProps {
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
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<TouchPosition | null>(null);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimestampRef = useRef<number>(0);
  const initialTouchesRef = useRef<React.Touch[]>([]);

  // Don't add handlers if not a touch device or component is disabled
  if (!isTouch || !enabled) {
    return (
      <div ref={containerRef} className={className}>
        {children}
      </div>
    );
  }

  // Calculate distance between two points
  const getDistance = (p1: TouchPosition, p2: TouchPosition): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  // Calculate angle between two points (in degrees)
  const getAngle = (p1: TouchPosition, p2: TouchPosition): number => {
    return (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
  };

  // Handle touch start event
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      startTimestampRef.current = Date.now();

      // Set timeout for long press
      if (onLongPress) {
        touchTimeoutRef.current = setTimeout(() => {
          if (touchStartRef.current) {
            onLongPress(touchStartRef.current);

            if (onGesture) {
              onGesture({
                type: 'longpress',
                duration: longPressThreshold,
              });
            }
          }
        }, longPressThreshold);
      }
    } else if (e.touches.length === 2) {
      // Store initial positions for pinch/rotation
      initialTouchesRef.current = [e.touches[0], e.touches[1]];
    }
  };

  // Handle touch move event
  const handleTouchMove = (e: React.TouchEvent) => {
    // Clear long press timeout on movement
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }

    if (e.touches.length === 2 && initialTouchesRef.current.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const initialTouch1 = initialTouchesRef.current[0];
      const initialTouch2 = initialTouchesRef.current[1];

      // Calculate pinch scale
      const initialDistance = getDistance(
        { x: initialTouch1.clientX, y: initialTouch1.clientY },
        { x: initialTouch2.clientX, y: initialTouch2.clientY },
      );

      const currentDistance = getDistance(
        { x: touch1.clientX, y: touch1.clientY },
        { x: touch2.clientX, y: touch2.clientY },
      );

      const scale = currentDistance / initialDistance;

      if (onPinch && Math.abs(scale - 1) > 0.1) {
        onPinch(scale);

        if (onGesture) {
          onGesture({
            type: 'pinch',
            scale,
          });
        }
      }

      // Calculate rotation angle
      const initialAngle = getAngle(
        { x: initialTouch1.clientX, y: initialTouch1.clientY },
        { x: initialTouch2.clientX, y: initialTouch2.clientY },
      );

      const currentAngle = getAngle(
        { x: touch1.clientX, y: touch1.clientY },
        { x: touch2.clientX, y: touch2.clientY },
      );

      const rotation = currentAngle - initialAngle;

      if (onRotate && Math.abs(rotation) > 10) {
        onRotate(rotation);

        if (onGesture) {
          onGesture({
            type: 'rotate',
            rotation,
          });
        }
      }
    }
  };

  // Handle touch end event
  const handleTouchEnd = (e: React.TouchEvent) => {
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
          if (onTap) {
            onTap(touchEnd);

            if (onGesture) {
              onGesture({
                type: 'tap',
              });
            }
          }
        } else if (distance >= 50) {
          // It's a swipe, determine direction
          const dx = touchEnd.x - touchStartRef.current.x;
          const dy = touchEnd.y - touchStartRef.current.y;
          let direction: 'left' | 'right' | 'up' | 'down';

          // Determine primary direction based on which axis has greater movement
          if (Math.abs(dx) > Math.abs(dy)) {
            direction = dx > 0 ? 'right' : 'left';
          } else {
            direction = dy > 0 ? 'down' : 'up';
          }

          if (onSwipe) {
            onSwipe(direction, distance);

            if (onGesture) {
              onGesture({
                type: 'swipe',
                direction,
              });
            }
          }
        }
      }
    }

    // Reset
    touchStartRef.current = null;
    initialTouchesRef.current = [];
  };

  return (
    <div
      ref={containerRef}
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
