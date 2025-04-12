'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  containerClassName?: string;
  aspectRatio?: 'square' | '16/9' | '4/3' | '1/1';
  priority?: boolean;
  onLoad?: () => void;
  blurDataUrl?: string;
  fallbackSrc?: string;
}

export default function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  containerClassName,
  aspectRatio,
  priority = false,
  onLoad,
  blurDataUrl,
  fallbackSrc = '/images/fallback-image.jpg',
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(priority);

  // Handle image loading state
  const handleImageLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle image error
  const handleImageError = () => {
    setHasError(true);
  };

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!imageRef.current || priority) return;

    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        setShouldLoad(true);
        observerRef.current?.disconnect();
      }
    }, {
      rootMargin: '200px', // Start loading before the image comes into view
    });

    observerRef.current.observe(imageRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  // Determine aspect ratio class
  const aspectRatioClass = aspectRatio
    ? {
        'aspect-square': aspectRatio === 'square' || aspectRatio === '1/1',
        'aspect-video': aspectRatio === '16/9',
        'aspect-[4/3]': aspectRatio === '4/3',
      }
    : {};

  return (
    <div 
      ref={imageRef}
      className={cn(
        "relative overflow-hidden bg-gray-100 dark:bg-gray-800",
        containerClassName,
        aspectRatioClass
      )}
      style={{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : 'auto',
      }}
    >
      {shouldLoad && (
        <>
          {!isLoaded && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse">
              <span className="sr-only">Loading image...</span>
            </div>
          )}
          <Image
            src={hasError ? fallbackSrc : src}
            alt={alt}
            className={cn(
              "transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0",
              className
            )}
            fill={!(width && height)}
            width={width}
            height={height}
            loading={priority ? "eager" : "lazy"}
            onLoadingComplete={handleImageLoad}
            onError={handleImageError}
            placeholder={blurDataUrl ? "blur" : "empty"}
            blurDataURL={blurDataUrl}
          />
        </>
      )}
    </div>
  );
} 