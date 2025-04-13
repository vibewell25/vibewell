// Mock for GLTFLoader from Three.js
class GLTFLoader {
  constructor() {
    this.setDRACOLoader = jest.fn(() => this);
    this.setPath = jest.fn(() => this);
    this.setResourcePath = jest.fn(() => this);
    this.setCrossOrigin = jest.fn(() => this);
  }

  load(url, onLoad, onProgress, onError) {
    // Simulate successful loading of a GLTF model
    const mockScene = {
      visible: true,
      userData: {},
      traverse: (callback) => {
        // Create a mock mesh to traverse
        const mockMesh = {
          isMesh: true,
          isSkinnedMesh: false,
          visible: true,
          material: { transparent: false, opacity: 1 },
          geometry: { dispose: jest.fn() },
          userData: {}
        };
        callback(mockScene);
        callback(mockMesh);
      }
    };

    // Call the onLoad callback with a mock GLTF object
    setTimeout(() => {
      onLoad({
        scene: mockScene,
        scenes: [mockScene],
        animations: [],
        parser: { getDependencies: jest.fn() }
      });
    }, 0);

    return { scene: mockScene };
  }
}

module.exports = { GLTFLoader };
