'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import LoadingSpinner from '../../../src/components/common/LoadingSpinner';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'info' | 'preferences' | 'payment'>('info');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert('You have been logged out');
      window.location.href = '/';
    }, 1000);
  };

  return (
    <div className="app-container">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="app-heading">Profile</h1>
        <button className="app-icon-button">
          <span className="text-xl">⚙️</span>
        </button>
      </div>

      {/* Profile header */}
      <div className="mb-6 flex items-center">
        <div className="relative mr-4 h-20 w-20 overflow-hidden rounded-full border-4 border-primary-500 bg-muted">
          <Image
            src="/images/avatar-placeholder.jpg"
            alt="Profile"
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Alex Johnson</h2>
          <p className="text-sm text-muted-foreground">alex.j@example.com</p>
          <p className="text-sm text-primary-600">Member since: May 2023</p>
          <div className="mt-1 flex items-center">
            <span className="text-xs text-muted-foreground">⭐ Premium Member</span>
          </div>
        </div>
      </div>

      {/* Profile tabs */}
      <div className="mb-6 border-b border-border">
        <div className="flex">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-4 text-sm font-medium ${
              activeTab === 'info'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-muted-foreground'
            }`}
          >
            Personal Info
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-3 px-4 text-sm font-medium ${
              activeTab === 'preferences'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-muted-foreground'
            }`}
          >
            Preferences
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`py-3 px-4 text-sm font-medium ${
              activeTab === 'payment'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-muted-foreground'
            }`}
          >
            Payment
          </button>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'info' && (
        <div className="space-y-6">
          <div className="app-card">
            <h3 className="app-subheading mb-4">Personal Information</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">
                  Full Name
                </label>
                <p className="text-foreground">Alex Johnson</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <p className="text-foreground">alex.j@example.com</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">
                  Phone
                </label>
                <p className="text-foreground">(555) 123-4567</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">
                  Date of Birth
                </label>
                <p className="text-foreground">January 15, 1990</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">
                  Address
                </label>
                <p className="text-foreground">
                  123 Main St, Apt 4B<br />
                  San Francisco, CA 94105
                </p>
              </div>
            </div>
            <div className="mt-6">
              <button className="app-button-secondary w-full">Edit Information</button>
            </div>
          </div>

          <div className="app-card">
            <h3 className="app-subheading mb-4">Wellness Goals</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="mr-3 h-2 w-2 rounded-full bg-primary-600"></div>
                <p className="text-foreground">Reduce stress and anxiety</p>
              </div>
              <div className="flex items-center">
                <div className="mr-3 h-2 w-2 rounded-full bg-primary-600"></div>
                <p className="text-foreground">Improve sleep quality</p>
              </div>
              <div className="flex items-center">
                <div className="mr-3 h-2 w-2 rounded-full bg-primary-600"></div>
                <p className="text-foreground">Maintain regular self-care routine</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="app-card">
            <h3 className="app-subheading mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-foreground">App Notifications</span>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-200">
                  <span className="absolute right-1 h-4 w-4 rounded-full bg-primary-600 transition"></span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground">Email Notifications</span>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-200">
                  <span className="absolute right-1 h-4 w-4 rounded-full bg-primary-600 transition"></span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground">SMS Notifications</span>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted">
                  <span className="absolute left-1 h-4 w-4 rounded-full bg-muted-foreground transition"></span>
                </div>
              </div>
            </div>
          </div>

          <div className="app-card">
            <h3 className="app-subheading mb-4">Appointment Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">
                  Preferred Service Type
                </label>
                <p className="text-foreground">Massage, Facial</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">
                  Preferred Providers
                </label>
                <p className="text-foreground">Sarah Johnson, Michael Chen</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">
                  Preferred Days
                </label>
                <p className="text-foreground">Weekends, Friday evenings</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payment' && (
        <div className="space-y-6">
          <div className="app-card">
            <h3 className="app-subheading mb-4">Payment Methods</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="mr-3 h-8 w-12 rounded bg-muted flex items-center justify-center text-xs font-medium">
                  VISA
                </div>
                <div>
                  <p className="text-foreground">•••• •••• •••• 4567</p>
                  <p className="text-xs text-muted-foreground">Expires 05/25</p>
                </div>
                <div className="ml-auto">
                  <span className="rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-800">
                    Default
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <div className="mr-3 h-8 w-12 rounded bg-muted flex items-center justify-center text-xs font-medium">
                  MC
                </div>
                <div>
                  <p className="text-foreground">•••• •••• •••• 8901</p>
                  <p className="text-xs text-muted-foreground">Expires 11/24</p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button className="app-button-secondary w-full">Add Payment Method</button>
            </div>
          </div>

          <div className="app-card">
            <h3 className="app-subheading mb-4">Membership</h3>
            <div className="rounded-lg bg-primary-50 p-4">
              <div className="mb-2 flex items-center">
                <span className="text-lg font-semibold text-primary-800">Premium Membership</span>
                <span className="ml-auto rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-800">
                  Active
                </span>
              </div>
              <p className="mb-2 text-sm text-primary-700">
                Your membership renews on June 15, 2023
              </p>
              <div className="mt-4">
                <button className="w-full rounded-lg border border-primary-600 px-4 py-2 text-sm font-medium text-primary-600">
                  Manage Membership
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout button */}
      <div className="mt-6">
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="app-button-secondary w-full border-red-300 text-red-500 hover:bg-red-50"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <LoadingSpinner size="sm" className="mr-2" />
              <span>Logging out...</span>
            </div>
          ) : (
            'Logout'
          )}
        </button>
      </div>
    </div>
  );
} 