'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * OptimizedImage component that leverages Next.js Image with additional features:
 * - Responsive handling with appropriate sizes
 * - Error fallback
 * - Loading state management
 * - Generates optimized responsive images for different viewports
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  quality = 80,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  fallbackSrc = '/images/image-placeholder.png',
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Reset states when src changes
  useEffect(() => {
    setImgSrc(src);
    setLoading(true);
    setError(false);
  }, [src]);

  const handleLoad = () => {
    setLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
    onError?.();
  };

  // Calculate aspect ratio for placeholder if width and height are provided
  let paddingBottom: string | undefined;
  if (!fill && width && height) {
    paddingBottom = `${(height / width) * 100}%`;
  }

  return (
    <div 
      className={cn(
        "relative overflow-hidden bg-gray-100",
        loading && "animate-pulse", 
        fill ? "w-full h-full" : "",
        className
      )}
      style={!fill && paddingBottom ? { paddingBottom } : undefined}
    >
      <Image
        src={imgSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        quality={quality}
        priority={priority}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "object-cover transition-opacity duration-300",
          loading ? "opacity-0" : "opacity-100",
          fill ? "absolute inset-0" : ""
        )}
      />
      
      {/* Placeholder shown during loading */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <svg 
            className="w-10 h-10 text-gray-300" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <path 
              stroke="currentColor" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="1.5" 
              d="M2 12.5l4.5-2.5 4.5 2.5 4.5-2.5 4.5 2.5M2 17.5l4.5-2.5 4.5 2.5 4.5-2.5 4.5 2.5"
            />
            <path 
              stroke="currentColor" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="1.5" 
              d="M2 7.5l4.5-2.5 4.5 2.5 4.5-2.5 4.5 2.5"
            />
          </svg>
        </div>
      )}
    </div>
  );
} 