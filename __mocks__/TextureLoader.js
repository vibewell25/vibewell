/**
 * Mock for TextureLoader from Three.js
 * Used for loading textures for 3D models and materials
 */

const TextureLoader = jest.fn().mockImplementation(() => {
  return {
    // Set path for relative URLs
    setPath: jest.fn().mockReturnThis(),
    
    // Set cross origin settings
    setCrossOrigin: jest.fn().mockReturnThis(),
    
    // Load method that returns a mock texture
    load: jest.fn().mockImplementation((url, onLoad, onProgress, onError) => {
      // Create a mock texture
      const mockTexture = {
        isTexture: true,
        uuid: `mock-texture-${Math.random().toString(36).substr(2, 9)}`,
        name: url ? url.split('/').pop() : 'mock-texture',
        image: {
          width: 64,
          height: 64,
          data: new Uint8Array(64 * 64 * 4)
        },
        mapping: 300, // UVMapping
        wrapS: 1001, // ClampToEdgeWrapping
        wrapT: 1001, // ClampToEdgeWrapping
        magFilter: 1006, // LinearFilter
        minFilter: 1008, // LinearMipmapLinearFilter
        anisotropy: 1,
        format: 1023, // RGBAFormat
        type: 1009,   // UnsignedByteType
        offset: { x: 0, y: 0 },
        repeat: { x: 1, y: 1 },
        center: { x: 0, y: 0 },
        rotation: 0,
        matrixAutoUpdate: true,
        matrix: {
          elements: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
        },
        generateMipmaps: true,
        flipY: true,
        premultiplyAlpha: false,
        needsUpdate: false,
        version: 0,
        dispose: jest.fn(),
        toJSON: jest.fn().mockReturnValue({ uuid: 'mock-texture-uuid' })
      };
      
      // Call the onLoad callback with the mock texture
      if (onLoad) {
        setTimeout(() => onLoad(mockTexture), 0);
      }
      
      return mockTexture;
    })
  };
});

module.exports = TextureLoader; 