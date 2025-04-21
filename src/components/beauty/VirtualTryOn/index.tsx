import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import {
  Camera,
  CameraOff,
  RefreshCcw,
  Download,
  Share2,
  Heart,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronRight,
  ChevronLeft,
  Info,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { virtualTryOnState, TryOnProduct, ProductColor } from '../../../utils/beauty-state';
import { AccessibilityAnnouncer } from '../../accessibility/AccessibilityAnnouncer';

// Lazy-loaded components for better performance
const ARExperience = lazy(() => import('./ARExperience'));
const ProductDetails = lazy(() => import('./ProductDetails'));
const ColorSelector = lazy(() => import('./ColorSelector'));
const RecentlyTried = lazy(() => import('./RecentlyTried'));
const VirtualizedProductGrid = lazy(() => import('./VirtualizedProductGrid'));

/**
 * VirtualTryOn component for trying beauty products using AR
 * Implements optimized image loading, accessibility features, and code splitting
 */
export function VirtualTryOn() {
  // State
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [announcement, setAnnouncement] = useState('');

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);

  // Use the virtual try-on state
  const {
    availableProducts,
    selectedProduct,
    selectedColor,
    cameraActive,
    arActive,
    isLoading,
    error,
    faceDetected,
    recentlyTriedProducts,
    loadTryOnProducts,
    selectProduct,
    selectColor,
    toggleCamera,
    startARExperience,
    stopARExperience,
    captureImage,
    saveToFavorites,
    shareImage,
  } = virtualTryOnState.useStore();

  // Load try-on products on mount
  useEffect(() => {
    loadTryOnProducts();
  }, [loadTryOnProducts]);

  // Toggle AR mode
  const handleARToggle = async () => {
    if (!cameraActive) {
      toggleCamera();
      setAnnouncement('Camera activated. Please allow camera access when prompted.');
    } else if (cameraActive && !arActive && faceDetected) {
      const success = await startARExperience();
      if (success) {
        setAnnouncement('AR experience started. You can now try on beauty products.');
      } else {
        setAnnouncement('Failed to start AR experience. Please try again.');
      }
    } else if (arActive) {
      stopARExperience();
      setAnnouncement('AR experience stopped.');
    } else {
      toggleCamera();
      setAnnouncement('Camera deactivated.');
    }
  };

  // Capture current look
  const handleCapture = async () => {
    if (!arActive) return;

    const imageData = await captureImage();
    if (imageData) {
      setCapturedImage(imageData);
      setAnnouncement('Image captured. You can now download or share it.');
    } else {
      setAnnouncement('Failed to capture image. Please try again.');
    }
  };

  // Share captured image
  const handleShare = async () => {
    if (!capturedImage) return;

    const success = await shareImage(capturedImage);
    if (success) {
      setAnnouncement('Image shared successfully.');
    } else {
      setAnnouncement('Failed to share image. Your browser may not support sharing.');
    }
  };

  // Save to favorites
  const handleSaveToFavorites = () => {
    if (!selectedProduct || !selectedColor) return;

    saveToFavorites(selectedProduct.id, selectedColor.id);
    setAnnouncement(`${selectedProduct.name} in ${selectedColor.name} saved to favorites.`);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
      setAnnouncement('Fullscreen mode activated. Press Escape to exit.');
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
      setAnnouncement('Fullscreen mode deactivated.');
    }
  };

  // Adjust zoom level
  const adjustZoom = (increase: boolean) => {
    setZoomLevel(prevZoom => {
      const newZoom = increase ? Math.min(prevZoom + 0.25, 3) : Math.max(prevZoom - 0.25, 0.5);

      setAnnouncement(`Zoom level set to ${Math.round(newZoom * 100)}%.`);
      return newZoom;
    });
  };

  return (
    <div className="virtual-try-on relative" ref={containerRef}>
      {/* Accessibility announcer for screen reader users */}
      <AccessibilityAnnouncer message={announcement} />

      {/* Info modal */}
      {isInfoOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg overflow-hidden max-w-lg w-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">How to Use Virtual Try-On</h2>
              <button
                onClick={() => setIsInfoOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Close help"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <ol className="space-y-4 list-decimal list-inside">
                <li className="text-gray-800">
                  <span className="font-medium">Select a Product</span>
                  <p className="text-gray-600 ml-6 mt-1">
                    Browse through our collection of products and click on one to select it
                  </p>
                </li>
                <li className="text-gray-800">
                  <span className="font-medium">Choose a Color</span>
                  <p className="text-gray-600 ml-6 mt-1">
                    Select from the available colors for your chosen product
                  </p>
                </li>
                <li className="text-gray-800">
                  <span className="font-medium">Activate Camera</span>
                  <p className="text-gray-600 ml-6 mt-1">
                    Click the "Activate Camera" button to turn on your device's camera
                  </p>
                </li>
                <li className="text-gray-800">
                  <span className="font-medium">Start AR Experience</span>
                  <p className="text-gray-600 ml-6 mt-1">
                    Once your face is detected, click the camera button again to start the AR try-on
                  </p>
                </li>
                <li className="text-gray-800">
                  <span className="font-medium">Adjust and Capture</span>
                  <p className="text-gray-600 ml-6 mt-1">
                    Use the zoom controls to adjust your view, then capture your look with the
                    center button
                  </p>
                </li>
              </ol>

              <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <h3 className="text-blue-800 font-medium">Privacy Note</h3>
                <p className="text-blue-700 text-sm mt-1">
                  Your camera feed is processed locally on your device. No images are sent to our
                  servers unless you explicitly choose to share them.
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t">
              <button
                onClick={() => setIsInfoOpen(false)}
                className="w-full py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
                aria-label="Close help"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div
        className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${isFullscreen ? 'h-screen fixed inset-0 z-40 bg-white p-4' : ''}`}
      >
        {/* Product selection panel */}
        <div className="md:col-span-1 bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4" id="product-selection">
            Select a Product
          </h2>

          {/* Product grid with virtualization */}
          <Suspense
            fallback={
              <div className="flex items-center justify-center w-full h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
              </div>
            }
          >
            <VirtualizedProductGrid
              products={availableProducts}
              isLoading={isLoading}
              onSelectProduct={product => {
                selectProduct(product.id);
                setAnnouncement(`Selected ${product.name}`);
              }}
              selectedProductId={selectedProduct?.id || null}
              gridClassName="mb-6"
            />
          </Suspense>

          {/* Product details section */}
          {selectedProduct && (
            <Suspense fallback={<div className="animate-pulse h-40 bg-gray-200 rounded-lg"></div>}>
              <ProductDetails product={selectedProduct} className="mb-6" />
            </Suspense>
          )}

          {/* Color selector section */}
          {selectedProduct && selectedProduct.colors.length > 0 && (
            <Suspense fallback={<div className="animate-pulse h-20 bg-gray-200 rounded-lg"></div>}>
              <ColorSelector
                colors={selectedProduct.colors}
                selectedColorId={selectedColor?.id}
                onSelectColor={colorId => {
                  selectColor(colorId);
                  const colorName =
                    selectedProduct.colors.find(c => c.id === colorId)?.name || 'new color';
                  setAnnouncement(`Selected ${colorName}`);
                }}
                className="mb-6"
              />
            </Suspense>
          )}

          {/* Recently tried products */}
          {recentlyTriedProducts.length > 0 && (
            <Suspense fallback={<div className="animate-pulse h-20 bg-gray-200 rounded-lg"></div>}>
              <RecentlyTried
                products={recentlyTriedProducts}
                onSelectProduct={productId => {
                  selectProduct(productId);
                  const product = recentlyTriedProducts.find(p => p.id === productId);
                  if (product) {
                    setAnnouncement(`Selected ${product.name} from recently tried`);
                  }
                }}
                currentProductId={selectedProduct?.id}
              />
            </Suspense>
          )}
        </div>

        {/* AR Experience container */}
        <div className="md:col-span-2 bg-white rounded-lg shadow overflow-hidden">
          <div className="relative aspect-video bg-gray-100">
            {/* Loading state */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600">Loading your AR experience...</p>
                </div>
              </div>
            )}

            {/* Camera inactive state */}
            {!cameraActive ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-6 max-w-md">
                  <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera size={32} className="text-pink-500" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Try On Beauty Products</h2>
                  <p className="text-gray-600 mb-6">
                    Activate your camera to virtually try on makeup, hair colors, and more
                  </p>
                  <button
                    onClick={handleARToggle}
                    className="bg-pink-500 text-white px-6 py-3 rounded-full font-medium hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors"
                    aria-label="Activate camera for virtual try-on"
                  >
                    Activate Camera
                  </button>
                </div>
              </div>
            ) : (
              /* Active AR experience */
              <Suspense
                fallback={
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
                  </div>
                }
              >
                <ARExperience
                  product={selectedProduct}
                  colorId={selectedColor?.id}
                  arActive={arActive}
                  faceDetected={faceDetected}
                  zoomLevel={zoomLevel}
                />
              </Suspense>
            )}

            {/* AR controls */}
            {cameraActive && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <div className="bg-white/90 backdrop-blur-sm py-2 px-4 rounded-full shadow-lg flex items-center space-x-3">
                  {/* AR toggle button */}
                  <button
                    onClick={handleARToggle}
                    disabled={!faceDetected && !arActive}
                    className={`p-3 rounded-full ${
                      arActive
                        ? 'bg-red-500 text-white'
                        : faceDetected
                          ? 'bg-pink-500 text-white'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    aria-label={arActive ? 'Stop AR experience' : 'Start AR experience'}
                  >
                    {arActive ? <CameraOff size={20} /> : <Camera size={20} />}
                  </button>

                  {/* Zoom controls */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => adjustZoom(false)}
                      disabled={zoomLevel <= 0.5 || !arActive}
                      className={`p-2 rounded-full ${
                        !arActive || zoomLevel <= 0.5
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'hover:bg-gray-200'
                      }`}
                      aria-label="Zoom out"
                    >
                      <ZoomOut size={18} />
                    </button>

                    <button
                      onClick={() => adjustZoom(true)}
                      disabled={zoomLevel >= 3 || !arActive}
                      className={`p-2 rounded-full ${
                        !arActive || zoomLevel >= 3
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'hover:bg-gray-200'
                      }`}
                      aria-label="Zoom in"
                    >
                      <ZoomIn size={18} />
                    </button>
                  </div>

                  {/* Capture button */}
                  <button
                    onClick={handleCapture}
                    disabled={!arActive}
                    className={`p-3 rounded-full ${
                      arActive
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    aria-label="Capture current look"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>

                  {/* Favorite button */}
                  <button
                    onClick={handleSaveToFavorites}
                    disabled={!selectedProduct || !selectedColor}
                    className={`p-2 rounded-full ${
                      selectedProduct && selectedColor
                        ? 'hover:bg-gray-200 text-pink-500'
                        : 'text-gray-300 cursor-not-allowed'
                    }`}
                    aria-label="Save to favorites"
                  >
                    <Heart size={18} />
                  </button>

                  {/* Reset button */}
                  <button
                    onClick={() => {
                      setZoomLevel(1);
                      setAnnouncement('View reset to default zoom level.');
                    }}
                    disabled={!arActive}
                    className={`p-2 rounded-full ${
                      arActive ? 'hover:bg-gray-200' : 'text-gray-300 cursor-not-allowed'
                    }`}
                    aria-label="Reset view"
                  >
                    <RefreshCcw size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Face detection message */}
            {cameraActive && !faceDetected && !arActive && (
              <div className="absolute top-4 left-0 right-0 flex justify-center">
                <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium animate-pulse">
                  Detecting face... Please make sure your face is visible
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="absolute top-4 left-0 right-0 flex justify-center">
                <div className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium">
                  {error}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Captured image modal */}
      {capturedImage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg overflow-hidden max-w-2xl w-full max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Captured Look</h2>
              <button
                onClick={() => {
                  setCapturedImage(null);
                  setAnnouncement('Captured image dismissed.');
                }}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Close image view"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={capturedImage}
                  alt="Your captured beauty look"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-between">
              <div className="text-sm text-gray-500">
                {selectedProduct?.name} in {selectedColor?.name}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    // Download the image
                    const link = document.createElement('a');
                    link.href = capturedImage;
                    link.download = `vibewell-beauty-${Date.now()}.png`;
                    link.click();
                    setAnnouncement('Image downloaded.');
                  }}
                  className="flex items-center space-x-1 text-gray-700 hover:text-gray-900"
                  aria-label="Download image"
                >
                  <Download size={16} />
                  <span>Download</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center space-x-1 text-gray-700 hover:text-gray-900"
                  aria-label="Share image"
                >
                  <Share2 size={16} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VirtualTryOn;
