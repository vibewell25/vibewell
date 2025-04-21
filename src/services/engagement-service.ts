import { prisma } from '@/lib/database/client';
import { AnalyticsService } from './analytics-service';

// Badge definitions with criteria
export interface Badge {
  id: string;
  name: string;
  description: string;
  image: string;
  criteria: {
    type: 'sessions' | 'shares' | 'products' | 'streak';
    count: number;
    filter?: Record<string, any>;
  };
  points: number;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  awardedAt: string;
  badge?: Badge;
}

export interface UserPoints {
  userId: string;
  points: number;
  level: number;
  lastUpdated: string;
}

export interface Achievement {
  id: string;
  userId: string;
  type: string;
  count: number;
  createdAt: string;
  updatedAt: string;
}

// Define all available badges
export const BADGES: Badge[] = [
  {
    id: 'first-try-on',
    name: 'Beginner',
    description: 'Completed your first virtual try-on',
    image: '/badges/first-try-on.svg',
    criteria: {
      type: 'sessions',
      count: 1,
    },
    points: 10,
  },
  {
    id: 'try-on-expert',
    name: 'Try-On Expert',
    description: 'Completed 10 virtual try-ons',
    image: '/badges/try-on-expert.svg',
    criteria: {
      type: 'sessions',
      count: 10,
    },
    points: 50,
  },
  {
    id: 'makeup-enthusiast',
    name: 'Makeup Enthusiast',
    description: 'Tried on 5 different makeup products',
    image: '/badges/makeup-enthusiast.svg',
    criteria: {
      type: 'sessions',
      count: 5,
      filter: { type: 'makeup' },
    },
    points: 30,
  },
  {
    id: 'hairstyle-explorer',
    name: 'Hairstyle Explorer',
    description: 'Tried on 5 different hairstyles',
    image: '/badges/hairstyle-explorer.svg',
    criteria: {
      type: 'sessions',
      count: 5,
      filter: { type: 'hairstyle' },
    },
    points: 30,
  },
  {
    id: 'accessory-collector',
    name: 'Accessory Collector',
    description: 'Tried on 5 different accessories',
    image: '/badges/accessory-collector.svg',
    criteria: {
      type: 'sessions',
      count: 5,
      filter: { type: 'accessory' },
    },
    points: 30,
  },
  {
    id: 'social-butterfly',
    name: 'Social Butterfly',
    description: 'Shared your try-ons 3 times',
    image: '/badges/social-butterfly.svg',
    criteria: {
      type: 'shares',
      count: 3,
    },
    points: 25,
  },
  {
    id: 'consistency-king',
    name: 'Consistency King',
    description: 'Used the try-on feature 3 days in a row',
    image: '/badges/consistency-king.svg',
    criteria: {
      type: 'streak',
      count: 3,
    },
    points: 40,
  },
];

// Calculate level based on points
function calculateLevel(points: number): number {
  // Each level requires 20% more points than the previous
  // Level 1: 0-100, Level 2: 101-220, Level 3: 221-364, etc.
  if (points < 100) return 1;

  let level = 1;
  let threshold = 100;
  let nextThreshold = threshold;

  while (points >= nextThreshold) {
    level++;
    threshold = nextThreshold;
    nextThreshold += Math.floor(threshold * 0.2);
  }

  return level;
}

export class EngagementService {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  /**
   * Get all badges for a user
   * @param userId The user's ID
   * @returns List of earned badges
   */
  async getUserBadges(userId: string): Promise<UserBadge[]> {
    try {
      const userBadges = await prisma.userBadge.findMany({
        where: { userId },
      });

      // Enrich with badge details
      return userBadges.map((userBadge: any) => ({
        id: userBadge.id,
        userId: userBadge.userId,
        badgeId: userBadge.badgeId,
        awardedAt: userBadge.awardedAt.toISOString(),
        badge: BADGES.find(badge => badge.id === userBadge.badgeId),
      }));
    } catch (error) {
      console.error('Error getting user badges:', error);
      return [];
    }
  }

  /**
   * Get user points and level
   * @param userId The user's ID
   * @returns User points data
   */
  async getUserPoints(userId: string): Promise<UserPoints | null> {
    try {
      const userPoints = await prisma.userPoints.findUnique({
        where: { userId },
      });

      if (!userPoints) {
        // No record found, create a new one
        return {
          userId,
          points: 0,
          level: 1,
          lastUpdated: new Date().toISOString(),
        };
      }

      return {
        userId: userPoints.userId,
        points: userPoints.points,
        level: userPoints.level,
        lastUpdated: userPoints.lastUpdated.toISOString(),
      };
    } catch (error) {
      console.error('Error getting user points:', error);
      return null;
    }
  }

  /**
   * Award points to a user
   * @param userId The user's ID
   * @param points Points to award
   */
  async awardPoints(userId: string, points: number): Promise<UserPoints | null> {
    try {
      const currentPoints = await this.getUserPoints(userId);
      const newPoints = (currentPoints?.points || 0) + points;
      const newLevel = calculateLevel(newPoints);

      const updatedUserPoints = await prisma.userPoints.upsert({
        where: { userId },
        update: {
          points: newPoints,
          level: newLevel,
          lastUpdated: new Date(),
        },
        create: {
          userId,
          points: newPoints,
          level: newLevel,
          lastUpdated: new Date(),
        },
      });

      return {
        userId: updatedUserPoints.userId,
        points: updatedUserPoints.points,
        level: updatedUserPoints.level,
        lastUpdated: updatedUserPoints.lastUpdated.toISOString(),
      };
    } catch (error) {
      console.error('Error awarding points:', error);
      return null;
    }
  }

  /**
   * Award a badge to a user
   * @param userId The user's ID
   * @param badgeId The badge to award
   */
  async awardBadge(userId: string, badgeId: string): Promise<UserBadge | null> {
    try {
      // Check if the user already has this badge
      const existingBadge = await prisma.userBadge.findFirst({
        where: {
          userId,
          badgeId,
        },
      });

      if (existingBadge) {
        return {
          id: existingBadge.id,
          userId: existingBadge.userId,
          badgeId: existingBadge.badgeId,
          awardedAt: existingBadge.awardedAt.toISOString(),
          badge: BADGES.find(badge => badge.id === badgeId),
        };
      }

      // Award new badge
      const userBadge = await prisma.userBadge.create({
        data: {
          userId,
          badgeId,
          awardedAt: new Date(),
        },
      });

      // Award points for the badge
      const badge = BADGES.find(b => b.id === badgeId);
      if (badge) {
        await this.awardPoints(userId, badge.points);
      }

      return {
        id: userBadge.id,
        userId: userBadge.userId,
        badgeId: userBadge.badgeId,
        awardedAt: userBadge.awardedAt.toISOString(),
        badge: badge,
      };
    } catch (error) {
      console.error('Error awarding badge:', error);
      return null;
    }
  }

  /**
   * Check if a user is eligible for any badges they don't have yet
   * @param userId The user's ID
   * @returns List of badge IDs the user is eligible for
   */
  async checkBadgeEligibility(userId: string): Promise<string[]> {
    try {
      // Get user's current badges
      const userBadges = await this.getUserBadges(userId);
      const earnedBadgeIds = userBadges.map(badge => badge.badgeId);

      // Get user's achievements for badge criteria
      const achievements = await prisma.achievement.findMany({
        where: { userId },
      });

      // Map achievements by type for easy access
      const achievementsByType: Record<string, number> = {};
      achievements.forEach((achievement: any) => {
        achievementsByType[achievement.type] = achievement.count;
      });

      // Check each badge's criteria
      const eligibleBadgeIds = BADGES.filter(badge => !earnedBadgeIds.includes(badge.id))
        .filter(badge => {
          const { type, count, filter } = badge.criteria;

          if (type === 'streak') {
            // Special handling for streak badges
            // This would need to be implemented based on your streak tracking logic
            return false;
          }

          if (filter) {
            // Check filtered criteria
            const achievementTypeWithFilter = `${type}:${Object.keys(filter)[0]}:${Object.values(filter)[0]}`;
            return (achievementsByType[achievementTypeWithFilter] || 0) >= count;
          }

          // Check simple criteria
          return (achievementsByType[type] || 0) >= count;
        })
        .map(badge => badge.id);

      return eligibleBadgeIds;
    } catch (error) {
      console.error('Error checking badge eligibility:', error);
      return [];
    }
  }

  /**
   * Track an achievement for a user
   * @param userId The user's ID
   * @param type The achievement type
   * @param count Count to add (default: 1)
   */
  async trackAchievement(userId: string, type: string, count: number = 1): Promise<void> {
    try {
      // Get existing achievement or create
      const existingAchievement = await prisma.achievement.findFirst({
        where: {
          userId,
          type,
        },
      });

      if (existingAchievement) {
        // Update existing achievement
        await prisma.achievement.update({
          where: { id: existingAchievement.id },
          data: {
            count: existingAchievement.count + count,
            updatedAt: new Date(),
          },
        });
      } else {
        // Create new achievement
        await prisma.achievement.create({
          data: {
            userId,
            type,
            count,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      // Track analytics
      this.analyticsService.trackEvent('achievement_earned', {
        user_id: userId,
        achievement_type: type,
        count,
      });

      // Check for new badges
      const eligibleBadgeIds = await this.checkBadgeEligibility(userId);
      for (const badgeId of eligibleBadgeIds) {
        await this.awardBadge(userId, badgeId);
      }
    } catch (error) {
      console.error('Error tracking achievement:', error);
    }
  }

  /**
   * Get personalized product recommendations for a user
   * @param userId The user's ID
   * @param limit Max number of recommendations
   * @returns List of recommended products
   */
  async getPersonalizedRecommendations(userId: string, limit: number = 5): Promise<any[]> {
    try {
      // Get user session history
      const userSessions = await prisma.tryOnSession.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      // Get top products the user has tried
      const topProducts = await prisma.tryOnSession.groupBy({
        by: ['productId'],
        where: {
          userId,
          productId: { not: null },
        },
        _count: { id: true },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 5,
      });

      const productIds = topProducts
        .filter((item: any) => item.productId !== null)
        .map((item: any) => item.productId as string);

      if (productIds.length === 0) {
        // If user has no history, return trending products
        return prisma.product.findMany({
          where: { trending: true },
          take: limit,
        });
      }

      // Get recommendations based on similar products
      const recommendations = await prisma.product.findMany({
        where: {
          OR: [
            // Similar categories
            {
              category: {
                in: await prisma.product
                  .findMany({
                    where: { id: { in: productIds } },
                    select: { category: true },
                  })
                  .then((products: any[]) => products.map((p: any) => p.category)),
              },
            },
            // Same brand
            {
              brand: {
                in: await prisma.product
                  .findMany({
                    where: { id: { in: productIds } },
                    select: { brand: true },
                  })
                  .then((products: any[]) => products.map((p: any) => p.brand)),
              },
            },
          ],
          id: { notIn: productIds }, // Exclude already tried products
        },
        take: limit,
        orderBy: {
          rating: 'desc',
        },
      });

      // If not enough recommendations, add some other popular products
      if (recommendations.length < limit) {
        const otherProducts = await prisma.product.findMany({
          where: {
            id: {
              notIn: [...productIds, ...recommendations.map((p: any) => p.id)],
            },
            trending: true,
          },
          take: limit - recommendations.length,
          orderBy: {
            rating: 'desc',
          },
        });

        return [...recommendations, ...otherProducts];
      }

      return recommendations;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }
}
