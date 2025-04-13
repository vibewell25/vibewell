// Mock Three.js library for testing
class MockScene {
  constructor() {
    this.children = [];
    this.background = null;
    this.add = jest.fn((object) => {
      this.children.push(object);
    });
    this.remove = jest.fn((object) => {
      const index = this.children.indexOf(object);
      if (index !== -1) {
        this.children.splice(index, 1);
      }
    });
  }
}

class MockColor {
  constructor() {
    this.r = 1;
    this.g = 1;
    this.b = 1;
  }
}

class MockPerspectiveCamera {
  constructor() {
    this.position = { x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.fov = 75;
    this.aspect = 1;
    this.near = 0.1;
    this.far = 1000;
  }
}

class MockWebGLRenderer {
  constructor() {
    this.domElement = document.createElement('canvas');
    this.shadowMap = { enabled: true };
    this.setSize = jest.fn();
    this.setPixelRatio = jest.fn();
    this.render = jest.fn();
    this.setClearColor = jest.fn();
  }
}

class MockAmbientLight {
  constructor() {
    this.intensity = 1;
  }
}

class MockDirectionalLight {
  constructor() {
    this.position = { x: 0, y: 0, z: 0 };
    this.intensity = 1;
    this.castShadow = false;
  }
}

class MockVector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  
  set = jest.fn();
  normalize = jest.fn(() => this);
  copy = jest.fn(() => this);
  applyQuaternion = jest.fn(() => this);
  add = jest.fn(() => this);
  sub = jest.fn(() => this);
  multiplyScalar = jest.fn(() => this);
  clone = jest.fn(() => new MockVector3(this.x, this.y, this.z));
}

class MockQuaternion {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.w = 1;
  }
  
  setFromEuler = jest.fn(() => this);
  setFromAxisAngle = jest.fn(() => this);
  multiply = jest.fn(() => this);
  clone = jest.fn(() => new MockQuaternion());
}

class MockGroup {
  constructor() {
    this.children = [];
    this.position = new MockVector3();
    this.rotation = new MockVector3();
    this.scale = new MockVector3(1, 1, 1);
    this.add = jest.fn((object) => {
      this.children.push(object);
    });
    this.remove = jest.fn((object) => {
      const index = this.children.indexOf(object);
      if (index !== -1) {
        this.children.splice(index, 1);
      }
    });
  }
}

const THREE = {
  Scene: MockScene,
  Color: MockColor,
  PerspectiveCamera: MockPerspectiveCamera,
  WebGLRenderer: MockWebGLRenderer,
  AmbientLight: MockAmbientLight,
  DirectionalLight: MockDirectionalLight,
  Vector3: MockVector3,
  Quaternion: MockQuaternion,
  Group: MockGroup,
  Box3: jest.fn(),
  Sphere: jest.fn(),
  Mesh: jest.fn(() => ({
    position: new MockVector3(),
    rotation: new MockVector3(),
    scale: new MockVector3(1, 1, 1),
    material: {},
    geometry: {},
  })),
  SphereGeometry: jest.fn(),
  BoxGeometry: jest.fn(),
  MeshStandardMaterial: jest.fn(),
  TextureLoader: jest.fn(() => ({
    load: jest.fn(),
  })),
  PMREMGenerator: jest.fn(() => ({
    compile: jest.fn(),
    dispose: jest.fn(),
  })),
  LoadingManager: jest.fn(() => ({
    onProgress: null,
    onLoad: null,
    onError: null,
  })),
  EventDispatcher: jest.fn(),
  Raycaster: jest.fn(() => ({
    set: jest.fn(),
    intersectObjects: jest.fn(() => []),
  })),
};

module.exports = THREE;
