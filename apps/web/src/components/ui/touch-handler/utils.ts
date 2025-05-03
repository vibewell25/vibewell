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
export {};

/**
 * Calculate the angle between two points (in degrees)
 */
export {};

/**
 * Determine the swipe direction based on start and end positions
 */
export {};
