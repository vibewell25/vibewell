# Vibewell AR Testing Guide

## Table of Contents
1. [Overview](#overview)
2. [Test Environment Setup](#test-environment-setup)
3. [Unit Testing AR Components](#unit-testing-ar-components)
4. [Integration Testing](#integration-testing)
5. [User Interaction Testing](#user-interaction-testing)
6. [Model Testing](#model-testing)
7. [Camera and Tracking](#camera-and-tracking)
8. [Best Practices](#best-practices)

## Overview

This guide covers testing strategies for AR features in the Vibewell application, focusing on:
- AR model rendering and interactions
- Camera and tracking functionality
- User gestures and controls
- Performance and resource usage
- Cross-device compatibility

### Key Testing Areas
- Model loading and rendering
- Tracking stability
- User interactions
- Performance metrics
- Error handling
- Device compatibility

## Test Environment Setup

### Required Dependencies
```bash
# Install AR testing dependencies
npm install -D @react-three/test-renderer
npm install -D @testing-library/react-three
npm install -D jest-webgl-canvas-mock
npm install -D @react-three/drei

# Install device simulation tools
npm install -D @testing-library/user-event
npm install -D mock-mediadevices
```

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(glb|gltf)$': '<rootDir>/__mocks__/modelMock.js',
    '^@/components/(.*)$': '<rootDir>/components/$1'
  },
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest'
  }
};
```

### Mock Setup
```typescript
// __mocks__/modelMock.js
module.exports = 'model-test-path';

// __mocks__/WebGLMock.js
import 'jest-webgl-canvas-mock';

// jest.setup.js
import '@testing-library/jest-dom';
import 'jest-webgl-canvas-mock';
import { mockMediaDevices } from 'mock-mediadevices';

global.MediaDevices = mockMediaDevices;
```

## Unit Testing AR Components

### Testing Model Loading
```typescript
import { render, act } from '@react-three/test-renderer';
import { ARModel } from '@/components/ARModel';

describe('ARModel', () => {
  it('loads model successfully', async () => {
    const { scene } = render(<ARModel modelPath="/models/hairstyle.glb" />);
    
    await act(async () => {
      // Wait for model to load
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    const model = scene.getObjectByName('hairstyle');
    expect(model).toBeTruthy();
  });

  it('handles loading errors gracefully', async () => {
    const onError = jest.fn();
    render(<ARModel modelPath="/invalid.glb" onError={onError} />);
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(onError).toHaveBeenCalled();
  });
});
```

### Testing AR Scene Setup
```typescript
import { render } from '@react-three/test-renderer';
import { ARScene } from '@/components/ARScene';

describe('ARScene', () => {
  it('initializes with correct settings', () => {
    const { scene } = render(
      <ARScene
        cameraPosition={[0, 1.5, 5]}
        lightIntensity={1}
      />
    );
    
    const camera = scene.getObjectByName('camera');
    expect(camera.position.y).toBe(1.5);
    
    const light = scene.getObjectByName('main-light');
    expect(light.intensity).toBe(1);
  });
});
```

## Integration Testing

### Testing AR Flow
```typescript
import { render, fireEvent, waitFor } from '@testing-library/react';
import { ARExperience } from '@/components/ARExperience';

describe('AR Experience Flow', () => {
  it('completes full AR flow', async () => {
    const { getByTestId } = render(<ARExperience />);
    
    // Start AR session
    fireEvent.click(getByTestId('start-ar'));
    await waitFor(() => {
      expect(getByTestId('ar-scene')).toBeInTheDocument();
    });
    
    // Load model
    fireEvent.click(getByTestId('load-model'));
    await waitFor(() => {
      expect(getByTestId('model-loaded')).toBeInTheDocument();
    });
    
    // Apply hairstyle
    fireEvent.click(getByTestId('apply-style'));
    await waitFor(() => {
      expect(getByTestId('style-applied')).toBeInTheDocument();
    });
  });
});
```

### Testing Camera Integration
```typescript
import { render, act } from '@testing-library/react';
import { ARCamera } from '@/components/ARCamera';

describe('AR Camera', () => {
  beforeEach(() => {
    // Mock camera permissions
    mockMediaDevices.getUserMedia.mockResolvedValue({
      getTracks: () => [{
        kind: 'video',
        enabled: true
      }]
    });
  });

  it('initializes camera stream', async () => {
    const onStreamReady = jest.fn();
    render(<ARCamera onStreamReady={onStreamReady} />);
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(onStreamReady).toHaveBeenCalled();
    expect(mockMediaDevices.getUserMedia).toHaveBeenCalledWith({
      video: { facingMode: 'user' }
    });
  });
});
```

## User Interaction Testing

### Testing Gestures
```typescript
import { fireEvent } from '@testing-library/react';
import { ARControls } from '@/components/ARControls';

describe('AR Controls', () => {
  it('handles pinch-to-zoom', async () => {
    const onZoom = jest.fn();
    const { getByTestId } = render(
      <ARControls onZoom={onZoom} />
    );
    
    const element = getByTestId('ar-control-area');
    
    // Simulate pinch gesture
    fireEvent.touchStart(element, {
      touches: [
        { clientX: 0, clientY: 0 },
        { clientX: 10, clientY: 0 }
      ]
    });
    
    fireEvent.touchMove(element, {
      touches: [
        { clientX: 0, clientY: 0 },
        { clientX: 50, clientY: 0 }
      ]
    });
    
    expect(onZoom).toHaveBeenCalledWith(expect.any(Number));
  });
});
```

### Testing Model Interactions
```typescript
import { render, fireEvent } from '@testing-library/react';
import { ModelControls } from '@/components/ModelControls';

describe('Model Controls', () => {
  it('handles model rotation', () => {
    const onRotate = jest.fn();
    const { getByTestId } = render(
      <ModelControls onRotate={onRotate} />
    );
    
    const control = getByTestId('rotation-control');
    fireEvent.mouseDown(control);
    fireEvent.mouseMove(control, {
      clientX: 100,
      clientY: 100
    });
    
    expect(onRotate).toHaveBeenCalledWith(
      expect.objectContaining({
        x: expect.any(Number),
        y: expect.any(Number)
      })
    );
  });
});
```

## Model Testing

### Testing Model Properties
```typescript
import { render } from '@react-three/test-renderer';
import { HairstyleModel } from '@/components/HairstyleModel';

describe('Hairstyle Model', () => {
  it('has correct materials', () => {
    const { scene } = render(
      <HairstyleModel color="#FF0000" />
    );
    
    const model = scene.getObjectByName('hairstyle');
    expect(model.material.color.getHexString()).toBe('ff0000');
  });

  it('updates on prop changes', async () => {
    const { scene, update } = render(
      <HairstyleModel color="#FF0000" />
    );
    
    await act(async () => {
      update(<HairstyleModel color="#00FF00" />);
    });
    
    const model = scene.getObjectByName('hairstyle');
    expect(model.material.color.getHexString()).toBe('00ff00');
  });
});
```

### Testing Model Animations
```typescript
import { render, act } from '@react-three/test-renderer';
import { AnimatedModel } from '@/components/AnimatedModel';

describe('Model Animations', () => {
  it('plays animation correctly', async () => {
    const { scene } = render(
      <AnimatedModel animation="wave" />
    );
    
    const mixer = scene.getObjectByName('model').animations[0];
    
    await act(async () => {
      mixer.update(1/60); // Advance one frame
    });
    
    expect(mixer.time).toBeGreaterThan(0);
  });
});
```

## Camera and Tracking

### Testing Face Tracking
```typescript
import { render, act } from '@testing-library/react';
import { FaceTracking } from '@/components/FaceTracking';

describe('Face Tracking', () => {
  it('detects face landmarks', async () => {
    const onLandmarksDetected = jest.fn();
    render(
      <FaceTracking
        onLandmarksDetected={onLandmarksDetected}
      />
    );
    
    // Simulate face detection
    await act(async () => {
      // Mock face detection result
      const landmarks = {
        nose: { x: 0.5, y: 0.5 },
        eyes: [
          { x: 0.4, y: 0.4 },
          { x: 0.6, y: 0.4 }
        ]
      };
      
      global.faceDetectionResult = landmarks;
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(onLandmarksDetected).toHaveBeenCalledWith(
      expect.objectContaining({
        nose: expect.any(Object),
        eyes: expect.any(Array)
      })
    );
  });
});
```

## Best Practices

### Performance Testing
```typescript
import { render } from '@react-three/test-renderer';
import { ARScene } from '@/components/ARScene';

describe('AR Performance', () => {
  it('maintains frame rate', async () => {
    const { scene } = render(<ARScene />);
    
    const startTime = performance.now();
    let frames = 0;
    
    // Simulate 1 second of rendering
    for (let i = 0; i < 60; i++) {
      await act(async () => {
        scene.updateMatrixWorld();
        frames++;
      });
    }
    
    const endTime = performance.now();
    const fps = frames / ((endTime - startTime) / 1000);
    
    expect(fps).toBeGreaterThan(55);
  });
});
```

### Memory Management
```typescript
import { render, cleanup } from '@react-three/test-renderer';
import { ARExperience } from '@/components/ARExperience';

describe('Memory Management', () => {
  afterEach(() => {
    cleanup();
  });

  it('disposes resources properly', async () => {
    const { unmount } = render(<ARExperience />);
    
    // Track memory usage
    const initialMemory = performance.memory.usedJSHeapSize;
    
    // Unmount component
    await act(async () => {
      unmount();
    });
    
    const finalMemory = performance.memory.usedJSHeapSize;
    expect(finalMemory).toBeLessThanOrEqual(initialMemory);
  });
});
```

## Additional Resources
- [React Three Fiber Testing](https://docs.pmnd.rs/react-three-fiber/tutorials/testing)
- [WebXR Device API](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API)
- [Three.js Testing](https://threejs.org/docs/#manual/en/introduction/How-to-run-things-locally)
- [Jest WebGL Mock](https://github.com/pmndrs/jest-webgl-canvas-mock)
- [Testing Library Documentation](https://testing-library.com/docs/) 