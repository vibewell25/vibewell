import { useEffect, useState } from 'react';

// Breakpoints following Tailwind's default breakpoints
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// Minimum touch target sizes (in pixels) following WCAG guidelines
export const touchTargets = {
  minimum: 44, // Minimum size for interactive elements
  comfortable: 48, // Comfortable size for most touch targets
  large: 64, // Large size for primary actions
};

// Hook to detect screen size
export function useScreenSize() {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
}

// Hook to detect device type
export function useDeviceType() {
  const { width } = useScreenSize();

  if (width < breakpoints.sm) {
    return 'mobile';
  } else if (width < breakpoints.lg) {
    return 'tablet';
  }
  return 'desktop';
}

// Hook to detect touch capability
export function useTouchCapability() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasTouch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore
      navigator.msMaxTouchPoints > 0;

    setIsTouch(hasTouch);
  }, []);

  return isTouch;
}

// Helper to generate responsive styles
export function getResponsiveStyles(deviceType: 'mobile' | 'tablet' | 'desktop') {
  const baseStyles = {
    interactive: {
      minWidth: `${touchTargets.minimum}px`,
      minHeight: `${touchTargets.minimum}px`,
      padding: '0.5rem',
      margin: '0.25rem',
    },
    text: {
      fontSize: '1rem',
      lineHeight: '1.5',
    },
    spacing: {
      gap: '1rem',
      padding: '1rem',
    },
  };

  switch (deviceType) {
    case 'mobile':
      return {
        ...baseStyles,
        interactive: {
          ...baseStyles.interactive,
          minWidth: `${touchTargets.comfortable}px`,
          minHeight: `${touchTargets.comfortable}px`,
          padding: '0.75rem',
          margin: '0.5rem',
        },
        text: {
          ...baseStyles.text,
          fontSize: '1.125rem',
        },
        spacing: {
          ...baseStyles.spacing,
          gap: '1.5rem',
          padding: '1.5rem',
        },
      };
    case 'tablet':
      return {
        ...baseStyles,
        interactive: {
          ...baseStyles.interactive,
          minWidth: `${touchTargets.comfortable}px`,
          minHeight: `${touchTargets.comfortable}px`,
        },
      };
    default:
      return baseStyles;
  }
}

// Helper to generate responsive class names
export function getResponsiveClasses(deviceType: 'mobile' | 'tablet' | 'desktop') {
  const baseClasses = {
    interactive: 'min-w-[44px] min-h-[44px] p-2 m-1',
    container: 'w-full mx-auto px-4',
    text: 'text-base leading-relaxed',
  };

  switch (deviceType) {
    case 'mobile':
      return {
        ...baseClasses,
        interactive: 'min-w-[48px] min-h-[48px] p-3 m-2',
        container: 'w-full mx-auto px-6',
        text: 'text-lg leading-relaxed',
      };
    case 'tablet':
      return {
        ...baseClasses,
        container: 'max-w-2xl mx-auto px-6',
      };
    default:
      return {
        ...baseClasses,
        container: 'max-w-4xl mx-auto px-8',
      };
  }
}
