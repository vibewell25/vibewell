import React, { useEffect, useRef, memo } from 'react';
import { TryOnProduct } from '../../../utils/beauty-state';
import Image from 'next/image';

// Declare global window type to include Image constructor
declare global {
  interface Window {
    Image: {
      new(): HTMLImageElement;
    }
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
const ARExperience: React.FC<ARExperienceProps> = memo(({
  product,
  colorId,
  arActive,
  faceDetected,
  zoomLevel,
  onError
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | undefined>();
  const streamRef = useRef<MediaStream | null>(null);
  
  // Set up camera stream and face detection on component mount
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
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
        stream.getTracks().forEach(track => track.stop());
      }
      
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [videoRef, onError]);
  
  // Handle AR overlay when active
  useEffect(() => {
    if (!arActive || !product || !colorId || !videoRef.current || !canvasRef.current) {
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Selected color from the product
    const selectedColor = product.colors.find(c => c.id === colorId);
    if (!selectedColor || !selectedColor.arOverlayUrl) return;
    
    // Create overlay image for the selected product/color
    const overlayImage = new window.Image();
    overlayImage.src = selectedColor.arOverlayUrl;
    overlayImage.onload = () => {
      console.log('Overlay image loaded');
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
      if (overlayImage && product) {
        const productType = product.category.toLowerCase();
        
        if (productType.includes('lipstick') || productType.includes('lip')) {
          // Position for lips (simplified)
          const lipX = canvas.width * 0.5 - (canvas.width * 0.15);
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
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = undefined;
      }
    };
  }, [arActive, product, colorId, zoomLevel, videoRef, canvasRef, requestRef]);
  
  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Video element for camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover ${arActive ? 'hidden' : 'block'}`}
        aria-hidden={arActive}
      />
      
      {/* Canvas for AR overlay */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-cover ${arActive ? 'block' : 'hidden'}`}
        aria-hidden={!arActive}
      />
      
      {/* Placeholder when no product is selected */}
      {!product && arActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white">
          <div className="text-center">
            <p className="text-xl font-medium mb-2">Select a product to try on</p>
            <p className="text-sm text-gray-300">Choose from our collection to visualize how it looks on you</p>
          </div>
        </div>
      )}
      
      {/* Face tracking guide overlay */}
      {!faceDetected && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-64 h-64 mx-auto mt-16 border-2 border-dashed border-white/60 rounded-full flex items-center justify-center">
            <p className="text-white text-center text-sm font-medium">
              Position your face here
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

export default ARExperience; 