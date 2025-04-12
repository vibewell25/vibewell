'use client';

import { format } from 'date-fns';
import {
  BookOpenIcon,
  CalendarIcon,
  ShoppingBagIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

interface Activity {
  id: string;
  type: 'content' | 'booking' | 'purchase' | 'review';
  title: string;
  description: string;
  date: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'content':
      return <BookOpenIcon className="h-5 w-5 text-blue-500" />;
    case 'booking':
      return <CalendarIcon className="h-5 w-5 text-green-500" />;
    case 'purchase':
      return <ShoppingBagIcon className="h-5 w-5 text-purple-500" />;
    case 'review':
      return <StarIcon className="h-5 w-5 text-yellow-500" />;
    default:
      return null;
  }
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="bg-muted/20 rounded-lg p-6 text-center">
        <p className="text-muted-foreground">No recent activities</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-4 rounded-lg border p-4"
        >
          <div className="mt-1">{getActivityIcon(activity.type)}</div>
          <div className="flex-1 space-y-1">
            <p className="font-medium">{activity.title}</p>
            <p className="text-sm text-muted-foreground">
              {activity.description}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(activity.date), 'MMM d, yyyy h:mm a')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
} 