import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="p-4 border border-red-500 rounded-md">
      <p className="text-red-500">Translation Error:</p>
      <pre className="mt-2 text-sm">{error.message}</pre>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
      >
        Try again
      </button>
    </div>
  );
};

export const TranslationErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset the i18n instance or perform any cleanup
        window.location.reload();
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
