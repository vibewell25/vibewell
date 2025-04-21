/**
 * Image optimization utilities
 */

/**
 * Generates a responsive image srcset string for different viewport sizes
 * @param {string} baseUrl - Base URL of the image
 * @param {Array<number>} widths - Array of widths to generate srcset for
 * @param {string} format - Image format (jpg, webp, etc.)
 * @returns {string} Formatted srcset string
 */
export const generateSrcSet = (baseUrl, widths = [320, 640, 960, 1280], format = 'webp') => {
  const baseUrlWithoutExt = baseUrl.substring(0, baseUrl.lastIndexOf('.'));
  
  return widths
    .map(width => `${baseUrlWithoutExt}-${width}.${format} ${width}w`)
    .join(', ');
};

/**
 * Lazy loads images that are about to enter the viewport
 * @param {string} selector - CSS selector for images to lazy load
 */
export const setupLazyLoading = (selector = 'img[data-src]') => {
  if (!('IntersectionObserver' in window)) {
    // Fallback for browsers that don't support IntersectionObserver
    document.querySelectorAll(selector).forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
      }
    });
    return;
  }
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset;
        }
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  });
  
  document.querySelectorAll(selector).forEach(img => {
    observer.observe(img);
  });
};

/**
 * Prefetches critical images to improve perceived performance
 * @param {Array<string>} imageUrls - Array of image URLs to prefetch
 */
export const prefetchCriticalImages = (imageUrls) => {
  if (!imageUrls || !imageUrls.length) return;
  
  const prefetch = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });
  };
  
  Promise.all(imageUrls.map(url => prefetch(url)))
    .catch(err => console.error('Failed to prefetch images:', err));
};

/**
 * Returns image dimensions that maintain aspect ratio based on constraints
 * @param {number} originalWidth - Original image width
 * @param {number} originalHeight - Original image height
 * @param {Object} constraints - Max width/height constraints
 * @returns {Object} New dimensions {width, height}
 */
export const calculateAspectRatio = (originalWidth, originalHeight, constraints = { maxWidth: 800, maxHeight: 600 }) => {
  const { maxWidth, maxHeight } = constraints;
  
  let width = originalWidth;
  let height = originalHeight;
  
  if (width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }
  
  if (height > maxHeight) {
    width = Math.round((width * maxHeight) / height);
    height = maxHeight;
  }
  
  return { width, height };
}; 