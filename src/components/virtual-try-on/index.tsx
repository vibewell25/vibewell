import React, { Suspense, lazy } from 'react';
import Image from 'next/image';

// Lazy load the AR component to reduce initial bundle size
const ARModelViewer = lazy(() => import('./ARModelViewer'));
const ARControls = lazy(() => import('./ARControls'));

/**
 * VirtualTryOn component that loads AR features dynamically
 * to improve initial page load performance
 * 
 * @component
 */
export function VirtualTryOn() {
  const [isARSupported, setIsARSupported] = React.useState<boolean | null>(null);
  const [modelId, setModelId] = React.useState<string | null>(null);
  
  // Check WebXR support on mount
  React.useEffect(() => {
    const checkARSupport = async () => {
      // Use feature detection to check for AR support
      if (
        'xr' in navigator && 
        navigator.xr !== undefined && 
        navigator.xr.isSessionSupported
      ) {
        try {
          const supported = await navigator.xr.isSessionSupported('immersive-ar');
          setIsARSupported(supported);
        } catch (e) {
          console.error('Error checking AR support:', e);
          setIsARSupported(false);
        }
      } else {
        setIsARSupported(false);
      }
    };
    
    checkARSupport();
  }, []);
  
  const handleModelSelect = (id: string) => {
    setModelId(id);
  };
  
  if (isARSupported === null) {
    return <div className="p-8 text-center">Checking AR compatibility...</div>;
  }
  
  if (isARSupported === false) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold mb-4">AR Not Supported</h2>
        <p className="mb-4">
          Your device or browser doesn't support AR experiences.
        </p>
        <p>
          Please try using a modern mobile device with the latest Chrome, Safari, or Firefox.
        </p>
      </div>
    );
  }
  
  return (
    <div className="virtual-try-on">
      <h1 className="text-2xl font-bold mb-6">Virtual Try-On</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Select a Product</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {SAMPLE_PRODUCTS.map(product => (
            <div 
              key={product.id}
              className={`cursor-pointer p-4 border rounded-lg transition-all ${
                modelId === product.id ? 'border-primary ring-2 ring-primary/50' : 'hover:border-gray-400'
              }`}
              onClick={() => handleModelSelect(product.id)}
            >
              <div className="aspect-square bg-gray-100 rounded-md mb-2 relative">
                <Image 
                  src={product.thumbnail} 
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  className="object-cover rounded-md"
                  priority={modelId === product.id}
                />
              </div>
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-sm text-gray-600">${product.price}</p>
            </div>
          ))}
        </div>
      </div>
      
      {modelId && (
        <Suspense fallback={<div className="p-8 text-center">Loading AR experience...</div>}>
          <div className="ar-container h-[500px] rounded-lg overflow-hidden border relative">
            <ARModelViewer modelId={modelId} />
            <ARControls modelId={modelId} />
          </div>
        </Suspense>
      )}
    </div>
  );
}

// Sample product data
const SAMPLE_PRODUCTS = [
  {
    id: 'lipstick-red',
    name: 'Ruby Red Lipstick',
    price: 19.99,
    thumbnail: '/images/products/lipstick-red-thumb.jpg',
    modelPath: '/models/lipstick-red.glb',
  },
  {
    id: 'foundation-medium',
    name: 'Medium Foundation',
    price: 29.99,
    thumbnail: '/images/products/foundation-medium-thumb.jpg',
    modelPath: '/models/foundation-medium.glb',
  },
  {
    id: 'eyeshadow-palette',
    name: 'Sunset Eyeshadow Palette',
    price: 39.99,
    thumbnail: '/images/products/eyeshadow-sunset-thumb.jpg',
    modelPath: '/models/eyeshadow-palette.glb',
  },
  {
    id: 'blush-pink',
    name: 'Pink Blush',
    price: 24.99,
    thumbnail: '/images/products/blush-pink-thumb.jpg',
    modelPath: '/models/blush-pink.glb',
  }
];

export default VirtualTryOn; 