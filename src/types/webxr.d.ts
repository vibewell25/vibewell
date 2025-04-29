/**
 * Represents a rigid transform in 3D space
 */
interface XRRigidTransform {
  readonly position: DOMPointReadOnly;
  readonly orientation: DOMPointReadOnly;
  readonly matrix: Float32Array;
  readonly inverse: XRRigidTransform;
}

/**
 * Represents a view into an XR scene
 */
interface XRView {
  readonly eye: "left" | "right" | "none";
  readonly projectionMatrix: Float32Array;
  readonly transform: XRRigidTransform;
  readonly recommendedViewportScale?: number;
  
  // New method for viewport scaling
  requestViewportScale(scale: number | null): void;
}

/**
 * Represents the pose of the viewer/user
 */
interface XRViewerPose {
  readonly transform: XRRigidTransform;
  readonly views: XRView[];
  readonly emulatedPosition: boolean;
}

/**
 * Represents a frame in the XR animation loop
 */
interface XRFrame {
  readonly session: XRSession;
  readonly predictedDisplayTime: DOMHighResTimeStamp;
  
  getViewerPose(referenceSpace: XRReferenceSpace): XRViewerPose | null;
  getPose(space: XRSpace, baseSpace: XRSpace): XRPose | null;
  getJointPose?(joint: XRJointSpace, baseSpace: XRSpace): XRJointPose | null;
  getHitTestResults(hitTestSource: XRHitTestSource): XRHitTestResult[];
  getHitTestResultsForTransientInput(hitTestSource: XRTransientInputHitTestSource): XRTransientInputHitTestResult[];
}

/**
 * Represents a reference space for XR tracking
 */
interface XRReferenceSpace extends XRSpace {
  getOffsetReferenceSpace(originOffset: XRRigidTransform): XRReferenceSpace;
  onreset: ((event: Event) => void) | null;
}

/**
 * Represents the state of the XR rendering
 */
interface XRRenderState {
  readonly baseLayer?: XRWebGLLayer;
  readonly depthNear: number;
  readonly depthFar: number;
  readonly inlineVerticalFieldOfView?: number;
  readonly layers?: XRLayer[];
}

/**
 * Represents an active XR session
 */
interface XRSession extends EventTarget {
  readonly renderState: XRRenderState;
  readonly inputSources: XRInputSource[];
  readonly environmentBlendMode: "opaque" | "additive" | "alpha-blend";
  readonly visibilityState: "visible" | "hidden" | "visible-blurred";
  readonly frameRate?: number;
  readonly supportedFrameRates?: Float32Array;
  
  updateRenderState(renderStateInit?: XRRenderStateInit): Promise<void>;
  requestReferenceSpace(type: XRReferenceSpaceType): Promise<XRReferenceSpace>;
  requestAnimationFrame(callback: XRFrameRequestCallback): number;
  cancelAnimationFrame(handle: number): void;
  end(): Promise<void>;

  // Hit testing
  requestHitTestSource(options: XRHitTestOptionsInit): Promise<XRHitTestSource>;
  requestHitTestSourceForTransientInput(options: XRTransientInputHitTestOptionsInit): Promise<XRTransientInputHitTestSource>;

  // Hand tracking
  requestHandTracking?(): Promise<void>;
  
  // Event handlers
  onend: ((event: Event) => void) | null;
  onselect: ((event: XRInputSourceEvent) => void) | null;
  onselectstart: ((event: XRInputSourceEvent) => void) | null;
  onselectend: ((event: XRInputSourceEvent) => void) | null;
  onsqueeze: ((event: XRInputSourceEvent) => void) | null;
  onsqueezestart: ((event: XRInputSourceEvent) => void) | null;
  onsqueezeend: ((event: XRInputSourceEvent) => void) | null;
  onvisibilitychange: ((event: Event) => void) | null;
}

/**
 * Represents the XR system interface
 */
interface XRSystem extends EventTarget {
  isSessionSupported(mode: XRSessionMode): Promise<boolean>;
  requestSession(mode: XRSessionMode, options?: XRSessionInit): Promise<XRSession>;
  
  // Device management
  supportsSession(mode: XRSessionMode, options?: XRSessionInit): Promise<void>;
  isFeatureSupported(featureName: string): Promise<boolean>;
}

// Session modes and space types
type XRSessionMode = "inline" | "immersive-vr" | "immersive-ar";
type XRReferenceSpaceType = "viewer" | "local" | "local-floor" | "bounded-floor" | "unbounded";
type XRFrameRequestCallback = (time: DOMHighResTimeStamp, frame: XRFrame) => void;

/**
 * Options for initializing an XR session
 */
interface XRSessionInit {
  optionalFeatures?: string[];
  requiredFeatures?: string[];
  domOverlay?: { root: Element };
  depthSensing?: {
    usagePreference: ["cpu-optimized" | "gpu-optimized"];
    dataFormatPreference: ["luminance-alpha" | "float32"];
  };
}

/**
 * Options for initializing XR render state
 */
interface XRRenderStateInit {
  baseLayer?: XRWebGLLayer;
  depthNear?: number;
  depthFar?: number;
  inlineVerticalFieldOfView?: number;
  layers?: XRLayer[];
}

/**
 * Represents a WebGL layer in XR
 */
interface XRWebGLLayer {
  readonly framebuffer: WebGLFramebuffer;
  readonly framebufferWidth: number;
  readonly framebufferHeight: number;
  readonly antialias: boolean;
  readonly ignoreDepthValues: boolean;
  
  getViewport(view: XRView): XRViewport;
}

/**
 * Represents a viewport in XR
 */
interface XRViewport {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Represents an XR input source
 */
interface XRInputSource {
  readonly handedness: "none" | "left" | "right";
  readonly targetRayMode: "gaze" | "tracked-pointer" | "screen";
  readonly targetRaySpace: XRSpace;
  readonly gripSpace?: XRSpace;
  readonly profiles: string[];
  readonly gamepad?: Gamepad;
  readonly hand?: XRHand;
}

/**
 * Hand tracking interfaces
 */
interface XRHand extends Map<XRHandJoint, XRJointSpace> {
  readonly size: number;
}

type XRHandJoint =
  | "wrist"
  | "thumb-metacarpal"
  | "thumb-phalanx-proximal"
  | "thumb-phalanx-distal"
  | "thumb-tip"
  | "index-finger-metacarpal"
  | "index-finger-phalanx-proximal"
  | "index-finger-phalanx-intermediate"
  | "index-finger-phalanx-distal"
  | "index-finger-tip"
  // ... other finger joints

/**
 * Hit testing interfaces
 */
interface XRHitTestResult {
  getPose(baseSpace: XRSpace): XRPose | null;
}

interface XRTransientInputHitTestResult {
  readonly inputSource: XRInputSource;
  readonly results: XRHitTestResult[];
}

interface XRHitTestSource {
  cancel(): void;
}

interface XRTransientInputHitTestSource {
  cancel(): void;
}

/**
 * Augment the Navigator interface
 */
interface Navigator {
  xr?: XRSystem;
}

/**
 * Constructor for XRSystem
 */
declare let XRSystem: {
  prototype: XRSystem;
  new(): XRSystem;
}; 