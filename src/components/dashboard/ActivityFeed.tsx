import { Icons } from '@/components/icons';
'use client';
import { format } from 'date-fns';
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
      return <Icons.Icons.BookOpenIcon className="h-5 w-5 text-blue-500" />;
    case 'booking':
      return <Icons.Icons.CalendarIcon className="h-5 w-5 text-green-500" />;
    case 'purchase':
      return <Icons.Icons.ShoppingBagIcon className="h-5 w-5 text-purple-500" />;
    case 'review':
      return <Icons.Icons.StarIcon className="h-5 w-5 text-yellow-500" />;
    default:
      return null;
  }
};
export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <Icons.div className="bg-muted/20 rounded-lg p-6 text-center">
        <Icons.p className="text-muted-foreground">No recent activities<Icons./p>
      <Icons./div>
    );
  }
  return (
    <Icons.div className="space-y-4">
      {activities.map((activity) => (
        <Icons.div
          key={activity.id}
          className="flex items-start gap-4 rounded-lg border p-4"
        >
          <Icons.div className="mt-1">{getActivityIcon(activity.type)}<Icons./div>
          <Icons.div className="flex-1 space-y-1">
            <Icons.p className="font-medium">{activity.title}<Icons./p>
            <Icons.p className="text-sm text-muted-foreground">
              {activity.description}
            <Icons./p>
            <Icons.p className="text-xs text-muted-foreground">
              {format(new Date(activity.date), 'MMM d, yyyy h:mm a')}
            <Icons./p>
          <Icons./div>
        <Icons./div>
      ))}
    <Icons./div>
  );
} 