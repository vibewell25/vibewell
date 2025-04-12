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
import { MobileLayout } from '@/components/layout/MobileLayout';
import Link from 'next/link';
import { ChevronRightIcon, UserIcon } from '@heroicons/react/24/outline';

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

interface User {
  name: string;
  bookingsThisWeek: number;
  earnings: string;
  role: string;
  businessType: string;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [userState, setUserState] = useState<User>({
    name: 'Maria',
    bookingsThisWeek: 4,
    earnings: '€900',
    role: 'Admin',
    businessType: 'Web-Based Panel'
  });

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
    <MobileLayout>
      <div className="px-5 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-gray-500">He Kōrero Yourservii</p>
            <h1 className="text-2xl font-bold">Hi, {user.name}</h1>
          </div>
          <div className="relative">
            <Link href="/notifications">
              <BellIcon className="w-6 h-6 text-gray-500" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {dashboardData?.notifications.filter(n => !n.read).length}
              </span>
            </Link>
          </div>
        </div>

        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Booking Overview</h2>
              <Link href="/bookings" className="flex items-center text-primary text-sm">
                <span>View</span>
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="mt-4 flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <span className="text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bookings this week</p>
                <p className="text-xl font-bold">{dashboardData?.earnings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <UserIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{user.role}</p>
                <p className="text-base font-medium">{user.businessType}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Clients</h2>
            <p className="text-sm text-gray-500">Notification</p>
          </div>

          <div className="space-y-4">
            {/* This would be a list of clients or notifications */}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
} 