import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VirtualTryOn } from '../virtual-try-on';
import { useARCache } from '@/hooks/use-ar-cache';
import { useAnalytics } from '@/hooks/use-analytics';
import { useEngagement } from '@/hooks/use-engagement';

// Mock the hooks
jest.mock('@/hooks/use-ar-cache');
jest.mock('@/hooks/use-analytics');
jest.mock('@/hooks/use-engagement');

// Mock the components
jest.mock('../ar-support-check', () => ({
  ARSupportCheck: ({ children }: { children: React.ReactNode }) => <div data-testid="ar-support-check">{children}</div>,
}));

jest.mock('../model-error-boundary', () => ({
  ModelErrorBoundary: ({ children }: { children: React.ReactNode }) => <div data-testid="model-error-boundary">{children}</div>,
}));

jest.mock('../three-ar-viewer', () => ({
  ThreeARViewer: () => <div data-testid="three-ar-viewer" />,
}));

const mockModels = [
  { id: '1', url: 'model1.glb', type: 'makeup' as const, name: 'Model 1' },
  { id: '2', url: 'model2.glb', type: 'hairstyle' as const, name: 'Model 2' },
];

describe('VirtualTryOn', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    (useARCache as jest.Mock).mockReturnValue({
      getModel: jest.fn(),
      prefetchModels: jest.fn(),
      cancelLoading: jest.fn(),
      isLoading: false,
      loadingProgress: 0,
      error: null,
      stats: {}
    });

    (useAnalytics as jest.Mock).mockReturnValue({
      trackEvent: jest.fn()
    });

    (useEngagement as jest.Mock).mockReturnValue({
      trackAchievement: jest.fn()
    });
  });

  it('renders without crashing', () => {
    render(
      <VirtualTryOn
        models={mockModels}
        onModelLoaded={() => {}}
        onModelError={() => {}}
        userId="user123"
      />
    );
    expect(screen.getByTestId('ar-support-check')).toBeInTheDocument();
  });

  it('shows loading state when loading model', () => {
    (useARCache as jest.Mock).mockReturnValue({
      ...useARCache(),
      isLoading: true,
      loadingProgress: 50
    });

    render(
      <VirtualTryOn
        models={mockModels}
        onModelLoaded={() => {}}
        onModelError={() => {}}
        userId="user123"
      />
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles model selection', () => {
    render(
      <VirtualTryOn
        models={mockModels}
        onModelLoaded={() => {}}
        onModelError={() => {}}
        userId="user123"
      />
    );

    const modelButtons = screen.getAllByRole('button');
    fireEvent.click(modelButtons[1]); // Click second model

    expect(useARCache().getModel).toHaveBeenCalledWith(mockModels[1].url);
  });

  it('handles intensity changes', async () => {
    const trackEvent = jest.fn();
    (useAnalytics as jest.Mock).mockReturnValue({ trackEvent });

    render(
      <VirtualTryOn
        models={mockModels}
        onModelLoaded={() => {}}
        onModelError={() => {}}
        userId="user123"
      />
    );

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '8' } });

    expect(trackEvent).toHaveBeenCalledWith('virtual_try_on_intensity_change', expect.any(Object));
  });

  it('handles errors correctly', async () => {
    const error = new Error('Failed to load model');
    const onModelError = jest.fn();
    
    (useARCache as jest.Mock).mockReturnValue({
      ...useARCache(),
      error,
      isLoading: false
    });

    render(
      <VirtualTryOn
        models={mockModels}
        onModelLoaded={() => {}}
        onModelError={onModelError}
        userId="user123"
      />
    );

    await waitFor(() => {
      expect(onModelError).toHaveBeenCalledWith(error);
    });
  });

  it('tracks session duration on unmount', async () => {
    const trackEvent = jest.fn();
    (useAnalytics as jest.Mock).mockReturnValue({ trackEvent });

    const { unmount } = render(
      <VirtualTryOn
        models={mockModels}
        onModelLoaded={() => {}}
        onModelError={() => {}}
        userId="user123"
      />
    );

    // Fast-forward time
    jest.advanceTimersByTime(5000);

    unmount();

    expect(trackEvent).toHaveBeenCalledWith(
      'virtual_try_on_session_end',
      expect.objectContaining({
        duration: expect.any(Number),
        userId: 'user123'
      })
    );
  });

  it('handles AR unsupported scenario', () => {
    const trackEvent = jest.fn();
    (useAnalytics as jest.Mock).mockReturnValue({ trackEvent });

    render(
      <VirtualTryOn
        models={mockModels}
        onModelLoaded={() => {}}
        onModelError={() => {}}
        userId="user123"
      />
    );

    // Simulate AR unsupported callback
    const arSupportCheck = screen.getByTestId('ar-support-check');
    fireEvent.error(arSupportCheck);

    expect(trackEvent).toHaveBeenCalledWith('ar_unsupported', expect.any(Object));
  });
}); 