import { render, screen, waitFor } from '@testing-library/react';
import { ARViewer } from '../ar-viewer';

// Mock the Three.js and React Three Fiber components
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="canvas">{children}</div>
  ),
}));

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  useGLTF: () => ({ scene: {} }),
}));

describe('ARViewer', () => {
  const mockModelUrl = 'https://example.com/model.glb';

  it('renders loading state initially', () => {
    render(<ARViewer modelUrl={mockModelUrl} />);
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('renders error state when model fails to load', async () => {
    const mockError = new Error('Failed to load model');
    render(<ARViewer modelUrl={mockModelUrl} onError={jest.fn()} />);
    
    // Simulate error
    const canvas = screen.getByTestId('canvas');
    canvas.dispatchEvent(new ErrorEvent('error', { error: mockError }));
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to load model/)).toBeInTheDocument();
    });
  });

  it('calls onLoad callback when model is loaded', async () => {
    const onLoad = jest.fn();
    render(<ARViewer modelUrl={mockModelUrl} onLoad={onLoad} />);
    
    // Simulate load
    const canvas = screen.getByTestId('canvas');
    canvas.dispatchEvent(new Event('load'));
    
    await waitFor(() => {
      expect(onLoad).toHaveBeenCalled();
    });
  });

  it('applies custom className', () => {
    const customClass = 'custom-class';
    render(<ARViewer modelUrl={mockModelUrl} className={customClass} />);
    expect(screen.getByTestId('ar-viewer')).toHaveClass(customClass);
  });
}); 