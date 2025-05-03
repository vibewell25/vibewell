import React, { createContext, useContext, useRef, useEffect } from 'react';

interface WebGLContextType {
  gl: WebGLRenderingContext | null;
  canvas: HTMLCanvasElement | null;
  initWebGL: () => void;
  updateScene: (params: { lightingIntensity?: number; particleEffects?: boolean }) => void;
}

const WebGLContext = createContext<WebGLContextType | undefined>(undefined);

export function useWebGL() {
  const context = useContext(WebGLContext);
  if (!context) {
    throw new Error('useWebGL must be used within a WebGLContext provider');
  }
  return context;
}
