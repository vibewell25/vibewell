'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { user, isLoading, error } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!isLoading && !user) {
      router.push('/api/auth/login?returnTo=/dashboard');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
        <p className="mt-2 text-gray-600">An error occurred during authentication.</p>
        <div className="mt-4">
          <Link
            href="/api/auth/login?returnTo=/dashboard"
            className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700"
          >
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // The useEffect will handle the redirect
  }

  // Get user roles if available
  const namespace = process.env.NEXT_PUBLIC_AUTH0_NAMESPACE || 'https://vibewell.com';
  const userRoles = user[`${namespace}/roles`] || [];
  const isAdmin = userRoles.includes('admin');
  const isProvider = userRoles.includes('provider');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-4">
            {user.picture && (
              <img
                src={user.picture}
                alt={user.name || 'User'}
                className="h-16 w-16 rounded-full"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">Welcome, {user.name || 'User'}!</h1>
              <p className="text-gray-600">{user.email}</p>
              {userRoles.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {userRoles.map(role => (
                    <span
                      key={role}
                      className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-indigo-800">My Profile</h2>
              <p className="mt-2 text-gray-600">View and edit your profile information.</p>
              <Link
                href="/profile"
                className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Go to Profile
              </Link>
            </div>

            {isProvider && (
              <div className="bg-emerald-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-emerald-800">Provider Dashboard</h2>
                <p className="mt-2 text-gray-600">Manage your services and bookings.</p>
                <Link
                  href="/provider/dashboard"
                  className="mt-4 inline-block px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                >
                  Provider Dashboard
                </Link>
              </div>
            )}

            {isAdmin && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-purple-800">Admin Dashboard</h2>
                <p className="mt-2 text-gray-600">Manage users, services, and platform settings.</p>
                <Link
                  href="/admin/dashboard"
                  className="mt-4 inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Admin Dashboard
                </Link>
              </div>
            )}

            <div className="bg-amber-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-amber-800">Explore Services</h2>
              <p className="mt-2 text-gray-600">Browse and book wellness services.</p>
              <Link
                href="/services"
                className="mt-4 inline-block px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
              >
                Browse Services
              </Link>
            </div>
          </div>

          <div className="mt-8 border-t pt-6">
            <Link href="/api/auth/logout" className="text-red-600 hover:text-red-800">
              Sign Out
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
