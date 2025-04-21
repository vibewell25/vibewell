'use client';

import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function Unauthorized() {
  const { user } = useUser();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            <p className="text-gray-700">
              This page requires additional permissions. If you believe you should have access,
              please contact your administrator.
            </p>

            {user ? (
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-600">
                  You are currently logged in as <span className="font-medium">{user.email}</span>
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 p-4 rounded-md">
                <p className="text-sm text-yellow-800">
                  You are not currently logged in. Try logging in with an account that has the
                  required permissions.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go to Dashboard
          </Link>

          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
