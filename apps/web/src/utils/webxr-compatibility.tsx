/**
 * WebXR Compatibility Utility
 *
 * This module provides functions for detecting WebXR support and fallbacks
 * for browsers that don't support AR features.
 */

import React from 'react';

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

// Types for WebXR features
type XRHandedness = 'left' | 'right' | 'none';

interface XRDepthUsage {
  cpu: 'cpu';
  gpu: 'gpu';
}

interface XRDepthDataFormat {
  luminance: 'luminance-alpha';
  float32: 'float32';
}

export interface XRDepthData {
  data: Float32Array;
  width: number;
  height: number;
}

interface XRHand {
  joints: Map<string, { trackingConfidence: number }>;
}

interface XRHandTrackingEvent extends Event {
  hands: Map<XRHandedness, XRHand>;
}

interface XRDepthSensingEvent extends Event {
  depthData: XRDepthData;
}

export interface WebXRFeatures {
  isSupported: boolean;
  hasARSupport: boolean;
  hasVRSupport: boolean;
  hasHandTracking: boolean;
  hasDepthSensing: boolean;
  handTrackingQuality?: 'low' | 'medium' | 'high';
  depthSensingCapabilities?: {
    usagePreference: keyof XRDepthUsage;
    dataFormatPreference: keyof XRDepthDataFormat;
  };
}

export interface HandTrackingState {
  hands: Map<XRHandedness, XRHand>;
  confidence: number;
  lastUpdated: number;
}

export interface DepthSensingState {
  depthMap: Float32Array;
  width: number;
  height: number;
  lastUpdated: number;
}

let handTrackingState: HandTrackingState | null = null;
let depthSensingState: DepthSensingState | null = null;

type DeviceMotionEventConstructor = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

type XRSessionWithFeatures = XRSession & {
  supportedFeatures?: Set<string>;
};

type XRSessionWithDepthSensing = XRSession & {
  getDepthSensing?: () => {
    usagePreference: keyof XRDepthUsage;
    dataFormatPreference: keyof XRDepthDataFormat;
  };
};

/**
 * Detects if WebXR is supported in the current browser
 */
export async function detectXRSupport(): Promise<XRCompatibilityInfo> {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');
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
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');
  try {
    return navigator.xr ? await navigator.xr.isSessionSupported('immersive-ar') : false;
  } catch (error) {
    console.warn('AR session check failed:', error);
    return false;
  }
}

/**
 * Check if VR is supported
 */
async function checkVRSupport(): Promise<boolean> {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');
  try {
    return navigator.xr ? await navigator.xr.isSessionSupported('immersive-vr') : false;
  } catch (error) {
    console.warn('VR session check failed:', error);
    return false;
  }
}

/**
 * Check if device has gyroscope
 */
async function checkGyroscopeSupport(): Promise<boolean> {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');
  if (!window.DeviceMotionEvent) {
    return false;
  }

  // Try to request device motion permission on iOS
  if (
    typeof DeviceMotionEvent !== 'undefined' &&
    typeof (DeviceMotionEvent as unknown as DeviceMotionEventConstructor).requestPermission === 'function'
  ) {
    try {
      // @ts-expect-error - iOS requires permission for DeviceMotion
      const permission = await (DeviceMotionEvent as DeviceMotionEventConstructor).requestPermission();
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
  info?: XRCompatibilityInfo,
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
  info?: XRCompatibilityInfo,
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
  info?: XRCompatibilityInfo,
): { component: string; props: Record<string, unknown> } {
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
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');
  if (typeof navigator === 'undefined' || !navigator.xr) {
    return createUnsupportedFeatures();
  }

  const features: WebXRFeatures = {
    isSupported: 'xr' in navigator,
    hasARSupport: false,
    hasVRSupport: false,
    hasHandTracking: false,
    hasDepthSensing: false,
  };

  try {
    features.hasARSupport = await checkARSupport();
    features.hasVRSupport = await checkVRSupport();

    if (features.hasARSupport || features.hasVRSupport) {
      const handTrackingResult = await checkHandTracking(
        features.hasARSupport ? 'immersive-ar' : 'immersive-vr',
      );
      features.hasHandTracking = handTrackingResult.supported;
      features.handTrackingQuality = handTrackingResult.quality;
    }

    if (features.hasARSupport) {
      const depthResult = await checkDepthSensing();
      features.hasDepthSensing = depthResult.supported;
      if (depthResult.capabilities) {
        features.depthSensingCapabilities = depthResult.capabilities;
      }
    }
  } catch (error) {
    console.error('Error checking WebXR features:', error);
    handleWebXRError(error);
  }

  return features;
}

function createUnsupportedFeatures(): WebXRFeatures {
  return {
    isSupported: false,
    hasARSupport: false,
    hasVRSupport: false,
    hasHandTracking: false,
    hasDepthSensing: false,
  };
}

async function checkHandTracking(
  mode: 'immersive-ar' | 'immersive-vr',
): Promise<{ supported: boolean; quality: 'low' | 'medium' | 'high' }> {
  if (!navigator.xr) {
    return { supported: false, quality: 'low' };
  }

  try {
    const session = await navigator.xr.requestSession(mode, {
      requiredFeatures: ['hand-tracking'],
      optionalFeatures: ['high-precision-hand-tracking'],
    });

    // Check if hand tracking is supported through feature detection
    const hasHighPrecision = (session as XRSessionWithFeatures).supportedFeatures.has(
      'high-precision-hand-tracking',
    );
    const quality = hasHighPrecision ? 'high' : 'medium';

    await session.end();
    return { supported: true, quality };
  } catch (error) {
    console.warn('Hand tracking check failed:', error);
    return { supported: false, quality: 'low' };
  }
}

async function checkDepthSensing(): Promise<{
  supported: boolean;
  capabilities?: {
    usagePreference: keyof XRDepthUsage;
    dataFormatPreference: keyof XRDepthDataFormat;
  };
}> {
  if (!navigator.xr) {
    return { supported: false };
  }

  try {
    const session = await navigator.xr.requestSession('immersive-ar', {
      requiredFeatures: ['depth-sensing'],
    });

    // Use type assertion since depth-sensing API is experimental
    const depthSensing = (session as XRSessionWithDepthSensing).getDepthSensing.();
    if (!depthSensing) {
      await session.end();
      return { supported: false };
    }

    const capabilities = {
      usagePreference: depthSensing.usagePreference as keyof XRDepthUsage,
      dataFormatPreference: depthSensing.dataFormatPreference as keyof XRDepthDataFormat,
    };

    await session.end();
    return { supported: true, capabilities };
  } catch (error) {
    console.warn('Depth sensing check failed:', error);
    return { supported: false };
  }
}

export async function initializeHandTracking(session: XRSession): Promise<void> {
  try {
    const hands = new Map<XRHandedness, XRHand>();

    session.addEventListener('handtrackingchange', ((event: XRHandTrackingEvent) => {
      updateHandTrackingState(event.hands);
    }) as EventListener);

    handTrackingState = {
      hands,
      confidence: 0,
      lastUpdated: Date.now(),
    };
  } catch (error) {
    console.error('Error initializing hand tracking:', error);
    throw new Error('Hand tracking initialization failed');
  }
}

export async function initializeDepthSensing(session: XRSession): Promise<void> {
  try {
    // Use type assertion for experimental depth sensing API
    const depthSensing = (session as XRSessionWithDepthSensing).getDepthSensing.();
    if (!depthSensing) {
      throw new Error('Depth sensing not supported');
    }

    session.addEventListener('depthsensing', ((event: XRDepthSensingEvent) => {
      updateDepthSensingState(event.depthData);
    }) as EventListener);

    depthSensingState = {
      depthMap: new Float32Array(),
      width: 0,
      height: 0,
      lastUpdated: Date.now(),
    };
  } catch (error) {
    console.error('Error initializing depth sensing:', error);
    throw new Error('Depth sensing initialization failed');
  }
}

function updateHandTrackingState(hands: Map<XRHandedness, XRHand>): void {
  if (handTrackingState) {
    handTrackingState.hands = hands;
    handTrackingState.lastUpdated = Date.now();
    handTrackingState.confidence = calculateHandTrackingConfidence(hands);
  }
}

function updateDepthSensingState(depthData: XRDepthData): void {
  if (depthSensingState) {
    depthSensingState.depthMap = depthData.data;
    depthSensingState.width = depthData.width;
    depthSensingState.height = depthData.height;
    depthSensingState.lastUpdated = Date.now();
  }
}

function calculateHandTrackingConfidence(hands: Map<XRHandedness, XRHand>): number {
  let totalConfidence = 0;
  let jointCount = 0;

  hands.forEach((hand) => {
    hand.joints.forEach((joint) => {
      if (totalConfidence > Number.MAX_SAFE_INTEGER || totalConfidence < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); totalConfidence += joint.trackingConfidence;
      if (jointCount > Number.MAX_SAFE_INTEGER || jointCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); jointCount++;
    });
  });

  return jointCount > 0 ? totalConfidence / jointCount : 0;
}

function handleWebXRError(error: unknown): void {
  if (error instanceof DOMException) {
    switch (error.name) {
      case 'NotAllowedError':
        throw new Error('WebXR access denied. Please grant necessary permissions.');
      case 'NotSupportedError':
        throw new Error('WebXR or required features not supported on this device.');
      case 'SecurityError':
        throw new Error('WebXR access blocked due to security restrictions.');
      default:
        throw new Error(`WebXR error: ${error.message}`);
    }
  } else {
    throw error;
  }
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
    checkWebXRFeatures().then((features) => {
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

const WebXRUtils = {
  detectXRSupport,
  getCompatible3DModelUrl,
  createARLaunchLink,
  getARCompatibleComponent,
  XRMode,
  XRFallbackType,
};

export default WebXRUtils;
