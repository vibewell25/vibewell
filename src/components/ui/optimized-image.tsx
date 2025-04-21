'use client';

import React, { useState, useEffect, memo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export interface OptimizedImageProps {
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
  style?: React.CSSProperties;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  fallbackSrc?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
}

/**
 * OptimizedImage - A wrapper around Next.js Image component with additional optimizations
 * Features:
 * - Automatic blur placeholders
 * - Loading indicators
 * - Error fallbacks
 * - Responsive sizes
 * - Lazy loading by default
 * - Optimized quality based on device
 * - WebP/AVIF format support
 */
const OptimizedImage = ({
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
  fallbackSrc = '/images/image-placeholder.jpg',
  fetchPriority = 'auto',
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(!priority);
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);
  const [generatedBlurUrl, setGeneratedBlurUrl] = useState<string | undefined>(blurDataURL);

  // Reset states when src changes
  useEffect(() => {
    setIsLoading(!priority);
    setError(false);
    setImgSrc(src);
  }, [src, priority]);

  useEffect(() => {
    // If no blur URL is provided and placeholder is blur, generate a simple one
    if (placeholder === 'blur' && !blurDataURL && !generatedBlurUrl) {
      // Create a simple low-quality placeholder (1x1 pixel)
      setGeneratedBlurUrl('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YxZjFmMSIvPjwvc3ZnPg==');
    }
  }, [placeholder, blurDataURL, generatedBlurUrl]);

  // Calculate appropriate quality based on device pixel ratio
  const devicePixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const calculatedQuality = quality || (devicePixelRatio > 1 ? 75 : 85);

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
      className={cn(
        "relative overflow-hidden",
        isLoading && "bg-slate-200 animate-pulse",
        className
      )}
      style={{
        width: fill ? '100%' : width,
        height: fill ? '100%' : height,
        ...style
      }}
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
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          error ? "grayscale" : ""
        )}
        style={{
          ...objectFitStyle
        }}
        fetchPriority={fetchPriority}
      />
      
      {/* Display alt text for screen readers if image fails to load */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-500 text-xs p-2 text-center">
          {alt || 'Image failed to load'}
        </div>
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(OptimizedImage);
