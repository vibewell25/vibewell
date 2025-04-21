/**
 * Responsive checker utility for VibeWell
 *
 * This utility provides functions to detect device types, check screen sizes,
 * and help with responsive behavior across the platform.
 */

// Standard breakpoints used throughout the application
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// Device types for targeted optimizations
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Detects the current device type based on user agent and screen size
 */
export function detectDeviceType(): DeviceType {
  // Check if window is available (client-side)
  if (typeof window === 'undefined') {
    return 'desktop'; // Default for server-side rendering
  }

  // Check for mobile devices via user agent
  const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  // Get the screen width
  const screenWidth = window.innerWidth;

  // Determine device type based on screen width and user agent
  if (isMobileUserAgent && screenWidth < BREAKPOINTS.md) {
    return 'mobile';
  } else if (screenWidth < BREAKPOINTS.lg || (isMobileUserAgent && screenWidth >= BREAKPOINTS.md)) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

/**
 * Check if the current device is a touch device
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') {
    return false; // Default for server-side rendering
  }

  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
}

/**
 * Get the current viewport dimensions
 */
export function getViewportDimensions(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 }; // Default for server-side rendering
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

/**
 * Check if the current viewport matches a specific breakpoint
 */
export function matchesBreakpoint(breakpoint: keyof typeof BREAKPOINTS): boolean {
  if (typeof window === 'undefined') {
    return false; // Default for server-side rendering
  }

  const { width } = getViewportDimensions();

  switch (breakpoint) {
    case 'xs':
      return width >= BREAKPOINTS.xs && width < BREAKPOINTS.sm;
    case 'sm':
      return width >= BREAKPOINTS.sm && width < BREAKPOINTS.md;
    case 'md':
      return width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
    case 'lg':
      return width >= BREAKPOINTS.lg && width < BREAKPOINTS.xl;
    case 'xl':
      return width >= BREAKPOINTS.xl && width < BREAKPOINTS['2xl'];
    case '2xl':
      return width >= BREAKPOINTS['2xl'];
    default:
      return false;
  }
}

/**
 * Create a custom hook to detect screen size changes
 */
export function createResponsiveListener(
  callback: (deviceType: DeviceType, dimensions: { width: number; height: number }) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {}; // No-op for server-side rendering
  }

  const handleResize = () => {
    const deviceType = detectDeviceType();
    const dimensions = getViewportDimensions();
    callback(deviceType, dimensions);
  };

  // Add event listener
  window.addEventListener('resize', handleResize);

  // Initial call
  handleResize();

  // Return cleanup function
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}
