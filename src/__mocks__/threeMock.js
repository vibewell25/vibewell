const THREE = {
  Group: jest.fn(() => ({
    add: jest.fn(),
    remove: jest.fn(),
    children: [],
    position: { set: jest.fn() },
    rotation: { set: jest.fn() },
    scale: { set: jest.fn() },
  })),
  Points: jest.fn(() => ({
    geometry: {
      attributes: {
        position: {
          needsUpdate: false,
        },
      },
    },
  })),
  BufferGeometry: jest.fn(),
  Float32BufferAttribute: jest.fn(),
  PointsMaterial: jest.fn(),
  Vector2: jest.fn(() => ({ x: 0, y: 0 })),
  Vector3: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
  Color: jest.fn(),
  Scene: jest.fn(),
  PerspectiveCamera: jest.fn(),
  WebGLRenderer: jest.fn(() => ({
    setSize: jest.fn(),
    render: jest.fn(),
    dispose: jest.fn(),
  })),
  Clock: jest.fn(() => ({
    getElapsedTime: jest.fn(() => 0),
  })),
};

module.exports = THREE;
