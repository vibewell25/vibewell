'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import type { ImageProps } from 'next/image';
import { useResponsive } from '@/hooks/useResponsive';

interface ResponsiveImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  mobileSrc?: string; 
  tabletSrc?: string;
  desktopSrc?: string;
  lowQualitySrc?: string;
  fallbackSrc?: string;
  lazyLoad?: boolean;
  loadingPriority?: 'low' | 'high';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * ResponsiveImage component that optimizes image loading based on device and network
 * 
 * Features:
 * - Automatically selects appropriate image source based on device type
 * - Handles offline fallback
 * - Implements progressive loading with low quality placeholder
 * - Optimizes loading based on network conditions
 */
export function ResponsiveImage({
  src,
  mobileSrc,
  tabletSrc,
  desktopSrc,
  lowQualitySrc,
  fallbackSrc = '/images/fallback.png',
  alt,
  width,
  height,
  lazyLoad = true,
  loadingPriority = 'low',
  onLoad,
  onError,
  ...props
}: ResponsiveImageProps) {
  const { isMobile, isTablet, isOnline } = useResponsive();
  const [imageSrc, setImageSrc] = useState<string>(lowQualitySrc || src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [effectiveConnection, setEffectiveConnection] = useState<string>('4g');

  // Detect network conditions
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      
      if (connection) {
        setEffectiveConnection(connection.effectiveType || '4g');
        
        const updateConnectionStatus = () => {
          setEffectiveConnection(connection.effectiveType || '4g');
        };
        
        connection.addEventListener('change', updateConnectionStatus);
        return () => connection.removeEventListener('change', updateConnectionStatus);
      }
    }
  }, []);

  // Determine the appropriate image source based on device and network
  useEffect(() => {
    if (!isOnline) {
      // Use fallback when offline
      setImageSrc(fallbackSrc);
      return;
    }

    // Start with low quality image if available
    if (lowQualitySrc && !isLoaded) {
      setImageSrc(lowQualitySrc);
    }
    
    // Select appropriate resolution based on device
    let appropriateSrc = src;
    if (isMobile && mobileSrc) {
      appropriateSrc = mobileSrc;
    } else if (isTablet && tabletSrc) {
      appropriateSrc = tabletSrc;
    } else if (!isMobile && !isTablet && desktopSrc) {
      appropriateSrc = desktopSrc;
    }
    
    // On slow connections, use lower quality images
    if (effectiveConnection === 'slow-2g' || effectiveConnection === '2g') {
      if (lowQualitySrc) {
        appropriateSrc = lowQualitySrc;
      } else if (mobileSrc) {
        appropriateSrc = mobileSrc;
      }
    }
    
    // Only set high-quality image after low-quality has loaded
    if (!lowQualitySrc || isLoaded) {
      setImageSrc(appropriateSrc);
    }
  }, [
    isMobile, isTablet, isOnline, isLoaded, src, mobileSrc, 
    tabletSrc, desktopSrc, lowQualitySrc, fallbackSrc, effectiveConnection
  ]);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
    
    // If we have a low quality image, now load the full quality
    if (lowQualitySrc && imageSrc === lowQualitySrc) {
      let fullSrc = src;
      if (isMobile && mobileSrc) {
        fullSrc = mobileSrc;
      } else if (isTablet && tabletSrc) {
        fullSrc = tabletSrc;
      } else if (!isMobile && !isTablet && desktopSrc) {
        fullSrc = desktopSrc;
      }
      setImageSrc(fullSrc);
    }
  };

  // Handle image error
  const handleError = () => {
    setHasError(true);
    setImageSrc(fallbackSrc);
    if (onError) onError();
  };

  return (
    <div className="relative">
      <Image
        src={hasError ? fallbackSrc : imageSrc}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        loading={lazyLoad ? 'lazy' : 'eager'}
        priority={loadingPriority === 'high'}
        sizes={`
          (max-width: 640px) 100vw,
          (max-width: 1024px) 50vw,
          33vw
        `}
        {...props}
      />
      
      {lowQualitySrc && !isLoaded && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse" 
          style={{ backdropFilter: 'blur(10px)' }}
        />
      )}
    </div>
  );
} 