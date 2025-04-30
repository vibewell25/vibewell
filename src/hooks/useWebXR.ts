import { useState, useCallback, useEffect } from 'react';

interface WebXRState {
  isSupported: boolean;
  isInitialized: boolean;
  session: XRSession | null;
  referenceSpace: XRReferenceSpace | null;
  error: string | null;
}

export const useWebXR = () => {
  const [state, setState] = useState<WebXRState>({
    isSupported: false,
    isInitialized: false,
    session: null,
    referenceSpace: null,
    error: null
  });

  // Check WebXR support
  useEffect(() => {
    if (typeof navigator === 'undefined') return;

    const checkSupport = async () => {
      try {
        if ('xr' in navigator) {
          const isSupported = await navigator.xr?.isSessionSupported('immersive-ar');
          setState(prev => ({ ...prev, isSupported }));
        }
      } catch (error) {
        console.error('Error checking WebXR support:', error);
        setState(prev => ({
          ...prev,
          error: 'WebXR support check failed'
        }));
      }
    };

    checkSupport();
  }, []);

  // Initialize WebXR session
  const initialize = useCallback(async () => {
    if (!state.isSupported || state.isInitialized) return;

    try {
      // Request AR session
      const session = await navigator.xr?.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test', 'local-floor'],
        optionalFeatures: ['dom-overlay', 'light-estimation']
      });

      if (!session) {
        throw new Error('Failed to create XR session');
      }

      // Setup XR reference space
      const referenceSpace = await session.requestReferenceSpace('local-floor');

      // Setup session event handlers
      session.addEventListener('end', () => {
        setState(prev => ({
          ...prev,
          session: null,
          referenceSpace: null,
          isInitialized: false
        }));
      });

      // Update state
      setState(prev => ({
        ...prev,
        session,
        referenceSpace,
        isInitialized: true,
        error: null
      }));
    } catch (error) {
      console.error('Error initializing WebXR:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to initialize WebXR'
      }));
    }
  }, [state.isSupported, state.isInitialized]);

  // End WebXR session
  const end = useCallback(async () => {
    if (state.session) {
      await state.session.end();
    }
  }, [state.session]);

  // Handle hit testing
  const performHitTest = useCallback(async (
    x: number,
    y: number
  ): Promise<XRHitTestResult[]> => {
    if (!state.session || !state.referenceSpace) {
      throw new Error('WebXR session not initialized');
    }

    try {
      const hitTestSource = await state.session.requestHitTestSource({
        space: state.referenceSpace
      });

      if (!hitTestSource) {
        throw new Error('Failed to create hit test source');
      }

      const frame = await new Promise<XRFrame>((resolve) => {
        state.session?.requestAnimationFrame((frame) => resolve(frame));
      });

      const hitTestResults = frame.getHitTestResults(hitTestSource);
      hitTestSource.cancel();

      return hitTestResults;
    } catch (error) {
      console.error('Error performing hit test:', error);
      throw error;
    }
  }, [state.session, state.referenceSpace]);

  // Handle light estimation
  const getLightEstimate = useCallback(async (): Promise<XRLightEstimate | null> => {
    if (!state.session) return null;

    try {
      const frame = await new Promise<XRFrame>((resolve) => {
        state.session?.requestAnimationFrame((frame) => resolve(frame));
      });

      const lightEstimate = frame.getLightEstimate();
      return lightEstimate || null;
    } catch (error) {
      console.error('Error getting light estimate:', error);
      return null;
    }
  }, [state.session]);

  return {
    isSupported: state.isSupported,
    isInitialized: state.isInitialized,
    session: state.session,
    referenceSpace: state.referenceSpace,
    error: state.error,
    initialize,
    end,
    performHitTest,
    getLightEstimate
  };
}; 