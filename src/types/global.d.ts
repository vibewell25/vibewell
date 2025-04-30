import { PrismaClient } from '@prisma/client';

/**
 * Base interface for all XR spaces
 */
interface XRSpace extends EventTarget {
  // Base interface for all spaces in WebXR
  readonly boundsGeometry?: DOMPointReadOnly[];
  readonly isStationary: boolean;
}

/**
 * Joint space for hand tracking
 */
interface XRJointSpace extends XRSpace {
  readonly jointName: XRHandJoint;
}

/**
 * Pose information for XR tracking
 */
interface XRPose {
  readonly emulatedPosition: boolean;
  readonly transform: XRRigidTransform;
}

/**
 * Extended pose information for joints
 */
interface XRJointPose extends XRPose {
  readonly radius: number;
}

// Ensure TypeScript knows about these interfaces globally
declare global {
  interface Window {
    OffscreenCanvas: typeof OffscreenCanvas;
    isSecureContext: boolean;
    XRSystem: typeof XRSystem;
  }

  interface WorkerGlobalScope {
    OffscreenCanvas: typeof OffscreenCanvas;
  }

  interface HTMLCanvasElement {
    transferControlToOffscreen(): OffscreenCanvas;
  }
}

// UUID module declaration
declare module 'uuid' {
  export function v4(): string;
}

declare module '*.glb' {
  const content: string;
  export default content;
}

declare module '*.gltf' {
  const content: string;
  export default content;
}

declare module '*.obj' {
  const content: string;
  export default content;
}

declare module '*.mtl' {
  const content: string;
  export default content;
}

declare module '*.fbx' {
  const content: string;
  export default content;
}

declare module '*.hdr' {
  const content: string;
  export default content;
}

declare module '*.webm' {
  const content: string;
  export default content;
}

declare module '*.mp4' {
  const content: string;
  export default content;
}

// WebXR types
interface XRSystem {
  isSessionSupported(mode: string): Promise<boolean>;
  requestSession(mode: string, options?: XRSessionInit): Promise<XRSession>;
}

interface XRSessionInit {
  requiredFeatures?: string[];
  optionalFeatures?: string[];
}

interface XRSession extends EventTarget {
  requestReferenceSpace(type: string): Promise<XRReferenceSpace>;
  requestAnimationFrame(callback: XRFrameRequestCallback): number;
  end(): Promise<void>;
}

interface XRFrame {
  session: XRSession;
  getViewerPose(referenceSpace: XRReferenceSpace): XRViewerPose | null;
}

interface XRReferenceSpace extends EventTarget {
  getOffsetReferenceSpace(originOffset: XRRigidTransform): XRReferenceSpace;
}

interface XRViewerPose {
  transform: XRRigidTransform;
  views: XRView[];
}

interface XRView {
  projectionMatrix: Float32Array;
  transform: XRRigidTransform;
}

interface XRRigidTransform {
  position: DOMPointReadOnly;
  orientation: DOMPointReadOnly;
  matrix: Float32Array;
}

type XRFrameRequestCallback = (time: DOMHighResTimeStamp, frame: XRFrame) => void;

// Extend Window interface
interface Window {
  xr?: XRSystem;
}
