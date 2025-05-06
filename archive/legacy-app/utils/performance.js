functions for application performance optimization
 */

/**
 * Creates a memoized version of a function that caches results based on input args

    * @param {Function} fn - The function to memoize
 * @returns {Function} Memoized function
 */
export const memoize = (fn) => {
  const cache = new Map();
  
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
const result = fn(...args);
    cache.set(key, result);
    return result;
/**
 * Debounces a function to limit how often it's executed

    * @param {Function} fn - Function to debounce

    * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (fn, delay) => {
  let timeoutId;
  
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
timeoutId = setTimeout(() => {
      fn(...args);
delay);
/**
 * Throttles a function to execute at most once per specified time period

    * @param {Function} fn - Function to throttle

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
limit);
/**
 * Loads an external script dynamically

    * @param {string} src - Script URL

    * @param {Object} options - Additional options
 * @returns {Promise} Promise that resolves when script loads
 */
export const loadScript = (src, options = {}) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
const script = document.createElement('script');
    script.src = src;
    script.async = options.async || true;
    script.defer = options.defer || false;
    
    script.onload = resolve;
    script.onerror = reject;
    
    document.head.appendChild(script);
