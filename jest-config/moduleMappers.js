module.exports = {
  // Three.js mocks

    'three/examples/jsm/loaders/GLTFLoader': '<rootDir>/__mocks__/GLTFLoader.js',

    'three/examples/jsm/loaders/DRACOLoader': '<rootDir>/__mocks__/DRACOLoader.js',

    'three': '<rootDir>/__mocks__/three.js',
  
  // Style and asset mocks

    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',

    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
  
  // Module aliases
  '^@/(.*)$': '<rootDir>/src/$1'
