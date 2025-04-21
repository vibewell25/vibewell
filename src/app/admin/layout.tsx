'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-unified-auth';
import { Sidebar } from '@/components/admin/sidebar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { user, isLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (!isLoading && !isAdmin) {
      router.push('/');
    }
  }, [isLoading, user, isAdmin, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <div className="w-64 border-r">
          <Skeleton className="h-full" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>You do not have permission to access this area.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
