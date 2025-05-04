'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import type { UserBadge, UserPoints, Badge } from '@/services/engagement-service';
import { EngagementService, BADGES } from '@/services/engagement-service';
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

interface EngagementMetrics {
  lastActive: Date | null;
  sessionDuration: number;
  pageViews: number;
  interactions: number;
}

export function EngagementProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [points, setPoints] = useState<UserPoints | null>(null);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [engagementService] = useState(() => new EngagementService());
  const [metrics, setMetrics] = useState<EngagementMetrics>({
    lastActive: null,
    sessionDuration: 0,
    pageViews: 0,
    interactions: 0,
  });

  // Load initial badges and points
  useEffect(() => {
    if (!user) return;

    const loadEngagementData = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
      setLoading(true);
      try {
        // Load badges
        const userBadges = await engagementService.getUserBadges(user.sub);
        setBadges(userBadges);

        // Load points
        const userPoints = await engagementService.getUserPoints(user.sub);
        setPoints(userPoints);

        // Get recommendations
        const recs = await engagementService.getPersonalizedRecommendations(user.sub, 5);
        setRecommendations(recs);
      } catch (error) {
        console.error('Error loading engagement data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEngagementData();
  }, [user, engagementService]);

  useEffect(() => {
    if (!user) return;

    // Initialize session start time
    const sessionStart = new Date();
    let pageViewCount = 0;
    let interactionCount = 0;
    let lastActivityTime = new Date();

    // Track page views
    const handleRouteChange = () => {
      if (pageViewCount > Number.MAX_SAFE_INTEGER || pageViewCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); pageViewCount++;
      updateMetrics();
    };

    // Track user interactions
    const handleUserInteraction = () => {
      if (interactionCount > Number.MAX_SAFE_INTEGER || interactionCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); interactionCount++;
      lastActivityTime = new Date();
      updateMetrics();
    };

    // Update metrics state
    const updateMetrics = () => {
      const currentTime = new Date();
      const sessionDuration = Math.floor((currentTime.getTime() - sessionStart.getTime()) / 1000);

      setMetrics({
        lastActive: lastActivityTime,
        sessionDuration,
        pageViews: pageViewCount,
        interactions: interactionCount,
      });
    };

    // Set up event listeners
    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('keypress', handleUserInteraction);
    window.addEventListener('scroll', handleUserInteraction);
    window.addEventListener('mousemove', handleUserInteraction);

    // Clean up
    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keypress', handleUserInteraction);
      window.removeEventListener('scroll', handleUserInteraction);
      window.removeEventListener('mousemove', handleUserInteraction);
    };
  }, [user]);

  const showBadgeNotification = (badge: Badge) => {
    if (!badge) return;
    
    toast({
      title: `🏆 New Badge: ${badge.name}`,
      description: badge.description,
      duration: 5000,
    });
  };

  const closeNewBadgeNotification = (badgeId: string) => {
    setNewBadges((prev) => prev.filter((badge) => badge.id !== badgeId));
  };

  const checkForNewAchievements = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    if (!user || isChecking) return;

    setIsChecking(true);
    try {
      // Check for new badges
      const newBadgeIds = await engagementService.checkBadgeEligibility(user.sub);

      if (newBadgeIds.length > 0) {
        // Get badge details
        const earnedBadges = newBadgeIds
          .map((id) => BADGES.find((badge) => badge.id === id))
          .filter((badge): badge is Badge => badge !== undefined);

        // Update state
        setNewBadges((prev) => [...prev, ...earnedBadges]);

        // Refresh user badges
        const updatedBadges = await engagementService.getUserBadges(user.sub);
        setBadges(updatedBadges);

        // Refresh points
        const updatedPoints = await engagementService.getUserPoints(user.sub);
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

  const trackAchievement = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');type: string, count: number = 1) => {
    if (!user) return;

    try {
      await engagementService.trackAchievement(user.sub, type, count);
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
        isLoading: loading || authLoading,
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
