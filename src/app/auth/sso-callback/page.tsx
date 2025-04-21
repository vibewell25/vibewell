'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-unified-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function SSOCallbackPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirect to dashboard after successful login
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-center">Processing Login</h1>

        {loading ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
            <p className="text-center text-gray-600 dark:text-gray-300">
              We're completing your sign-in. This should only take a moment...
            </p>
          </div>
        ) : user ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 flex items-center justify-center bg-green-100 rounded-full dark:bg-green-900">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-center text-gray-600 dark:text-gray-300">
              Sign in successful! Redirecting to your dashboard...
            </p>
            <Button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 flex items-center justify-center bg-red-100 rounded-full dark:bg-red-900">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="text-center text-gray-600 dark:text-gray-300">
              There was a problem with your sign-in. Please try again.
            </p>
            <Button
              onClick={() => router.push('/auth/login')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Return to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
