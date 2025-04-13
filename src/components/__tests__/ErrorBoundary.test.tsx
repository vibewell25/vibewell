import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../ui/ErrorBoundary';

// Test component that throws an error
const ErrorThrowingComponent = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Component rendered successfully</div>;
};

describe('ErrorBoundary', () => {
  // Mock console.error to prevent test noise
  let originalConsoleError: typeof console.error;
  
  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });
  
  afterAll(() => {
    console.error = originalConsoleError;
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
  
  it('renders fallback UI when an error occurs', () => {
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    
    // Error message should be displayed
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/Test error/i)).toBeInTheDocument();
    
    // Try Again button should be present
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
  
  it('logs error details', () => {
    const consoleSpy = jest.spyOn(console, 'error');
    
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    
    // Check that console.error was called
    expect(consoleSpy).toHaveBeenCalled();
    
    // The error object should be in the args
    const errorArg = consoleSpy.mock.calls.find(
      call => call[0] instanceof Error || (typeof call[0] === 'object' && call[0]?.message === 'Test error')
    );
    
    expect(errorArg).toBeTruthy();
  });
  
  it('handles different error types', () => {
    const differentErrorComponent = () => {
      // Throw a string instead of an Error object
      throw 'String error';
    };
    
    render(
      <ErrorBoundary>
        <differentErrorComponent />
      </ErrorBoundary>
    );
    
    // Error message should still be displayed
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
  });
  
  it('recovers after error', () => {
    // Use a component state to control whether it throws
    const TestComponent = () => {
      const [shouldThrow, setShouldThrow] = React.useState(true);
      
      if (shouldThrow) {
        throw new Error('Test error');
      }
      
      return <div>Recovered content</div>;
    };
    
    const { rerender } = render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );
    
    // Error should be displayed initially
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    
    // Simulate fixing the error and re-rendering
    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    
    // When we click "Try Again", the ErrorBoundary will reset its state
    // In a real app, this would allow the component to re-render without the error
    fireEvent.click(tryAgainButton);
    
    // After clicking "Try Again", we would re-render the component
    // For testing purposes, we simulate a successful render after error reset
    rerender(
      <ErrorBoundary>
        <div>Recovered content</div>
      </ErrorBoundary>
    );
    
    // Now the recovered content should be visible
    expect(screen.getByText('Recovered content')).toBeInTheDocument();
  });
}); 