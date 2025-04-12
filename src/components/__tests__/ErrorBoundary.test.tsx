import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

describe('ErrorBoundary', () => {
  const ErrorComponent = () => {
    throw new Error('Test error');
  };

  const TypeErrorComponent = () => {
    throw new TypeError('Type error');
  };

  const ReferenceErrorComponent = () => {
    throw new ReferenceError('Reference error');
  };

  const FallbackComponent = () => <div>Error occurred</div>;

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary fallback={<FallbackComponent />}>
        <div>Normal content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal content')).toBeInTheDocument();
    expect(screen.queryByText('Error occurred')).not.toBeInTheDocument();
  });

  it('renders fallback when there is an error', () => {
    // Suppress console error from React
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<FallbackComponent />}>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error occurred')).toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('logs error details', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<FallbackComponent />}>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error caught by ErrorBoundary:',
      expect.any(Error),
      expect.any(Object)
    );

    consoleSpy.mockRestore();
  });

  it('handles different error types', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<FallbackComponent />}>
        <TypeErrorComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Error occurred')).toBeInTheDocument();

    render(
      <ErrorBoundary fallback={<FallbackComponent />}>
        <ReferenceErrorComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Error occurred')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('recovers after error', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { rerender } = render(
      <ErrorBoundary fallback={<FallbackComponent />}>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error occurred')).toBeInTheDocument();

    rerender(
      <ErrorBoundary fallback={<FallbackComponent />}>
        <div>Recovered content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Recovered content')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('matches snapshot', () => {
    const { container } = render(
      <ErrorBoundary fallback={<FallbackComponent />}>
        <div>Normal content</div>
      </ErrorBoundary>
    );
    expect(container).toMatchSnapshot();
  });

  it('matches error snapshot', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(
      <ErrorBoundary fallback={<FallbackComponent />}>
        <ErrorComponent />
      </ErrorBoundary>
    );
    expect(container).toMatchSnapshot();
    consoleSpy.mockRestore();
  });

  it('renders efficiently', async () => {
    const startTime = performance.now();
    await act(async () => {
      render(
        <ErrorBoundary fallback={<FallbackComponent />}>
          <div>Normal content</div>
        </ErrorBoundary>
      );
    });
    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(16); // 60fps threshold
  });
}); 