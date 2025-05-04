import { useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, useGLTF } from '@react-three/drei';
import { Suspense } from 'react';

interface ARModelViewerProps {
  modelId: string;
}

// Map model IDs to their file paths
const MODEL_PATHS: Record<string, string> = {
  'lipstick-red': '/models/lipstick-red.glb',
  'foundation-medium': '/models/foundation-medium.glb',
  'eyeshadow-palette': '/models/eyeshadow-palette.glb',
  'blush-pink': '/models/blush-pink.glb',
};

// Component to render the 3D model
function Model({ modelPath, onLoaded }: { modelPath: string; onLoaded: () => void }) {
  const { scene } = useGLTF(modelPath);

  // Auto-rotate the model
  useFrame(({ clock }) => {
    scene.rotation.y = clock.getElapsedTime() * 0.15;
  });

  // Call onLoaded after the model is rendered
  useEffect(() => {
    onLoaded();
  }, [onLoaded]);

  return <primitive object={scene} scale={1.5} position={[0, 0, 0]} />;
}

/**
 * ARModelViewer component for rendering 3D models of beauty products
 *
 * @component
 * @example
 * ```tsx
 * <ARModelViewer modelId="lipstick-red" />
 * ```
 */
export function ARModelViewer({ modelId }: ARModelViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const modelPath = MODEL_PATHS[modelId] || '';

  // Handle loading state
  const handleModelLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="ar-model-viewer h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm">
          <div className="text-center">
            <div className="border-primary mb-2 inline-block h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"></div>
            <p>Loading 3D Model...</p>
          </div>
        </div>
      )}

      <Canvas shadows camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />

        <Suspense fallback={null}>
          {modelPath && <Model modelPath={modelPath} onLoaded={handleModelLoad} />}
          <Environment preset="city" />
          <OrbitControls enablePan={false} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default ARModelViewer;
