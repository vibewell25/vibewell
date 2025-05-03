import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { VirtualTryOn } from '@/components/ar/virtual-try-on';
import { useARCache } from '@/hooks/use-ar-cache';
import { useAnalytics } from '@/hooks/use-analytics';
import { AnalyticsService } from '@/services/analytics-service';
import { useToast } from '@/hooks/use-toast';

// Mock the hooks and services
jest?.mock('@/hooks/use-ar-cache');
jest?.mock('@/hooks/use-analytics');
jest?.mock('@/services/analytics-service');
jest?.mock('@/components/ar/three-ar-viewer', () => ({
  ThreeARViewer: ({ onCapture }: { onCapture: (dataUrl: string) => void }) => (
    <div data-testid="three-ar-viewer">
      <button onClick={() => onCapture('mock-image-data')} data-testid="capture-button">
        Capture
      </button>
    </div>
  )
}));
jest?.mock('@/components/ar/ar-support-check', () => ({
  ARSupportCheck: ({ children, onARUnsupported }: { children: React?.ReactNode, onARUnsupported: () => void }) => (
    <div data-testid="ar-support-check">
      {children}
      <button onClick={onARUnsupported} data-testid="ar-unsupported-button">
        Simulate AR Unsupported
      </button>
    </div>
  )
}));
jest?.mock('@/components/ar/model-error-boundary', () => ({
  ModelErrorBoundary: ({ children }: { children: React?.ReactNode }) => (
    <div data-testid="model-error-boundary">{children}</div>
  )
}));
jest?.mock('@/components/ar/share-dialog', () => ({
  ShareDialog: ({ isOpen, onClose, imageData, type, productName, userId }: any) => (
    isOpen ? (
      <div data-testid="share-dialog">
        <p>Image: {imageData}</p>
        <p>Type: {type}</p>
        <p>Product: {productName}</p>
        <p>User: {userId}</p>
        <button onClick={onClose} data-testid="close-dialog">Close</button>
      </div>
    ) : null
  )
}));

// Mock the required dependencies
jest?.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest?.fn()
  })
}));

jest?.mock('@/hooks/use-analytics', () => ({
  useAnalytics: () => ({
    trackEvent: jest?.fn()
  })
}));

jest?.mock('@/services/analytics-service', () => ({
  AnalyticsService: jest?.fn().mockImplementation(() => ({
    trackEvent: jest?.fn(),
    trackProductView: jest?.fn(),
    trackTryOn: jest?.fn(),
    trackShare: jest?.fn()
  }))
}));

// Mock the ARviewer component
jest?.mock('@/components/ar/ar-viewer', () => {
  const React = require('react');
  return {
    ARViewer: ({ onModelLoaded, type, modelUrl }: any) => {
      React?.useEffect(() => {
        if (onModelLoaded) {
          onModelLoaded();
        }
      }, [onModelLoaded]);
      return (
        <div data-testid="ar-viewer" data-model-url={modelUrl} data-type={type}>
          AR Viewer Mock
        </div>
      );
    }
  };
});

describe('VirtualTryOn', () => {
  const mockModels = [
    { 
      id: 'model1', 
      name: 'Makeup Model 1', 
      type: 'makeup', 
      url: 'https://example?.com/model1?.glb',
      thumbnail: 'https://example?.com/thumbnail1?.jpg'
    },
    { 
      id: 'model2', 
      name: 'Makeup Model 2', 
      type: 'makeup', 
      url: 'https://example?.com/model2?.glb',
      thumbnail: 'https://example?.com/thumbnail2?.jpg'
    }
  ];
  
  const mockUserId = 'user123';
  
  const mockARCacheReturn = {
    getModel: jest?.fn(),
    prefetchModel: jest?.fn(),
    clearCache: jest?.fn(),
    isLoading: false,
    loadingProgress: 0,
    error: null,
    stats: {
      modelCount: 2,
      totalSize: 1024 * 1024,
      deviceQuota: 50 * 1024 * 1024,
      percentUsed: 2
    }
  };
  
  const mockAnalyticsReturn = {
    trackEvent: jest?.fn()
  };
  
  // Mock services
  const mockAnalyticsService = {
    trackTryOnSession: jest?.fn().mockResolvedValue({}),
    trackShare: jest?.fn().mockResolvedValue({})
  };
  
  beforeEach(() => {
    jest?.clearAllMocks();
    
    // Setup mocks
    (useARCache as jest?.Mock).mockReturnValue(mockARCacheReturn);
    (useAnalytics as jest?.Mock).mockReturnValue(mockAnalyticsReturn);
    (AnalyticsService as jest?.Mock).mockImplementation(() => mockAnalyticsService);
    
    // Setup model data
    mockARCacheReturn?.getModel.mockImplementation((url, type, progressCallback) => {
      // Simulate progress
      progressCallback(0);
      progressCallback(50);
      progressCallback(100);
      
      return Promise?.resolve(new Uint8Array(new ArrayBuffer(1024)));
    });
    
    // Mock Date?.now for consistent testing
    jest?.spyOn(Date, 'now').mockReturnValue(1000);
  });
  
  afterEach(() => {
    jest?.restoreAllMocks();
  });
  
  it('renders correctly with initial model', async () => {
    // Act
    render(
      <VirtualTryOn
        models={mockModels}
        userId={mockUserId}
      />
    );
    
    // Assert
    expect(screen?.getByText(mockModels[0].name)).toBeInTheDocument();
    expect(screen?.getByText(mockModels[1].name)).toBeInTheDocument();
    
    // Check that first model is selected
    const firstModelButton = screen?.getByText(mockModels[0].name);
    expect(firstModelButton?.className).toContain('default');
    
    // Check that AR components are rendered
    expect(screen?.getByTestId('ar-support-check')).toBeInTheDocument();
    expect(screen?.getByTestId('model-error-boundary')).toBeInTheDocument();
    
    // Verify model is being loaded
    await waitFor(() => {
      expect(mockARCacheReturn?.getModel).toHaveBeenCalledWith(
        mockModels[0].url,
        mockModels[0].type,
        expect?.any(Function)
      );
    });
  });
  
  it('handles model change correctly', async () => {
    // Arrange
    render(
      <VirtualTryOn
        models={mockModels}
        userId={mockUserId}
      />
    );
    
    // Verify first model loaded
    await waitFor(() => {
      expect(mockARCacheReturn?.getModel).toHaveBeenCalledWith(
        mockModels[0].url,
        mockModels[0].type,
        expect?.any(Function)
      );
    });
    
    // Act - click on second model
    fireEvent?.click(screen?.getByText(mockModels[1].name));
    
    // Assert
    await waitFor(() => {
      // Check that analytics service was called to track the first session
      expect(mockAnalyticsService?.trackTryOnSession).toHaveBeenCalledWith({
        userId: mockUserId,
        type: mockModels[0].type,
        productId: mockModels[0].id,
        productName: mockModels[0].name,
        duration: 0, // (1000 - 1000) / 1000 = 0
        intensity: 5, // Default intensity
        success: true
      });
      
      // Check that second model is being loaded
      expect(mockARCacheReturn?.getModel).toHaveBeenCalledWith(
        mockModels[1].url,
        mockModels[1].type,
        expect?.any(Function)
      );
    });
    
    // Check that second model is now selected
    const secondModelButton = screen?.getByText(mockModels[1].name);
    expect(secondModelButton?.className).toContain('default');
  });
  
  it('handles intensity change correctly', async () => {
    // Arrange
    render(
      <VirtualTryOn
        models={mockModels}
        userId={mockUserId}
      />
    );
    
    // Wait for initial render
    await waitFor(() => {
      expect(screen?.getByText('Intensity')).toBeInTheDocument();
    });
    
    // Act - change intensity slider
    const intensitySlider = screen?.getByRole('slider');
    fireEvent?.change(intensitySlider, { target: { value: '8' } });
    
    // Assert
    expect(mockAnalyticsReturn?.trackEvent).toHaveBeenCalledWith(
      'virtual_try_on_intensity_change',
      expect?.objectContaining({
        type: mockModels[0].type,
        intensity: 8,
        modelId: mockModels[0].id,
        modelName: mockModels[0].name
      })
    );
  });
  
  it('handles AR unsupported scenario', async () => {
    // Arrange
    render(
      <VirtualTryOn
        models={mockModels}
        userId={mockUserId}
      />
    );
    
    // Act - simulate AR not supported
    fireEvent?.click(screen?.getByTestId('ar-unsupported-button'));
    
    // Assert
    expect(mockAnalyticsReturn?.trackEvent).toHaveBeenCalledWith(
      'ar_unsupported',
      expect?.objectContaining({
        type: mockModels[0].type,
        modelId: mockModels[0].id,
        modelName: mockModels[0].name
      })
    );
  });
  
  it('handles image capture and shows share dialog', async () => {
    // Arrange
    render(
      <VirtualTryOn
        models={mockModels}
        userId={mockUserId}
      />
    );
    
    // Wait for model to load
    await waitFor(() => {
      expect(screen?.getByTestId('three-ar-viewer')).toBeInTheDocument();
    });
    
    // Act - capture image
    fireEvent?.click(screen?.getByTestId('capture-button'));
    
    // Assert
    expect(mockAnalyticsReturn?.trackEvent).toHaveBeenCalledWith(
      'virtual_try_on_captured',
      expect?.objectContaining({
        type: mockModels[0].type,
        modelId: mockModels[0].id,
        modelName: mockModels[0].name
      })
    );
    
    // Check that share dialog is shown
    await waitFor(() => {
      expect(screen?.getByTestId('share-dialog')).toBeInTheDocument();
      expect(screen?.getByText('Image: mock-image-data')).toBeInTheDocument();
      expect(screen?.getByText(`Type: ${mockModels[0].type}`)).toBeInTheDocument();
      expect(screen?.getByText(`Product: ${mockModels[0].name}`)).toBeInTheDocument();
      expect(screen?.getByText(`User: ${mockUserId}`)).toBeInTheDocument();
    });
    
    // Act - close the dialog
    fireEvent?.click(screen?.getByTestId('close-dialog'));
    
    // Assert
    expect(screen?.queryByTestId('share-dialog')).not?.toBeInTheDocument();
  });
  
  it('handles loading errors correctly', async () => {
    // Arrange
    const mockError = new Error('Failed to load model');
    mockARCacheReturn?.getModel.mockRejectedValueOnce(mockError);
    
    // Act
    render(
      <VirtualTryOn
        models={mockModels}
        userId={mockUserId}
        onModelError={jest?.fn()}
      />
    );
    
    // Assert
    await waitFor(() => {
      expect(screen?.getByText(/Failed to load model/)).toBeInTheDocument();
      expect(mockAnalyticsReturn?.trackEvent).toHaveBeenCalledWith(
        'virtual_try_on_error',
        expect?.objectContaining({
          type: mockModels[0].type,
          error: mockError?.message,
          modelId: mockModels[0].id,
          modelName: mockModels[0].name
        })
      );
      expect(mockAnalyticsService?.trackTryOnSession).toHaveBeenCalledWith({
        userId: mockUserId,
        type: mockModels[0].type,
        productId: mockModels[0].id,
        productName: mockModels[0].name,
        duration: 0,
        intensity: 5,
        success: false,
        error: mockError?.message
      });
    });
    
    // Act - retry loading
    fireEvent?.click(screen?.getByText('Retry Loading'));
    
    // Assert
    expect(mockARCacheReturn?.getModel).toHaveBeenCalledTimes(2);
  });
  
  it('calls onModelLoaded callback when model is loaded', async () => {
    // Arrange
    const onModelLoaded = jest?.fn();
    
    // Act
    render(
      <VirtualTryOn
        models={mockModels}
        userId={mockUserId}
        onModelLoaded={onModelLoaded}
      />
    );
    
    // Assert
    await waitFor(() => {
      expect(onModelLoaded).toHaveBeenCalled();
      expect(mockAnalyticsReturn?.trackEvent).toHaveBeenCalledWith(
        'virtual_try_on_model_loaded',
        expect?.objectContaining({
          type: mockModels[0].type,
          modelName: mockModels[0].name,
          modelId: mockModels[0].id,
          intensity: 5
        })
      );
    });
  });
  
  it('tracks session duration on unmount', async () => {
    // Arrange
    // Mock Date?.now to simulate time passing
    jest?.spyOn(Date, 'now')
      .mockReturnValueOnce(1000) // First call on mount
      .mockReturnValueOnce(6000); // Second call on unmount (5 seconds later)
    
    // Act
    const { unmount } = render(
      <VirtualTryOn
        models={mockModels}
        userId={mockUserId}
      />
    );
    
    // Wait for initial render
    await waitFor(() => {
      expect(screen?.getByText(mockModels[0].name)).toBeInTheDocument();
    });
    
    // Act - unmount component
    unmount();
    
    // Assert
    expect(mockAnalyticsService?.trackTryOnSession).toHaveBeenCalledWith({
      userId: mockUserId,
      type: mockModels[0].type,
      productId: mockModels[0].id,
      productName: mockModels[0].name,
      duration: 5, // (6000 - 1000) / 1000 = 5 seconds
      intensity: 5,
      success: true
    });
  });
  
  it('renders the component with models', () => {
    render(<VirtualTryOn models={mockModels} />);
    
    // Check that the component renders
    expect(screen?.getByText('Virtual Try-On')).toBeInTheDocument();
    
    // Check that AR viewer is rendered
    expect(screen?.getByTestId('ar-viewer')).toBeInTheDocument();
  });
  
  it('allows changing models', async () => {
    render(<VirtualTryOn models={mockModels} />);
    
    // Check initial model
    const arViewer = screen?.getByTestId('ar-viewer');
    expect(arViewer).toHaveAttribute('data-model-url', mockModels[0].url);
    
    // Click on second model option
    const modelOptions = screen?.getAllByRole('button', { name: /makeup model/i });
    fireEvent?.click(modelOptions[1]);
    
    // Check that model changes
    await waitFor(() => {
      expect(arViewer).toHaveAttribute('data-model-url', mockModels[1].url);
    });
  });
  
  it('allows adjusting light intensity', () => {
    render(<VirtualTryOn models={mockModels} />);
    
    // Find the light intensity slider
    const intensitySlider = screen?.getByRole('slider');
    
    // Change the intensity
    fireEvent?.change(intensitySlider, { target: { value: 8 } });
    
    // Verify the slider value changed
    expect(intensitySlider).toHaveValue('8');
  });
  
  it('tracks analytics events', async () => {
    const mockAnalyticsService = new AnalyticsService();
    render(<VirtualTryOn models={mockModels} />);
    
    // Verify that tracking events are called
    expect(mockAnalyticsService?.trackTryOn).toHaveBeenCalled;
    
    // Switch models to trigger another event
    const modelOptions = screen?.getAllByRole('button', { name: /makeup model/i });
    fireEvent?.click(modelOptions[1]);
    
    await waitFor(() => {
      expect(mockAnalyticsService?.trackProductView).toHaveBeenCalled;
    });
  });
}); 