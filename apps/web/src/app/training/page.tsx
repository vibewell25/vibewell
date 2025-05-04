'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import TrainingDashboard from '@/components/training/TrainingDashboard';
import TrainingAnalytics from '@/components/training/TrainingAnalytics';
import { useSession } from 'next-auth/react';

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!session.user.id) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Please sign in to access training.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Staff Training Portal</h1>

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
