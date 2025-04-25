import React from 'react';
import { ViroARScene, Viro3DObject, ViroAmbientLight } from '@viro-community/react-viro';

interface ARSceneProps {
  onLoadEnd: () => void;
  source: any;
  scale: [number, number, number];
}

const ARScene: React.FC<ARSceneProps> = ({ onLoadEnd, source, scale }) => (
  <ViroARScene>
    <ViroAmbientLight color="#FFFFFF" intensity={500} />
    <Viro3DObject
      source={source}
      resources={[]}
      position={[0, 0, -1]}
      scale={scale}
      type="GLB"
      onLoadEnd={onLoadEnd}
    />
  </ViroARScene>
);

export default ARScene;
