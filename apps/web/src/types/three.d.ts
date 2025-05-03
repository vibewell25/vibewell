declare module 'three' {
  export class Vector2 {
    constructor(x?: number, y?: number);
    x: number;
    y: number;
    set(x: number, y: number): this;
    copy(v: Vector2): this;
  }

  export class Vector3 {
    constructor(x?: number, y?: number, z?: number);
    x: number;
    y: number;
    z: number;
    set(x: number, y: number, z: number): this;
    copy(v: Vector3): this;
    add(v: Vector3): this;
    sub(v: Vector3): this;
    multiply(v: Vector3): this;
    divide(v: Vector3): this;
    normalize(): this;
  }

  export class Euler {
    constructor(x?: number, y?: number, z?: number, order?: string);
    x: number;
    y: number;
    z: number;
    order: string;
    set(x: number, y: number, z: number, order?: string): this;
  }

  export class Quaternion {
    constructor(x?: number, y?: number, z?: number, w?: number);
    x: number;
    y: number;
    z: number;
    w: number;
    set(x: number, y: number, z: number, w: number): this;
    setFromEuler(euler: Euler): this;
  }

  export class Matrix4 {
    constructor();
    elements: number[];
    set(...elements: number[]): this;
    identity(): this;
    copy(m: Matrix4): this;
    makeRotationFromQuaternion(q: Quaternion): this;
    lookAt(eye: Vector3, target: Vector3, up: Vector3): this;
  }

  export class Object3D {
    constructor();
    position: Vector3;
    rotation: Euler;
    quaternion: Quaternion;
    scale: Vector3;
    matrix: Matrix4;
    matrixWorld: Matrix4;
    children: Object3D[];
    parent: Object3D | null;
    visible: boolean;
    add(...objects: Object3D[]): this;
    remove(...objects: Object3D[]): this;
    updateMatrix(): void;
    updateMatrixWorld(force?: boolean): void;
  }

  export class Scene extends Object3D {
    constructor();
    background: Color | Texture | null;
    environment: Texture | null;
  }

  export class Camera extends Object3D {
    constructor();
    matrixWorldInverse: Matrix4;
    projectionMatrix: Matrix4;
    projectionMatrixInverse: Matrix4;
  }

  export class PerspectiveCamera extends Camera {
    constructor(fov?: number, aspect?: number, near?: number, far?: number);
    fov: number;
    aspect: number;
    near: number;
    far: number;
    updateProjectionMatrix(): void;
  }

  export class WebGLRenderer {
    constructor(parameters?: WebGLRendererParameters);
    domElement: HTMLCanvasElement;
    setSize(width: number, height: number, updateStyle?: boolean): void;
    setPixelRatio(value: number): void;
    render(scene: Scene, camera: Camera): void;
    dispose(): void;
  }

  export interface WebGLRendererParameters {
    canvas?: HTMLCanvasElement;
    context?: WebGLRenderingContext;
    precision?: string;
    alpha?: boolean;
    premultipliedAlpha?: boolean;
    antialias?: boolean;
    stencil?: boolean;
    preserveDrawingBuffer?: boolean;
    powerPreference?: string;
  }

  export class Color {
    constructor(r?: number | string, g?: number, b?: number);
    r: number;
    g: number;
    b: number;
    set(color: Color | string | number): this;
    setRGB(r: number, g: number, b: number): this;
  }

  export class Texture {
    constructor(
      image?: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
      mapping?: number,
      wrapS?: number,
      wrapT?: number,
      magFilter?: number,
      minFilter?: number,
      format?: number,
      type?: number,
      anisotropy?: number
    );
    image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;
    needsUpdate: boolean;
  }

  export class Light extends Object3D {
    constructor(color?: number | string, intensity?: number);
    color: Color;
    intensity: number;
  }

  export class DirectionalLight extends Light {
    constructor(color?: number | string, intensity?: number);
    target: Object3D;
    shadow: DirectionalLightShadow;
  }

  export class DirectionalLightShadow {
    constructor();
    camera: OrthographicCamera;
    bias: number;
    normalBias: number;
    radius: number;
    mapSize: Vector2;
  }

  export class OrthographicCamera extends Camera {
    constructor(
      left?: number,
      right?: number,
      top?: number,
      bottom?: number,
      near?: number,
      far?: number
    );
    left: number;
    right: number;
    top: number;
    bottom: number;
    near: number;
    far: number;
    zoom: number;
    updateProjectionMatrix(): void;
  }
} 