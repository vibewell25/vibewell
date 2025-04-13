// Mock for GLTFLoader
class GLTFLoader {
  constructor() {
    this.load = jest.fn((url, onLoad) => {
      // Simulate successful loading with a basic result
      if (onLoad) {
        setTimeout(() => {
          onLoad({
            scene: {
              traverse: jest.fn(),
              children: [],
              animations: [],
            },
            scenes: [],
            animations: [],
            asset: { version: '2.0' },
          });
        }, 0);
      }
    });
    this.setDRACOLoader = jest.fn().mockReturnThis();
    this.setMeshoptDecoder = jest.fn().mockReturnThis();
    this.setCrossOrigin = jest.fn().mockReturnThis();
    this.setWithCredentials = jest.fn().mockReturnThis();
  }
}

module.exports = { GLTFLoader };
