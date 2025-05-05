import sharp from 'sharp';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { ImageOptimizer } from '../types/image-optimization';
import { ImageOptimizationStats } from '../types/monitoring';
import { performanceMonitor } from './performance-monitoring';

/**
 * Unified Image Optimization Utilities
 * 
 * This module combines functionality from:
 * - src/utils/imageOptimization.js
 * - src/utils/image-optimization.ts
 * - app/utils/imageOptimization.js
 * 
 * It provides both server-side and client-side image optimization features.
 */

// Types and interfaces
interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
interface OptimizedImage {
  buffer: Buffer;
  format: string;
  width: number;
  height: number;
  size: number;
interface ImageCache {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
// Create a simple in-memory cache for client-side use
const createImageCache = (): ImageCache => {
  const cache = new Map<string, string>();
  
  return {
    async get(key: string): Promise<string | null> {
      return cache.get(key) || null;
async set(key: string, value: string): Promise<void> {
      cache.set(key, value);
// ======= SERVER-SIDE IMAGE OPTIMIZATION =======

/**
 * Server-side image optimizer using Sharp
 */
class ImageOptimizerImpl implements ImageOptimizer {
  private stats: ImageOptimizationStats = {
    optimizationRate: 0,
    cdnLatency: 0,
    compressionRatio: 0,
    processingTime: 0,
private cacheDir: string;
  private static instance: ImageOptimizerImpl;

  private constructor() {
    this.cacheDir = path.join(process.cwd(), '.cache', 'images');
    this.ensureCacheDir();
public static getInstance(): ImageOptimizerImpl {
    if (!ImageOptimizerImpl.instance) {
      ImageOptimizerImpl.instance = new ImageOptimizerImpl();
return ImageOptimizerImpl.instance;
private async ensureCacheDir(): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
catch (error) {
      console.error('Error creating cache directory:', error);
private generateCacheKey(buffer: Buffer, options: ImageOptimizationOptions): string {
    const hash = createHash('sha256');
    hash.update(buffer);
    hash.update(JSON.stringify(options));
    return hash.digest('hex');
private async getCachedImage(cacheKey: string): Promise<Buffer | null> {
    try {
      const cachePath = path.join(this.cacheDir, cacheKey);
      const buffer = await fs.readFile(cachePath);
      return buffer;
catch {
      return null;
private async cacheImage(cacheKey: string, buffer: Buffer): Promise<void> {
    try {
      const cachePath = path.join(this.cacheDir, cacheKey);
      await fs.writeFile(cachePath, buffer);
catch (error) {
      console.error('Error caching image:', error);
public async optimizeImage(
    input: Buffer | string,
    options: ImageOptimizationOptions = {},
  ): Promise<OptimizedImage> {
    const startTime = performance.now();
    const inputBuffer = typeof input === 'string' ? await fs.readFile(input) : input;

    const cacheKey = this.generateCacheKey(inputBuffer, options);
    const cachedBuffer = await this.getCachedImage(cacheKey);

    if (cachedBuffer) {
      const metadata = await sharp(cachedBuffer).metadata();
      return {
        buffer: cachedBuffer,
        format: metadata.format || 'unknown',
        width: metadata.width || 0,
        height: metadata.height || 0,
        size: cachedBuffer.length,
const pipeline = sharp(inputBuffer);
    const initialMetadata = await pipeline.metadata();

    // Apply resizing if dimensions are specified
    if (options.width || options.height) {
      pipeline.resize(options.width, options.height, {
        fit: options.fit || 'cover',
        withoutEnlargement: true,
// Convert format if specified
    if (options.format) {
      pipeline.toFormat(options.format, {
        quality: options.quality || 80,
        effort: 6, // Higher compression effort
const outputBuffer = await pipeline.toBuffer();
    await this.cacheImage(cacheKey, outputBuffer);

    const processingTime = performance.now() - startTime;
    const compressionRatio = outputBuffer.length / inputBuffer.length;
    
    // Update stats
    this.stats = {
      ...this.stats,
      optimizationRate: (1 - compressionRatio) * 100,
      processingTime,
      compressionRatio,
let outputMetadata = initialMetadata;
    if (options.width || options.height || options.format) {
      outputMetadata = await sharp(outputBuffer).metadata();
return {
      buffer: outputBuffer,
      format: outputMetadata.format || 'unknown',
      width: outputMetadata.width || 0,
      height: outputMetadata.height || 0,
      size: outputBuffer.length,
public async generateResponsiveImages(
    input: Buffer | string,
    breakpoints: number[] = [640, 750, 828, 1080, 1200, 1920],
  ): Promise<Map<number, OptimizedImage>> {
    const results = new Map<number, OptimizedImage>();

    await Promise.all(
      breakpoints.map(async (width) => {
        const optimized = await this.optimizeImage(input, {
          width,
          format: 'webp',
          quality: 80,
results.set(width, optimized);
),
return results;
public async generatePlaceholder(input: Buffer | string): Promise<string> {
    const placeholder = await this.optimizeImage(input, {
      width: 10,
      height: 10,
      format: 'webp',
      quality: 30,
return `data:image/${placeholder.format};base64,${placeholder.buffer.toString('base64')}`;
public async cleanCache(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir);
      const now = Date.now();

      await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(this.cacheDir, file);
          const stats = await fs.stat(filePath);
          
          if (now - stats.mtimeMs > maxAge) {
            await fs.unlink(filePath);
),
catch (error) {
      console.error('Error cleaning cache:', error);
public async getImageMetadata(input: Buffer | string): Promise<sharp.Metadata> {
    const inputBuffer = typeof input === 'string' ? await fs.readFile(input) : input;
    return sharp(inputBuffer).metadata();
async getOptimizationStats(): Promise<ImageOptimizationStats> {
    return this.stats;
getMetrics(): Record<string, number> {
    return {
      'image_optimization_rate': this.stats.optimizationRate,
      'image_compression_ratio': this.stats.compressionRatio,
      'image_processing_time_ms': this.stats.processingTime,
      'image_cdn_latency_ms': this.stats.cdnLatency,
// Export server-side optimizer
export const serverImageOptimizer = ImageOptimizerImpl.getInstance();

// ======= CLIENT-SIDE IMAGE OPTIMIZATION =======

/**
 * Image format support detection for client-side
 */
export const detectImageSupport = (): Record<string, boolean> => {
  const formats = {
    webp: false,
    avif: false,
    jpeg2000: false,
if (typeof window !== 'undefined') {
    const canvas = document.createElement('canvas');
    if (canvas.toDataURL) {
      formats.webp = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      formats.avif = canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
      formats.jpeg2000 = canvas.toDataURL('image/jp2').indexOf('data:image/jp2') === 0;
return formats;
/**
 * Generate optimized image URL based on device capabilities and network
 * @param {string} url - Original image URL
 * @param {Object} options - Optimization options
 * @returns {string} - Optimized image URL
 */
export const generateOptimizedImageUrl = (
  url: string, 
  options: { width?: number; quality?: number; format?: string } = {}
): string => {
  if (typeof window === 'undefined') {
    return url; // Return original URL if not in browser
const { width = window.innerWidth, quality = 80, format = 'auto' } = options;

  const formats = detectImageSupport();
  const connection = (navigator as any).connection.effectiveType || '4g';

  // Adjust quality based on network connection
  const networkQuality = {
    'slow-2g': 60,
    '2g': 70,
    '3g': 80,
    '4g': 85,
    '5g': 90,
[connection] || quality;

  // Choose best format based on support
  let targetFormat = format;
  if (format === 'auto') {
    if (formats.avif) targetFormat = 'avif';
    else if (formats.webp) targetFormat = 'webp';
    else targetFormat = 'jpeg';
// Calculate optimal dimensions
  const devicePixelRatio = window.devicePixelRatio || 1;
  const targetWidth = Math.round(width * devicePixelRatio);

  // Construct optimized URL (assuming a CDN that supports these parameters)
  const optimizedUrl = new URL(url);
  optimizedUrl.searchParams.set('w', targetWidth.toString());
  optimizedUrl.searchParams.set('q', networkQuality.toString());
  optimizedUrl.searchParams.set('fm', targetFormat);

  return optimizedUrl.toString();
/**
 * Generates a responsive image srcset string for different viewport sizes
 * @param {string} baseUrl - Base URL of the image
 * @param {Array<number>} widths - Array of widths to generate srcset for
 * @param {string} format - Image format (jpg, webp, etc.)
 * @returns {string} Formatted srcset string
 */
export const generateSrcSet = (
  baseUrl: string, 
  widths: number[] = [320, 640, 960, 1280], 
  format: string = 'webp'
): string => {
  const baseUrlWithoutExt = baseUrl.substring(0, baseUrl.lastIndexOf('.'));
  
  return widths
    .map(width => `${baseUrlWithoutExt}-${width}.${format} ${width}w`)
    .join(', ');
// Create client-side image cache
const imageCache = typeof window !== 'undefined' ? createImageCache() : null;

/**
 * Enhanced lazy loading with preloading for critical images
 * @param {string} selector - CSS selector for images to lazy load
 * @param {Object} options - Lazy loading options
 */
export const setupLazyLoading = (
  selector: string = 'img[data-src]', 
  options: {
    rootMargin?: string;
    threshold?: number;
    preloadCritical?: boolean;
    cacheImages?: boolean;
= {}
): void => {
  if (typeof window === 'undefined') {
    return; // Return if not in browser
const {
    rootMargin = '50px 0px',
    threshold = 0.01,
    preloadCritical = true,
    cacheImages = true,
= options;

  // Preload critical images
  if (preloadCritical) {
    document.querySelectorAll('img[data-critical="true"]').forEach((img) => {
      if ((img as HTMLImageElement).dataset.src) {
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.as = 'image';
        preloadLink.href = (img as HTMLImageElement).dataset.src as string;
        document.head.appendChild(preloadLink);
if (!('IntersectionObserver' in window)) {
    // Fallback for browsers that don't support IntersectionObserver
    document.querySelectorAll(selector).forEach((img) => {
      const imgElement = img as HTMLImageElement;
      if (imgElement.dataset.src) {
        imgElement.src = cacheImages 
          ? generateOptimizedImageUrl(imgElement.dataset.src)
          : imgElement.dataset.src;
if (imgElement.dataset.srcset) {
        imgElement.srcset = imgElement.dataset.srcset;
return;
const loadImage = async (img: Element): Promise<void> => {
    try {
      const imgElement = img as HTMLImageElement;
      if (imgElement.dataset.src) {
        const optimizedUrl = generateOptimizedImageUrl(imgElement.dataset.src);

        if (cacheImages && imageCache) {
          const cachedImage = await imageCache.get(optimizedUrl);
          if (cachedImage) {
            imgElement.src = cachedImage;
            return;
imgElement.src = optimizedUrl;

        if (cacheImages && imageCache) {
          // Cache the image after loading
          imgElement.onload = () => {
            imageCache.set(optimizedUrl, optimizedUrl);
if (imgElement.dataset.srcset) {
        imgElement.srcset = imgElement.dataset.srcset;
catch (error) {
      console.error('Error loading image:', error);
      // Fallback to original source
      const imgElement = img as HTMLImageElement;
      if (imgElement.dataset.src) {
        imgElement.src = imgElement.dataset.src;
const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadImage(entry.target);
          observer.unobserve(entry.target);
{
      rootMargin,
      threshold,
document.querySelectorAll(selector).forEach((img) => {
    observer.observe(img);
/**
 * Prefetches critical images to improve perceived performance
 * @param {Array<string>} imageUrls - Array of image URLs to prefetch
 */
export const prefetchImages = (imageUrls: string[] = []): void => {
  if (typeof window === 'undefined' || !imageUrls || !imageUrls.length) {
    return;
// Don't prefetch more than 5 images at once to avoid overloading the browser
  const imagesToPrefetch = imageUrls.slice(0, 5);
  
  const prefetch = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = url;
Promise.all(imagesToPrefetch.map(url => prefetch(url)))
    .catch(err => console.error('Failed to prefetch images:', err));
/**
 * Returns image dimensions that maintain aspect ratio based on constraints
 * @param {number} originalWidth - Original image width
 * @param {number} originalHeight - Original image height
 * @param {Object} constraints - Max width/height constraints
 * @returns {Object} New dimensions {width, height}
 */
export const calculateAspectRatio = (
  originalWidth: number, 
  originalHeight: number, 
  constraints: { maxWidth: number; maxHeight: number } = { maxWidth: 800, maxHeight: 600 }
): { width: number; height: number } => {
  const { maxWidth, maxHeight } = constraints;
  
  let width = originalWidth;
  let height = originalHeight;
  
  if (width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
if (height > maxHeight) {
    width = Math.round((width * maxHeight) / height);
    height = maxHeight;
return { width, height };
