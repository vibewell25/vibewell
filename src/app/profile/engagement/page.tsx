'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { BadgesDisplay } from '@/components/engagement/badges-display';
import { LevelProgress } from '@/components/engagement/level-progress';
import { Recommendations } from '@/components/engagement/recommendations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EngagementProvider } from '@/hooks/use-engagement';
import { Trophy, Star, History } from 'lucide-react';

// Content component that uses session
function EngagementContent() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-lg" />
        <div className="h-24 w-full bg-gray-200 rounded-lg" />
        <div className="h-64 w-full bg-gray-200 rounded-lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to view your engagement profile.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <EngagementProvider>
      <div className="container mx-auto py-8 space-y-6">
        <h1 className="text-3xl font-bold">Your Engagement Profile</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Progress & Level
            </CardTitle>
            <CardDescription>Track your progress and level up as you use ViBEWELL</CardDescription>
          </CardHeader>
          <CardContent>
            <LevelProgress showDetails={true} />
          </CardContent>
        </Card>

        <Tabs defaultValue="badges">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="badges" className="flex gap-2 items-center">
              <Trophy className="h-4 w-4" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex gap-2 items-center">
              <History className="h-4 w-4" />
              Recommendations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="badges">
            <Card>
              <CardHeader>
                <CardTitle>Your Badges</CardTitle>
                <CardDescription>
                  Collect badges by trying different products and sharing your looks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BadgesDisplay showUnlocked={true} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle>Recommended for You</CardTitle>
                <CardDescription>Based on your try-on history and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <Recommendations showTitle={false} maxItems={6} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </EngagementProvider>
  );
}

// Export default component with proper client-side protection
export default function EngagementPage() {
  // Move the client-state management to the wrapper component
  const [hasMounted, setHasMounted] = useState(false);

  // Simple effect to ensure we're only rendering on the client
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Safeguard against server-rendering session-dependent components
  if (!hasMounted) {
    return (
      <div className="container mx-auto py-8 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-lg" />
        <div className="h-24 w-full bg-gray-200 rounded-lg" />
        <div className="h-64 w-full bg-gray-200 rounded-lg" />
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8 space-y-6 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded-lg" />
          <div className="h-24 w-full bg-gray-200 rounded-lg" />
          <div className="h-64 w-full bg-gray-200 rounded-lg" />
        </div>
      }
    >
      <EngagementContent />
    </Suspense>
  );
}
