'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import TrainingDashboard from '@/components/training/TrainingDashboard';
import TrainingAnalytics from '@/components/training/TrainingAnalytics';
import { useSession } from 'next-auth/react';

export default function TrainingPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please sign in to access training.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Staff Training Portal</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <TrainingDashboard staffId={session.user.id} />
        </TabsContent>

        <TabsContent value="analytics">
          <TrainingAnalytics staffId={session.user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 