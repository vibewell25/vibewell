import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ShareDialog } from '@/components/ar/share-dialog';
import { useAnalytics } from '@/hooks/use-analytics';
import { AnalyticsService } from '@/services/analytics-service';

// Mock the hooks and services
jest.mock('@/hooks/use-analytics');
jest.mock('@/services/analytics-service');
jest.mock('@/components/ar/social-share-buttons', () => ({
  SocialShareButtons: ({ 
    imageData, 
    type, 
    productName, 
    shareUrl,
    onShare
  }: any) => (
    <div data-testid="social-share-buttons">
      <p>Image: {imageData}</p>
      <p>Type: {type}</p>
      <p>Product: {productName}</p>
      <p>URL: {shareUrl}</p>
      <button onClick={() => onShare('facebook')} data-testid="facebook-share">
        Share to Facebook
      </button>
      <button onClick={() => onShare('twitter')} data-testid="twitter-share">
        Share to Twitter
      </button>
    </div>
  )
}));

// Mock global fetch
global.fetch = jest.fn();

describe('ShareDialog', () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    imageData: 'data:image/png;base64,mockImageData',
    type: 'makeup' as const,
    productName: 'Red Lipstick',
    userId: 'user123'
  };

  const mockAnalyticsReturn = {
    trackEvent: jest.fn()
  };

  const mockAnalyticsService = {
    trackShare: jest.fn().mockResolvedValue({})
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    (useAnalytics as jest.Mock).mockReturnValue(mockAnalyticsReturn);
    (AnalyticsService as jest.Mock).mockImplementation(() => mockAnalyticsService);
    
    // Setup fetch mock
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ shareUrl: 'https://vibewell.com/share/abc123' })
    });
  });

  it('renders correctly when open', () => {
    // Act
    render(<ShareDialog {...mockProps} />);
    
    // Assert
    expect(screen.getByText('Share Your Look')).toBeInTheDocument();
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.getByRole('img').getAttribute('src')).toBe(mockProps.imageData);
    expect(screen.getByText('Social Media')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Download Image')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    // Act
    render(<ShareDialog {...mockProps} isOpen={false} />);
    
    // Assert
    expect(screen.queryByText('Share Your Look')).not.toBeInTheDocument();
  });

  it('handles email sharing correctly', async () => {
    // Arrange
    render(<ShareDialog {...mockProps} />);
    
    // Act - Switch to email tab
    fireEvent.click(screen.getByText('Email'));
    
    // Enter email
    const emailInput = screen.getByPlaceholderText('Enter email address');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Click share button
    fireEvent.click(screen.getByText('Share via Email'));
    
    // Assert
    expect(global.fetch).toHaveBeenCalledWith('/api/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        imageData: mockProps.imageData,
        type: mockProps.type,
        productName: mockProps.productName,
      }),
    });

    await waitFor(() => {
      // Check that analytics was called
      expect(mockAnalyticsReturn.trackEvent).toHaveBeenCalledWith(
        'share_attempt',
        expect.objectContaining({
          type: mockProps.type,
          method: 'email'
        })
      );

      expect(mockAnalyticsReturn.trackEvent).toHaveBeenCalledWith(
        'share_success',
        expect.objectContaining({
          type: mockProps.type,
          method: 'email'
        })
      );

      // Check that analytics service was called
      expect(mockAnalyticsService.trackShare).toHaveBeenCalledWith({
        sessionId: 'abc123',
        userId: mockProps.userId,
        platform: 'email',
        method: 'email',
        success: true
      });
    });
  });

  it('handles email share errors correctly', async () => {
    // Arrange
    const mockError = new Error('Server error');
    (global.fetch as jest.Mock).mockRejectedValueOnce(mockError);
    
    render(<ShareDialog {...mockProps} />);
    
    // Act - Switch to email tab
    fireEvent.click(screen.getByText('Email'));
    
    // Enter email
    const emailInput = screen.getByPlaceholderText('Enter email address');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Click share button
    fireEvent.click(screen.getByText('Share via Email'));
    
    // Assert
    await waitFor(() => {
      // Check that analytics error was tracked
      expect(mockAnalyticsReturn.trackEvent).toHaveBeenCalledWith(
        'share_error',
        expect.objectContaining({
          type: mockProps.type,
          method: 'email',
          error: 'Server error'
        })
      );

      // Check that analytics service was called with error
      expect(mockAnalyticsService.trackShare).toHaveBeenCalledWith({
        sessionId: 'unknown',
        userId: mockProps.userId,
        platform: 'email',
        method: 'email',
        success: false,
        error: 'Server error'
      });
    });
  });

  it('handles image downloading correctly', async () => {
    // Arrange
    // Mock link creation and click
    const mockLink = {
      href: '',
      download: '',
      click: jest.fn(),
    };

    // Type-safe mocking of document.createElement
    const originalCreateElement = document.createElement;
    document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === 'a') {
        return mockLink as unknown as HTMLElement;
      }
      return originalCreateElement.call(document, tag);
    });

    const mockAppendChild = jest.fn();
    const mockRemoveChild = jest.fn();
    document.body.appendChild = mockAppendChild;
    document.body.removeChild = mockRemoveChild;
    
    // Act
    render(<ShareDialog {...mockProps} />);
    
    // Click download button
    fireEvent.click(screen.getByText('Download Image'));
    
    // Assert
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(mockLink.href).toBe(mockProps.imageData);
    expect(mockLink.download).toMatch(/vibewell-makeup-.*\.png/);
    expect(mockLink.click).toHaveBeenCalled();
    expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
    expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
    
    expect(mockAnalyticsReturn.trackEvent).toHaveBeenCalledWith(
      'image_downloaded',
      expect.objectContaining({
        type: mockProps.type
      })
    );

    expect(mockAnalyticsService.trackShare).toHaveBeenCalledWith({
      sessionId: 'download',
      userId: mockProps.userId,
      platform: 'local',
      method: 'download',
      success: true
    });

    // Restore original document.createElement
    document.createElement = originalCreateElement;
  });

  it('shows social share buttons after successful email share', async () => {
    // Arrange
    render(<ShareDialog {...mockProps} />);
    
    // Act - Switch to email tab and share
    fireEvent.click(screen.getByText('Email'));
    
    // Enter email
    const emailInput = screen.getByPlaceholderText('Enter email address');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Click share button
    fireEvent.click(screen.getByText('Share via Email'));
    
    // Wait for share to complete
    await waitFor(() => {
      expect(mockAnalyticsService.trackShare).toHaveBeenCalled();
    });

    // Switch to social tab
    fireEvent.click(screen.getByText('Social Media'));
    
    // Assert
    expect(screen.getByTestId('social-share-buttons')).toBeInTheDocument();
    expect(screen.getByText(`URL: https://vibewell.com/share/abc123`)).toBeInTheDocument();
  });

  it('tracks social sharing through social buttons', async () => {
    // Arrange
    // First share via email to get a share URL
    render(<ShareDialog {...mockProps} />);
    
    // Email share
    fireEvent.click(screen.getByText('Email'));
    const emailInput = screen.getByPlaceholderText('Enter email address');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText('Share via Email'));
    
    // Wait for share to complete
    await waitFor(() => {
      expect(mockAnalyticsService.trackShare).toHaveBeenCalled();
    });

    // Switch to social tab
    fireEvent.click(screen.getByText('Social Media'));
    
    // Act - Click on Facebook share
    fireEvent.click(screen.getByTestId('facebook-share'));
    
    // Assert
    expect(mockAnalyticsService.trackShare).toHaveBeenCalledWith({
      sessionId: 'abc123',
      userId: mockProps.userId,
      platform: 'facebook',
      method: 'social',
      success: true
    });
  });
});
