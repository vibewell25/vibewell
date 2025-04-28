# 3D Mock Files for Testing

This document provides an overview of the mock files created for testing Three.js and React Three Fiber components in the Vibewell project.

## Core Three.js Mocks

- **`__mocks__/three.js`**: Main mock for Three.js library
  - Contains mock implementations for core Three.js classes (Vector3, Object3D, Scene, etc.)
  - Includes PMREMGenerator for environment mapping
  - Provides basic texture loading functionality

## Loader Mocks

- **`__mocks__/GLTFLoader.js`**: Mock for loading 3D models in GLTF format
  - Simulates loading a GLTF scene with meshes and materials
  - Supports scene traversal and callbacks

- **`__mocks__/TextureLoader.js`**: Mock for loading image textures
  - Simulates loading image textures with appropriate properties
  - Handles various image formats

- **`__mocks__/RGBELoader.js`**: Mock for loading HDR environment maps
  - Used for loading RGBE format high dynamic range images
  - Creates mock HDR textures with appropriate settings

- **`__mocks__/EXRLoader.js`**: Mock for loading EXR format HDR images
  - Similar to RGBELoader but for OpenEXR format
  - Returns mock HDR textures with float data type

- **`__mocks__/KTX2Loader.js`**: Mock for loading KTX2 format textures
  - Supports compressed textures used in 3D models
  - Includes mipmaps and compressed texture properties

- **`__mocks__/HDRCubeTextureLoader.js`**: Mock for loading HDR cubemaps
  - Creates a six-sided cube texture for environment reflections
  - Supports HDR format for realistic lighting

## React Three Fiber Mocks

- **`__mocks__/@react-three/fiber.js`**: Mock for React Three Fiber library
  - Provides Canvas component and hooks (useThree, useFrame, etc.)
  - Simulates the Three.js rendering context

- **`__mocks__/@react-three/drei.js`**: Mock for Drei utility library
  - Includes controls, helpers, and utility components
  - Environment component for simulating environment maps
  - Enhanced useTexture hook for testing texture loading

## Usage in Tests

When testing components that use Three.js or React Three Fiber, these mocks will automatically be used by Jest instead of the actual libraries. This allows for testing 3D components without requiring WebGL rendering or loading actual 3D assets.

Example test:

```jsx
import { render } from '@testing-library/react';
import ARViewer from '../src/components/ARViewer';

test('AR viewer renders without crashing', () => {
  const { getByTestId } = render(<ARViewer modelPath="test.glb" />);
  expect(getByTestId('r3f-canvas')).toBeInTheDocument();
});
```

## Notes for Maintenance

- Update these mocks when new Three.js features are used in the application
- If performance issues arise in tests, consider simplifying the mock implementations
- For components that rely on specific Three.js behavior, you may need to enhance the relevant mock 