import { render, screen, fireEvent } from '@testing-library/react';
import { VirtualTryOn } from '../virtual-try-on';

// Mock the ARViewer component
jest.mock('../ar-viewer', () => ({
  ARViewer: () => <div data-testid="ar-viewer" />,
}));

describe('VirtualTryOn', () => {
  const mockProps = {
    modelUrl: 'https://example.com/model.glb',
    type: 'makeup' as const,
  };

  it('renders with initial state', () => {
    render(<VirtualTryOn {...mockProps} />);
    
    expect(screen.getByTestId('ar-viewer')).toBeInTheDocument();
    expect(screen.getByText('Try On')).toBeInTheDocument();
    expect(screen.getByText('Share')).toBeInTheDocument();
    expect(screen.getByText('Intensity')).toBeInTheDocument();
  });

  it('handles try-on button click', () => {
    const onTryOn = jest.fn();
    render(<VirtualTryOn {...mockProps} onTryOn={onTryOn} />);
    
    fireEvent.click(screen.getByText('Try On'));
    expect(onTryOn).toHaveBeenCalled();
  });

  it('handles share button click', () => {
    const onShare = jest.fn();
    render(<VirtualTryOn {...mockProps} onShare={onShare} />);
    
    fireEvent.click(screen.getByText('Share'));
    expect(onShare).toHaveBeenCalled();
  });

  it('updates intensity value when slider changes', () => {
    render(<VirtualTryOn {...mockProps} />);
    
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: 50 } });
    
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const customClass = 'custom-class';
    render(<VirtualTryOn {...mockProps} className={customClass} />);
    
    const container = screen.getByTestId('virtual-try-on');
    expect(container).toHaveClass(customClass);
  });

  it('disables buttons when loading', () => {
    render(<VirtualTryOn {...mockProps} />);
    
    // Simulate loading state
    const arViewer = screen.getByTestId('ar-viewer');
    arViewer.dispatchEvent(new Event('loadstart'));
    
    expect(screen.getByText('Try On')).toBeDisabled();
    expect(screen.getByText('Share')).toBeDisabled();
  });
}); 