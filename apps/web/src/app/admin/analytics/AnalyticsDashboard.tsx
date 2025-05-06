import { Icons } from '@/components/icons';
import { StatCard } from './stat-card';
import { Overview } from './overview';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AnalyticsDashboard() {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
        <p className="text-muted-foreground">View insights and metrics from your application</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Users"
              value="2,543"
              description="Active users across the platform"
              icon={<Icons.user className="h-4 w-4" />}
              trend={{ value: 12.5, label: 'from last month', direction: 'up' }}
            />
            <StatCard
              title="Bookings"
              value="458"
              description="Total sessions booked this month"
              icon={<Icons.calendar className="h-4 w-4" />}
              trend={{ value: 8.2, label: 'from last month', direction: 'up' }}
              variant="primary"
            />
            <StatCard
              title="Messages"
              value="1,284"
              description="Total messages exchanged"
              icon={<Icons.message className="h-4 w-4" />}
              trend={{ value: 4.1, label: 'from last month', direction: 'up' }}
            />
            <StatCard
              title="Average Rating"
              value="4.8"
              description="From 245 reviews"
              icon={<Icons.star className="h-4 w-4" />}
              trend={{ value: 0.3, label: 'from last month', direction: 'up' }}
              variant="success"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>Revenue growth over the past 12 months</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {[1, 2, 3].map((i) => (
                    <div className="flex items-center" key={i}>
                      <div className="bg-primary/10 mr-4 rounded-full p-2">
                        <Icons.activity className="text-primary h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          New booking {i === 1 ? 'created' : i === 2 ? 'completed' : 'cancelled'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {i === 1 ? '10 minutes' : i === 2 ? '2 hours' : '5 hours'} ago
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
              <CardDescription>Detailed user metrics and demographics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                User analytics content will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Reports</CardTitle>
              <CardDescription>Detailed activity and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Activity reports content will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
