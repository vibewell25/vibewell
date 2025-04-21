import { useState, useEffect } from 'react';
import {
  BREAKPOINTS,
  DeviceType,
  detectDeviceType,
  getViewportDimensions,
  isTouchDevice,
} from '@/utils/responsive-checker';

type Dimensions = { width: number; height: number };

/**
 * A React hook that provides responsive information and layout helpers
 */
export function useResponsive() {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    // Get initial values
    setDeviceType(detectDeviceType());
    setDimensions(getViewportDimensions());
    setIsTouch(isTouchDevice());

    // Set up resize listener
    const handleResize = () => {
      setDeviceType(detectDeviceType());
      setDimensions(getViewportDimensions());
    };

    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Helper functions
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType === 'desktop';

  // Check if screen matches a certain breakpoint
  const isBreakpoint = (
    breakpoint: keyof typeof BREAKPOINTS,
    comparison: 'up' | 'down' | 'only' = 'up'
  ) => {
    const width = dimensions.width;

    switch (comparison) {
      case 'up':
        return width >= BREAKPOINTS[breakpoint];
      case 'down':
        return width < BREAKPOINTS[breakpoint];
      case 'only':
        const nextBreakpoint = Object.entries(BREAKPOINTS).find(
          ([key, value]) => value > BREAKPOINTS[breakpoint]
        );
        return (
          width >= BREAKPOINTS[breakpoint] && (nextBreakpoint ? width < nextBreakpoint[1] : true)
        );
      default:
        return false;
    }
  };

  return {
    deviceType,
    dimensions,
    isTouch,
    isMobile,
    isTablet,
    isDesktop,
    isBreakpoint,
    breakpoints: BREAKPOINTS,
  };
}
