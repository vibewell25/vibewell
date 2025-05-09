class SVGLoader {
constructor() {
    this.defaultPath = '';
    this.path = '';
    this.setPath = jest.fn((path) => {
      this.path = path;
      return this;
this.load = jest.fn((url, onLoad, onProgress, onError) => {
      // Create mock SVG data
      const mockPaths = [
        {
          color: { r: 0, g: 0, b: 0 },
          userData: { style: { fill: '#000000' } },
          subPaths: [
            {
              currentPath: {
                curves: [],
                autoClose: true
]
];

      // Call the onLoad callback with mock paths
      if (onLoad) {
        setTimeout(() => {
          onLoad({
            paths: mockPaths,
xml: document.createElementNS('http://www.w3.org/2000/svg', 'svg')
0);
return mockPaths;
parse(text) {
    // Mock parse method returning some basic SVG paths
    return {
      paths: [
        {
          color: { r: 0, g: 0, b: 0 },
          userData: { style: { fill: '#000000' } },
          subPaths: [
            {
              currentPath: {
                curves: [],
                autoClose: true
]
],
xml: document.createElementNS('http://www.w3.org/2000/svg', 'svg')
static createShapes(paths) {
    // Mock static method for creating shapes from paths
    return [
      {
        type: 'Shape',
uuid: 'mock-shape-uuid',
        curves: [],
        holes: [],
        autoClose: true
];
// Export both the class and a static property for Three.js compatibility
module.exports = { 
  SVGLoader: SVGLoader,
  SVGLoader: SVGLoader // Export twice to match Three.js export pattern
