import { Icons } from '@/components/icons';
'use client';
import { useState } from 'react';
import { UserAvatar } from '@/components/user-avatar';
// Dummy data for recommended connections
const INITIAL_RECOMMENDATIONS = [
  {
    id: 'user7',
    name: 'Jane Smith',
    avatar: '/avatar7.png',
    bio: 'Yoga instructor & meditation enthusiast',
    mutualConnections: 3,
  },
  {
    id: 'user8',
    name: 'Chris Taylor',
    avatar: '/avatar8.png',
    bio: 'Nutritionist specializing in plant-based diets',
    mutualConnections: 5,
  },
  {
    id: 'user9',
    name: 'Olivia Chen',
    avatar: '/avatar9.png',
    bio: 'Mental health advocate & wellness coach',
    mutualConnections: 2,
  },
  {
    id: 'user10',
    name: 'Marcus Johnson',
    avatar: '/avatar10.png',
    bio: 'Fitness trainer focused on functional movement',
    mutualConnections: 4,
  }
];
export function RecommendedConnections() {
  const [recommendations, setRecommendations] = useState(INITIAL_RECOMMENDATIONS);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const handleConnect = (userId: string) => {
    // In a real app, this would make an API call
    if (connectedUsers.includes(userId)) {
      setConnectedUsers(connectedUsers.filter(id => id !== userId));
    } else {
      setConnectedUsers([...connectedUsers, userId]);
    }
  };
  const handleDismiss = (userId: string) => {
    // Remove the user from recommendations
    setRecommendations(recommendations.filter(user => user.id !== userId));
  };
  // If no recommendations left, show a message
  if (recommendations.length === 0) {
    return (
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Recommended Connections</h2>
        <p className="text-sm text-muted-foreground">
          No more recommendations at the moment. Check back later!
        </p>
      </div>
    );
  }
  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Recommended Connections</h2>
      <div className="space-y-4">
        {recommendations.map(user => (
          <div key={user.id} className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <UserAvatar 
                src={user.avatar} 
                alt={`${user.name}'s avatar`}
                fallbackInitials={user.name}
              />
              <div>
                <h3 className="font-medium text-sm">{user.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{user.bio}</p>
                <p className="text-xs text-primary mt-1">
                  {user.mutualConnections} mutual connection{user.mutualConnections !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                className={`p-1.5 rounded-full ${
                  connectedUsers.includes(user.id)
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                } transition-colors`}
                onClick={() => handleConnect(user.id)}
                aria-label={connectedUsers.includes(user.id) ? 'Connected' : 'Connect'}
              >
                {connectedUsers.includes(user.id) ? (
                  <Icons.CheckIcon className="h-4 w-4" />
                ) : (
                  <Icons.PlusIcon className="h-4 w-4" />
                )}
              </button>
              <button
                className="text-muted-foreground hover:text-foreground text-xs"
                onClick={() => handleDismiss(user.id)}
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 