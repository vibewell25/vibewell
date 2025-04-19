import React from 'react';
import Link from 'next/link';

export default function UnauthorizedAccess() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Unauthorized Access
        </h1>
        <p className="text-gray-600 mb-8">
          You don't have permission to access this resource. Please contact your administrator
          if you believe this is an error.
        </p>
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
          >
            Return to Home
          </Link>
          <Link
            href="/auth/login"
            className="inline-block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
          >
            Login with Different Account
          </Link>
        </div>
      </div>
    </div>
  );
} 