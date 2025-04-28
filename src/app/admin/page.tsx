'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/unified-auth-context';
import { analytics } from '@/utils/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useDeviceType } from '@/utils/responsive';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  subscription?: {
    status: string;
    plan: string;
    validUntil: string;
  };
}

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const deviceType = useDeviceType();
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin()) {
      window.location.href = '/';
      return;
    }

    fetchUsers();
    analytics.trackPageView('/admin');
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      analytics.trackError(error as Error);
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'suspend' | 'activate' | 'delete') => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchUsers();
        analytics.trackEvent({
          name: `user_${action}d`,
          properties: { userId },
          category: 'user',
        });
      }
    } catch (error) {
      analytics.trackError(error as Error);
      console.error(`Error ${action}ing user:`, error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="flex flex-col md:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Button
                className="flex h-32 items-center justify-center text-lg"
                onClick={() => router.push('/admin/analytics')}
              >
                <Icons.activity className="mr-2 h-6 w-6" />
                Analytics Dashboard
              </Button>
              <Button
                className="flex h-32 items-center justify-center text-lg"
                variant="outline"
                onClick={() => router.push('/admin/users')}
              >
                <Icons.user className="mr-2 h-6 w-6" />
                User Management
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Total Users: {users.length}</p>
              <p>Active Users: {users.filter((u) => u.subscription?.status === 'active').length}</p>
              <p>Premium Users: {users.filter((u) => u.subscription?.plan === 'premium').length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                New Users (24h):{' '}
                {
                  users.filter((u) => {
                    const created = new Date(u.createdAt);
                    const now = new Date();
                    return now.getTime() - created.getTime() < 24 * 60 * 60 * 1000;
                  }).length
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-semibold">User Management</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Role</th>
                <th className="p-4 text-left">Subscription</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="p-4">{user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">{user.role}</td>
                  <td className="p-4">
                    {user.subscription ? (
                      <span
                        className={`rounded px-2 py-1 ${
                          user.subscription.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.subscription.plan} - {user.subscription.status}
                      </span>
                    ) : (
                      'No subscription'
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size={deviceType === 'mobile' ? 'sm' : 'md'}
                        onClick={() =>
                          handleUserAction(
                            user.id,
                            user.subscription?.status === 'active' ? 'suspend' : 'activate',
                          )
                        }
                      >
                        {user.subscription?.status === 'active' ? 'Suspend' : 'Activate'}
                      </Button>
                      <Button
                        variant="destructive"
                        size={deviceType === 'mobile' ? 'sm' : 'md'}
                        onClick={() => handleUserAction(user.id, 'delete')}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
