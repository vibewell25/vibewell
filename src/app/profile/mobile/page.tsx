'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-unified-auth';
import Link from 'next/link';

// Mobile profile components
function ProfileMobileContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'activity';
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Handle tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);

    // Update URL without page reload
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('tab', tab);
    router.push(`/profile/mobile?${newParams.toString()}`);
  };

  if (loading) {
    return (
      <MobileLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
        </div>
      </MobileLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <MobileLayout>
      <div className="min-h-screen bg-background pb-16">
        {/* Profile Header */}
        <div className="flex flex-col items-center border-b border-border bg-card px-4 pb-4 pt-6">
          <Avatar className="mb-3 h-20 w-20">
            <AvatarImage src={user.avatarUrl || ''} alt={user.fullName || 'User'} />
            <AvatarFallback>{user.fullName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <h1 className="mb-1 text-xl font-semibold">{user.fullName || 'User'}</h1>
          <p className="mb-3 text-sm text-muted-foreground">{user.email}</p>

          <div className="mb-3 flex space-x-2">
            <Badge variant="outline" className="px-2 py-1 text-xs">
              {user.role || 'Customer'}
            </Badge>
            <Badge variant="outline" className="px-2 py-1 text-xs">
              Member since {format(new Date(user.createdAt || Date.now()), 'MMM yyyy')}
            </Badge>
          </div>

          <Button variant="outline" size="sm" asChild>
            <Link href="/profile/edit">Edit Profile</Link>
          </Button>
        </div>

        {/* Profile Tabs */}
        <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
          <TabsList className="sticky top-0 z-10 grid grid-cols-3 bg-background">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="p-4">
            <h2 className="mb-4 text-lg font-medium">Recent Activity</h2>
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">3 days ago</span>
                  <Badge>New Review</Badge>
                </div>
                <p className="text-sm">You reviewed "The Wellness Spa" (⭐⭐⭐⭐⭐)</p>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">1 week ago</span>
                  <Badge>Booking Completed</Badge>
                </div>
                <p className="text-sm">Swedish Massage with Sarah at Serenity Spa</p>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">2 weeks ago</span>
                  <Badge variant="outline">Profile Update</Badge>
                </div>
                <p className="text-sm">You updated your profile information</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="p-4">
            <h2 className="mb-4 text-lg font-medium">Your Bookings</h2>
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">Haircut and Style</h3>
                    <p className="text-sm text-muted-foreground">Modern Cuts Salon</p>
                  </div>
                  <Badge variant="outline">Upcoming</Badge>
                </div>
                <p className="mb-3 text-sm">June 15, 2023 • 2:00 PM</p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    Reschedule
                  </Button>
                  <Button size="sm" variant="destructive">
                    Cancel
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">Swedish Massage</h3>
                    <p className="text-sm text-muted-foreground">Serenity Spa</p>
                  </div>
                  <Badge variant="secondary">Completed</Badge>
                </div>
                <p className="mb-3 text-sm">May 28, 2023 • 11:00 AM</p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    Book Again
                  </Button>
                  <Button size="sm" variant="outline">
                    Leave Review
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="p-4">
            <h2 className="mb-4 text-lg font-medium">Your Favorites</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded-md bg-gray-200"></div>
                  <div>
                    <h3 className="font-medium">Serenity Spa</h3>
                    <p className="text-sm text-muted-foreground">Massage, Facials</p>
                    <div className="mt-1 flex items-center">
                      <span className="mr-1 text-sm">4.8</span>
                      <span className="text-yellow-500">★★★★★</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded-md bg-gray-200"></div>
                  <div>
                    <h3 className="font-medium">Modern Cuts Salon</h3>
                    <p className="text-sm text-muted-foreground">Haircuts, Styling</p>
                    <div className="mt-1 flex items-center">
                      <span className="mr-1 text-sm">4.6</span>
                      <span className="text-yellow-500">★★★★★</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded-md bg-gray-200"></div>
                  <div>
                    <h3 className="font-medium">Glow Beauty Lounge</h3>
                    <p className="text-sm text-muted-foreground">Facials, Makeup</p>
                    <div className="mt-1 flex items-center">
                      <span className="mr-1 text-sm">4.7</span>
                      <span className="text-yellow-500">★★★★★</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}

export default function ProfileMobilePage() {
  return (
    <Suspense
      fallback={
        <MobileLayout>
          <div className="flex min-h-screen items-center justify-center">Loading profile...</div>
        </MobileLayout>
      }
    >
      <ProfileMobileContent />
    </Suspense>
  );
}
