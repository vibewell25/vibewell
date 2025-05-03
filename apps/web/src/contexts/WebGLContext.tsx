import React, { createContext, useContext, useRef, useEffect } from 'react';

interface WebGLContextType {
  gl: WebGLRenderingContext | null;
  canvas: HTMLCanvasElement | null;
  initWebGL: () => void;
  updateScene: (params: { lightingIntensity?: number; particleEffects?: boolean }) => void;
}

const WebGLContext = createContext<WebGLContextType | undefined>(undefined);

export {};

export {};
