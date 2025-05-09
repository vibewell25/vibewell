const FBXLoader = vi.fn().mockImplementation(() => {
  return {
    load: vi.fn().mockImplementation((url, onLoad, onProgress, onError) => {
      // Create a mock FBX scene with basic structure
const mockObject = new Object3D();
      mockObject.name = 'MockFBXModel';
      
      // Add some mock meshes to the scene
      const mockMesh1 = new Mesh(
        new BoxGeometry(1, 1, 1),
        new MeshBasicMaterial({ color: 0xcccccc })
mockMesh1.name = 'MockMesh1';
      
      const mockMesh2 = new Mesh(
        new BoxGeometry(0.5, 0.5, 0.5),
        new MeshBasicMaterial({ color: 0x999999 })
mockMesh2.name = 'MockMesh2';
      
      mockObject.add(mockMesh1);
      mockObject.add(mockMesh2);
      
      // Mock animations property
      mockObject.animations = [
        {
          name: 'Animation1',
          duration: 1.0,
          tracks: [],
uuid: 'mock-animation-1'
{
          name: 'Animation2',
          duration: 2.0,
          tracks: [],
uuid: 'mock-animation-2'
];
      
      // Call onLoad with the mock object
      if (onLoad) {
        setTimeout(() => onLoad(mockObject), 0);
// Return something for chaining
      return {
        url,
        loader: this
),
    setPath: vi.fn().mockReturnThis(),
    setResourcePath: vi.fn().mockReturnThis(),
    setCrossOrigin: vi.fn().mockReturnThis()
export default FBXLoader; 