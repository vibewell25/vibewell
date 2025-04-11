/**
 * Mock implementation of Three.js GLTFLoader
 */
class GLTFLoader {
  constructor() {
    this.setDRACOLoader = jest.fn().mockReturnThis();
    this.setCrossOrigin = jest.fn().mockReturnThis();
    this.setWithCredentials = jest.fn().mockReturnThis();
    this.setPath = jest.fn().mockReturnThis();
    this.setResourcePath = jest.fn().mockReturnThis();
    this.setRequestHeader = jest.fn().mockReturnThis();
  }

  load(url, onLoad, onProgress, onError) {
    // Create a mock GLTF object
    const mockGLTF = {
      scene: {
        traverse: jest.fn(),
        userData: {},
        children: [],
        animations: [],
        clone: jest.fn().mockImplementation(() => ({
          traverse: jest.fn(),
          userData: {},
          children: [],
          animations: [],
          position: { set: jest.fn() },
          rotation: { set: jest.fn() },
          scale: { set: jest.fn() },
        })),
      },
      animations: [],
      scenes: [],
      cameras: [],
      asset: {},
      parser: {},
      userData: {},
    };

    // Call the onLoad callback with our mock object
    if (onLoad) {
      setTimeout(() => onLoad(mockGLTF), 0);
    }

    return mockGLTF;
  }

  parse(data, path, onLoad, onError) {
    // Create a mock GLTF object
    const mockGLTF = {
      scene: {
        traverse: jest.fn(),
        userData: {},
        children: [],
        animations: [],
      },
      animations: [],
      scenes: [],
      cameras: [],
      asset: {},
      parser: {},
      userData: {},
    };

    // Call the onLoad callback with our mock object
    if (onLoad) {
      setTimeout(() => onLoad(mockGLTF), 0);
    }

    return mockGLTF;
  }
}

module.exports = { GLTFLoader }; 