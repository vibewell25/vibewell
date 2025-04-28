'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-unified-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

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
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 rounded-lg bg-white p-8 shadow dark:bg-gray-800">
        <h1 className="text-center text-2xl font-bold">Processing Login</h1>

        {loading ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-b-blue-500 border-t-blue-500"></div>
            <p className="text-center text-gray-600 dark:text-gray-300">
              We're completing your sign-in. This should only take a moment...
            </p>
          </div>
        ) : user ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <svg
                className="h-8 w-8 text-green-500"
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
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <svg
                className="h-8 w-8 text-red-500"
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
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Return to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
