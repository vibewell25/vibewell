import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useResponsive } from '@/hooks/useResponsive';
import { cn } from '@/lib/utils';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  fill?: boolean;
  mobileSrc?: string;
  tabletSrc?: string;
  desktopSrc?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  onLoad?: () => void;
  loadingPlaceholder?: React.ReactNode;
  fallbackSrc?: string;
}

/**
 * ResponsiveImage - An image component that adapts to different screen sizes
 *
 * This component automatically selects the appropriate image source based on
 * device type, and applies appropriate sizing and optimization techniques.
 */
export function ResponsiveImage({
  src,
  alt,
  className,
  width,
  height,
  sizes = '100vw',
  priority = false,
  quality = 75,
  fill = false,
  mobileSrc,
  tabletSrc,
  desktopSrc,
  objectFit = 'cover',
  objectPosition = 'center',
  onLoad,
  loadingPlaceholder,
  fallbackSrc,
}: ResponsiveImageProps) {
  const { deviceType } = useResponsive();
  const [isLoading, setIsLoading] = useState(true);
  const [imgSrc, setImgSrc] = useState(src);
  const [imgError, setImgError] = useState(false);

  // Compute appropriate image source based on device type
  useEffect(() => {
    if (imgError && fallbackSrc) {
      setImgSrc(fallbackSrc);
      return;
    }

    let appropriateSrc = src;

    // Use device-specific images if provided
    if (deviceType === 'mobile' && mobileSrc) {
      appropriateSrc = mobileSrc;
    } else if (deviceType === 'tablet' && tabletSrc) {
      appropriateSrc = tabletSrc;
    } else if (deviceType === 'desktop' && desktopSrc) {
      appropriateSrc = desktopSrc;
    }

    setImgSrc(appropriateSrc);
  }, [deviceType, src, mobileSrc, tabletSrc, desktopSrc, imgError, fallbackSrc]);

  // Determine image dimensions based on device type if not explicitly provided
  const getDimensions = () => {
    if (width && height) {
      return { width, height };
    }

    if (fill) {
      return {};
    }

    // Default dimensions by device type
    switch (deviceType) {
      case 'mobile':
        return { width: 400, height: 300 };
      case 'tablet':
        return { width: 800, height: 600 };
      case 'desktop':
        return { width: 1200, height: 800 };
      default:
        return { width: 800, height: 600 };
    }
  };

  const dimensions = getDimensions();

  // Compute sizes based on device type if not explicitly provided
  const getSizes = () => {
    if (sizes !== '100vw') {
      return sizes;
    }

    switch (deviceType) {
      case 'mobile':
        return '100vw';
      case 'tablet':
        return '50vw';
      case 'desktop':
        return '33vw';
      default:
        return '100vw';
    }
  };

  // Handle image load event
  const handleImageLoad = () => {
    setIsLoading(false);
    if (onLoad) {
      onLoad();
    }
  };

  // Handle image error
  const handleImageError = () => {
    if (fallbackSrc && !imgError) {
      setImgError(true);
      setImgSrc(fallbackSrc);
    }
  };

  // Set image styles
  const imageStyles = cn(
    'transition-opacity duration-300',
    isLoading ? 'opacity-0' : 'opacity-100',
    className
  );

  // Return appropriate loading placeholder while image is loading
  if (isLoading && loadingPlaceholder) {
    return (
      <div className="relative">
        {loadingPlaceholder}
        <div className="absolute inset-0 opacity-0">
          <Image
            src={imgSrc}
            alt={alt}
            {...(fill ? { fill: true } : dimensions)}
            sizes={getSizes()}
            priority={priority}
            quality={quality}
            className={imageStyles}
            style={{
              objectFit,
              objectPosition,
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
      </div>
    );
  }

  // Return the image
  return (
    <Image
      src={imgSrc}
      alt={alt}
      {...(fill ? { fill: true } : dimensions)}
      sizes={getSizes()}
      priority={priority}
      quality={quality}
      className={imageStyles}
      style={{
        objectFit,
        objectPosition,
      }}
      onLoad={handleImageLoad}
      onError={handleImageError}
    />
  );
}
