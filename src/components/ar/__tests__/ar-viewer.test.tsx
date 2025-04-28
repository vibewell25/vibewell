/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace, @typescript-eslint/no-require-imports, react/no-unescaped-entities, import/no-anonymous-default-export, no-unused-vars, security/detect-object-injection, unicorn/no-null, unicorn/consistent-function-scoping */import { render, screen, waitFor } from '@testing-library/react';
import { ARViewer } from '../ar-viewer';

// Mock the Three.js and React Three Fiber components
// Note: Most of these mocks are now provided in jest.setup.js

describe('ARViewer', () => {
  it('renders loading state initially', () => {
    render(<ARViewer modelUrl="https://example.com/model.glb" type="makeup" />);
    expect(screen.getByTestId('ar-loading')).toBeInTheDocument();
  });

  it('shows error state when model fails to load', async () => {
    // The mock in jest.setup.js should handle this case
    render(<ARViewer modelUrl="https://example.com/invalid.glb" type="makeup" />);

    // Wait for the error state to appear
    await waitFor(() => {
      expect(screen.getByTestId('ar-error')).toBeInTheDocument();
    });
  });

  it('renders AR viewer when model is loaded successfully', async () => {
    render(<ARViewer modelUrl="https://example.com/model.glb" type="makeup" />);

    // Wait for the model to load
    await waitFor(() => {
      expect(screen.getByTestId('ar-canvas')).toBeInTheDocument();
    });
  });
});
