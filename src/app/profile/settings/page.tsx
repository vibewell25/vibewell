'use client';

import { useState } from 'react';
import { Layout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  UserCircleIcon,
  BellIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  CameraIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Tabs for settings
type SettingsTab = 'profile' | 'notifications' | 'privacy' | 'security' | 'account';

export default function ProfileSettingsPage() {
  const { user, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    location: '',
    website: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Initialize form with user data when loaded
  useState(() => {
    if (user) {
      setFormData({
        fullName: user.user_metadata?.full_name || '',
        bio: user.user_metadata?.bio || '',
        location: user.user_metadata?.location || '',
        website: user.user_metadata?.website || '',
        email: user.email || '',
      });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call to update profile
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage('Profile updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }, 1000);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container-app py-12 flex justify-center items-center h-[60vh]">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container-app py-12 flex flex-col justify-center items-center h-[60vh]">
          <h1 className="text-2xl font-bold mb-4">Sign in to access settings</h1>
          <p className="text-muted-foreground mb-6">You need to be logged in to change your settings.</p>
          <a href="/auth/signin" className="btn-primary">Sign In</a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-app py-12">
        {/* Header with back button */}
        <div className="mb-8">
          <Link href="/profile" className="inline-flex items-center text-primary hover:text-primary-dark mb-4">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Profile
          </Link>
          <h1 className="text-3xl font-bold">Account Settings</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar navigation */}
          <div className="md:col-span-1">
            <div className="space-y-1 sticky top-20">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center space-x-2 p-3 rounded-md text-left ${
                  activeTab === 'profile' 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-muted'
                }`}
              >
                <UserCircleIcon className="h-5 w-5" />
                <span>Profile Information</span>
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center space-x-2 p-3 rounded-md text-left ${
                  activeTab === 'notifications' 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-muted'
                }`}
              >
                <BellIcon className="h-5 w-5" />
                <span>Notification Settings</span>
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`w-full flex items-center space-x-2 p-3 rounded-md text-left ${
                  activeTab === 'privacy' 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-muted'
                }`}
              >
                <ShieldCheckIcon className="h-5 w-5" />
                <span>Privacy</span>
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center space-x-2 p-3 rounded-md text-left ${
                  activeTab === 'security' 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-muted'
                }`}
              >
                <LockClosedIcon className="h-5 w-5" />
                <span>Security</span>
              </button>
              
              <div className="pt-4 mt-4 border-t border-border">
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center space-x-2 p-3 rounded-md text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <XMarkIcon className="h-5 w-5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="md:col-span-3">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="card">
                  <h2 className="text-xl font-bold mb-6">Profile Picture</h2>
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {user.user_metadata?.avatar_url ? (
                          <img 
                            src={user.user_metadata.avatar_url} 
                            alt={user.user_metadata?.full_name || 'Profile picture'} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserCircleIcon className="h-24 w-24 text-muted-foreground" />
                        )}
                      </div>
                      <button className="absolute bottom-0 right-0 bg-primary rounded-full p-2 text-white">
                        <CameraIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload a new profile picture. JPG, GIF or PNG. Max size of 800K.
                      </p>
                      <div className="flex space-x-2">
                        <button className="btn-primary text-sm">
                          Upload New Picture
                        </button>
                        <button className="text-sm text-red-600 hover:text-red-700 hover:underline">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h2 className="text-xl font-bold mb-6">Profile Information</h2>
                  
                  {successMessage && (
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 rounded-md">
                      {successMessage}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium mb-1">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Tell us about yourself"
                      />
                    </div>

                    <div>
                      <label htmlFor="location" className="block text-sm font-medium mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="City, Country"
                      />
                    </div>

                    <div>
                      <label htmlFor="website" className="block text-sm font-medium mb-1">
                        Website
                      </label>
                      <input
                        type="url"
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="https://example.com"
                      />
                    </div>

                    <div className="pt-4">
                      <button 
                        type="submit" 
                        className="btn-primary" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="card space-y-6">
                <h2 className="text-xl font-bold mb-6">Notification Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-muted-foreground">Receive email notifications about activity</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-muted-foreground peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <h3 className="font-medium">Push Notifications</h3>
                      <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-muted-foreground peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <h3 className="font-medium">Message Notifications</h3>
                      <p className="text-sm text-muted-foreground">Get notified when someone messages you</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-muted-foreground peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <h3 className="font-medium">Friend Requests</h3>
                      <p className="text-sm text-muted-foreground">Get notified about new friend requests</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-muted-foreground peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <h3 className="font-medium">Marketing Emails</h3>
                      <p className="text-sm text-muted-foreground">Receive updates about new features and offers</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-muted-foreground peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="pt-4">
                    <button className="btn-primary">
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="card space-y-6">
                <h2 className="text-xl font-bold mb-6">Privacy Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <h3 className="font-medium">Profile Visibility</h3>
                      <p className="text-sm text-muted-foreground">Control who can see your profile</p>
                    </div>
                    <select className="form-input min-w-[150px]">
                      <option value="public">Public</option>
                      <option value="friends">Friends Only</option>
                      <option value="private">Private</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <h3 className="font-medium">Activity Status</h3>
                      <p className="text-sm text-muted-foreground">Show when you're active on the platform</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-muted-foreground peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <h3 className="font-medium">Post Visibility</h3>
                      <p className="text-sm text-muted-foreground">Default visibility for your posts</p>
                    </div>
                    <select className="form-input min-w-[150px]">
                      <option value="public">Public</option>
                      <option value="friends">Friends Only</option>
                      <option value="private">Private</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <h3 className="font-medium">Data Sharing</h3>
                      <p className="text-sm text-muted-foreground">Share usage data to improve the platform</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-muted-foreground peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="pt-4">
                    <button className="btn-primary">
                      Save Privacy Settings
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="card">
                  <h2 className="text-xl font-bold mb-6">Password</h2>
                  
                  <form className="space-y-4">
                    <div>
                      <label htmlFor="current-password" className="block text-sm font-medium mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="current-password"
                        className="form-input"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="new-password" className="block text-sm font-medium mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="new-password"
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label htmlFor="confirm-password" className="block text-sm font-medium mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirm-password"
                        className="form-input"
                      />
                    </div>

                    <div className="pt-4">
                      <button type="submit" className="btn-primary">
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>

                <div className="card">
                  <h2 className="text-xl font-bold mb-6">Two-Factor Authentication</h2>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-medium">Enable 2FA</h3>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-muted-foreground peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  
                  <button className="btn-primary">
                    Set Up Two-Factor Authentication
                  </button>
                </div>

                <div className="card">
                  <h2 className="text-xl font-bold mb-6">Sessions</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-border">
                      <div>
                        <h3 className="font-medium">Current Session</h3>
                        <p className="text-sm text-muted-foreground">
                          Chrome on MacOS • San Francisco, CA
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Started: Today at 10:30 AM
                        </p>
                      </div>
                      <span className="text-sm bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                        Active Now
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-border">
                      <div>
                        <h3 className="font-medium">Safari on iPhone</h3>
                        <p className="text-sm text-muted-foreground">
                          San Francisco, CA
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last active: Yesterday at 8:15 PM
                        </p>
                      </div>
                      <button className="text-sm text-red-600 hover:text-red-700">
                        Sign Out
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-border">
                      <div>
                        <h3 className="font-medium">Firefox on Windows</h3>
                        <p className="text-sm text-muted-foreground">
                          New York, NY
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last active: July 15, 2023 at 3:42 PM
                        </p>
                      </div>
                      <button className="text-sm text-red-600 hover:text-red-700">
                        Sign Out
                      </button>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button className="text-red-600 hover:text-red-700 font-medium">
                      Sign Out of All Devices
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}