const HDRCubeTextureLoader = jest.fn().mockImplementation(() => {
  return {
    // Property to store the current resource path
    path: '',
    
    // Method to set the resource path for relative URLs
    setPath: jest.fn().mockImplementation(function(path) {
      this.path = path;
      return this;
),
// Method to set the cross-origin attribute
    setCrossOrigin: jest.fn().mockReturnThis(),
    
    // Method to set data type
    setDataType: jest.fn().mockReturnThis(),
    
    // Mock the load method
    load: jest.fn().mockImplementation((urls, onLoad, onProgress, onError) => {
      // Create a mock cube texture
      const mockCubeTexture = {
        isCubeTexture: true,
uuid: `mock-hdr-cube-texture-${Math.random().toString(36).substr(2, 9)}`,
        images: [
          { data: new Float32Array(16 * 16 * 4) }, // px
          { data: new Float32Array(16 * 16 * 4) }, // nx
          { data: new Float32Array(16 * 16 * 4) }, // py
          { data: new Float32Array(16 * 16 * 4) }, // ny
          { data: new Float32Array(16 * 16 * 4) }, // pz
          { data: new Float32Array(16 * 16 * 4) }  // nz
        ],
        mapping: 301, // CubeReflectionMapping
        wrapS: 1001, // ClampToEdgeWrapping
        wrapT: 1001, // ClampToEdgeWrapping
        magFilter: 1006, // LinearFilter
        minFilter: 1006, // LinearFilter (no mipmaps for HDR)
        format: 1023, // RGBAFormat
        type: 1015,   // FloatType
        encoding: 3001, // sRGBEncoding
        generateMipmaps: false,
        flipY: false,
        needsUpdate: true,
        dispose: jest.fn()
// Call the onLoad callback with the mock texture
      if (onLoad) {
        setTimeout(() => onLoad(mockCubeTexture), 0);
return mockCubeTexture;
)
module.exports = HDRCubeTextureLoader; 