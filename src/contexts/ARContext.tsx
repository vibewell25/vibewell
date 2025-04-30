import React, { createContext, useContext, useState, useCallback } from 'react';
import * as THREE from 'three';

interface ARState {
  isInitialized: boolean;
  isTracking: boolean;
  faceDetected: boolean;
  landmarks: any[];
  cameraPosition?: THREE.Vector3;
  worldMatrix?: THREE.Matrix4;
  confidence: number;
  error?: string;
}

interface ARContextValue {
  arState: ARState;
  updateARState: (update: Partial<ARState>) => void;
  resetARState: () => void;
}

const initialState: ARState = {
  isInitialized: false,
  isTracking: false,
  faceDetected: false,
  landmarks: [],
  confidence: 0
};

const ARContext = createContext<ARContextValue | undefined>(undefined);

export const ARProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [arState, setARState] = useState<ARState>(initialState);

  const updateARState = useCallback((update: Partial<ARState>) => {
    setARState(current => ({
      ...current,
      ...update
    }));
  }, []);

  const resetARState = useCallback(() => {
    setARState(initialState);
  }, []);

  return (
    <ARContext.Provider
      value={{
        arState,
        updateARState,
        resetARState
      }}
    >
      {children}
    </ARContext.Provider>
  );
};

export const useARContext = () => {
  const context = useContext(ARContext);
  if (!context) {
    throw new Error('useARContext must be used within an ARProvider');
  }
  return context;
}; 