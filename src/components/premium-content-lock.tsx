'use client';

import { Icons } from '@/components/icons';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

interface PremiumContentLockProps {
  children: React.ReactNode;
  resourceName?: string;
  resourceType?: string;
  redirectPath?: string;
}

export function PremiumContentLock({
  children,
  resourceName = 'content',
  resourceType = 'resource',
  redirectPath = '/pricing',
}: PremiumContentLockProps) {
  const { user, loading } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  // Mock premium check function - in a real app, this would call an API
  const checkPremiumStatus = async () => {
    setCheckingSubscription(true);
    // Simulate API call to check subscription status
    const mockApiCall = new Promise<boolean>((resolve) => {
      setTimeout(() => {
        // For demo purposes, assume user with email containing "premium" has a subscription
        const hasPremium = user?.email?.includes('premium') || false;
        resolve(hasPremium);
      }, 800);
    });
    const status = await mockApiCall;
    setIsPremium(status);
    setCheckingSubscription(false);
    // Track usage analytics
    if (status) {
      trackResourceAccess(resourceName, resourceType);
    }
    return status;
  };
  // Track premium resource access for analytics
  const trackResourceAccess = (name: string, type: string) => {
    // In a real app, this would send analytics data to your backend
    if (typeof window !== 'undefined') {
      // Simple localStorage usage tracking
      const now = new Date().toISOString();
      const key = `resource_access_${name.replace(/\s+/g, '_')}`;
      try {
        const accessData = JSON.parse(localStorage.getItem('resource_access_log') || '{}');
        accessData[key] = { 
          name, 
          type, 
          lastAccessed: now,
          count: (accessData[key]?.count || 0) + 1
        };
        localStorage.setItem('resource_access_log', JSON.stringify(accessData));
      } catch (e) {
        console.error('Failed to track resource access', e);
      }
    }
  };
  // Call the premium check when auth is completed
  if (!loading && user && checkingSubscription) {
    checkPremiumStatus();
  }
  // If still loading auth or subscription check, show loading state
  if (loading || (user && checkingSubscription)) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-8 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <Icons.SparklesIcon className="h-12 w-12 text-amber-500 mb-4" />
          <p className="text-amber-800">Checking subscription status...</p>
        </div>
      </div>
    );
  }
  // If user has a premium subscription, show the content
  if (user && isPremium) {
    return <>{children}</>;
  }
  // If user is authenticated but doesn't have premium
  if (user && !isPremium) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-8">
        <div className="flex flex-col items-center text-center">
          <Icons.LockClosedIcon className="h-12 w-12 text-amber-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">Premium {resourceType} Locked</h3>
          <p className="mb-6 text-amber-800">
            This {resourceType} requires a premium subscription to access.
          </p>
          <div className="space-y-3">
            <Link href={redirectPath}>
              <Button className="bg-amber-600 hover:bg-amber-700">
                Upgrade to Premium
              </Button>
            </Link>
            <p className="text-sm text-amber-700">
              Starting at $19.99/month - Unlock all premium resources
            </p>
          </div>
        </div>
      </div>
    );
  }
  // If user is not authenticated
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-8">
      <div className="flex flex-col items-center text-center">
        <Icons.LockClosedIcon className="h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Premium {resourceType} Locked</h3>
        <p className="mb-6 text-amber-800">
          Please sign in to access this premium {resourceType}.
        </p>
        <div className="space-y-3">
          <Link href="/auth/sign-in">
            <Button className="bg-amber-600 hover:bg-amber-700">
              Sign In
            </Button>
          </Link>
          <p className="text-sm text-amber-700">
            Don't have an account? <Link href="/auth/sign-up" className="text-amber-800 underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
} 