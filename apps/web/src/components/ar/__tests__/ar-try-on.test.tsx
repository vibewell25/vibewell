import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { ARTryOn } from '../ARTryOn';
import { useARResourceManager } from '@/hooks/useARResourceManager';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';

// Mock dependencies
jest.mock('@/hooks/useARResourceManager');
jest.mock('@/hooks/useDeviceCapabilities');
jest.mock('@/hooks/useWebXR');
jest.mock('next/dynamic', () => (component: any) => {
  const DynamicComponent = () => <div data-testid="mock-ar-viewer">AR Viewer Component</div>;
  DynamicComponent.displayName = 'DynamicARViewer';
  DynamicComponent.preload = jest.fn();
  return DynamicComponent;
});

describe('ARTryOn Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock device capability hook
    (useDeviceCapabilities as jest.Mock).mockReturnValue({
      hasARSupport: true,
      hasFrontCamera: true,
      hasWebGLSupport: true,
      devicePerformance: 'high',
      isLoading: false
    });
    
    // Mock AR resource manager hook
    (useARResourceManager as jest.Mock).mockReturnValue({
      loadModel: jest.fn().mockResolvedValue({
        modelUrl: 'http://example.com/model.glb',
        textureUrl: 'http://example.com/texture.jpg'
      }),
      loadTexture: jest.fn().mockResolvedValue('http://example.com/texture.jpg'),
      getResourceStatus: jest.fn().mockReturnValue({ status: 'loaded' }),
      clearResources: jest.fn(),
      preloadModels: jest.fn()
    });
  });

  it('should render AR try-on component with supported device', () => {
    render(<ARTryOn productId="product-123" />);
    
    expect(screen.getByTestId('ar-try-on-container')).toBeInTheDocument();
    expect(screen.getByText(/Try on this product/i)).toBeInTheDocument();
  });

  it('should show unsupported message on incompatible devices', () => {
    // Mock device as not supporting AR
    (useDeviceCapabilities as jest.Mock).mockReturnValue({
      hasARSupport: false,
      hasFrontCamera: true,
      hasWebGLSupport: true,
      devicePerformance: 'high',
      isLoading: false
    });
    
    render(<ARTryOn productId="product-123" />);
    
    expect(screen.getByText(/Your device doesn't support AR features/i)).toBeInTheDocument();
    expect(screen.queryByTestId('mock-ar-viewer')).not.toBeInTheDocument();
  });

  it('should load AR model when starting try-on experience', async () => {
    const mockLoadModel = jest.fn().mockResolvedValue({
      modelUrl: 'http://example.com/model.glb',
      textureUrl: 'http://example.com/texture.jpg'
    });
    
    (useARResourceManager as jest.Mock).mockReturnValue({
      loadModel: mockLoadModel,
      loadTexture: jest.fn().mockResolvedValue('http://example.com/texture.jpg'),
      getResourceStatus: jest.fn().mockReturnValue({ status: 'loaded' }),
      clearResources: jest.fn(),
      preloadModels: jest.fn()
    });
    
    render(<ARTryOn productId="product-123" />);
    
    // Click the start button
    const startButton = screen.getByRole('button', { name: /Try on/i });
    await act(async () => {
      fireEvent.click(startButton);
    });
    
    // Assert AR model was loaded
    expect(mockLoadModel).toHaveBeenCalledWith('product-123');
    
    // AR viewer should be rendered
    await waitFor(() => {
      expect(screen.getByTestId('mock-ar-viewer')).toBeInTheDocument();
    });
  });

  it('should show loading state while resources are loading', async () => {
    // Mock resource loading state
    const mockGetResourceStatus = jest.fn()
      .mockReturnValueOnce({ status: 'loading' })
      .mockReturnValue({ status: 'loaded' });
    
    (useARResourceManager as jest.Mock).mockReturnValue({
      loadModel: jest.fn().mockResolvedValue({
        modelUrl: 'http://example.com/model.glb',
        textureUrl: 'http://example.com/texture.jpg'
      }),
      loadTexture: jest.fn().mockResolvedValue('http://example.com/texture.jpg'),
      getResourceStatus: mockGetResourceStatus,
      clearResources: jest.fn(),
      preloadModels: jest.fn()
    });
    
    render(<ARTryOn productId="product-123" />);
    
    // Click the start button
    const startButton = screen.getByRole('button', { name: /Try on/i });
    await act(async () => {
      fireEvent.click(startButton);
    });
    
    // Should show loading indicator initially
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    
    // After loading completes, AR viewer should be shown
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      expect(screen.getByTestId('mock-ar-viewer')).toBeInTheDocument();
    });
  });

  it('should handle errors during model loading', async () => {
    // Mock error during resource loading
    const mockLoadModel = jest.fn().mockRejectedValue(new Error('Failed to load AR model'));
    
    (useARResourceManager as jest.Mock).mockReturnValue({
      loadModel: mockLoadModel,
      loadTexture: jest.fn(),
      getResourceStatus: jest.fn().mockReturnValue({ status: 'error', error: 'Failed to load AR model' }),
      clearResources: jest.fn(),
      preloadModels: jest.fn()
    });
    
    render(<ARTryOn productId="product-123" />);
    
    // Click the start button
    const startButton = screen.getByRole('button', { name: /Try on/i });
    await act(async () => {
      fireEvent.click(startButton);
    });
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to load AR model/i)).toBeInTheDocument();
      expect(screen.queryByTestId('mock-ar-viewer')).not.toBeInTheDocument();
    });
  });

  it('should clean up resources when unmounted', async () => {
    const mockClearResources = jest.fn();
    
    (useARResourceManager as jest.Mock).mockReturnValue({
      loadModel: jest.fn().mockResolvedValue({
        modelUrl: 'http://example.com/model.glb',
        textureUrl: 'http://example.com/texture.jpg'
      }),
      loadTexture: jest.fn(),
      getResourceStatus: jest.fn().mockReturnValue({ status: 'loaded' }),
      clearResources: mockClearResources,
      preloadModels: jest.fn()
    });
    
    const { unmount } = render(<ARTryOn productId="product-123" />);
    
    // Click the start button to initialize AR
    const startButton = screen.getByRole('button', { name: /Try on/i });
    await act(async () => {
      fireEvent.click(startButton);
    });
    
    // Unmount component
    unmount();
    
    // Resources should be cleared
    expect(mockClearResources).toHaveBeenCalled();
  });
}); 