'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
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
      errorInfo: null
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
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
          <div className="w-full max-w-md p-6 rounded-lg shadow-lg bg-card border border-border">
            <div className="flex items-center justify-center mb-6 text-red-500">
              <Icons.XCircleIcon className="h-12 w-12" />
            </div>
            
            <h1 className="text-2xl font-bold text-foreground mb-2">Oops, something went wrong</h1>
            <p className="text-muted-foreground mb-6">
              We're sorry, but we encountered an unexpected error. Please try refreshing the page or go back to the homepage.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={this.handleReload}
                className="w-full py-2 px-4 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              >
                Refresh page
              </button>
              
              <Link
                href="/"
                onClick={this.handleGoHome}
                className="block w-full py-2 px-4 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-colors text-center"
              >
                Go to homepage
              </Link>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 p-3 border border-border rounded-md bg-muted">
                <summary className="cursor-pointer font-medium text-sm">
                  Error details (development only)
                </summary>
                <div className="mt-2">
                  <p className="text-red-600 font-mono text-sm mb-2">
                    {this.state.error?.toString()}
                  </p>
                  <pre className="whitespace-pre-wrap text-xs text-muted-foreground overflow-auto max-h-60 p-2 bg-card rounded">
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