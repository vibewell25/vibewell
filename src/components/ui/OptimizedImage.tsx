import Image from 'next/image';
import { useState, useEffect } from 'react';
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
}

const DEFAULT_BLUR_DATA_URL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qLjgyPy0/ODMuRkVHSUhKU1NTW1xfYGFUZF5kW1P/2wBDARUXFyAeIB4aGh4gICBTRlNGU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1P/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

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
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
  }, [src]);

  const handleError = () => {
    if (retryCount < MAX_RETRIES) {
      // Retry loading with exponential backoff
      const timeout = Math.pow(2, retryCount) * 1000;
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
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
        className
      )}
      style={{
        aspectRatio: width && height ? `${width}/${height}` : undefined
      }}
    >
      <Image
        src={hasError ? '/images/fallback.jpg' : src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={quality}
        sizes={sizes}
        fill={fill}
        loading={loading}
        className={cn(
          'transition-opacity duration-300',
          objectFit && `object-${objectFit}`,
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoadingComplete={() => {
          setIsLoading(false);
          onLoad?.();
        }}
        onError={handleError}
      />
      
      {/* Accessibility enhancement */}
      {hasError && (
        <span className="sr-only">
          Image failed to load: {alt}
        </span>
      )}
    </div>
  );
} 