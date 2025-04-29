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
