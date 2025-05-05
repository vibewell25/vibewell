import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/data-table';
import { useSubscriptions, Subscription } from '@/hooks/use-subscriptions';
import { useAuth } from '@/hooks/useAuth';
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
];

export default function SubscriptionManagement() {
  const { subscriptions, isLoading, error } = useSubscriptions();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = React.useState<string | null>(null);

  // Track page view
  React.useEffect(() => {
    trackEvent('subscription_management_view');
[]);

  if (!user.isAdmin) {
    return <div>Access denied. Admin privileges required.</div>;
if (isLoading) {
    return <div>Loading...</div>;
if (error) {
    return <div>Error: {error.message}</div>;
const subscriptionStats = {
    total: subscriptions.length,
    active: subscriptions.filter((s) => s.status === 'active').length,
    cancelled: subscriptions.filter((s) => s.status === 'cancelled').length,
    revenue: subscriptions
      .filter((s) => s.status === 'active')
      .reduce((acc, curr) => acc + curr.amount, 0),
return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Subscription Management</h1>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="p-6">
          <h3 className="mb-2 text-lg font-semibold">Total Subscriptions</h3>
          <p className="text-3xl">{subscriptionStats.total}</p>
        </Card>
        <Card className="p-6">
          <h3 className="mb-2 text-lg font-semibold">Active Subscriptions</h3>
          <p className="text-3xl">{subscriptionStats.active}</p>
        </Card>
        <Card className="p-6">
          <h3 className="mb-2 text-lg font-semibold">Cancelled</h3>
          <p className="text-3xl">{subscriptionStats.cancelled}</p>
        </Card>
        <Card className="p-6">
          <h3 className="mb-2 text-lg font-semibold">Monthly Revenue</h3>
          <p className="text-3xl">{formatCurrency(subscriptionStats.revenue)}</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Subscriptions</h2>
          <Button onClick={() => handleCreateSubscription()}>Create Subscription</Button>
        </div>

        <DataTable columns={columns} data={subscriptions} pagination sorting filtering />
      </Card>
    </div>
// Handler functions
const handleManage = (subscription: Subscription) => {
  trackEvent('subscription_manage', { subscriptionId: subscription.id });
  // Implement subscription management functionality
const handleCancel = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');subscription: Subscription) => {
  trackEvent('subscription_cancel', { subscriptionId: subscription.id });
  // Implement subscription cancellation functionality
const handleCreateSubscription = () => {
  trackEvent('subscription_create');
  // Implement subscription creation functionality
