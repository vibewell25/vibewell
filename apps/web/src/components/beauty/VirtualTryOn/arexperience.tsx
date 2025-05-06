import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Skeleton from '@/components/ui/SkeletonLoader';

// Define the interfaces that would have been imported from beauty-state
interface ProductColor {
  id: string;
  name: string;
  hex: string;
  arOverlayUrl?: string;
}

interface TryOnProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number | string;
  ratingAverage: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  colors: ProductColor[];
  images: { url: string; alt?: string }[];
}

// Declare global window type to include Image constructor
declare global {
  interface Window {
    Image: {
      new(): HTMLImageElement;
    };
  }
}

export interface ARExperienceProps {
  product: TryOnProduct | null;
  colorId: string | undefined;
  arActive: boolean;
  faceDetected: boolean;
  zoomLevel: number;
  onError?: (error: Error) => void;
}

/**
 * ARExperience component for rendering the AR try-on experience
 * Handles camera stream, face detection, and product overlay
 */
function ARExperienceBase(props: ARExperienceProps) {
  const { product, colorId, arActive, faceDetected, zoomLevel, onError } = props;
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const [cameraStatus, setCameraStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [overlayStatus, setOverlayStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  
  // Set up camera stream and face detection on component mount
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      setCameraStatus('loading');
      try {
        // Add a small delay to ensure smooth loading animation
        await new Promise(resolve => setTimeout(resolve, 500));
        
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Wait for video to be ready to play
          videoRef.current.onloadedmetadata = () => {
            setCameraStatus('ready');
          };
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setCameraStatus('error');
        if (onError) {
          onError(error instanceof Error ? error : new Error(String(error)));
        }
      }
    };

    if (videoRef.current) {
      startCamera();
    }

    // Clean up on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, [onError]);

  // Handle AR overlay when active
  useEffect(() => {
    if (!arActive || !product || !colorId || !videoRef.current || !canvasRef.current) {
      return;
    }
    
    setOverlayStatus('loading');
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Selected color from the product
    const selectedColor = product.colors.find((c: ProductColor) => c.id === colorId);
    if (!selectedColor || !selectedColor.arOverlayUrl) {
      setOverlayStatus('error');
      return;
    }

    // Create overlay image for the selected product/color
    const overlayImage = new window.Image();
    overlayImage.src = selectedColor.arOverlayUrl;
    
    // Handle overlay image loading
    overlayImage.onload = () => {
      console.log('Overlay image loaded');
      setOverlayStatus('ready');
    };
    
    overlayImage.onerror = () => {
      console.error('Error loading overlay image');
      setOverlayStatus('error');
    };

    // Animation function to apply AR effect
    const applyAREffect = () => {
      if (!video || !canvas || !ctx || !arActive) return;

      // Match canvas dimensions to video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      // Apply zoom
      if (zoomLevel !== 1) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        ctx.translate(centerX, centerY);
        ctx.scale(zoomLevel, zoomLevel);
        ctx.translate(-centerX, -centerY);
      }
      
      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Apply product overlay - this would normally use face detection landmarks
      // For this example, we'll use simplified positioning based on product type
      if (overlayImage && product && overlayStatus === 'ready') {
        const productType = product.category.toLowerCase();

        if (productType.includes('lipstick') || productType.includes('lip')) {
          // Position for lips (simplified)
          const lipX = canvas.width * 0.5 - canvas.width * 0.15;
          const lipY = canvas.height * 0.65;
          const lipWidth = canvas.width * 0.3;
          const lipHeight = canvas.height * 0.1;

          // Apply lip overlay with color
          ctx.globalAlpha = 0.7;
          ctx.globalCompositeOperation = 'source-over';
          ctx.drawImage(overlayImage, lipX, lipY, lipWidth, lipHeight);
        } else if (productType.includes('eyeshadow') || productType.includes('eye')) {
          // Position for eyes (simplified)
          const eyeLeftX = canvas.width * 0.35;
          const eyeRightX = canvas.width * 0.58;
          const eyeY = canvas.height * 0.4;
          const eyeWidth = canvas.width * 0.12;
          const eyeHeight = canvas.height * 0.06;

          // Apply eye makeup overlay
          ctx.globalAlpha = 0.6;
          ctx.globalCompositeOperation = 'multiply';
          ctx.drawImage(overlayImage, eyeLeftX, eyeY, eyeWidth, eyeHeight);
          ctx.drawImage(overlayImage, eyeRightX, eyeY, eyeWidth, eyeHeight);
        } else if (productType.includes('foundation') || productType.includes('skin')) {
          // Full-face overlay for foundation
          ctx.globalAlpha = 0.3;
          ctx.globalCompositeOperation = 'overlay';
          ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
        } else if (productType.includes('blush') || productType.includes('cheek')) {
          // Position for cheeks
          const cheekLeftX = canvas.width * 0.25;
          const cheekRightX = canvas.width * 0.65;
          const cheekY = canvas.height * 0.5;
          const cheekSize = canvas.width * 0.15;

          // Apply blush overlay
          ctx.globalAlpha = 0.4;
          ctx.globalCompositeOperation = 'multiply';
          ctx.drawImage(overlayImage, cheekLeftX, cheekY, cheekSize, cheekSize);
          ctx.drawImage(overlayImage, cheekRightX, cheekY, cheekSize, cheekSize);
        } else if (productType.includes('hair') || productType.includes('color')) {
          // Hair overlay
          ctx.globalAlpha = 0.5;
          ctx.globalCompositeOperation = 'source-atop';
          ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
        } else {
          // Generic overlay
          ctx.globalAlpha = 0.5;
          ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
        }
      }
      
      ctx.restore();

      // Continue animation loop
      requestRef.current = requestAnimationFrame(applyAREffect);
    };

    // Start animation loop
    requestRef.current = requestAnimationFrame(applyAREffect);

    // Clean up animation on effect change
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, [arActive, product, colorId, zoomLevel, overlayStatus]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-gray-900">
      {/* Video element for camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn(
          "h-full w-full object-cover transition-opacity duration-300",
          arActive ? 'opacity-0' : 'opacity-100',
          cameraStatus === 'loading' ? 'hidden' : 'block'
        )}
        aria-hidden={arActive || cameraStatus !== 'ready'}
      />

      {/* Canvas for AR overlay */}
      <canvas
        ref={canvasRef}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-300", 
          arActive ? 'opacity-100' : 'opacity-0',
          overlayStatus === 'ready' && cameraStatus === 'ready' ? 'block' : 'hidden'
        )}
        aria-hidden={!arActive || overlayStatus !== 'ready' || cameraStatus !== 'ready'}
      />

      {/* Loading state */}
      {cameraStatus === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white">
          <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
          <p className="text-sm font-medium">Initializing camera...</p>
          <div className="mt-4 w-48">
            <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {cameraStatus === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-4">
          <div className="rounded-full bg-red-500/20 p-3 mb-4">
            <Camera className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium mb-2">Camera access error</h3>
          <p className="text-sm text-center text-gray-300 max-w-xs">
            Please allow camera access to use the virtual try-on feature
          </p>
        </div>
      )}

      {/* Placeholder when no product is selected */}
      {!product && arActive && cameraStatus === 'ready' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white">
          <div className="text-center p-4">
            <p className="mb-2 text-xl font-medium">Select a product to try on</p>
            <p className="text-sm text-gray-300">
              Choose from our collection to visualize how it looks on you
            </p>
          </div>
        </div>
      )}

      {/* Product loading state */}
      {product && arActive && overlayStatus === 'loading' && cameraStatus === 'ready' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
          <div className="text-center p-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-sm">Preparing {product.name}...</p>
          </div>
        </div>
      )}

      {/* Face tracking guide overlay - improved with animation */}
      {!faceDetected && arActive && cameraStatus === 'ready' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="mx-auto mt-0 sm:mt-16 flex h-48 w-48 sm:h-64 sm:w-64 items-center justify-center rounded-full border-2 border-dashed border-white/60 animate-pulse">
            <div className="text-center p-4">
              <Camera className="h-6 w-6 mx-auto mb-2 text-white/80" />
              <p className="text-center text-sm font-medium text-white">Position your face here</p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-friendly tip at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 sm:hidden">
        <p className="text-xs text-white text-center">
          Rotate your device for a better experience
        </p>
      </div>
    </div>
  );
}

// Create a memoized version of the component
const ARExperience = React.memo(ARExperienceBase);

// Add display name for better debugging
ARExperience.displayName = 'ARExperience';

export default ARExperience;
