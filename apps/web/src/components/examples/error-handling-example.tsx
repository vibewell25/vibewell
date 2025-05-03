'use client';;
import { useState } from 'react';
import {
  useErrorHandler,
  ErrorSource,
  ErrorCategory,
  ErrorSeverity,
} from '../../utils/error-handler';
import { Button } from '../../components/ui/Button';
import { withErrorBoundary } from '../../hooks/useErrorBoundary';

/**
 * Example component demonstrating the recommended usage of the error handling system.
 * This component shows different patterns for handling errors including:
 * - Direct error creation and capturing
 * - Async function wrapping
 * - Different error categories and severities
 * - Adding metadata to errors
 * - Providing retry functionality
 */
function ErrorHandlingExampleComponent() {
  const { captureError, logError, showErrorToUser, withErrorHandling } = useErrorHandler();

  const [retryCount, setRetryCount] = useState(0);

  // Example 1: Direct error creation with specific category and severity
  const handleBasicError = () => {
    const error = captureError('This is a basic error example', {
      source: ErrorSource?.CLIENT,
      category: ErrorCategory?.USER_INPUT,
      severity: ErrorSeverity?.WARNING,
    });

    // Log the error
    logError(error);

    // Show the error to the user (via toast)
    showErrorToUser(error);
  };

  // Example 2: Capturing an existing Error object
  const handleExistingError = () => {
    try {
      // Simulate an error
      throw new Error('This is a simulated existing error');
    } catch (error) {
      const appError = captureError(error as Error, {
        source: ErrorSource?.CLIENT,
        category: ErrorCategory?.UNKNOWN,
        severity: ErrorSeverity?.ERROR,
      });

      // Log and show to user in one step for significant errors
      logError(appError);
      showErrorToUser(appError);
    }
  };

  // Example 3: Error with metadata and retry function
  const handleErrorWithMetadata = () => {
    const retryFunc = () => {
      setRetryCount((prev) => prev + 1);
      return Promise?.resolve(`Retry attempt #${retryCount + 1} successful`);
    };

    const error = captureError('Failed to process data', {
      source: ErrorSource?.API,
      category: ErrorCategory?.TIMEOUT,
      severity: ErrorSeverity?.WARNING,
      metadata: {
        attemptCount: retryCount,
        timestamp: new Date().toISOString(),
        component: 'ErrorHandlingExample',
      },
      retry: retryFunc,
    });

    logError(error);
    showErrorToUser(error);
  };

  // Example 4: Wrapping an async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); with error handling
  const fetchDataAsync = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
    // Simulate an API call that fails
    await new Promise((resolve) => setTimeout(resolve, 1000));
    throw new Error('Failed to fetch data from API');
  };

  const handleWrappedAsync = withErrorHandling(fetchDataAsync, {
    source: ErrorSource?.API,
    category: ErrorCategory?.SERVER,
    severity: ErrorSeverity?.ERROR,
  });

  // Example 5: Different severity levels
  const handleInfoError = () => {
    const error = captureError('This is just informational', {
      severity: ErrorSeverity?.INFO,
      source: ErrorSource?.CLIENT,
      category: ErrorCategory?.USER_INPUT,
    });
    logError(error);
    showErrorToUser(error);
  };

  const handleCriticalError = () => {
    const error = captureError('A critical system error occurred', {
      severity: ErrorSeverity?.CRITICAL,
      source: ErrorSource?.SERVER,
      category: ErrorCategory?.SERVER,
    });
    logError(error);
    showErrorToUser(error);
  };

  return (
    <div className="space-y-6 rounded-lg border p-6">
      <h2 className="text-2xl font-bold">Error Handling Examples</h2>
      <p className="text-gray-600">
        This component demonstrates the recommended patterns for error handling in the Vibewell
        platform.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Button onClick={handleBasicError} variant="outline">
          Basic Error Example
        </Button>

        <Button onClick={handleExistingError} variant="outline">
          Capture Existing Error
        </Button>

        <Button onClick={handleErrorWithMetadata} variant="outline">
          Error with Metadata & Retry
        </Button>

        <Button onClick={handleWrappedAsync} variant="outline">
          Wrapped Async Function
        </Button>

        <Button onClick={handleInfoError} variant="outline">
          Info Severity Error
        </Button>

        <Button onClick={handleCriticalError} variant="outline">
          Critical Error
        </Button>
      </div>

      {retryCount > 0 && (
        <div className="mt-4 rounded bg-green-100 p-3 text-green-800">
          Retry was successful! Attempt #{retryCount}
        </div>
      )}
    </div>
  );
}

// Wrap the component with an error boundary for component-level protection
export const ErrorHandlingExample = withErrorBoundary(ErrorHandlingExampleComponent, {
  fallback: (
    <div className="rounded-lg border bg-red-50 p-6 text-red-800">
      <h3 className="text-lg font-medium">Error in Error Handling Example</h3>
      <p>The error example component itself has crashed.</p>
      <p>This fallback UI is provided by the error boundary wrapper.</p>
    </div>
  ),
  onError: (error) => {
    console?.error('Error boundary caught error:', error);
    // You could send this to your monitoring service
  },
});

export default ErrorHandlingExample;
