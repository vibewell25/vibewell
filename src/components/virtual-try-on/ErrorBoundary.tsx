import { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Virtual try-on error', 'ErrorBoundary', {
      error: error.message,
      stack: errorInfo.componentStack,
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center rounded-lg bg-red-50 p-8">
            <div className="mb-4 text-lg font-semibold text-red-600">
              {this.state.error?.message || 'Something went wrong'}
            </div>
            <div className="mb-6 text-gray-600">
              {this.state.error instanceof Error &&
              this.state.error.name === 'NotSupportedError' ? (
                <>
                  Your browser doesn't support some required features. Please try using a modern
                  browser like Chrome, Firefox, or Safari.
                </>
              ) : (
                'We encountered an unexpected error. Please try again.'
              )}
            </div>
            <button
              onClick={this.handleRetry}
              className="rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
