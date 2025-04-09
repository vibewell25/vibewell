import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import React from 'react';

// Add TextEncoder and TextDecoder to global scope for Jest
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock the ARViewer component
jest.mock('@/components/ar/ar-viewer', () => {
  const MockARViewer: React.FC<{ modelUrl: string; type: string }> = ({ modelUrl, type }) => (
    <div data-testid="ar-viewer" data-model-url={modelUrl} data-type={type} />
  );
  return { ARViewer: MockARViewer };
}); 