import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VirtualTryOn } from '../virtual-try-on';
import { useARCache } from '@/hooks/use-ar-cache';
import { useAnalytics } from '@/hooks/use-analytics';
import { useEngagement } from '@/hooks/use-engagement';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the hooks
vi.mock('@/hooks/use-ar-cache');
vi.mock('@/hooks/use-analytics');
vi.mock('@/hooks/use-engagement');

// Mock the components
vi.mock('../ar-support-check', () => ({
  ARSupportCheck: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="ar-support-check">{children}</div>
  ),
}));

vi.mock('../model-error-boundary', () => ({
  ModelErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="model-error-boundary">{children}</div>
  ),
}));

vi.mock('../three-ar-viewer', () => ({
  ThreeARViewer: () => <div data-testid="three-ar-viewer" />,
}));

const mockModels = [
  { id: '1', url: 'model1.glb', type: 'makeup' as const, name: 'Model 1' },
  { id: '2', url: 'model2.glb', type: 'hairstyle' as const, name: 'Model 2' },
];

describe('VirtualTryOn', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup default mock implementations
    (useARCache as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      getModel: vi.fn(),
      prefetchModels: vi.fn(),
      cancelLoading: vi.fn(),
      isLoading: false,
      loadingProgress: 0,
      error: null,
      stats: {},
    });

    (useAnalytics as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      trackEvent: vi.fn(),
    });

    (useEngagement as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      trackAchievement: vi.fn(),
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
    (useARCache as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      getModel: vi.fn(),
      prefetchModels: vi.fn(),
      cancelLoading: vi.fn(),
      isLoading: true,
      loadingProgress: 50,
      error: null,
      stats: {},
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
    const getModel = vi.fn();
    (useARCache as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      getModel,
      prefetchModels: vi.fn(),
      cancelLoading: vi.fn(),
      isLoading: false,
      loadingProgress: 0,
      error: null,
      stats: {},
    });

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

    expect(getModel).toHaveBeenCalledWith(mockModels[1].url);
  });

  it('handles intensity changes', async () => {
    const trackEvent = vi.fn();
    (useAnalytics as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ trackEvent });

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
    const onModelError = vi.fn();

    (useARCache as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      getModel: vi.fn(),
      prefetchModels: vi.fn(),
      cancelLoading: vi.fn(),
      error,
      isLoading: false,
      loadingProgress: 0,
      stats: {},
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
    const trackEvent = vi.fn();
    (useAnalytics as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ trackEvent });

    const { unmount } = render(
      <VirtualTryOn
        models={mockModels}
        onModelLoaded={() => {}}
        onModelError={() => {}}
        userId="user123"
      />
    );

    // Fast-forward time
    vi.advanceTimersByTime(5000);

    unmount();

    expect(trackEvent).toHaveBeenCalledWith(
      'virtual_try_on_session_end',
      expect.objectContaining({
        duration: expect.any(Number),
        userId: 'user123',
      })
    );
  });

  it('handles AR unsupported scenario', () => {
    const trackEvent = vi.fn();
    (useAnalytics as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ trackEvent });

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
