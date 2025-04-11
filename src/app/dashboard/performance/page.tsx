'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { PerformanceDashboard } from '@/components/performance/PerformanceDashboard';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function PerformancePage() {
  const { user, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      try {
        // Check if user is admin
        const response = await fetch('/api/users/currentRole');
        const { role } = await response.json();
        
        if (role !== 'admin') {
          setIsAuthorized(false);
        } else {
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setIsAuthorized(false);
      }
    };

    if (!loading) {
      checkAuth();
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Layout>
        <div className="container-app py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthorized) {
    return (
      <Layout>
        <div className="container-app py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to access the performance dashboard.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-app py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Performance Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor application performance metrics and receive alerts when thresholds are exceeded.
          </p>
        </div>
        
        <PerformanceDashboard />
      </div>
    </Layout>
  );
} 