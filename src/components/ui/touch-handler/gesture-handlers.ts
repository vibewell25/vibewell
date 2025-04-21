import { TouchPosition, TouchGesture, getDistance, getAngle, getSwipeDirection } from './utils';

/**
 * Handle tap gesture
 */
export const handleTapGesture = (
  touchEnd: TouchPosition,
  onTap?: (position: TouchPosition) => void,
  onGesture?: (gesture: TouchGesture) => void
) => {
  if (onTap) {
    onTap(touchEnd);

    if (onGesture) {
      onGesture({
        type: 'tap',
      });
    }
  }
};

/**
 * Handle swipe gesture
 */
export const handleSwipeGesture = (
  startPos: TouchPosition,
  endPos: TouchPosition,
  distance: number,
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down', distance: number) => void,
  onGesture?: (gesture: TouchGesture) => void
) => {
  const direction = getSwipeDirection(startPos, endPos);

  if (onSwipe) {
    onSwipe(direction, distance);

    if (onGesture) {
      onGesture({
        type: 'swipe',
        direction,
      });
    }
  }
};

/**
 * Handle pinch gesture
 */
export const handlePinchGesture = (
  currentTouches: React.Touch[],
  initialTouches: React.Touch[],
  onPinch?: (scale: number) => void,
  onGesture?: (gesture: TouchGesture) => void
) => {
  if (currentTouches.length < 2 || initialTouches.length < 2) return;

  const initialDistance = getDistance(
    { x: initialTouches[0].clientX, y: initialTouches[0].clientY },
    { x: initialTouches[1].clientX, y: initialTouches[1].clientY }
  );

  const currentDistance = getDistance(
    { x: currentTouches[0].clientX, y: currentTouches[0].clientY },
    { x: currentTouches[1].clientX, y: currentTouches[1].clientY }
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
};

/**
 * Handle rotate gesture
 */
export const handleRotateGesture = (
  currentTouches: React.Touch[],
  initialTouches: React.Touch[],
  onRotate?: (angle: number) => void,
  onGesture?: (gesture: TouchGesture) => void
) => {
  if (currentTouches.length < 2 || initialTouches.length < 2) return;

  const initialAngle = getAngle(
    { x: initialTouches[0].clientX, y: initialTouches[0].clientY },
    { x: initialTouches[1].clientX, y: initialTouches[1].clientY }
  );

  const currentAngle = getAngle(
    { x: currentTouches[0].clientX, y: currentTouches[0].clientY },
    { x: currentTouches[1].clientX, y: currentTouches[1].clientY }
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
};

/**
 * Handle long press gesture
 */
export const handleLongPressGesture = (
  position: TouchPosition,
  longPressThreshold: number,
  onLongPress?: (position: TouchPosition) => void,
  onGesture?: (gesture: TouchGesture) => void
) => {
  if (onLongPress) {
    onLongPress(position);

    if (onGesture) {
      onGesture({
        type: 'longpress',
        duration: longPressThreshold,
      });
    }
  }
};
