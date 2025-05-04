import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, CircularProgress, Slider, Typography } from '@mui/material';
import { useARStore } from '@/stores/arStore';
import { useProductStore } from '@/stores/productStore';
import { ARScene } from './ARScene';
import { FaceMesh } from './FaceMesh';
import { ProductOverlay } from './ProductOverlay';
import { useWebXR } from '@/hooks/useWebXR';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';
import { ARErrorBoundary } from './ARErrorBoundary';

interface ARTryOnProps {
  productId: string;
  onComplete?: () => void;
}

export const ARTryOn: React.FC<ARTryOnProps> = ({ productId, onComplete }) => {
  const sceneRef = useRef<THREE.Scene>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [intensity, setIntensity] = useState(0.5);
  const { isSupported, initialize } = useWebXR();
  const { hasCamera, hasGyroscope } = useDeviceCapabilities();
  const { currentProduct, loadProduct } = useProductStore();
  const { updateARSession } = useARStore();

  useEffect(() => {
    const setupAR = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
      try {
        setIsLoading(true);
        await Promise.all([
          initialize(),
          loadProduct(productId)
        ]);
      } catch (error) {
        console.error('Error setting up AR:', error);
      } finally {
        setIsLoading(false);
      }
    };

    setupAR();
  }, [productId, initialize, loadProduct]);

  const handleIntensityChange = (_: Event, newValue: number | number[]) => {
    setIntensity(newValue as number);
  };

  const handleCapture = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    if (!sceneRef.current) return;

    try {
      const screenshot = await captureARScene(sceneRef.current);
      updateARSession({
        productId,
        screenshot,
        intensity,
        timestamp: Date.now()
      });
      
      onComplete.();
    } catch (error) {
      console.error('Error capturing AR scene:', error);
    }
  };

  if (!isSupported) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          AR is not supported on your device
        </Typography>
        <Typography variant="body2">
          Please ensure you have a compatible device with camera and gyroscope.
        </Typography>
      </Box>
    );
  }

  if (!hasCamera || !hasGyroscope) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Missing required hardware
        </Typography>
        <Typography variant="body2">
          This feature requires a camera and gyroscope.
        </Typography>
      </Box>
    );
  }

  return (
    <ARErrorBoundary>
      <Box className="ar-try-on-container" sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Virtual Try-On
        </Typography>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box 
              sx={{ 
                position: 'relative',
                width: '100%',
                height: '60vh',
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: 'background.paper'
              }}
            >
              <ARScene ref={sceneRef}>
                <FaceMesh />
                {currentProduct && (
                  <ProductOverlay
                    product={currentProduct}
                    intensity={intensity}
                  />
                )}
              </ARScene>
            </Box>

            <Box sx={{ mt: 2, px: 2 }}>
              <Typography id="intensity-slider" gutterBottom>
                Intensity
              </Typography>
              <Slider
                value={intensity}
                onChange={handleIntensityChange}
                aria-labelledby="intensity-slider"
                step={0.1}
                marks
                min={0}
                max={1}
                sx={{ width: '100%' }}
              />
            </Box>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCapture}
                disabled={isLoading}
              >
                Capture Look
              </Button>
            </Box>
          </>
        )}
      </Box>
    </ARErrorBoundary>
  );
};

const captureARScene = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');scene: THREE.Scene): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      const camera = scene.children.find(child => child instanceof THREE.Camera);
      
      if (!camera) {
        throw new Error('Camera not found in scene');
      }

      renderer.render(scene, camera as THREE.Camera);
      const dataUrl = renderer.domElement.toDataURL('image/png');
      
      // Clean up
      renderer.dispose();
      
      resolve(dataUrl);
    } catch (error) {
      reject(error);
    }
  });
}; 