'use client';

import { useState } from 'react';
import { WebAuthnButton } from '@/components/WebAuthnButton';

export default function WebAuthnDemo() {
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  // In a real application, these would come from your authentication system
  const mockUserId = process.env['MOCKUSERID'];
  const mockUsername = 'test.user@example.com';

  const handleSuccess = () => {
    setStatus('Operation completed successfully!');
    setError('');
  };

  const handleError = (error: Error) => {
    setStatus('');
    setError(error.message);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">WebAuthn Demo</h2>
          <p className="mt-2 text-sm text-gray-600">
            Test WebAuthn registration and authentication
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <WebAuthnButton
                mode="register"
                userId={mockUserId}
                username={mockUsername}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </div>
            <div>
              <WebAuthnButton
                mode="authenticate"
                userId={mockUserId}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </div>
          </div>

          {status && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{status}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
