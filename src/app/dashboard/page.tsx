'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { UpcomingAppointments } from '@/components/dashboard/UpcomingAppointments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ChartBarIcon, ClockIcon, BellIcon, TargetIcon, HeartIcon, BoltIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WellnessProgress {
  totalContent: number;
  completedContent: number;
  percentage: number;
  goals: Array<{
    id: string;
    title: string;
    target: number;
    current: number;
    unit: string;
  }>;
}

interface HealthMetrics {
  heartRate: number;
  steps: number;
  sleepHours: number;
  stressLevel: number;
  history: Array<{
    date: string;
    heartRate: number;
    steps: number;
    sleepHours: number;
    stressLevel: number;
  }>;
}

interface Recommendation {
  id: string;
  type: 'content' | 'service' | 'product';
  title: string;
  description: string;
  imageUrl: string;
  relevance: number;
}

interface DashboardData {
  wellnessProgress: WellnessProgress;
  healthMetrics: HealthMetrics;
  activities: Array<{
    id: string;
    type: 'content' | 'booking' | 'purchase' | 'review';
    title: string;
    description: string;
    date: string;
  }>;
  upcomingAppointments: Array<{
    id: string;
    service: string;
    provider: string;
    date: string;
    time: string;
  }>;
  recommendations: Recommendation[];
  notifications: Array<{
    id: string;
    type: 'appointment' | 'achievement' | 'reminder' | 'update';
    title: string;
    message: string;
    date: string;
    read: boolean;
  }>;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [loading, user, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        setError(null);
        const [
          wellnessProgress,
          healthMetrics,
          activities,
          appointments,
          recommendations,
          notifications
        ] = await Promise.all([
          fetch('/api/wellness/progress').then(res => res.json()),
          fetch('/api/health/metrics').then(res => res.json()),
          fetch('/api/dashboard/activities').then(res => res.json()),
          fetch('/api/beauty/appointments/upcoming').then(res => res.json()),
          fetch('/api/recommendations').then(res => res.json()),
          fetch('/api/notifications').then(res => res.json()),
        ]);

        setDashboardData({
          wellnessProgress,
          healthMetrics,
          activities: activities.activities,
          upcomingAppointments: appointments.appointments,
          recommendations: recommendations.recommendations,
          notifications: notifications.notifications,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading || isLoading) {
    return (
      <Layout>
        <div className="container-app py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <Layout>
        <div className="container-app py-12">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-app py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name}! Here's your wellness journey overview.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="notifications">
              Notifications
              {dashboardData?.notifications.filter(n => !n.read).length > 0 && (
                <Badge className="ml-2" variant="secondary">
                  {dashboardData.notifications.filter(n => !n.read).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Wellness Progress</CardTitle>
                  <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData?.wellnessProgress.completedContent} / {dashboardData?.wellnessProgress.totalContent}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Content completed
                  </p>
                  <Progress
                    value={dashboardData?.wellnessProgress.percentage}
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Health Score</CardTitle>
                  <HeartIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData?.healthMetrics.stressLevel}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Stress level
                  </p>
                  <Progress
                    value={100 - (dashboardData?.healthMetrics.stressLevel || 0)}
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Daily Steps</CardTitle>
                  <BoltIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData?.healthMetrics.steps.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Steps today
                  </p>
                  <Progress
                    value={(dashboardData?.healthMetrics.steps || 0) / 10000 * 100}
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sleep Quality</CardTitle>
                  <ClockIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData?.healthMetrics.sleepHours}h
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last night
                  </p>
                  <Progress
                    value={(dashboardData?.healthMetrics.sleepHours || 0) / 8 * 100}
                    className="mt-2"
                  />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Health Trends</h2>
                <Card>
                  <CardContent className="pt-6">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dashboardData?.healthMetrics.history}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="heartRate" stroke="#8884d8" />
                          <Line type="monotone" dataKey="steps" stroke="#82ca9d" />
                          <Line type="monotone" dataKey="sleepHours" stroke="#ffc658" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-24">
                    <CalendarIcon className="h-6 w-6 mr-2" />
                    Book Appointment
                  </Button>
                  <Button variant="outline" className="h-24">
                    <TargetIcon className="h-6 w-6 mr-2" />
                    Set Goals
                  </Button>
                  <Button variant="outline" className="h-24">
                    <HeartIcon className="h-6 w-6 mr-2" />
                    Track Health
                  </Button>
                  <Button variant="outline" className="h-24">
                    <BellIcon className="h-6 w-6 mr-2" />
                    View Notifications
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <ActivityFeed activities={dashboardData?.activities || []} />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
                <UpcomingAppointments appointments={dashboardData?.upcomingAppointments || []} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Heart Rate History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dashboardData?.healthMetrics.history}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="heartRate" stroke="#8884d8" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sleep Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dashboardData?.healthMetrics.history}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="sleepHours" stroke="#ffc658" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardData?.wellnessProgress.goals.map((goal) => (
                <Card key={goal.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {goal.current} / {goal.target} {goal.unit}
                    </div>
                    <Progress
                      value={(goal.current / goal.target) * 100}
                      className="mt-2"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="space-y-4">
              {dashboardData?.notifications.map((notification) => (
                <Card key={notification.id} className={!notification.read ? 'border-primary' : ''}>
                  <CardHeader>
                    <CardTitle className="text-lg">{notification.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(notification.date), 'MMM d, yyyy h:mm a')}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p>{notification.message}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
} 