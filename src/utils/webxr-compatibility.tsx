/**
 * WebXR Compatibility Utility
 *
 * This module provides functions for detecting WebXR support and fallbacks
 * for browsers that don't support AR features.
 */

// Different types of XR experiences
export enum XRMode {
  AR = 'ar',
  VR = 'vr',
  FALLBACK = 'fallback', // For non-XR browsing
}

// Different fallback experiences
export enum XRFallbackType {
  IMAGE_ONLY = 'image-only', // Show static images instead
  VIDEO = 'video', // Show video/360 experience
  MODEL_VIEWER = '3d-model-viewer', // Use <model-viewer> element
  SCENE_VIEWER = 'scene-viewer', // Use Google Scene Viewer
}

// Browser compatibility information
interface XRCompatibilityInfo {
  arSupported: boolean;
  vrSupported: boolean;
  recommendedMode: XRMode;
  fallbackType: XRFallbackType;
  browser: string;
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  hasGyroscope: boolean;
}

export interface WebXRFeatures {
  isSupported: boolean;
  hasARSupport: boolean;
  hasVRSupport: boolean;
  hasHandTracking: boolean;
  hasDepthSensing: boolean;
}

/**
 * Detects if WebXR is supported in the current browser
 */
export async function detectXRSupport(): Promise<XRCompatibilityInfo> {
  const navigator = window.navigator;
  const userAgent = navigator.userAgent.toLowerCase();

  // Check device type
  const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent);
  const isIOS = /iphone|ipad|ipod/i.test(userAgent);
  const isAndroid = /android/i.test(userAgent);

  // Detect browser
  const isChrome = /chrome|chromium|crios/i.test(userAgent) && !/edg|edge/i.test(userAgent);
  const isFirefox = /firefox|fxios/i.test(userAgent);
  const isSafari = /safari/i.test(userAgent) && !/chrome|chromium|crios/i.test(userAgent);
  const isEdge = /edg|edge/i.test(userAgent);

  let browser = 'unknown';
  if (isChrome) browser = 'chrome';
  else if (isFirefox) browser = 'firefox';
  else if (isSafari) browser = 'safari';
  else if (isEdge) browser = 'edge';

  // Check for WebXR API
  const hasWebXR = 'xr' in navigator;

  // Check for gyroscope (important for orientation in AR/VR)
  const hasGyroscope = await checkGyroscopeSupport();

  // Initialize default compatibility info
  const compatibilityInfo: XRCompatibilityInfo = {
    arSupported: false,
    vrSupported: false,
    recommendedMode: XRMode.FALLBACK,
    fallbackType: XRFallbackType.IMAGE_ONLY,
    browser,
    isMobile,
    isIOS,
    isAndroid,
    hasGyroscope,
  };

  // Test for AR and VR session support
  if (hasWebXR) {
    try {
      // Check AR support
      compatibilityInfo.arSupported = await checkARSupport();

      // Check VR support
      compatibilityInfo.vrSupported = await checkVRSupport();

      // Determine recommended mode
      if (compatibilityInfo.arSupported) {
        compatibilityInfo.recommendedMode = XRMode.AR;
      } else if (compatibilityInfo.vrSupported) {
        compatibilityInfo.recommendedMode = XRMode.VR;
      }
    } catch (error) {
      console.error('Error checking XR support:', error);
    }
  }

  // Determine best fallback type if needed
  if (compatibilityInfo.recommendedMode === XRMode.FALLBACK) {
    // On iOS, prefer Scene Viewer
    if (isIOS) {
      compatibilityInfo.fallbackType = hasGyroscope
        ? XRFallbackType.MODEL_VIEWER
        : XRFallbackType.IMAGE_ONLY;
    }
    // On Android, prefer Scene Viewer
    else if (isAndroid) {
      compatibilityInfo.fallbackType = XRFallbackType.SCENE_VIEWER;
    }
    // On desktop with gyroscope, use model viewer
    else if (hasGyroscope) {
      compatibilityInfo.fallbackType = XRFallbackType.MODEL_VIEWER;
    }
    // Otherwise use video fallback
    else {
      compatibilityInfo.fallbackType = XRFallbackType.VIDEO;
    }
  }

  return compatibilityInfo;
}

/**
 * Check if AR is supported
 */
async function checkARSupport(): Promise<boolean> {
  if (!('xr' in navigator)) {
    return false;
  }

  try {
    // @ts-expect-error - Some browsers may not have isSessionSupported method
    return await navigator.xr.isSessionSupported('immersive-ar');
  } catch (error) {
    console.warn('Error checking AR support:', error);
    return false;
  }
}

/**
 * Check if VR is supported
 */
async function checkVRSupport(): Promise<boolean> {
  if (!('xr' in navigator)) {
    return false;
  }

  try {
    // @ts-expect-error - Some browsers may not have isSessionSupported method
    return await navigator.xr.isSessionSupported('immersive-vr');
  } catch (error) {
    console.warn('Error checking VR support:', error);
    return false;
  }
}

/**
 * Check if device has gyroscope
 */
async function checkGyroscopeSupport(): Promise<boolean> {
  if (!window.DeviceMotionEvent) {
    return false;
  }

  // Try to request device motion permission on iOS
  if (
    typeof DeviceMotionEvent !== 'undefined' &&
    typeof (DeviceMotionEvent as any).requestPermission === 'function'
  ) {
    try {
      // @ts-expect-error - iOS requires permission for DeviceMotion
      const permission = await DeviceMotionEvent.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.warn('Error requesting device motion permission:', error);
      return false;
    }
  }

  // For other browsers, assume gyroscope exists
  // Better detection would require actual device motion events
  return true;
}

/**
 * Get a 3D model URL that's compatible with the current browser
 */
export function getCompatible3DModelUrl(
  glbUrl: string,
  usdzUrl: string,
  fallbackImageUrl: string,
  info?: XRCompatibilityInfo
): string {
  // Get compatibility info if not provided
  if (!info) {
    // Use synchronous check for immediate result (less accurate)
    const isMobile = /mobile|android|iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase());
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase());

    // Basic compatibility info
    info = {
      arSupported: false,
      vrSupported: false,
      recommendedMode: XRMode.FALLBACK,
      fallbackType: isIOS ? XRFallbackType.MODEL_VIEWER : XRFallbackType.SCENE_VIEWER,
      browser: 'unknown',
      isMobile,
      isIOS,
      isAndroid: /android/i.test(navigator.userAgent.toLowerCase()),
      hasGyroscope: false,
    };
  }

  // Return appropriate URL based on platform
  if (info.isIOS) {
    return usdzUrl || glbUrl;
  } else if (info.arSupported || info.vrSupported) {
    return glbUrl;
  } else {
    // Use fallback image if neither AR nor VR is supported
    return fallbackImageUrl;
  }
}

/**
 * Create a launch link for AR experience
 */
export function createARLaunchLink(
  glbUrl: string,
  usdzUrl: string,
  fallbackUrl: string,
  info?: XRCompatibilityInfo
): string {
  // Get compatibility info if not provided
  if (!info) {
    // Use synchronous check for immediate result
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/i.test(userAgent);
    const isAndroid = /android/i.test(userAgent);

    // Basic compatibility info
    info = {
      arSupported: false,
      vrSupported: false,
      recommendedMode: XRMode.FALLBACK,
      fallbackType: isIOS ? XRFallbackType.MODEL_VIEWER : XRFallbackType.SCENE_VIEWER,
      browser: 'unknown',
      isMobile: isIOS || isAndroid,
      isIOS,
      isAndroid,
      hasGyroscope: false,
    };
  }

  // For iOS devices, use AR Quick Look
  if (info.isIOS) {
    return usdzUrl;
  }

  // For Android devices, use Scene Viewer
  if (info.isAndroid) {
    // Create Scene Viewer URL with fallback
    return `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(glbUrl)}&mode=ar_preferred#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(fallbackUrl)};end;`;
  }

  // For WebXR supported browsers, return the GLB URL
  if (info.arSupported) {
    return glbUrl;
  }

  // Fallback for unsupported platforms
  return fallbackUrl;
}

/**
 * Create a component for AR display that works cross-browser
 */
export function getARCompatibleComponent(
  modelUrl: string,
  fallbackImageUrl: string,
  info?: XRCompatibilityInfo
): { component: string; props: Record<string, any> } {
  // Get compatibility info if not provided
  if (!info) {
    // Use synchronous check for immediate result
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/i.test(userAgent);
    const isAndroid = /android/i.test(userAgent);

    // Basic compatibility info
    info = {
      arSupported: 'xr' in navigator,
      vrSupported: false,
      recommendedMode: XRMode.FALLBACK,
      fallbackType: isIOS ? XRFallbackType.MODEL_VIEWER : XRFallbackType.SCENE_VIEWER,
      browser: 'unknown',
      isMobile: isIOS || isAndroid,
      isIOS,
      isAndroid,
      hasGyroscope: false,
    };
  }

  // Return appropriate component based on compatibility
  if (info.arSupported) {
    return {
      component: 'WebXRViewer',
      props: {
        modelUrl,
        fallbackImageUrl,
      },
    };
  } else if (info.fallbackType === XRFallbackType.MODEL_VIEWER) {
    return {
      component: 'ModelViewer',
      props: {
        src: modelUrl,
        fallbackImageUrl,
        ar: false,
        autoRotate: true,
      },
    };
  } else {
    return {
      component: 'FallbackImage',
      props: {
        src: fallbackImageUrl,
        alt: '3D model fallback image',
      },
    };
  }
}

export async function checkWebXRFeatures(): Promise<WebXRFeatures> {
  if (typeof navigator === 'undefined' || !navigator.xr) {
    return {
      isSupported: false,
      hasARSupport: false,
      hasVRSupport: false,
      hasHandTracking: false,
      hasDepthSensing: false,
    };
  }

  const features: WebXRFeatures = {
    isSupported: 'xr' in navigator,
    hasARSupport: false,
    hasVRSupport: false,
    hasHandTracking: false,
    hasDepthSensing: false,
  };

  try {
    features.hasARSupport = await navigator.xr.isSessionSupported('immersive-ar');
  } catch (e) {
    console.warn('AR session check failed:', e);
  }

  try {
    features.hasVRSupport = await navigator.xr.isSessionSupported('immersive-vr');
  } catch (e) {
    console.warn('VR session check failed:', e);
  }

  // Check for hand tracking
  if (features.hasARSupport || features.hasVRSupport) {
    try {
      const session = await navigator.xr.requestSession(
        features.hasARSupport ? 'immersive-ar' : 'immersive-vr',
        { optionalFeatures: ['hand-tracking'] }
      );
      features.hasHandTracking = true;
      await session.end();
    } catch (e) {
      console.warn('Hand tracking check failed:', e);
    }
  }

  // Check for depth sensing
  if (features.hasARSupport) {
    try {
      const session = await navigator.xr.requestSession('immersive-ar', {
        optionalFeatures: ['depth-sensing'],
      });
      features.hasDepthSensing = true;
      await session.end();
    } catch (e) {
      console.warn('Depth sensing check failed:', e);
    }
  }

  return features;
}

export function getFallbackExperience(features: WebXRFeatures) {
  if (!features.isSupported) {
    return {
      type: '2d',
      message:
        'Your browser does not support WebXR. Please try a compatible browser for the full experience.',
    };
  }

  if (!features.hasARSupport && !features.hasVRSupport) {
    return {
      type: '2d',
      message: 'Your device does not support AR or VR. Using fallback 2D experience.',
    };
  }

  return {
    type: features.hasARSupport ? 'ar' : 'vr',
    message: null,
  };
}

export function useWebXR() {
  const [features, setFeatures] = React.useState<WebXRFeatures>({
    isSupported: false,
    hasARSupport: false,
    hasVRSupport: false,
    hasHandTracking: false,
    hasDepthSensing: false,
  });

  const [isChecking, setIsChecking] = React.useState(true);

  React.useEffect(() => {
    checkWebXRFeatures().then(features => {
      setFeatures(features);
      setIsChecking(false);
    });
  }, []);

  return {
    features,
    isChecking,
    fallback: getFallbackExperience(features),
  };
}

export default {
  detectXRSupport,
  getCompatible3DModelUrl,
  createARLaunchLink,
  getARCompatibleComponent,
  XRMode,
  XRFallbackType,
};
