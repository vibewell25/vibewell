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
export {};
