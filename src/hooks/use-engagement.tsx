'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useSession } from 'next-auth/react';
import {
  EngagementService,
  UserBadge,
  UserPoints,
  Badge,
  BADGES,
} from '@/services/engagement-service';
import { useToast } from '@/components/ui/use-toast';

interface EngagementContextType {
  badges: UserBadge[];
  points: UserPoints | null;
  newBadges: Badge[];
  recommendations: any[];
  isLoading: boolean;
  isChecking: boolean;
  showBadgeNotification: (badge: Badge) => void;
  checkForNewAchievements: () => Promise<void>;
  closeNewBadgeNotification: (badgeId: string) => void;
  trackAchievement: (type: string, count?: number) => Promise<void>;
}

const EngagementContext = createContext<EngagementContextType | undefined>(undefined);

export function EngagementProvider({ children }: { children: React.ReactNode }) {
  const userId = session?.user?.id;
  const { toast } = useToast();

  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [points, setPoints] = useState<UserPoints | null>(null);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [engagementService] = useState(() => new EngagementService());

  // Load initial badges and points
  useEffect(() => {
    if (!userId) return;

    const loadEngagementData = async () => {
      setIsLoading(true);
      try {
        // Load badges
        const userBadges = await engagementService.getUserBadges(userId);
        setBadges(userBadges);

        // Load points
        const userPoints = await engagementService.getUserPoints(userId);
        setPoints(userPoints);

        // Get recommendations
        const recs = await engagementService.getPersonalizedRecommendations(userId, 5);
        setRecommendations(recs);
      } catch (error) {
        console.error('Error loading engagement data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEngagementData();
  }, [userId, engagementService]);

  const showBadgeNotification = (badge: Badge) => {
    toast({
      title: `🏆 New Badge: ${badge.name}`,
      description: badge.description,
      duration: 5000,
    });
  };

  const closeNewBadgeNotification = (badgeId: string) => {
    setNewBadges((prev) => prev.filter((badge) => badge.id !== badgeId));
  };

  const checkForNewAchievements = async () => {
    if (!userId || isChecking) return;

    setIsChecking(true);
    try {
      // Check for new badges
      const newBadgeIds = await engagementService.checkBadgeEligibility(userId);

      if (newBadgeIds.length > 0) {
        // Get badge details
        const earnedBadges = newBadgeIds
          .map((id) => BADGES.find((badge) => badge.id === id))
          .filter(Boolean) as Badge[];

        // Update state
        setNewBadges((prev) => [...prev, ...earnedBadges]);

        // Refresh user badges
        const updatedBadges = await engagementService.getUserBadges(userId);
        setBadges(updatedBadges);

        // Refresh points
        const updatedPoints = await engagementService.getUserPoints(userId);
        setPoints(updatedPoints);

        // Show notification for the first badge
        if (earnedBadges.length > 0) {
          showBadgeNotification(earnedBadges[0]);
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const trackAchievement = async (type: string, count: number = 1) => {
    if (!userId) return;

    try {
      await engagementService.trackAchievement(userId, type, count);
      await checkForNewAchievements();
    } catch (error) {
      console.error(`Error tracking achievement ${type}:`, error);
    }
  };

  return (
    <EngagementContext.Provider
      value={{
        badges,
        points,
        newBadges,
        recommendations,
        isLoading,
        isChecking,
        showBadgeNotification,
        checkForNewAchievements,
        closeNewBadgeNotification,
        trackAchievement,
      }}
    >
      {children}
    </EngagementContext.Provider>
  );
}

export function useEngagement() {
  const context = useContext(EngagementContext);

  if (context === undefined) {
    throw new Error('useEngagement must be used within an EngagementProvider');
  }

  return context;
}
