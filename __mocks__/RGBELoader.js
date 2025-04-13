/**
 * Mock for RGBELoader from Three.js
 * Used for loading HDR/RGBE format environment maps
 */

const RGBELoader = jest.fn().mockImplementation(() => {
  return {
    // Set path for relative URLs
    setPath: jest.fn().mockReturnThis(),
    
    // Set data type (float, half float)
    setDataType: jest.fn().mockReturnThis(),
    
    // Set cross origin settings
    setCrossOrigin: jest.fn().mockReturnThis(),
    
    // Set response type
    setRequestHeader: jest.fn().mockReturnThis(),
    
    // Mock the load method
    load: jest.fn().mockImplementation((url, onLoad, onProgress, onError) => {
      // Create a mock texture for HDR environment maps
      const mockTexture = {
        isTexture: true,
        image: {
          data: new Float32Array(16), // Minimal data array
          width: 2,
          height: 2
        },
        format: 1023, // RGBEFormat
        type: 1015,   // HalfFloatType
        mapping: 303, // EquirectangularReflectionMapping
        minFilter: 1006, // LinearFilter
        magFilter: 1006, // LinearFilter
        flipY: true,
        generateMipmaps: false,
        needsUpdate: true,
        dispose: jest.fn(),
        toJSON: jest.fn().mockReturnValue({ uuid: 'mock-rgbe-texture-uuid' })
      };
      
      // Call the onLoad callback with the mock texture
      if (onLoad) {
        setTimeout(() => onLoad(mockTexture), 0);
      }
      
      return mockTexture;
    })
  };
});

module.exports = RGBELoader;