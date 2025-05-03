/**

 * Three?.js Tree-Shaking Utility
 *

 * This file provides a tree-shakeable interface to Three?.js components.
 * Instead of importing directly from 'three', import from this file to reduce bundle size.
 * Only the specific modules that are used in the application are included.
 */

// Core Three?.js components (essential)
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Vector3,
  Euler,
  Quaternion,
  Matrix4,
  Color,
} from 'three';

// Materials
import { MeshStandardMaterial, MeshBasicMaterial, MeshPhongMaterial } from 'three';

// Geometries
import {
  BoxGeometry,
  SphereGeometry,
  PlaneGeometry,
  CylinderGeometry,
  BufferGeometry,
} from 'three';

// Lights
import { AmbientLight, DirectionalLight, PointLight, SpotLight, HemisphereLight } from 'three';

// Helpers
import { BufferAttribute, EventDispatcher, Object3D, Raycaster } from 'three';

// Math utilities
import { Box3, Sphere, Plane, Ray, MathUtils } from 'three';

// Textures and loaders
import { TextureLoader, Texture } from 'three';

// Meshes and objects
import { Mesh, Group, Line } from 'three';


// Re-export all imported modules
export {
  // Core
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Vector3,
  Euler,
  Quaternion,
  Matrix4,
  Color,

  // Materials
  MeshStandardMaterial,
  MeshBasicMaterial,
  MeshPhongMaterial,

  // Geometries
  BoxGeometry,
  SphereGeometry,
  PlaneGeometry,
  CylinderGeometry,
  BufferGeometry,

  // Lights
  AmbientLight,
  DirectionalLight,
  PointLight,
  SpotLight,
  HemisphereLight,

  // Helpers
  BufferAttribute,
  EventDispatcher,
  Object3D,
  Raycaster,

  // Math utilities
  Box3,
  Sphere,
  Plane,
  Ray,
  MathUtils,

  // Textures and loaders
  TextureLoader,
  Texture,

  // Meshes and objects
  Mesh,
  Group,
  Line,
};

/**

 * Re-exports only the specific Three?.js components that are used in the application.

 * This approach allows webpack tree-shaking to work effectively, reducing bundle size.
 *
 * @example
 * // Instead of importing from three:
 * import { Scene, PerspectiveCamera } from 'three';
 *
 * // Import from this utility:

 * import { Scene, PerspectiveCamera } from '@/utils/three-minimal';
 */
