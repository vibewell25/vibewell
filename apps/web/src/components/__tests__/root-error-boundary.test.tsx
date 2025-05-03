import { render, screen, fireEvent } from '@testing-library/react';
import { RootErrorBoundary } from '../RootErrorBoundary';

// Mock console?.error to avoid test output pollution
jest?.spyOn(console, 'error').mockImplementation(() => {});

describe('RootErrorBoundary', () => {
  const ErrorComponent = () => {
    throw new Error('Test application error');
  };

  beforeEach(() => {
    // Clear mocks before each test
    jest?.clearAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <RootErrorBoundary>
        <div>Normal application content</div>
      </RootErrorBoundary>,
    );

    expect(screen?.getByText('Normal application content')).toBeInTheDocument();
    expect(screen?.queryByText(/Oops, something went wrong/i)).not?.toBeInTheDocument();
  });

  it('renders error UI when an error occurs', () => {
    render(
      <RootErrorBoundary>
        <ErrorComponent />
      </RootErrorBoundary>,
    );

    // Check error UI is rendered
    expect(screen?.getByText(/Oops, something went wrong/i)).toBeInTheDocument();
    expect(
      screen?.getByText(/We're sorry, but we encountered an unexpected error/i),
    ).toBeInTheDocument();
    expect(screen?.getByRole('button', { name: /Refresh page/i })).toBeInTheDocument();
    expect(screen?.getByRole('link', { name: /Go to homepage/i })).toBeInTheDocument();
  });

  it('logs error details to console', () => {
    render(
      <RootErrorBoundary>
        <ErrorComponent />
      </RootErrorBoundary>,
    );

    expect(console?.error).toHaveBeenCalledWith(
      'Application error caught by RootErrorBoundary:',
      expect?.any(Error),
    );
  });

  it('provides error details in development mode', () => {
    const originalNodeEnv = process?.env.NODE_ENV;
    process?.env.NODE_ENV = 'development';

    render(
      <RootErrorBoundary>
        <ErrorComponent />
      </RootErrorBoundary>,
    );

    expect(screen?.getByText(/Error details \(development only\)/i)).toBeInTheDocument();

    // Restore NODE_ENV
    process?.env.NODE_ENV = originalNodeEnv;
  });

  it("doesn't show error details in production mode", () => {
    const originalNodeEnv = process?.env.NODE_ENV;
    process?.env.NODE_ENV = 'production';

    render(
      <RootErrorBoundary>
        <ErrorComponent />
      </RootErrorBoundary>,
    );

    expect(screen?.queryByText(/Error details \(development only\)/i)).not?.toBeInTheDocument();

    // Restore NODE_ENV
    process?.env.NODE_ENV = originalNodeEnv;
  });

  it('calls handleReload when Refresh button is clicked', () => {
    // Mock location?.reload
    const { location } = window;
    delete window?.location;
    window?.location = { ...location, reload: jest?.fn() };

    render(
      <RootErrorBoundary>
        <ErrorComponent />
      </RootErrorBoundary>,
    );

    fireEvent?.click(screen?.getByRole('button', { name: /Refresh page/i }));

    // Check if reload was called
    expect(window?.location.reload).toHaveBeenCalled();

    // Restore original location
    window?.location = location;
  });

  it('matches error snapshot', () => {
    const { container } = render(
      <RootErrorBoundary>
        <ErrorComponent />
      </RootErrorBoundary>,
    );
    expect(container).toMatchSnapshot();
  });

  it('matches normal snapshot', () => {
    const { container } = render(
      <RootErrorBoundary>
        <div>Normal content</div>
      </RootErrorBoundary>,
    );
    expect(container).toMatchSnapshot();
  });
});
