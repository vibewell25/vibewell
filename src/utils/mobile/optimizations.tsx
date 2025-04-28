/**
 * Mobile optimization implementation functions
 */
import { DevicePerformanceProfile } from './types';

/**
 * Apply lazy loading to all images based on device capabilities
 * @param maxImageWidth - Maximum image width to use for mobile devices
 * @param deviceProfile - Device performance profile
 */
export function applyLazyLoading(
  maxImageWidth: number,
  deviceProfile: DevicePerformanceProfile,
): void {
  if (typeof document === 'undefined') return;

  // Find all images that don't have loading="lazy" already applied
  const images = document.querySelectorAll('img:not([loading="lazy"])');

  images.forEach((img) => {
    // Cast to HTMLImageElement to access src property
    const imgElement = img as HTMLImageElement;

    // Add loading lazy attribute
    imgElement.setAttribute('loading', 'lazy');

    // For low-end devices, we'll also set decoding to async
    if (deviceProfile.type !== 'high') {
      imgElement.setAttribute('decoding', 'async');
    }

    // If the image has a src attribute, check if it needs resizing
    if (imgElement.src && !imgElement.src.includes('data:')) {
      // Don't optimize SVGs and already optimized images
      if (!imgElement.src.includes('.svg') && !imgElement.src.includes('?w=')) {
        try {
          const originalUrl = new URL(imgElement.src);
          const optimizedUrl = generateOptimizedImageUrl(originalUrl.toString(), maxImageWidth);
          imgElement.src = optimizedUrl;
        } catch (e) {
          // Invalid URL, skip optimization
        }
      }
    }
  });

  // Pre-connect to image CDNs if used in the page
  const imageDomains = [
    'images.unsplash.com',
    'res.cloudinary.com',
    'cdn.shopify.com',
    'i.pravatar.cc',
  ];

  // Create preconnect links for common image domains found in the source
  const html = document.documentElement.innerHTML;
  imageDomains.forEach((domain) => {
    if (
      html.includes(domain) &&
      !document.querySelector(`link[rel="preconnect"][href*="${domain}"]`)
    ) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = `https://${domain}`;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  });
}

/**
 * Create a throttled function that limits execution
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  let lastFunc: ReturnType<typeof setTimeout>;
  let lastRan: number;

  return function (this: any, ...args: Parameters<T>): void {
    if (!inThrottle) {
      func.apply(this, args);
      lastRan = Date.now();
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(
        () => {
          if (Date.now() - lastRan >= limit) {
            func.apply(this, args);
            lastRan = Date.now();
          }
        },
        limit - (Date.now() - lastRan),
      );
    }
  };
}

/**
 * Apply event throttling to improve performance on mobile devices
 * @param deviceProfile - Device performance profile
 */
export function applyEventThrottling(deviceProfile: DevicePerformanceProfile): void {
  if (typeof window === 'undefined') return;

  // Only apply aggressive throttling on low-end devices
  const throttleTime =
    deviceProfile.type === 'low' ? 100 : deviceProfile.type === 'medium' ? 50 : 16;

  // Common event listeners that can be throttled
  const eventTypes = ['scroll', 'resize', 'mousemove', 'pointermove', 'touchmove'];

  // Store original event listeners
  const originalAddEventListener = EventTarget.prototype.addEventListener;

  // Override addEventListener to automatically throttle certain events
  EventTarget.prototype.addEventListener = function (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) {
    if (eventTypes.includes(type)) {
      let throttledListener: EventListenerOrEventListenerObject;

      if (typeof listener === 'function') {
        throttledListener = throttle(listener, throttleTime);
      } else {
        const originalHandleEvent = listener.handleEvent;
        listener.handleEvent = throttle(originalHandleEvent, throttleTime);
        throttledListener = listener;
      }

      originalAddEventListener.call(this, type, throttledListener, options);
    } else {
      originalAddEventListener.call(this, type, listener, options);
    }
  };
}

/**
 * Generate an optimized image URL with proper width parameters
 * @param originalUrl - The original image URL
 * @param maxWidth - Maximum width for the image
 * @returns Optimized image URL
 */
export function generateOptimizedImageUrl(originalUrl: string, maxWidth: number): string {
  try {
    const url = new URL(originalUrl);

    // Handle common image CDNs
    if (url.hostname === 'images.unsplash.com') {
      // Unsplash already has a good API for this
      url.searchParams.set('w', maxWidth.toString());
      url.searchParams.set('q', '75');
      url.searchParams.set('auto', 'format');
    } else if (url.hostname === 'res.cloudinary.com') {
      // Handle Cloudinary URLs
      const parts = url.pathname.split('/');
      const uploadIndex = parts.findIndex((p) => p === 'upload');

      if (uploadIndex !== -1) {
        parts.splice(uploadIndex + 1, 0, `w_${maxWidth},q_auto:eco`);
        url.pathname = parts.join('/');
      }
    }

    return url.toString();
  } catch (e) {
    // If URL parsing fails, return the original
    return originalUrl;
  }
}
