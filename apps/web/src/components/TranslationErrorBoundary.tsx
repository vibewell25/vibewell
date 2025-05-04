import React, { ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="rounded-md border border-red-500 p-4">
      <p className="text-red-500">Translation Error:</p>
      <pre className="mt-2 text-sm">{error.message}</pre>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 rounded-md bg-primary-500 px-4 py-2 text-white hover:bg-primary-600"
      >
        Try again
      </button>
    </div>
  );
};

export function TranslationErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}
