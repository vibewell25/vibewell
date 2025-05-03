'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-unified-auth';
import { NotificationList } from '@/components/notifications/NotificationList';
import { Layout } from '@/components/layout';
import { Toaster } from 'react-hot-toast';

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router?.push('/auth/signin');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <Layout>
      <div className="container-app py-12">
        <Toaster position="top-right" />
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with your wellness journey</p>
        </div>
        <NotificationList />
      </div>
    </Layout>
  );
}
