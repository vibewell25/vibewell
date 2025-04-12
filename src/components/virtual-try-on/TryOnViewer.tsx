'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Fallback } from '@/components/ui/fallback';
import { Button } from '@/components/ui/button';
import { 
  Camera, 
  RotateCcw, 
  Download, 
  Share2, 
  ZoomIn, 
  ZoomOut,
  Maximize2,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

interface TryOnViewerProps {
  productId: string;
  productName: string;
  productType: 'glasses' | 'jewelry' | 'makeup' | 'clothing';
  initialVariant?: string;
  onCapture?: (imageUrl: string) => void;
  onShare?: (imageUrl: string) => void;
  onBack?: () => void;
}

export function TryOnViewer({
  productId,
  productName,
  productType,
  initialVariant,
  onCapture,
  onShare,
  onBack
}: TryOnViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState(initialVariant || '');
  const [variants, setVariants] = useState<Array<{ id: string; name: string; imageUrl: string }>>([]);
  const [currentFilter, setCurrentFilter] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Simulate product variants
  useEffect(() => {
    // This would be fetched from an API in a real app
    const fetchedVariants = [
      { id: 'v1', name: 'Classic', imageUrl: '/assets/try-on/variants/classic.png' },
      { id: 'v2', name: 'Modern', imageUrl: '/assets/try-on/variants/modern.png' },
      { id: 'v3', name: 'Vintage', imageUrl: '/assets/try-on/variants/vintage.png' },
      { id: 'v4', name: 'Sport', imageUrl: '/assets/try-on/variants/sport.png' },
    ];
    
    setVariants(fetchedVariants);
    if (!selectedVariant && fetchedVariants.length > 0) {
      setSelectedVariant(fetchedVariants[0].id);
    }
  }, [productId, selectedVariant]);

  // Initialize camera and request permissions
  useEffect(() => {
    async function setupCamera() {
      try {
        setIsLoading(true);
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
        }
        
        // Load AR models/filters based on product type and variant
        loadArFilters(productType, selectedVariant);
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Unable to access camera. Please ensure you have given camera permission.');
        setHasPermission(false);
      } finally {
        setIsLoading(false);
      }
    }
    
    setupCamera();
    
    // Cleanup function to stop camera when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [productType, selectedVariant]);

  // Simulate loading AR filters
  const loadArFilters = (productType: string, variantId: string) => {
    setCurrentFilter(null);
    
    // Simulate loading time
    setTimeout(() => {
      // In a real implementation, this would load the actual AR filter
      setCurrentFilter(`${productType}-${variantId}`);
    }, 1000);
  };

  // Handle variant change
  const handleVariantChange = (variantId: string) => {
    setSelectedVariant(variantId);
    loadArFilters(productType, variantId);
  };

  // Capture image from camera
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsCapturing(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Apply AR filter overlay (simplified)
    if (currentFilter) {
      // In a real implementation, this would apply the AR filter
      // For demo purposes, just add a text overlay
      context.font = '20px Arial';
      context.fillStyle = 'white';
      context.fillText(`Filter: ${currentFilter}`, 10, 30);
    }
    
    // Convert canvas to image data URL
    const imageDataUrl = canvas.toDataURL('image/png');
    setCapturedImage(imageDataUrl);
    
    // Call the onCapture callback if provided
    if (onCapture) {
      onCapture(imageDataUrl);
    }
    
    setIsCapturing(false);
  };

  // Handle download of captured image
  const handleDownload = () => {
    if (!capturedImage) return;
    
    const link = document.createElement('a');
    link.href = capturedImage;
    link.download = `vibewell-try-on-${productName.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.click();
  };

  // Handle sharing of captured image
  const handleShare = () => {
    if (!capturedImage || !onShare) return;
    onShare(capturedImage);
  };

  // Handle zoom controls
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  // Handle reset (clear captured image)
  const handleReset = () => {
    setCapturedImage(null);
  };

  // Handle fullscreen
  const handleFullscreen = () => {
    if (!videoRef.current) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full w-full">
        {/* Back button */}
        {onBack && (
          <Button 
            variant="ghost" 
            className="self-start mb-4"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to products
          </Button>
        )}
        
        {/* Product name and variant selector */}
        <div className="mb-4">
          <h2 className="text-xl font-bold">{productName} - Virtual Try-On</h2>
          <p className="text-gray-500 mb-2">Select a variant to try on:</p>
          
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {variants.map(variant => (
              <Button
                key={variant.id}
                variant={selectedVariant === variant.id ? 'default' : 'outline'}
                onClick={() => handleVariantChange(variant.id)}
                className="flex-shrink-0"
              >
                {variant.name}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Camera or captured image display */}
        <div className="relative bg-black rounded-lg overflow-hidden flex-grow">
          {isLoading ? (
            <Fallback className="h-full" message="Preparing virtual try-on experience..." />
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : (
            <>
              {!capturedImage ? (
                // Live camera view
                <div className="relative h-full">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: `scale(${zoomLevel})` }}
                    onCanPlay={() => setIsLoading(false)}
                  />
                  {currentFilter && (
                    <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                      Filter: {currentFilter}
                    </div>
                  )}
                </div>
              ) : (
                // Captured image view
                <div className="relative h-full">
                  <img
                    src={capturedImage}
                    alt="Captured try-on"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* Hidden canvas for capture */}
              <canvas ref={canvasRef} className="hidden" />
            </>
          )}
        </div>
        
        {/* Controls */}
        <div className="mt-4 flex justify-between items-center">
          <div className="flex space-x-2">
            {!capturedImage ? (
              <>
                <Button 
                  onClick={handleCapture} 
                  disabled={isLoading || isCapturing || !hasPermission}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Capture
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleZoomIn}
                  disabled={isLoading || zoomLevel >= 2}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleZoomOut}
                  disabled={isLoading || zoomLevel <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleFullscreen}
                  disabled={isLoading}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={handleReset}
                  variant="outline"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                {onShare && (
                  <Button 
                    onClick={handleShare}
                    variant="outline"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                )}
              </>
            )}
          </div>
          
          {/* Variant navigation for smaller screens */}
          <div className="sm:hidden flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                const currentIndex = variants.findIndex(v => v.id === selectedVariant);
                const prevIndex = (currentIndex - 1 + variants.length) % variants.length;
                handleVariantChange(variants[prevIndex].id);
              }}
              disabled={variants.length <= 1}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                const currentIndex = variants.findIndex(v => v.id === selectedVariant);
                const nextIndex = (currentIndex + 1) % variants.length;
                handleVariantChange(variants[nextIndex].id);
              }}
              disabled={variants.length <= 1}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Product information */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold">About this {productType}</h3>
          <p className="text-sm text-gray-600 mt-1">
            Try on this {productType} virtually to see how it looks on you before purchasing.
            {productType === 'glasses' && ' Our AR technology ensures accurate fit and style representation.'}
            {productType === 'jewelry' && ' See how these pieces complement your style with realistic rendering.'}
            {productType === 'makeup' && ' Experience how these colors and textures will look on your skin tone.'}
            {productType === 'clothing' && ' Check how this garment fits and matches your style before buying.'}
          </p>
        </div>
      </div>
    </ErrorBoundary>
  );
} 