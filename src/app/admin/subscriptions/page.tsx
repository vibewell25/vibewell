import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/ui/data-table';
import { useSubscriptions, Subscription } from '@/hooks/use-subscriptions';
import { useAuth } from '@/hooks/use-unified-auth';
import { trackEvent } from '@/lib/monitoring/analytics';
import { formatCurrency } from '@/lib/utils';

const columns: Column[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'customerName', header: 'Customer' },
  { accessorKey: 'plan', header: 'Plan' },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row: { original } }: { row: { original: Subscription } }) =>
      formatCurrency(original.amount),
  },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'nextBillingDate', header: 'Next Billing' },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row: { original } }: { row: { original: Subscription } }) => (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => handleManage(original)}>
          Manage
        </Button>
        <Button variant="destructive" size="sm" onClick={() => handleCancel(original)}>
          Cancel
        </Button>
      </div>
    ),
  },
];

export default function SubscriptionManagement() {
  const { subscriptions, isLoading, error } = useSubscriptions();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = React.useState<string | null>(null);

  // Track page view
  React.useEffect(() => {
    trackEvent('subscription_management_view');
  }, []);

  if (!user?.isAdmin) {
    return <div>Access denied. Admin privileges required.</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const subscriptionStats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'active').length,
    cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
    revenue: subscriptions
      .filter(s => s.status === 'active')
      .reduce((acc, curr) => acc + curr.amount, 0),
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Subscription Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Subscriptions</h3>
          <p className="text-3xl">{subscriptionStats.total}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Active Subscriptions</h3>
          <p className="text-3xl">{subscriptionStats.active}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Cancelled</h3>
          <p className="text-3xl">{subscriptionStats.cancelled}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Monthly Revenue</h3>
          <p className="text-3xl">{formatCurrency(subscriptionStats.revenue)}</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Subscriptions</h2>
          <Button onClick={() => handleCreateSubscription()}>Create Subscription</Button>
        </div>

        <DataTable columns={columns} data={subscriptions} pagination sorting filtering />
      </Card>
    </div>
  );
}

// Handler functions
const handleManage = (subscription: Subscription) => {
  trackEvent('subscription_manage', { subscriptionId: subscription.id });
  // Implement subscription management functionality
};

const handleCancel = async (subscription: Subscription) => {
  trackEvent('subscription_cancel', { subscriptionId: subscription.id });
  // Implement subscription cancellation functionality
};

const handleCreateSubscription = () => {
  trackEvent('subscription_create');
  // Implement subscription creation functionality
};
