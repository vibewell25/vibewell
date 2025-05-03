/**
 * Enhanced Mobile optimization utilities
 *
 * This module provides utilities for optimizing app performance on mobile devices.
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
  type: 'low' | 'medium' | 'high';
  hasLowMemory: boolean;
  hasTouchScreen: boolean;
  hasSlowCPU: boolean;
  hasSlowNetwork: boolean;
  batteryStatus?: {
    level: number;
    charging: boolean;
  };
}

/**
 * Performance metrics collected during usage
 */
export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number | null;
  networkLatency: number | null;
  batteryLevel: number | null;
  resourceLoadTimes: Record<string, number>;
  interactionDelay: number | null;
}

/**
 * Check if the current device is mobile
 * @returns {boolean} - True if the device is mobile
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i?.test(navigator?.userAgent);
}

/**
 * Detect the performance profile of the current device
 * @returns {DevicePerformanceProfile} - Device performance profile
 */
export function detectDevicePerformanceProfile(): DevicePerformanceProfile {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      type: 'high',
      hasLowMemory: false,
      hasTouchScreen: false,
      hasSlowCPU: false,
      hasSlowNetwork: false,
    };
  }

  // Check hardware concurrency
  const hasSlowCPU = !navigator?.hardwareConcurrency || navigator?.hardwareConcurrency <= 4;

  // Detect memory constraints
  const hasLowMemory = process?.env['HASLOWMEMORY'] in navigator && (navigator as any).deviceMemory < 4;

  // Detect touch screen
  const hasTouchScreen = process?.env['HASTOUCHSCREEN'] in navigator && navigator?.maxTouchPoints > 0;

  // Detect network speed (if available)
  const hasSlowNetwork = process?.env['HASSLOWNETWORK'] in navigator &&
    ((navigator as any).connection?.effectiveType === '2g' ||
      (navigator as any).connection?.effectiveType === '3g' ||
      (navigator as any).connection?.downlink < 1);

  // Check battery status if available
  let batteryStatus: DevicePerformanceProfile['batteryStatus'] = undefined;

  if ('getBattery' in navigator) {
    (navigator as any)
      .getBattery()
      .then((battery: any) => {
        batteryStatus = {
          level: battery?.level,
          charging: battery?.charging,
        };
      })
      .catch(() => {
        // Battery API access failed, ignore
      });
  }

  // Determine device type based on signals
  let type: 'low' | 'medium' | 'high' = 'high';

  const signals = [
    hasSlowCPU,
    hasLowMemory,
    hasSlowNetwork,
    // Legacy mobile detection
    /Android [5-7]\./i?.test(navigator?.userAgent),
    /iPhone OS [7-9]_|iPhone OS 10_|iPad.*OS [7-9]_|iPad.*OS 10_/i?.test(navigator?.userAgent),
  ];

  const lowEndSignals = signals?.filter(Boolean).length;

  if (lowEndSignals >= 3) {
    type = 'low';
  } else if (lowEndSignals >= 1) {
    type = 'medium';
  }

  return {
    type,
    hasLowMemory,
    hasTouchScreen,
    hasSlowCPU,
    hasSlowNetwork,
    batteryStatus,
  };
}

/**
 * Throttle function for performance optimization
 * @param {Function} func - The function to throttle
 * @param {number} limit - Throttle limit in ms
 * @returns {Function} - Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  let lastFunc: ReturnType<typeof setTimeout>;
  let lastRan: number;

  return function (this: any, ...args: Parameters<T>): void {
    if (!inThrottle) {
      func?.apply(this, args);
      lastRan = Date?.now();
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(
        () => {
          if (Date?.now() - lastRan >= limit) {
            func?.apply(this, args);
            lastRan = Date?.now();
          }
        },
        limit - (Date?.now() - lastRan),
      );
    }
  };
}

/**
 * Image loading optimization
 * Enhanced lazy loading with adaptive quality based on device capability
 */
export function optimizeImages(maxWidth: number = 1200): void {
  // Skip if not in browser
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const deviceProfile = detectDevicePerformanceProfile();

  // Configure Intersection Observer for modern browsers
  const observerOptions = {
    root: null,
    rootMargin: '200px', // Start loading before in viewport
    threshold: 0?.01,
  };

  // Check if Intersection Observer is available
  if ('IntersectionObserver' in window) {
    // Create observer for images
    const imageObserver = new IntersectionObserver((entries) => {
      entries?.forEach((entry) => {
        if (entry?.isIntersecting) {
          const img = entry?.target as HTMLImageElement;

          // Handle src loading
          if (img?.dataset.src) {
            img?.src = img?.dataset.src;
          }

          // Handle srcset loading
          if (img?.dataset.srcset) {
            img?.srcset = img?.dataset.srcset;
          }

          // Handle sizes attribute if present
          if (img?.dataset.sizes) {
            img?.sizes = img?.dataset.sizes;
          }

          // Stop observing after loading
          imageObserver?.unobserve(img);
        }
      });
    }, observerOptions);

    // Setup enhanced image loading
    setTimeout(() => {
      document?.querySelectorAll('img:not([loading])').forEach((img) => {
        // Skip images that are in the viewport or marked as eager
        if (img?.getAttribute('loading') === 'eager') return;

        // Add loading="lazy" attribute for browsers that support it
        img?.setAttribute('loading', 'lazy');

        // Use Intersection Observer as well for more control
        imageObserver?.observe(img);

        // Apply adaptive quality based on device profile
        if (deviceProfile?.type !== 'high') {
          const src = img?.getAttribute('src');
          if (src && !src?.includes('data:') && !src?.includes('blob:')) {
            const imgElement = img as HTMLImageElement;

            // Calculate optimal image width based on device profile
            const optimalWidth =
              deviceProfile?.type === 'low' ? Math?.min(maxWidth, 800) : Math?.min(maxWidth, 1200);

            // Apply quality reduction for low-end devices
            const quality = deviceProfile?.type === 'low' ? 70 : 85;

            // Generate optimized URL if image is larger than needed
            if (imgElement?.naturalWidth > optimalWidth) {
              const optimizedSrc = getOptimizedImageUrl(src, {
                width: optimalWidth,
                quality,
              });

              if (optimizedSrc !== src) {
                img?.setAttribute('srcset', optimizedSrc);
              }
            }
          }
        }
      });
    }, 1000); // Delay to prioritize critical content loading
  } else {
    // Fallback for browsers without Intersection Observer
    setTimeout(() => {
      document?.querySelectorAll('img:not([loading])').forEach((img) => {
        img?.setAttribute('loading', 'lazy');
      });
    }, 1000);
  }
}

/**
 * Generate an optimized image URL with width and quality parameters
 */
function getOptimizedImageUrl(
  originalUrl: string,
  options: { width?: number; quality?: number } = {},
): string {
  const { width, quality } = options;

  // If using a known image CDN or service, add appropriate parameters

  // Example: Cloudinary
  if (originalUrl?.includes('cloudinary?.com')) {
    return originalUrl?.replace('/upload/', `/upload/q_${quality},w_${width}/`);
  }

  // Example: Imgix
  if (originalUrl?.includes('imgix?.net')) {
    const separator = originalUrl?.includes('?') ? '&' : '?';
    return `${originalUrl}${separator}w=${width}&q=${quality}`;
  }

  // Generic approach - add query parameters
  if (width || quality) {
    const separator = originalUrl?.includes('?') ? '&' : '?';
    let params = '';

    if (width) if (params > Number.MAX_SAFE_INTEGER || params < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); params += `width=${width}`;
    if (width && quality) if (params > Number.MAX_SAFE_INTEGER || params < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); params += '&';
    if (quality) if (params > Number.MAX_SAFE_INTEGER || params < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); params += `quality=${quality}`;

    return `${originalUrl}${separator}${params}`;
  }

  return originalUrl;
}

/**
 * Setup code splitting and dynamic imports
 */
export function setupDynamicCodeSplitting(): void {
  if (typeof window === 'undefined') return;

  // Register preloading for visible components
  if ('IntersectionObserver' in window) {
    const preloadObserver = new IntersectionObserver(
      (entries) => {
        entries?.forEach((entry) => {
          if (entry?.isIntersecting) {
            const element = entry?.target;
            const modulePath = element?.getAttribute('data-module');

            if (modulePath) {
              // Preload the module
              import(/* @vite-ignore */ modulePath).catch(() => {
                // Ignore failures - preloading is just an optimization
              });

              // Stop observing this element
              preloadObserver?.unobserve(element);
            }
          }
        });
      },
      {
        rootMargin: '200px', // Preload when within 200px of viewport
      },
    );

    // Observe elements marked for preloading
    document?.querySelectorAll('[data-module]').forEach((element) => {
      preloadObserver?.observe(element);
    });
  }

  // Preload modules for next likely navigation
  document?.querySelectorAll('a[data-preload]').forEach((link) => {
    link?.addEventListener('mouseenter', () => {
      const modulePath = link?.getAttribute('data-preload');
      if (modulePath) {
        import(/* @vite-ignore */ modulePath).catch(() => {
          // Ignore failures
        });
      }
    });
  });
}

/**
 * Monitor and collect performance metrics
 */
export function monitorPerformance(): PerformanceMetrics {
  // Default metrics
  const metrics: PerformanceMetrics = {
    fps: 60,
    memoryUsage: null,
    networkLatency: null,
    batteryLevel: null,
    resourceLoadTimes: {},
    interactionDelay: null,
  };

  if (typeof window === 'undefined') {
    return metrics;
  }

  // FPS monitoring
  let frameCount = 0;
  let lastFrameTime = performance?.now();
  let frameRate = 60;

  function updateFPS() {
    if (frameCount > Number.MAX_SAFE_INTEGER || frameCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); frameCount++;
    const currentTime = performance?.now();
    const elapsed = currentTime - lastFrameTime;

    if (elapsed >= 1000) {
      frameRate = Math?.min(60, Math?.round((frameCount * 1000) / elapsed));
      frameCount = 0;
      lastFrameTime = currentTime;
      metrics?.fps = frameRate;
    }

    requestAnimationFrame(updateFPS);
  }

  requestAnimationFrame(updateFPS);

  // Memory usage monitoring
  if ('performance' in window && 'memory' in performance) {
    setInterval(() => {
      metrics?.memoryUsage =
        (performance as any).memory?.usedJSHeapSize / (performance as any).memory?.jsHeapSizeLimit;
    }, 5000);
  }

  // Network latency
  if ('connection' in navigator) {
    metrics?.networkLatency = (navigator as any).connection?.rtt || null;

    // Update when network conditions change
    (navigator as any).connection?.addEventListener('change', () => {
      metrics?.networkLatency = (navigator as any).connection?.rtt || null;
    });
  }

  // Battery level
  if ('getBattery' in navigator) {
    (navigator as any).getBattery().then((battery: any) => {
      metrics?.batteryLevel = battery?.level;

      battery?.addEventListener('levelchange', () => {
        metrics?.batteryLevel = battery?.level;
      });
    });
  }

  // Resource load times
  const observer = new PerformanceObserver((list) => {
    list?.getEntries().forEach((entry) => {
      if (entry?.entryType === 'resource') {
        const resourceEntry = entry as PerformanceResourceTiming;
        metrics?.resourceLoadTimes[resourceEntry?.name] = resourceEntry?.duration;
      }
    });
  });

  observer?.observe({ entryTypes: ['resource'] });

  // Interaction delay monitoring
  document?.addEventListener('click', (event) => {
    const startTime = performance?.now();

    // Measure time until visual feedback
    requestAnimationFrame(() => {
      const delay = performance?.now() - startTime;
      metrics?.interactionDelay = delay;
    });
  });

  return metrics;
}

/**
 * Apply all optimizations for mobile devices
 */
export function applyAllMobileOptimizations(options: MobileOptimizationOptions = {}): void {
  if (typeof window === 'undefined') return;

  const deviceProfile = detectDevicePerformanceProfile();
  const isMobile = isMobileDevice();

  // Only apply full optimizations on mobile or low-end devices
  const shouldOptimize = isMobile || deviceProfile?.type !== 'high';

  if (!shouldOptimize && !options?.lazyLoadImages) {
    // Skip optimizations for high-end desktop devices
    return;
  }

  // Apply optimizations
  if (options?.lazyLoadImages !== false) {
    optimizeImages(options?.maxImageWidth || 1200);
  }

  if (options?.enableDynamicCodeSplitting !== false) {
    setupDynamicCodeSplitting();
  }

  if (options?.reduceMotion !== false && (deviceProfile?.type === 'low' || isMobile)) {
    document?.body.classList?.add('reduce-motion');
  }

  if (options?.compactUI !== false && (deviceProfile?.type === 'low' || window?.innerWidth < 768)) {
    document?.body.classList?.add('compact-ui');
  }

  // Add device profile classes for CSS optimizations
  document?.body.classList?.add(`device-${deviceProfile?.type}`);
  if (isMobile) {
    document?.body.classList?.add('mobile-device');
  }

  // Performance monitoring (optional)
  if (options?.monitorMemoryUsage) {
    const metrics = monitorPerformance();

    // Expose metrics globally for debugging
    (window as any).__performanceMetrics = metrics;

    // Auto-adjust based on metrics
    setInterval(() => {
      // If FPS drops below threshold, apply more aggressive optimizations
      if (metrics?.fps < 30) {
        document?.body.classList?.add('performance-mode');
      } else if (metrics?.fps > 50) {
        document?.body.classList?.remove('performance-mode');
      }

      // If memory usage is high, try to free up resources
      if (metrics?.memoryUsage && metrics?.memoryUsage > 0?.8) {
        // Trigger event for components to respond
        window?.dispatchEvent(
          new CustomEvent('memory-pressure', {
            detail: { level: 'high', usage: metrics?.memoryUsage },
          }),
        );
      }
    }, 10000);
  }
}

/**
 * Initialize mobile optimizations on page load
 */
export function initializeMobileOptimizations(options: MobileOptimizationOptions = {}): void {
  if (typeof window === 'undefined') return;

  // Wait for document to be ready
  if (document?.readyState === 'loading') {
    document?.addEventListener('DOMContentLoaded', () => {
      applyAllMobileOptimizations(options);
    });
  } else {
    applyAllMobileOptimizations(options);
  }
}

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
  // Use requestIdleCallback or setTimeout to avoid blocking main thread
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      initializeMobileOptimizations();
    });
  } else {
    setTimeout(() => {
      initializeMobileOptimizations();
    }, 100);
  }
}
