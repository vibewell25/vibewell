'use client';

import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function Unauthorized() {
  const { user } = useUser();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-10 shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md shadow-sm">
            <p className="text-gray-700">
              This page requires additional permissions. If you believe you should have access,
              please contact your administrator.
            </p>

            {user ? (
              <div className="rounded-md bg-gray-50 p-4">
                <p className="text-sm text-gray-600">
                  You are currently logged in as <span className="font-medium">{user.email}</span>
                </p>
              </div>
            ) : (
              <div className="rounded-md bg-yellow-50 p-4">
                <p className="text-sm text-yellow-800">
                  You are not currently logged in. Try logging in with an account that has the
                  required permissions.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Go to Dashboard
          </Link>

          <Link
            href="/"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
