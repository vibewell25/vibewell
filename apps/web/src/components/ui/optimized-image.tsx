import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  fill?: boolean;
  loading?: 'lazy' | 'eager';
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  fetchPriority?: 'high' | 'low' | 'auto';
  aboveTheFold?: boolean;
  preload?: boolean;
}

// Store this outside component to avoid recreation on each render
// Stored in memory for the session only
const DEFAULT_BLUR_DATA_URL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qLjgyPy0/ODMuRkVHSUhKU1NTW1xfYGFUZF5kW1P/2wBDARUXFyAeIB4aGh4gICBTRlNGU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1P/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

/**
 * OptimizedImage - High-performance image component
 * 
 * Features:
 * - Automatic blur placeholders
 * - Proper image loading priorities
 * - Error handling with retries
 * - Memory-efficient implementation
 * - Support for above-the-fold prioritization
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 75,
  placeholder = 'empty',
  blurDataURL = DEFAULT_BLUR_DATA_URL,
  onLoad,
  fill = false,
  loading = 'lazy',
  objectFit = 'cover',
  fetchPriority = 'auto',
  aboveTheFold = false,
  preload = false,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const MAX_RETRIES = 3;

  // Determine proper fetchPriority and loading based on position
  const effectivePriority = priority || aboveTheFold;
  const effectiveLoading = effectivePriority ? 'eager' : loading;
  const effectiveFetchPriority = effectivePriority ? 'high' : fetchPriority;

  // Reset states when src changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
  }, [src]);

  // Preload image if requested
  useEffect(() => {
    if (preload && src) {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'image';
      preloadLink.href = src;
      document.head.appendChild(preloadLink);
      
      return () => {
        document.head.removeChild(preloadLink);
      };
    }
  }, [preload, src]);

  // Support Intersection Observer for images outside viewport
  useEffect(() => {
    if (!imageRef.current || effectivePriority) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Preload the image when it's about to enter viewport
          const img = new Image();
          img.src = src;
          observer.disconnect();
        }
      });
    }, {
      rootMargin: '200px', // Load when within 200px of viewport
    });
    
    observer.observe(imageRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, [src, effectivePriority]);

  const handleError = () => {
    if (retryCount < MAX_RETRIES) {
      // Retry loading with exponential backoff
      const timeout = Math.pow(2, retryCount) * 1000;
      setTimeout(() => {
        setRetryCount((prev) => prev + 1);
        setIsLoading(true);
        setHasError(false);
      }, timeout);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        isLoading && 'animate-pulse bg-gray-200',
        className,
      )}
      style={{
        aspectRatio: width && height ? `${width}/${height}` : undefined,
      }}
      ref={imageRef}
    >
      <Image
        src={hasError ? '/images/fallback.jpg' : src}
        alt={alt}
        width={width}
        height={height}
        priority={effectivePriority}
        quality={quality}
        sizes={sizes}
        fill={fill}
        loading={effectiveLoading}
        fetchPriority={effectiveFetchPriority}
        className={cn(
          'transition-opacity duration-300',
          objectFit && `object-${objectFit}`,
          isLoading ? 'opacity-0' : 'opacity-100',
        )}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoadingComplete={() => {
          setIsLoading(false);
          onLoad.();
        }}
        onError={handleError}
      />

      {/* Accessibility enhancement */}
      {hasError && <span className="sr-only">Image failed to load: {alt}</span>}
    </div>
  );
}
