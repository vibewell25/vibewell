/**
 * Types for mobile optimization utilities
 */

/**
 * Configuration options for mobile optimizations
 */
export interface MobileOptimizationOptions {
  /**
   * Whether to apply lazy loading to images
   */
  lazyLoadImages?: boolean;

  /**
   * Whether to apply reduced motion for animations
   */
  reduceMotion?: boolean;

  /**

   * Whether to defer non-critical resources
   */
  deferNonCritical?: boolean;

  /**
   * Whether to apply compact UI elements on small screens
   */
  compactUI?: boolean;

  /**
   * Maximum image resolution on mobile (width in pixels)
   */
  maxImageWidth?: number;

  /**
   * Throttle event listeners for better performance
   */
  throttleEvents?: boolean;

  /**
   * Enable dynamic code splitting
   */
  enableDynamicCodeSplitting?: boolean;

  /**
   * Monitor memory usage
   */
  monitorMemoryUsage?: boolean;

  /**
   * Enable offline support enhancements
   */
  enhanceOfflineSupport?: boolean;
}

/**
 * Device performance profile
 */
export interface DevicePerformanceProfile {
  /**
   * Device performance classification
   */
  type: 'low' | 'medium' | 'high';

  /**
   * Whether the device has low memory
   */
  hasLowMemory: boolean;

  /**
   * Whether the device has a touch screen
   */
  hasTouchScreen: boolean;

  /**
   * Whether the device has a slow CPU
   */
  hasSlowCPU: boolean;

  /**
   * Whether the device has a slow network connection
   */
  hasSlowNetwork: boolean;

  /**
   * Battery status information
   */
  batteryStatus?: {
    level: number;
    charging: boolean;
  };
}
