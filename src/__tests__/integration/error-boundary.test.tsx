import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorBoundary, withErrorBoundary } from '@/components/ui/error-boundary';

// A component that throws an error
function BuggyComponent({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Component rendered successfully</div>;
}

// Mock console.error to avoid cluttering test output
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundary', () => {
  test('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>No error here</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('No error here')).toBeInTheDocument();
  });

  test('renders fallback UI when an error occurs', () => {
    // We need to suppress the error boundary warning in the test
    const spy = jest.spyOn(console, 'error');
    spy.mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>
    );

    // Check that the fallback UI is rendered
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/test error/i)).toBeInTheDocument();
    expect(screen.getByText(/try again/i)).toBeInTheDocument();

    spy.mockRestore();
  });

  test('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error UI</div>;
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <BuggyComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
  });

  test('calls onError when an error occurs', () => {
    const handleError = jest.fn();
    
    render(
      <ErrorBoundary onError={handleError}>
        <BuggyComponent />
      </ErrorBoundary>
    );

    expect(handleError).toHaveBeenCalled();
  });

  test('resets the error state when "Try Again" is clicked', () => {
    let shouldThrow = true;
    const onReset = jest.fn(() => {
      shouldThrow = false;
    });
    
    const { rerender } = render(
      <ErrorBoundary onReset={onReset}>
        <BuggyComponent shouldThrow={shouldThrow} />
      </ErrorBoundary>
    );

    // Check that the error UI is shown
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    
    // Click the reset button
    fireEvent.click(screen.getByText(/try again/i));
    
    // Check that onReset was called
    expect(onReset).toHaveBeenCalled();
    
    // Rerender the component with the updated shouldThrow value
    rerender(
      <ErrorBoundary onReset={onReset}>
        <BuggyComponent shouldThrow={shouldThrow} />
      </ErrorBoundary>
    );
    
    // Now the component should render successfully
    expect(screen.getByText('Component rendered successfully')).toBeInTheDocument();
  });
});

describe('withErrorBoundary HOC', () => {
  test('wraps component with error boundary', () => {
    const WrappedBuggyComponent = withErrorBoundary(BuggyComponent);
    
    render(<WrappedBuggyComponent />);
    
    // Check that the fallback UI is rendered
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  test('passes props to wrapped component', () => {
    const WrappedBuggyComponent = withErrorBoundary(BuggyComponent);
    
    render(<WrappedBuggyComponent shouldThrow={false} />);
    
    // Check that the component rendered successfully
    expect(screen.getByText('Component rendered successfully')).toBeInTheDocument();
  });

  test('passes error boundary props correctly', () => {
    const customFallback = <div>Custom error fallback</div>;
    const WrappedBuggyComponent = withErrorBoundary(BuggyComponent, { fallback: customFallback });
    
    render(<WrappedBuggyComponent />);
    
    // Check that the custom fallback is rendered
    expect(screen.getByText('Custom error fallback')).toBeInTheDocument();
  });
}); 