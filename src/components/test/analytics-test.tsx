'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AnalyticsService } from '@/services/analytics-service';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AnalyticsTest() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const analyticsService = new AnalyticsService();

  const testTryOnSession = async (type: 'makeup' | 'hairstyle' | 'accessory') => {
    try {
      setLoading(true);
      await analyticsService.trackTryOnSession({
        userId: 'test-user',
        type,
        productId: `test-${type}`,
        productName: `Test ${type}`,
        duration: 60,
        intensity: 5,
        success: true,
      });
      toast({
        title: 'Success',
        description: `${type} try-on session tracked successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to track ${type} try-on session`,
        variant: 'destructive',
      });
      console.error(`Error tracking ${type} try-on session:`, error);
    } finally {
      setLoading(false);
    }
  };

  const testFailedSession = async () => {
    try {
      setLoading(true);
      await analyticsService.trackTryOnSession({
        userId: 'test-user',
        type: 'makeup',
        productId: 'test-error-product',
        productName: 'Test Error Product',
        duration: 10,
        intensity: 5,
        success: false,
        error: 'Model loading failed',
      });
      toast({
        title: 'Success',
        description: 'Error session tracked successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to track error session',
        variant: 'destructive',
      });
      console.error('Error tracking failed session:', error);
    } finally {
      setLoading(false);
    }
  };

  const testShareAnalytics = async (
    method: 'social' | 'email' | 'download',
    platform: string = 'facebook'
  ) => {
    try {
      setLoading(true);
      await analyticsService.trackShare({
        userId: 'test-user',
        sessionId: `test-session-${method}`,
        platform,
        method,
        success: true,
      });
      toast({
        title: 'Success',
        description: `${method} share analytics tracked successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to track ${method} share analytics`,
        variant: 'destructive',
      });
      console.error(`Error tracking ${method} share analytics:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold">Analytics Test</h2>

      <Tabs defaultValue="sessions">
        <TabsList>
          <TabsTrigger value="sessions">Try-On Sessions</TabsTrigger>
          <TabsTrigger value="shares">Shares</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4 pt-4">
          <h3 className="text-lg font-medium">Test Try-On Sessions</h3>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => testTryOnSession('makeup')} disabled={loading} variant="default">
              Test Makeup Session
            </Button>
            <Button
              onClick={() => testTryOnSession('hairstyle')}
              disabled={loading}
              variant="default"
            >
              Test Hairstyle Session
            </Button>
            <Button
              onClick={() => testTryOnSession('accessory')}
              disabled={loading}
              variant="default"
            >
              Test Accessory Session
            </Button>
            <Button onClick={testFailedSession} disabled={loading} variant="destructive">
              Test Failed Session
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="shares" className="space-y-4 pt-4">
          <h3 className="text-lg font-medium">Test Share Analytics</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => testShareAnalytics('social', 'facebook')}
              disabled={loading}
              variant="default"
            >
              Test Facebook Share
            </Button>
            <Button
              onClick={() => testShareAnalytics('social', 'instagram')}
              disabled={loading}
              variant="default"
            >
              Test Instagram Share
            </Button>
            <Button
              onClick={() => testShareAnalytics('email')}
              disabled={loading}
              variant="default"
            >
              Test Email Share
            </Button>
            <Button
              onClick={() => testShareAnalytics('download')}
              disabled={loading}
              variant="default"
            >
              Test Download
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm">
        <p>
          Use these test buttons to generate analytics data that can be viewed in the admin
          dashboard.
        </p>
        <p className="mt-1 text-muted-foreground">
          After generating test data, visit the{' '}
          <a href="/admin/analytics" className="text-blue-600 hover:underline">
            admin analytics dashboard
          </a>{' '}
          to see the results.
        </p>
      </div>
    </div>
  );
}
