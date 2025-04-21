/**
 * Mobile optimization utilities for the Vibewell application
 *
 * This module provides tools for optimizing app performance on mobile devices.
 */
import { MobileOptimizationOptions, DevicePerformanceProfile } from './types';
import {
  detectDevicePerformanceProfile,
  isMobileDevice,
  applyDeviceClasses,
} from './deviceDetection';
import {
  applyLazyLoading,
  applyEventThrottling,
  throttle,
  generateOptimizedImageUrl,
} from './optimizations';

/**
 * Apply all mobile optimizations based on the provided options
 * @param {MobileOptimizationOptions} options - Optimization options
 * @returns {void}
 */
export function applyMobileOptimizations(options: MobileOptimizationOptions = {}): void {
  if (typeof window === 'undefined') return;

  const {
    lazyLoadImages = true,
    reduceMotion = true,
    deferNonCritical = true,
    compactUI = true,
    maxImageWidth = 1200,
    throttleEvents = true,
    enableDynamicCodeSplitting = true,
    monitorMemoryUsage = true,
    enhanceOfflineSupport = true,
  } = options;

  // Get device profile
  const deviceProfile = detectDevicePerformanceProfile();

  // Only apply full optimizations on mobile or low-end devices
  const shouldApplyFullOptimizations = isMobileDevice() || deviceProfile.type !== 'high';

  // Apply device classes to body
  applyDeviceClasses();

  // Apply reduced motion for better performance if enabled
  if (reduceMotion && (shouldApplyFullOptimizations || deviceProfile.type === 'low')) {
    document.body.classList.add('reduced-motion');
    // Set reduced motion media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!mediaQuery.matches) {
      document.body.style.setProperty('--app-transition-duration', '0.15s');
    }
  }

  // Apply lazy loading for images
  if (lazyLoadImages) {
    applyLazyLoading(maxImageWidth, deviceProfile);
  }

  // Apply event throttling
  if (throttleEvents && shouldApplyFullOptimizations) {
    applyEventThrottling(deviceProfile);
  }

  console.log('[Performance] Mobile optimizations applied:', {
    deviceType: deviceProfile.type,
    isMobile: isMobileDevice(),
    optimizations: {
      lazyLoadImages,
      reduceMotion,
      throttleEvents,
      compactUI,
    },
  });
}

/**
 * React hook for mobile performance monitoring
 * @returns Device performance profile and utility functions
 */
export function useMobilePerformanceMonitoring() {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      deviceProfile: {
        type: 'high',
        hasLowMemory: false,
        hasTouchScreen: false,
        hasSlowCPU: false,
        hasSlowNetwork: false,
      },
      applyMobileOptimizations,
    };
  }

  const deviceProfile = detectDevicePerformanceProfile();

  return {
    isMobile: isMobileDevice(),
    deviceProfile,
    applyMobileOptimizations,
  };
}

/**
 * Initialize mobile optimizations with the given options
 * This is the main entry point for using mobile optimizations
 *
 * @param options - Mobile optimization options
 */
export function initMobileOptimizations(options: MobileOptimizationOptions = {}): void {
  if (typeof window === 'undefined') return;

  // Apply optimizations on document load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyMobileOptimizations(options);
    });
  } else {
    applyMobileOptimizations(options);
  }
}

// Export all utility functions and types
export {
  detectDevicePerformanceProfile,
  isMobileDevice,
  applyDeviceClasses,
  throttle,
  generateOptimizedImageUrl,
};

export type { MobileOptimizationOptions, DevicePerformanceProfile };
