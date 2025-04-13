// Basic Three.js mock
const mockVector3 = {
  set: jest.fn(),
  copy: jest.fn(),
  clone: jest.fn(() => ({ ...mockVector3 })),
  add: jest.fn(),
  sub: jest.fn(),
  multiply: jest.fn(),
  divide: jest.fn(),
  length: jest.fn(() => 1),
  normalize: jest.fn(),
};

const mockColor = {
  set: jest.fn(),
  copy: jest.fn(),
  clone: jest.fn(() => ({ ...mockColor })),
  r: 1, g: 1, b: 1,
};

const mockQuaternion = {
  set: jest.fn(),
  copy: jest.fn(),
  clone: jest.fn(() => ({ ...mockQuaternion })),
  setFromEuler: jest.fn(),
  setFromAxisAngle: jest.fn(),
};

const mockMatrix4 = {
  set: jest.fn(),
  copy: jest.fn(),
  clone: jest.fn(() => ({ ...mockMatrix4 })),
  identity: jest.fn(),
  makeRotationFromQuaternion: jest.fn(),
  multiply: jest.fn(),
};

const mockObject3D = {
  position: { ...mockVector3 },
  rotation: { ...mockVector3, _order: 'XYZ' },
  quaternion: { ...mockQuaternion },
  scale: { ...mockVector3, x: 1, y: 1, z: 1 },
  matrix: { ...mockMatrix4 },
  matrixWorld: { ...mockMatrix4 },
  children: [],
  parent: null,
  up: { ...mockVector3, y: 1 },
  visible: true,
  castShadow: false,
  receiveShadow: false,
  frustumCulled: true,
  renderOrder: 0,
  userData: {},
  uuid: 'mock-uuid',
  name: '',
  type: 'Object3D',
  add: jest.fn(function(child) { 
    this.children.push(child); 
    child.parent = this;
    return this;
  }),
  remove: jest.fn(function(child) {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
      child.parent = null;
    }
    return this;
  }),
  updateMatrix: jest.fn(),
  updateMatrixWorld: jest.fn(),
  updateWorldMatrix: jest.fn(),
  traverse: jest.fn(function(callback) {
    callback(this);
    this.children.forEach(child => child.traverse && child.traverse(callback));
  }),
  traverseVisible: jest.fn(),
  traverseAncestors: jest.fn(),
  lookAt: jest.fn(),
  clone: jest.fn(() => ({ ...mockObject3D })),
  copy: jest.fn(),
  getWorldPosition: jest.fn(() => ({ ...mockVector3 })),
  getWorldQuaternion: jest.fn(() => ({ ...mockQuaternion })),
  getWorldScale: jest.fn(() => ({ ...mockVector3 })),
  applyMatrix4: jest.fn(),
  raycast: jest.fn(),
};

const mockScene = {
  ...mockObject3D,
  type: 'Scene',
  background: null,
  environment: null,
  fog: null,
  overrideMaterial: null,
  autoUpdate: true,
  isScene: true,
};

const mockCamera = {
  ...mockObject3D,
  type: 'Camera',
  matrixWorldInverse: { ...mockMatrix4 },
  projectionMatrix: { ...mockMatrix4 },
  projectionMatrixInverse: { ...mockMatrix4 },
  isCamera: true,
  near: 0.1,
  far: 2000,
  zoom: 1,
  updateProjectionMatrix: jest.fn(),
  clone: jest.fn(() => ({ ...mockCamera })),
};

const mockMesh = {
  ...mockObject3D,
  type: 'Mesh',
  isMesh: true,
  geometry: {
    dispose: jest.fn(),
    attributes: { position: { count: 0 } },
    boundingSphere: { radius: 1 },
  },
  material: {
    dispose: jest.fn(),
    side: 0,
    transparent: false,
    opacity: 1,
    color: { ...mockColor },
  },
  updateMorphTargets: jest.fn(),
};

const mockRenderer = {
  domElement: document.createElement('div'),
  setSize: jest.fn(),
  setPixelRatio: jest.fn(),
  setClearColor: jest.fn(),
  render: jest.fn(),
  shadowMap: {
    enabled: false,
    type: 1,
  },
  xr: {
    enabled: false,
    setReferenceSpaceType: jest.fn(),
    getReferenceSpace: jest.fn(),
    getSession: jest.fn(),
    isPresenting: false,
  },
  outputEncoding: 3000,
  toneMapping: 0,
  toneMappingExposure: 1,
  dispose: jest.fn(),
};

const mockRaycaster = {
  ray: {
    origin: { ...mockVector3 },
    direction: { ...mockVector3 },
  },
  near: 0,
  far: Infinity,
  params: {
    Mesh: {},
    Line: {},
    LOD: {},
    Points: {},
    Sprite: {},
  },
  linePrecision: 1,
  set: jest.fn(),
  setFromCamera: jest.fn(),
  intersectObject: jest.fn(() => []),
  intersectObjects: jest.fn(() => []),
};

// Export all mocks for Three.js
module.exports = {
  // Basic structures
  Vector2: jest.fn(() => ({ x: 0, y: 0, ...mockVector3 })),
  Vector3: jest.fn(() => ({ x: 0, y: 0, z: 0, ...mockVector3 })),
  Vector4: jest.fn(() => ({ x: 0, y: 0, z: 0, w: 0 })),
  Quaternion: jest.fn(() => ({ x: 0, y: 0, z: 0, w: 1, ...mockQuaternion })),
  Matrix3: jest.fn(() => ({})),
  Matrix4: jest.fn(() => ({ ...mockMatrix4 })),
  Euler: jest.fn(() => ({ x: 0, y: 0, z: 0, order: 'XYZ' })),
  Box2: jest.fn(() => ({})),
  Box3: jest.fn(() => ({
    min: { x: -Infinity, y: -Infinity, z: -Infinity },
    max: { x: Infinity, y: Infinity, z: Infinity },
  })),
  Sphere: jest.fn(() => ({ center: { ...mockVector3 }, radius: 0 })),
  Color: jest.fn(() => ({ ...mockColor })),
  
  // Core classes
  Object3D: jest.fn(() => ({ ...mockObject3D })),
  Raycaster: jest.fn(() => ({ ...mockRaycaster })),
  Clock: jest.fn(() => ({
    startTime: 0,
    oldTime: 0,
    elapsedTime: 0,
    running: false,
    start: jest.fn(),
    stop: jest.fn(),
    getElapsedTime: jest.fn(() => 0),
    getDelta: jest.fn(() => 0),
  })),
  
  // Renderers
  WebGLRenderer: jest.fn(() => ({ ...mockRenderer })),
  WebGL1Renderer: jest.fn(() => ({ ...mockRenderer })),
  
  // Cameras
  Camera: jest.fn(() => ({ ...mockCamera })),
  PerspectiveCamera: jest.fn(() => ({ 
    ...mockCamera,
    fov: 50,
    aspect: 1,
    isPerspectiveCamera: true,
  })),
  OrthographicCamera: jest.fn(() => ({ 
    ...mockCamera,
    left: -1, right: 1, top: 1, bottom: -1,
    isOrthographicCamera: true,
  })),
  
  // Scene
  Scene: jest.fn(() => ({ ...mockScene })),
  Group: jest.fn(() => ({ ...mockObject3D, isGroup: true })),
  
  // Objects
  Mesh: jest.fn(() => ({ ...mockMesh })),
  InstancedMesh: jest.fn(() => ({ ...mockMesh, isInstancedMesh: true, count: 0 })),
  Line: jest.fn(() => ({ ...mockObject3D, isLine: true })),
  LineSegments: jest.fn(() => ({ ...mockObject3D, isLineSegments: true })),
  Points: jest.fn(() => ({ ...mockObject3D, isPoints: true })),
  Sprite: jest.fn(() => ({ ...mockObject3D, isSprite: true })),
  SkinnedMesh: jest.fn(() => ({ ...mockMesh, isSkinnedMesh: true })),
  
  // Materials
  Material: jest.fn(() => ({ dispose: jest.fn() })),
  MeshBasicMaterial: jest.fn(() => ({ 
    color: { ...mockColor },
    map: null,
    isMeshBasicMaterial: true,
    dispose: jest.fn(),
  })),
  MeshStandardMaterial: jest.fn(() => ({
    color: { ...mockColor },
    roughness: 1,
    metalness: 0,
    map: null,
    isMeshStandardMaterial: true,
    dispose: jest.fn(),
  })),
  LineBasicMaterial: jest.fn(() => ({ 
    color: { ...mockColor },
    isLineBasicMaterial: true,
    dispose: jest.fn(),
  })),
  
  // Geometries
  BufferGeometry: jest.fn(() => ({
    attributes: {},
    index: null,
    dispose: jest.fn(),
    isBufferGeometry: true,
  })),
  BoxGeometry: jest.fn(() => ({
    attributes: { position: { count: 24 } },
    dispose: jest.fn(),
    isBufferGeometry: true,
  })),
  SphereGeometry: jest.fn(() => ({
    attributes: { position: { count: 32 } },
    dispose: jest.fn(),
    isBufferGeometry: true,
  })),
  PlaneGeometry: jest.fn(() => ({
    attributes: { position: { count: 4 } },
    dispose: jest.fn(),
    isBufferGeometry: true,
  })),
  
  // Lights
  AmbientLight: jest.fn(() => ({ 
    ...mockObject3D,
    isAmbientLight: true,
    color: { ...mockColor },
    intensity: 1,
  })),
  DirectionalLight: jest.fn(() => ({ 
    ...mockObject3D,
    isDirectionalLight: true,
    color: { ...mockColor },
    intensity: 1,
    target: { ...mockObject3D },
  })),
  PointLight: jest.fn(() => ({ 
    ...mockObject3D,
    isPointLight: true,
    color: { ...mockColor },
    intensity: 1,
    distance: 0,
    decay: 2,
  })),
  
  // Textures
  Texture: jest.fn(() => ({
    image: {},
    dispose: jest.fn(),
    isTexture: true,
  })),
  
  // Constants
  LinearEncoding: 3000,
  sRGBEncoding: 3001,
  BasicShadowMap: 0,
  PCFShadowMap: 1,
  PCFSoftShadowMap: 2,
  FrontSide: 0,
  BackSide: 1,
  DoubleSide: 2,
  
  // Animation
  AnimationMixer: jest.fn(() => ({
    time: 0,
    timeScale: 1,
    update: jest.fn(),
    clipAction: jest.fn(() => ({
      play: jest.fn(),
      stop: jest.fn(),
      reset: jest.fn(),
      setLoop: jest.fn(),
      setEffectiveTimeScale: jest.fn(),
      setDuration: jest.fn(),
    })),
  })),
  
  // Loaders
  TextureLoader: jest.fn(() => ({
    load: jest.fn((url, onLoad) => {
      const texture = { url, isTexture: true, dispose: jest.fn() };
      if (onLoad) onLoad(texture);
      return texture;
    }),
  })),
};
