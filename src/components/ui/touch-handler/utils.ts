/**
 * Utility functions and types for the TouchHandler component
 */

/**
 * Represents a touch position with x and y coordinates
 */
export interface TouchPosition {
  x: number;
  y: number;
}

/**
 * Represents a touch gesture with type and additional data
 */
export interface TouchGesture {
  type: 'tap' | 'swipe' | 'pinch' | 'rotate' | 'longpress';
  direction?: 'left' | 'right' | 'up' | 'down';
  scale?: number;
  rotation?: number;
  duration?: number;
}

/**
 * Calculate the distance between two points
 */
export const getDistance = (p1: TouchPosition, p2: TouchPosition): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

/**
 * Calculate the angle between two points (in degrees)
 */
export const getAngle = (p1: TouchPosition, p2: TouchPosition): number => {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
};

/**
 * Determine the swipe direction based on start and end positions
 */
export const getSwipeDirection = (
  startPos: TouchPosition,
  endPos: TouchPosition
): 'left' | 'right' | 'up' | 'down' => {
  const dx = endPos.x - startPos.x;
  const dy = endPos.y - startPos.y;
  
  // Determine primary direction based on which axis has greater movement
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left';
  } else {
    return dy > 0 ? 'down' : 'up';
  }
}; 