import { Suspense } from 'react';
import { withPageAuthRequired } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DataTable } from '@/components/admin/DataTable';
import { UserList } from '@/components/admin/UserList';
import { SubscriptionStats } from '@/components/admin/SubscriptionStats';
import { AdminMetrics } from '@/components/admin/AdminMetrics';

export const metadata = {
  title: 'Admin Dashboard | Vibewell',
  description: 'Manage users, subscriptions, and view analytics',
};

async function getAdminData() {
  const [users, subscriptions, metrics] = await Promise.all([
    prisma.user.findMany({
      include: {
        subscriptions: true,
        bookings: true,
      },
    }),
    prisma.subscription.findMany({
      include: {
        user: true,
      },
    }),
    prisma.metrics.findFirst({
      orderBy: {
        createdAt: 'desc',
      },
    }),
  ]);

  return {
    users,
    subscriptions,
    metrics,
  };
}

export default withPageAuthRequired(async function AdminDashboard() {
  const data = await getAdminData();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Suspense fallback={<div>Loading metrics...</div>}>
          <AdminMetrics metrics={data.metrics} />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <Suspense fallback={<div>Loading users...</div>}>
            <UserList users={data.users} />
          </Suspense>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Subscription Overview</h2>
          <Suspense fallback={<div>Loading subscriptions...</div>}>
            <SubscriptionStats subscriptions={data.subscriptions} />
          </Suspense>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Detailed User Data</h2>
        <Suspense fallback={<div>Loading table...</div>}>
          <DataTable data={data.users} />
        </Suspense>
      </div>
    </div>
  );
}); 