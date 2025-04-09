'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface Props {
  children: ReactNode;
  onError?: (error: Error) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ModelErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Model loading error:', error, errorInfo);
    this.props.onError?.(error);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Model Loading Failed</h2>
            <p className="text-gray-500">
              We couldn't load the 3D model. This might be due to:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-500">
              <li>Poor internet connection</li>
              <li>Browser compatibility issues</li>
              <li>Model file corruption</li>
            </ul>
            <div className="space-y-2">
              <Button onClick={this.handleRetry}>Try Again</Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-4 p-4 bg-red-50 rounded-md">
                <p className="text-sm text-red-500">
                  Error details: {this.state.error.message}
                </p>
              </div>
            )}
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
} 