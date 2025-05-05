import { useState } from 'react';
import { Card, Button } from '@/components/ui';
import SkinConditionLogComponent from './SkinConditionLog';
import SkinCareRoutineComponent from './SkinCareRoutine';
import BeautyProgress from './BeautyProgress';
import BeautyGoals from './BeautyGoals';
import ProductRecommendations from './ProductRecommendations';

type Tab = 'log' | 'routine' | 'progress' | 'goals' | 'recommendations';

export default function BeautyDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('progress');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'log':
        return <SkinConditionLogComponent />;
      case 'routine':
        return <SkinCareRoutineComponent />;
      case 'progress':
        return <BeautyProgress />;
      case 'goals':
        return <BeautyGoals />;
      case 'recommendations':
        return <ProductRecommendations />;
      default:
        return null;
return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="mb-6 text-3xl font-bold">Beauty & Wellness Dashboard</h1>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeTab === 'progress' ? 'default' : 'outline'}
            onClick={() => setActiveTab('progress')}
          >
            Progress Overview
          </Button>
          <Button
            variant={activeTab === 'log' ? 'default' : 'outline'}
            onClick={() => setActiveTab('log')}
          >
            Skin Condition Log
          </Button>
          <Button
            variant={activeTab === 'routine' ? 'default' : 'outline'}
            onClick={() => setActiveTab('routine')}
          >
            Skincare Routine
          </Button>
          <Button
            variant={activeTab === 'goals' ? 'default' : 'outline'}
            onClick={() => setActiveTab('goals')}
          >
            Beauty Goals
          </Button>
          <Button
            variant={activeTab === 'recommendations' ? 'default' : 'outline'}
            onClick={() => setActiveTab('recommendations')}
          >
            Product Recommendations
          </Button>
        </div>
      </Card>

      <div className="mt-6">{renderTabContent()}</div>

      {activeTab === 'progress' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <h3 className="mb-2 text-lg font-semibold">Quick Actions</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setActiveTab('log')}
              >
                Log Today's Skin Condition
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setActiveTab('routine')}
              >
                View Skincare Routine
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setActiveTab('goals')}
              >
                Check Goals Progress
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-2 text-lg font-semibold">Recent Activity</h3>
            <div className="space-y-2">
              <div className="text-sm">
                <p className="font-medium">Last Skin Condition Log</p>
                <p className="text-gray-600">Today at 9:00 AM</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">Routine Updated</p>
                <p className="text-gray-600">Yesterday at 8:30 PM</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">New Goal Added</p>
                <p className="text-gray-600">2 days ago</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-2 text-lg font-semibold">Upcoming</h3>
            <div className="space-y-2">
              <div className="text-sm">
                <p className="font-medium">Goal Due: Clear Skin</p>
                <p className="text-gray-600">In 5 days</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">Product Restock Needed</p>
                <p className="text-gray-600">Moisturizer running low</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-2 text-lg font-semibold">Tips & Reminders</h3>
            <div className="space-y-2 text-sm">
              <p>Remember to:</p>
              <ul className="list-inside list-disc space-y-1">
                <li>Stay hydrated</li>
                <li>Use sunscreen daily</li>
                <li>Clean makeup brushes</li>
                <li>Get enough sleep</li>
              </ul>
            </div>
          </Card>
        </div>
      )}
    </div>
