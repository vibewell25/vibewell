/**
 * Enhanced image optimization utilities
 */

import { createImageCache } from './cache';

const imageCache = createImageCache();

/**
 * Image format support detection
 */
const detectImageSupport = () => {
  const formats = {
    webp: false,
    avif: false,
    jpeg2000: false
  };
  
  if (typeof window !== 'undefined') {
    const canvas = document.createElement('canvas');
    if (canvas.toDataURL) {
      formats.webp = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      formats.avif = canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
      formats.jpeg2000 = canvas.toDataURL('image/jp2').indexOf('data:image/jp2') === 0;
    }
  }
  
  return formats;
};

/**
 * Generate optimized image URL based on device capabilities and network
 * @param {string} url - Original image URL
 * @param {Object} options - Optimization options
 * @returns {string} - Optimized image URL
 */
export const generateOptimizedImageUrl = (url, options = {}) => {
  const {
    width = window.innerWidth,
    quality = 80,
    format = 'auto'
  } = options;

  const formats = detectImageSupport();
  const connection = navigator.connection?.effectiveType || '4g';
  
  // Adjust quality based on network connection
  const networkQuality = {
    'slow-2g': 60,
    '2g': 70,
    '3g': 80,
    '4g': 85,
    '5g': 90
  }[connection] || quality;

  // Choose best format based on support
  let targetFormat = format;
  if (format === 'auto') {
    if (formats.avif) targetFormat = 'avif';
    else if (formats.webp) targetFormat = 'webp';
    else targetFormat = 'jpeg';
  }

  // Calculate optimal dimensions
  const devicePixelRatio = window.devicePixelRatio || 1;
  const targetWidth = Math.round(width * devicePixelRatio);

  // Construct optimized URL (assuming a CDN that supports these parameters)
  const optimizedUrl = new URL(url);
  optimizedUrl.searchParams.set('w', targetWidth.toString());
  optimizedUrl.searchParams.set('q', networkQuality.toString());
  optimizedUrl.searchParams.set('fm', targetFormat);

  return optimizedUrl.toString();
};

/**
 * Enhanced lazy loading with preloading for critical images
 * @param {string} selector - CSS selector for images to lazy load
 * @param {Object} options - Lazy loading options
 */
export const setupLazyLoading = (selector = 'img[data-src]', options = {}) => {
  const {
    rootMargin = '50px 0px',
    threshold = 0.01,
    preloadCritical = true,
    cacheImages = true
  } = options;

  // Preload critical images
  if (preloadCritical) {
    document.querySelectorAll('img[data-critical="true"]').forEach(img => {
      if (img.dataset.src) {
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.as = 'image';
        preloadLink.href = img.dataset.src;
        document.head.appendChild(preloadLink);
      }
    });
  }

  if (!('IntersectionObserver' in window)) {
    // Fallback for browsers that don't support IntersectionObserver
    document.querySelectorAll(selector).forEach(img => {
      if (img.dataset.src) {
        const optimizedUrl = generateOptimizedImageUrl(img.dataset.src);
        img.src = optimizedUrl;
      }
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
      }
    });
    return;
  }

  const loadImage = async (img) => {
    try {
      if (img.dataset.src) {
        const optimizedUrl = generateOptimizedImageUrl(img.dataset.src);
        
        if (cacheImages) {
          const cachedImage = await imageCache.get(optimizedUrl);
          if (cachedImage) {
            img.src = cachedImage;
            return;
          }
        }

        img.src = optimizedUrl;
        
        if (cacheImages) {
          // Cache the image after loading
          img.onload = () => {
            imageCache.set(optimizedUrl, optimizedUrl);
          };
        }
      }

      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
      }
    } catch (error) {
      console.error('Error loading image:', error);
      // Fallback to original source
      if (img.dataset.src) img.src = img.dataset.src;
    }
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        loadImage(img);
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin,
    threshold
  });
  
  document.querySelectorAll(selector).forEach(img => {
    observer.observe(img);
  });
};

/**
 * Prefetch images that might be needed soon
 * @param {string[]} urls - Array of image URLs to prefetch
 */
export const prefetchImages = (urls = []) => {
  if (!urls.length) return;

  // Create a connection to check network conditions
  const connection = navigator.connection;
  
  // Only prefetch on fast connections
  if (connection && (connection.saveData || connection.effectiveType === 'slow-2g')) {
    return;
  }

  // Use requestIdleCallback to prefetch during idle time
  const prefetch = (url) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'image';
    link.href = generateOptimizedImageUrl(url);
    document.head.appendChild(link);
  };

  if ('requestIdleCallback' in window) {
    urls.forEach(url => {
      requestIdleCallback(() => prefetch(url));
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    urls.forEach(prefetch);
  }
};

export default {
  setupLazyLoading,
  generateOptimizedImageUrl,
  prefetchImages
}; 