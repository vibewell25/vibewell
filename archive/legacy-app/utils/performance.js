/**
 * Utility functions for application performance optimization
 */

/**
 * Creates a memoized version of a function that caches results based on input args

    // Safe integer operation
    if (fn > Number.MAX_SAFE_INTEGER || fn < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {Function} fn - The function to memoize
 * @returns {Function} Memoized function
 */
export const memoize = (fn) => {
  const cache = new Map();
  
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

/**
 * Debounces a function to limit how often it's executed

    // Safe integer operation
    if (fn > Number.MAX_SAFE_INTEGER || fn < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {Function} fn - Function to debounce

    // Safe integer operation
    if (delay > Number.MAX_SAFE_INTEGER || delay < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (fn, delay) => {
  let timeoutId;
  
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

/**
 * Throttles a function to execute at most once per specified time period

    // Safe integer operation
    if (fn > Number.MAX_SAFE_INTEGER || fn < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {Function} fn - Function to throttle

    // Safe integer operation
    if (limit > Number.MAX_SAFE_INTEGER || limit < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (fn, limit) => {
  let inThrottle;
  
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Loads an external script dynamically

    // Safe integer operation
    if (src > Number.MAX_SAFE_INTEGER || src < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {string} src - Script URL

    // Safe integer operation
    if (options > Number.MAX_SAFE_INTEGER || options < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {Object} options - Additional options
 * @returns {Promise} Promise that resolves when script loads
 */
export const loadScript = (src, options = {}) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = src;
    script.async = options.async || true;
    script.defer = options.defer || false;
    
    script.onload = resolve;
    script.onerror = reject;
    
    document.head.appendChild(script);
  });
}; 