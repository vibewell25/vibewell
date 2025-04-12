import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Role, Permission, hasPermission } from '@/lib/auth/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
  requiredPermission?: Permission;
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission,
  fallbackPath = '/',
}) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAuthorized, setIsAuthorized] = React.useState(false);

  React.useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    const userRole = session.user?.role as Role;
    
    if (requiredRole && userRole !== requiredRole) {
      router.push(fallbackPath);
      return;
    }

    if (requiredPermission && !hasPermission(userRole, requiredPermission)) {
      router.push(fallbackPath);
      return;
    }

    setIsAuthorized(true);
  }, [session, status, requiredRole, requiredPermission, router, fallbackPath]);

  if (status === 'loading' || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}; 