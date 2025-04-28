'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import Link from 'next/link';
import { Icons } from './icons';

interface RootErrorBoundaryProps {
  children: ReactNode;
}

interface RootErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * A Root Error Boundary component for wrapping the entire application.
 * This catches any errors that occur during rendering and provides a user-friendly error screen.
 */
export class RootErrorBoundary extends Component<RootErrorBoundaryProps, RootErrorBoundaryState> {
  constructor(props: RootErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<RootErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You could log the error to an error reporting service here
    console.error('Application error caught by RootErrorBoundary:', error);
    console.error('Component stack:', errorInfo.componentStack);

    this.setState({ errorInfo });

    // You could also send the error to your analytics or error tracking service
    // Example: sendErrorToAnalytics(error, errorInfo);
  }

  handleReload = (): void => {
    // Reset the error state and refresh the page
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = (): void => {
    // Reset the error state (navigation will happen via Next.js)
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
            <div className="mb-6 flex items-center justify-center text-red-500">
              <Icons.XCircleIcon className="h-12 w-12" />
            </div>

            <h1 className="mb-2 text-2xl font-bold text-foreground">Oops, something went wrong</h1>
            <p className="mb-6 text-muted-foreground">
              We're sorry, but we encountered an unexpected error. Please try refreshing the page or
              go back to the homepage.
            </p>

            <div className="space-y-4">
              <button
                onClick={this.handleReload}
                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded px-4 py-2 transition-colors"
              >
                Refresh page
              </button>

              <Link
                href="/"
                onClick={this.handleGoHome}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 block w-full rounded px-4 py-2 text-center transition-colors"
              >
                Go to homepage
              </Link>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 rounded-md border border-border bg-muted p-3">
                <summary className="cursor-pointer text-sm font-medium">
                  Error details (development only)
                </summary>
                <div className="mt-2">
                  <p className="mb-2 font-mono text-sm text-red-600">
                    {this.state.error?.toString()}
                  </p>
                  <pre className="max-h-60 overflow-auto whitespace-pre-wrap rounded bg-card p-2 text-xs text-muted-foreground">
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RootErrorBoundary;
