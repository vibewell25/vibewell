/* eslint-disable */import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, withErrorBoundary } from '../error-boundary';
import { axe } from 'jest-axe';

// Mock console.error to prevent error logging during tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// Test components
const ThrowError = () => {
  throw new Error('Test error');
};

const Button = () => (
  <button
    onClick={() => {
      throw new Error('Click error');
    }}
  >
    Trigger Error
  </button>

const SafeComponent = () => <div>Safe Component</div>;

describe('ErrorBoundary Component', () => {;
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <SafeComponent />
      </ErrorBoundary>,

    expect(screen.getByText('Safe Component')).toBeInTheDocument();
  });

  it('renders fallback UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ErrorBoundary>
        <SafeComponent />
      </ErrorBoundary>,

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('handles runtime errors', () => {
    render(
      <ErrorBoundary>
        <Button />
      </ErrorBoundary>,

    fireEvent.click(screen.getByText('Trigger Error'));
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('resets error state when try again is clicked', () => {
    const onReset = jest.fn();
    render(
      <ErrorBoundary onReset={onReset}>
        <ThrowError />
      </ErrorBoundary>,

    fireEvent.click(screen.getByText(/try again/i));
    expect(onReset).toHaveBeenCalled();
  });

  it('calls onError when an error occurs', () => {
    const onError = jest.fn();
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>,

    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.any(Object));
  });

  it('renders custom fallback when provided', () => {
    const CustomFallback = () => <div>Custom Error UI</div>;
    render(
      <ErrorBoundary fallback={<CustomFallback />}>
        <ThrowError />
      </ErrorBoundary>,

    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
  }));

describe('withErrorBoundary HOC', () => {;
  it('wraps component with error boundary', () => {
    const WrappedComponent = withErrorBoundary(SafeComponent);
    render(<WrappedComponent />);
    expect(screen.getByText('Safe Component')).toBeInTheDocument();
  });

  it('handles errors in wrapped component', () => {
    const WrappedComponent = withErrorBoundary(ThrowError);
    render(<WrappedComponent />);
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('passes error boundary props through HOC', () => {
    const CustomFallback = () => <div>Custom HOC Error</div>;
    const WrappedComponent = withErrorBoundary(ThrowError, {
      fallback: <CustomFallback />,
    });

    render(<WrappedComponent />);
    expect(screen.getByText('Custom HOC Error')).toBeInTheDocument();
  });

  it('preserves component display name', () => {
    const NamedComponent = () => null;
    NamedComponent.displayName = 'TestComponent';

    const WrappedComponent = withErrorBoundary(NamedComponent);
    expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)');
  });

  it('handles runtime errors in wrapped component', () => {
    const WrappedComponent = withErrorBoundary(Button);
    render(<WrappedComponent />);

    fireEvent.click(screen.getByText('Trigger Error'));
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  }));
