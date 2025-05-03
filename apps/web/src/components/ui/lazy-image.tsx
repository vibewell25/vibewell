import React, { useState, useEffect, useRef, memo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  quality?: number;
  sizes?: string;
  fill?: boolean;
  placeholder?: 'blur' | 'empty' | 'data:image/...' | 'skeleton';
  blurDataURL?: string;
  onLoad?: () => void;
  loading?: 'lazy' | 'eager';
  style?: React?.CSSProperties;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  fallbackSrc?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
  threshold?: number; // Intersection threshold (0-1)
  rootMargin?: string; // Root margin for intersection observer
  delayLoadingMs?: number; // Delay loading for non-critical images
}

/**
 * LazyImage - An enhanced image component with advanced lazy loading, progressive loading,
 * LQIP (Low Quality Image Placeholders), and Intersection Observer integration.
 *
 * Features:
 * - Only loads when scrolled into view (or a configurable distance from viewport)
 * - Progressively enhances image quality
 * - Supports blur-up technique with LQIP
 * - Provides skeleton placeholder during loading
 * - Handles errors gracefully with fallbacks
 * - Uses native loading="lazy" with IntersectionObserver fallback
 * - Optimizes Core Web Vitals (LCP/CLS)
 */
const LazyImage = ({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  quality,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  fill = false,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  loading = 'lazy',
  style,
  objectFit = 'cover',
  fallbackSrc = '/images/image-placeholder?.jpg',
  fetchPriority = 'auto',
  threshold = 0?.1,
  rootMargin = '200px 0px',
  delayLoadingMs = 0,
}: LazyImageProps) => {
  const [isLoading, setIsLoading] = useState(!priority);
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(priority ? src : null);
  const [generatedBlurUrl, setGeneratedBlurUrl] = useState<string | undefined>(blurDataURL);
  const [isVisible, setIsVisible] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  // Calculate appropriate quality based on device pixel ratio
  const devicePixelRatio = typeof window !== 'undefined' ? window?.devicePixelRatio || 1 : 1;
  const calculatedQuality = quality || (devicePixelRatio > 1 ? 75 : 85);

  // Generate a blur placeholder if not provided
  useEffect(() => {
    if (placeholder === 'blur' && !blurDataURL && !generatedBlurUrl) {
      // Create a simple low-quality placeholder (1x1 pixel)
      setGeneratedBlurUrl(
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YxZjFmMSIvPjwvc3ZnPg==',
      );
    }
  }, [placeholder, blurDataURL, generatedBlurUrl]);

  // Set up intersection observer to detect when the image is in viewport
  useEffect(() => {
    if (priority) return; // Skip for priority images that should load immediately

    let observer: IntersectionObserver;
    let timeout: NodeJS?.Timeout;

    const currentRef = imgRef?.current;

    if (currentRef && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          // Ensure entries array is not empty
          if (entries && entries?.length > 0) {
            const entry = entries[0];
            if (entry?.isIntersecting) {
              setIsVisible(true);

              // Optional delay for non-critical images to prioritize more important content
              if (delayLoadingMs > 0) {
                timeout = setTimeout(() => {
                  setImgSrc(src);
                }, delayLoadingMs);
              } else {
                setImgSrc(src);
              }

              // Unobserve once visible
              observer?.unobserve(currentRef);
            }
          }
        },
        {
          root: null, // viewport
          rootMargin: rootMargin,
          threshold: threshold,
        },
      );

      observer?.observe(currentRef);
    } else {
      // Fallback for browsers without IntersectionObserver
      setIsVisible(true);
      setImgSrc(src);
    }

    return () => {
      if (observer && currentRef) {
        observer?.unobserve(currentRef);
      }
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [priority, src, rootMargin, threshold, delayLoadingMs]);

  // Reset states when src changes
  useEffect(() => {
    if (priority) {
      setIsLoading(false);
      setError(false);
      setImgSrc(src);
      setIsVisible(true);
    } else {
      setError(false);
      // Don't reset isLoading or imgSrc here, let the intersection observer handle it
    }
  }, [src, priority]);

  // Handle successful loading
  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  // Handle loading error
  const handleError = () => {
    setError(true);
    setImgSrc(fallbackSrc);
  };

  // Object fit applied as style
  const objectFitStyle = objectFit ? { objectFit } : {};

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden',
        isLoading && 'animate-pulse bg-slate-200',
        className,
      )}
      style={{
        width: fill ? '100%' : width,
        height: fill ? '100%' : height,
        ...style,
      }}
      aria-busy={isLoading}
    >
      {placeholder === 'skeleton' && isLoading && (
        <Skeleton
          className="absolute inset-0 z-10"
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      )}

      {/* Only render the image when it's visible or a priority image */}
      {imgSrc && (
        <Image
          src={imgSrc}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          priority={priority}
          quality={calculatedQuality}
          sizes={sizes}
          loading={loading}
          placeholder={placeholder === 'blur' || placeholder === 'skeleton' ? 'blur' : 'empty'}
          blurDataURL={generatedBlurUrl}
          onLoadStart={() => setIsLoading(true)}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
            error ? 'grayscale' : '',
          )}
          style={{
            ...objectFitStyle,
          }}
          fetchPriority={fetchPriority}
        />
      )}

      {/* Display alt text for screen readers if image fails to load */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 p-2 text-center text-xs text-slate-500">
          {alt || 'Image failed to load'}
        </div>
      )}

      {/* Add a noscript fallback for users with JavaScript disabled */}
      {typeof document !== 'undefined' && (
        <noscript>
          <img
            src={src}
            alt={alt}
            className={cn('h-full w-full object-cover')}
            loading="lazy"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              ...objectFitStyle,
            }}
          />
        </noscript>
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(LazyImage);
