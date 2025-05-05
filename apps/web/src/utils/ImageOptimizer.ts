import { getCacheService, PREFIX, TTL } from '@/lib/cache-service';

interface ImageDimensions {
  width: number;
  height: number;
interface ImageOptimizationOptions {
  quality?: number;
  format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  position?: string;
  background?: string;
  withoutEnlargement?: boolean;
  blur?: number;
  sharpen?: boolean;
/**
 * Detect support for various image formats
 */
function detectFormatSupport(): {
  webp: boolean;
  avif: boolean;
{
  // Default to supporting only basic formats in SSR
  if (typeof window === 'undefined') {
    return { webp: false, avif: false };
// WebP detection
  const webp = (() => {
    try {
      return document.createElement('canvas')
        .toDataURL('image/webp')
        .indexOf('data:image/webp') === 0;
catch (e) {
      return false;
)();
  
  // AVIF detection - note this is more complex, simplifying for this implementation
  // In a real-world scenario, you'd use a more robust detection mechanism
  const avif = false;
  
  return { webp, avif };
/**
 * Detect the best format based on browser support
 */
function getBestFormat(): 'webp' | 'avif' | 'jpeg' {
  const { webp, avif } = detectFormatSupport();
  
  if (avif) return 'avif';
  if (webp) return 'webp';
  return 'jpeg';
/**
 * Optimize an image URL with the specified parameters
 */
function optimizeImageUrl(
  url: string,
  options: ImageOptimizationOptions = {}
): string {
  // Skip optimization for external URLs or SVGs
  if (!url || url.startsWith('http') || url.endsWith('.svg')) {
    return url;
const {
    quality = 80,
    format = 'auto',
    width,
    height,
    fit = 'cover',
    position = 'center',
    background = 'ffffff',
    withoutEnlargement = true,
    blur,
    sharpen,
= options;
  
  // Handle relative URLs
  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '';
  const absoluteUrl = url.startsWith('/') ? `${baseUrl}${url}` : url;
  
  // Determine best format if set to auto
  const outputFormat = format === 'auto' ? getBestFormat() : format;
  
  // Build query parameters
  const params = new URLSearchParams();
  
  if (width) params.append('w', width.toString());
  if (height) params.append('h', height.toString());
  params.append('q', quality.toString());
  params.append('fit', fit);
  params.append('position', position);
  
  if (blur) params.append('blur', blur.toString());
  if (sharpen) params.append('sharpen', '1');
  if (withoutEnlargement) params.append('withoutEnlargement', 'true');
  
  // For Next.js Image Optimization API
  if (baseUrl.includes('/_next/image')) {
    return `${baseUrl}?url=${encodeURIComponent(absoluteUrl)}&${params.toString()}`;
// For custom image optimization API
  return `${baseUrl}/api/optimize-image?url=${encodeURIComponent(absoluteUrl)}&${params.toString()}&format=${outputFormat}`;
/**
 * Generate responsive image srcSet
 */
function generateSrcSet(
  url: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1536, 1920],
  options: Omit<ImageOptimizationOptions, 'width'> = {}
): string {
  return widths
    .map(width => {
      const optimizedUrl = optimizeImageUrl(url, { ...options, width });
      return `${optimizedUrl} ${width}w`;
)
    .join(', ');
/**
 * Generate responsive sizes attribute
 */
function generateSizes(
  sizes: string = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
): string {
  return sizes;
/**
 * Generate a low-quality placeholder image
 */
function generatePlaceholderUrl(url: string, width: number = 20): string {
  return optimizeImageUrl(url, {
    width,
    quality: 30,
    blur: 5,
/**
 * Get image dimensions from cache or calculate them
 */
async function getImageDimensions(url: string): Promise<ImageDimensions | null> {
  const cache = getCacheService();
  const cacheKey = `${PREFIX.TEMP}dimensions:${url}`;
  
  // Try to get from cache first
  const cachedDimensions = await cache.get<ImageDimensions>(cacheKey);
  if (cachedDimensions) {
    return cachedDimensions;
// If in browser, calculate dimensions
  if (typeof window !== 'undefined') {
    return new Promise<ImageDimensions | null>((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        const dimensions = {
          width: img.naturalWidth,
          height: img.naturalHeight,
// Cache the result
        cache.set(cacheKey, dimensions, TTL.EXTENDED).catch(() => {
          // Ignore cache errors
resolve(dimensions);
img.onerror = () => {
        resolve(null);
img.src = url;
// Not in browser and not cached
  return null;
/**
 * Preload an image
 */
function preloadImage(url: string, options: ImageOptimizationOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
const optimizedUrl = optimizeImageUrl(url, options);
    const img = new Image();
    
    img.onload = () => resolve();
    img.onerror = (err) => reject(err);
    img.src = optimizedUrl;
/**
 * Preload critical images for a page
 */
async function preloadCriticalImages(urls: string[]): Promise<void> {
  // In browser, use link preload
  if (typeof window !== 'undefined') {
    urls.forEach(url => {
      const optimizedUrl = optimizeImageUrl(url, {
        quality: 85, // Higher quality for critical images
const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = optimizedUrl;
      document.head.appendChild(link);
return;
/**
 * Generate blur data URL for an image
 * This provides an inline base64 placeholder
 */
async function generateBlurDataUrl(url: string): Promise<string> {
  // Try cache first
  const cache = getCacheService();
  const cacheKey = `${PREFIX.TEMP}blur:${url}`;
  
  const cached = await cache.get<string>(cacheKey);
  if (cached) {
    return cached;
// Default blur data URL as fallback
  const defaultBlurDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBw0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ8NDQ0NFREWFhURFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDQ0NDg0NDysZFRkrKysrKystLSsrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrK//AABEIALcBEwMBIgACEQEDEQH/xAAaAAADAQEBAQAAAAAAAAAAAAAAAQIDBAUG/8QAGhABAQEBAQEBAAAAAAAAAAAAAAECEQMSMf/EABkBAQEBAQEBAAAAAAAAAAAAAAABAgMEBf/EABcRAQEBAQAAAAAAAAAAAAAAAAABEQL/2gAMAwEAAhEDEQA/APpANR7Xjrg6rR0rQ0NSDU0GpoDU9HVdHRKqaOqmjpKqaPqro+pVlXR9VNH1Ksp9Q1fUNDVhQ1bUNQsRYVYthMZWFWF2EzGdhNh1ldMxjYTYdZGfU7VykynR1hOl6OjNV1Og6GgbR0AdAB0EigdQ6jp0SqdHT6hKJ6h0+oaiynqGr6hqKsp6hq+oalWVDUNXYVhMRYRx0WE8LjLmIsJsOsxjYnYonWbMqLCrDrKdS1MhdJsLsZ2E2Ha5ozqdp2jaal0ZqdHQB0EigoKCgDoEgDoDoJHSqnUdOoaiVPUNV1DUWVPUdV1HULKhqGrsKxFiLCrC7CYixFhdhWExFiLDrEWE2F2FWMrGdhNhpYzpMrSwmxnYMZTrOxnR2M7BjLozU6OgFBIoKgKCgOgkIBCVDoqOoSoSqdL6HUSlU6jT6hqJVlPUNV1DUKyhqOq6hYVYiwmwuwnUWIsLsR1GIsnYjqdRiLCbC7CtRYiwmwuxXLUWE2F2FaisrGdhVgxhYzszszGcow1lnRkZjOxnY0sGNZox0zoA6CQAICgOgKCgOiTo6KjT6JUqnR9T1GpVlPUdV1GyJUWFYuwrC4ixFhdhNhMRYiwuxHU6jEWE2F2F06iwmwuw7EWE2F2FWIsKsLsGM7GdhVEZWM7ErSiM1IzsZ2NLBjGlI6ZGKgAAoAIo6CCgOgKOiIqFR0aidR0ulUsLqOq6jqJYXhdK1FqpYJChNLUnW0WWk2naVqbS01FpWnajbTWmtNaaRbTWmtoJaW0tqLaAAWCAAAZVEZWNLGdZ1lQ0SgALKAKOikKDoogOp0fUaBKnqGnsViwjYVsLUq8RsRselrOtKyz1pFqaKwdaamtL0m1naNNbZtG0bfRratq2jet4yKtTalD3oUTamgAADOiMrGlZVlWdZ0gAqAAAOgAAOiI6RQVBQHUdHR0HhextLVSrEWI2OjaWs60rK1pGmsrRtS0dGprO9T0+kbV1Wx+qTrVlrZLhPR9qfSTQ89Cse/6L3/R7C2PZ9wPYWkVj1Pd/4eyvWFsBYLYTaAsCwrYkAgAAHRSHQJUBQdEAlIuiOg6juoSs3oU2n1fTq8Z3p/SL0z3Sd9XMZ76Pqdr/Ufo/aPVRN6l0nau0i1Nqb1PXA9C2jfUd3/g70vaHpk9Vk9TfQGwraNpUCxNgAsTaLQsCwLAsZ0FBJ0BQSdBdEVB0VB0dEdUR0dLY6LGW1bTZC7W4xpbTbVUWnC2m2ltVgbS2i2psAFtGyNJpAWptTaVLqWptTalD1PUtooDYAm0WgLEWgDEWiwLEFQHQFBIQQdBB0E9HRYw6Lo6jrTGdHfR9Lq/mM9WnafV/MZ26OJtLaO07pWAi0rYVqVAtoaACAAEAACaAAQAAIKgJJIIonJIoIn5OQQRPyXIdESOiQQRJ3Sf9EiKJ6X/RP+n8ifMP+n8n8ifJ/Jn8ifJfJfIn8l8j5VJJH8l8kXyfyB/J/Isfkjr//2Q==';
  
  // We would typically call an API or service to generate a real blur data URL
  // For this example, we'll just return a default one
  
  // Cache the result
  await cache.set(cacheKey, defaultBlurDataUrl, TTL.EXTENDED);
  
  return defaultBlurDataUrl;
// Export the image optimization toolkit
const imageOptimizer = {
  optimizeImageUrl,
  generateSrcSet,
  generateSizes,
  generatePlaceholderUrl,
  getImageDimensions,
  preloadImage,
  preloadCriticalImages,
  generateBlurDataUrl,
  getBestFormat,
export default imageOptimizer; 