import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowUpIcon, ArrowDownIcon, Users, Calendar, CreditCard, BarChart3 } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  change?: {
    value: string;
    type: 'increase' | 'decrease';
function MetricCard({ title, value, description, icon, change }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {change && (
          <div className="mt-2 flex items-center text-xs">
            {change.type === 'increase' ? (
              <ArrowUpIcon className="mr-1 h-3 w-3 text-green-500" />
            ) : (
              <ArrowDownIcon className="mr-1 h-3 w-3 text-red-500" />
            )}
            <span className={change.type === 'increase' ? 'text-green-500' : 'text-red-500'}>
              {change.value}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
export function Metrics() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Revenue"
        value="$45,231.89"
        description="Monthly revenue"
        icon={<CreditCard className="h-4 w-4" />}
        change={{
          value: '+20.1% from last month',
          type: 'increase',
/>
      <MetricCard
        title="Active Users"
        value="2,350"
        description="Active this month"
        icon={<Users className="h-4 w-4" />}
        change={{
          value: '+12.5% from last month',
          type: 'increase',
/>
      <MetricCard
        title="New Bookings"
        value="142"
        description="This week"
        icon={<Calendar className="h-4 w-4" />}
        change={{
          value: '-3.2% from last week',
          type: 'decrease',
/>
      <MetricCard
        title="Conversion Rate"
        value="3.2%"
        description="Visitor to booking"
        icon={<BarChart3 className="h-4 w-4" />}
        change={{
          value: '+1.1% from last month',
          type: 'increase',
/>
    </div>
