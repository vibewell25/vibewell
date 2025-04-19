import React, { createContext, useContext, useRef, useEffect } from 'react';

interface WebGLContextType {
  gl: WebGLRenderingContext | null;
  canvas: HTMLCanvasElement | null;
  initWebGL: () => void;
  updateScene: (params: { lightingIntensity?: number; particleEffects?: boolean }) => void;
}

const WebGLContext = createContext<WebGLContextType | undefined>(undefined);

export const useWebGL = () => {
  const context = useContext(WebGLContext);
  if (!context) {
    throw new Error('useWebGL must be used within a WebGLProvider');
  }
  return context;
};

export const WebGLProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);

  const initWebGL = () => {
    if (!canvasRef.current) return;

    const gl = canvasRef.current.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    glRef.current = gl;
    // Initialize WebGL scene here
  };

  const updateScene = ({ lightingIntensity, particleEffects }: { 
    lightingIntensity?: number; 
    particleEffects?: boolean 
  }) => {
    if (!glRef.current) return;
    // Update WebGL scene parameters here
  };

  useEffect(() => {
    initWebGL();
    return () => {
      // Cleanup WebGL context
      if (glRef.current) {
        const ext = glRef.current.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
      }
    };
  }, []);

  return (
    <WebGLContext.Provider
      value={{
        gl: glRef.current,
        canvas: canvasRef.current,
        initWebGL,
        updateScene,
      }}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      {children}
    </WebGLContext.Provider>
  );
}; 