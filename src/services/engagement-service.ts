import { createClient } from '@supabase/supabase-js';
import { AnalyticsService } from './analytics-service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
const BADGES: Badge[] = [
  {
    id: 'first-try-on',
    name: 'Beginner',
    description: 'Completed your first virtual try-on',
    image: '/badges/first-try-on.svg',
    criteria: {
      type: 'sessions',
      count: 1
    },
    points: 10
  },
  {
    id: 'try-on-expert',
    name: 'Try-On Expert',
    description: 'Completed 10 virtual try-ons',
    image: '/badges/try-on-expert.svg',
    criteria: {
      type: 'sessions',
      count: 10
    },
    points: 50
  },
  {
    id: 'makeup-enthusiast',
    name: 'Makeup Enthusiast',
    description: 'Tried on 5 different makeup products',
    image: '/badges/makeup-enthusiast.svg',
    criteria: {
      type: 'sessions',
      count: 5,
      filter: { type: 'makeup' }
    },
    points: 30
  },
  {
    id: 'hairstyle-explorer',
    name: 'Hairstyle Explorer',
    description: 'Tried on 5 different hairstyles',
    image: '/badges/hairstyle-explorer.svg',
    criteria: {
      type: 'sessions',
      count: 5,
      filter: { type: 'hairstyle' }
    },
    points: 30
  },
  {
    id: 'accessory-collector',
    name: 'Accessory Collector',
    description: 'Tried on 5 different accessories',
    image: '/badges/accessory-collector.svg',
    criteria: {
      type: 'sessions',
      count: 5,
      filter: { type: 'accessory' }
    },
    points: 30
  },
  {
    id: 'social-butterfly',
    name: 'Social Butterfly',
    description: 'Shared your try-ons 3 times',
    image: '/badges/social-butterfly.svg',
    criteria: {
      type: 'shares',
      count: 3
    },
    points: 25
  },
  {
    id: 'consistency-king',
    name: 'Consistency King',
    description: 'Used the try-on feature 3 days in a row',
    image: '/badges/consistency-king.svg',
    criteria: {
      type: 'streak',
      count: 3
    },
    points: 40
  }
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
      const { data, error } = await supabase
        .from('user_badges')
        .select('id, userId, badgeId, awardedAt')
        .eq('userId', userId);
      
      if (error) throw error;
      
      // Enrich with badge details
      return data.map(userBadge => ({
        ...userBadge,
        badge: BADGES.find(badge => badge.id === userBadge.badgeId)
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
      const { data, error } = await supabase
        .from('user_points')
        .select('userId, points, level, lastUpdated')
        .eq('userId', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No record found, create a new one
          return {
            userId,
            points: 0,
            level: 1,
            lastUpdated: new Date().toISOString()
          };
        }
        throw error;
      }
      
      return data;
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
      
      const { data, error } = await supabase
        .from('user_points')
        .upsert({
          userId,
          points: newPoints,
          level: newLevel,
          lastUpdated: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
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
      // Check if user already has this badge
      const { data: existingBadge } = await supabase
        .from('user_badges')
        .select('id')
        .eq('userId', userId)
        .eq('badgeId', badgeId)
        .single();
      
      if (existingBadge) {
        return null; // User already has this badge
      }
      
      // Award the badge
      const { data, error } = await supabase
        .from('user_badges')
        .insert({
          userId,
          badgeId,
          awardedAt: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Also award points for the badge
      const badge = BADGES.find(b => b.id === badgeId);
      if (badge) {
        await this.awardPoints(userId, badge.points);
      }
      
      return data;
    } catch (error) {
      console.error('Error awarding badge:', error);
      return null;
    }
  }
  
  /**
   * Check if user has earned any new badges
   * @param userId The user's ID
   */
  async checkBadgeEligibility(userId: string): Promise<string[]> {
    try {
      const earnedBadges: string[] = [];
      
      // Get user's current badges
      const userBadges = await this.getUserBadges(userId);
      const earnedBadgeIds = userBadges.map(ub => ub.badgeId);
      
      // Get user's sessions and shares data for evaluation
      const { data: tryOnSessions } = await supabase
        .from('try_on_sessions')
        .select('id, type, productId, success, created_at')
        .eq('userId', userId);
      
      const { data: shareAnalytics } = await supabase
        .from('share_analytics')
        .select('id, method, platform, created_at')
        .eq('userId', userId);
      
      // Check each badge's criteria
      for (const badge of BADGES) {
        // Skip already earned badges
        if (earnedBadgeIds.includes(badge.id)) continue;
        
        let eligible = false;
        
        switch (badge.criteria.type) {
          case 'sessions':
            if (badge.criteria.filter) {
              // Filter sessions by specified criteria
              const filteredSessions = tryOnSessions.filter(session => {
                return Object.entries(badge.criteria.filter!).every(([key, value]) => {
                  return session[key] === value;
                });
              });
              eligible = filteredSessions.length >= badge.criteria.count;
            } else {
              // Just count total sessions
              eligible = tryOnSessions.length >= badge.criteria.count;
            }
            break;
          
          case 'shares':
            eligible = shareAnalytics.length >= badge.criteria.count;
            break;
          
          case 'streak':
            // Calculate daily usage streak
            const sortedDates = tryOnSessions
              .map(session => new Date(session.created_at).toDateString())
              .filter((date, index, self) => self.indexOf(date) === index) // Unique dates
              .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
            
            let maxStreak = 1;
            let currentStreak = 1;
            
            for (let i = 1; i < sortedDates.length; i++) {
              const prevDate = new Date(sortedDates[i-1]);
              const currentDate = new Date(sortedDates[i]);
              
              // Check if dates are consecutive
              const diffTime = currentDate.getTime() - prevDate.getTime();
              const diffDays = diffTime / (1000 * 60 * 60 * 24);
              
              if (diffDays === 1) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
              } else {
                currentStreak = 1;
              }
            }
            
            eligible = maxStreak >= badge.criteria.count;
            break;
        }
        
        if (eligible) {
          // Award the badge
          await this.awardBadge(userId, badge.id);
          earnedBadges.push(badge.id);
        }
      }
      
      return earnedBadges;
    } catch (error) {
      console.error('Error checking badge eligibility:', error);
      return [];
    }
  }
  
  /**
   * Track an achievement for a user
   * @param userId The user's ID
   * @param type Achievement type
   * @param count Achievement count
   */
  async trackAchievement(userId: string, type: string, count: number = 1): Promise<void> {
    try {
      // Check if achievement already exists
      const { data: existingAchievement } = await supabase
        .from('user_achievements')
        .select('id, count')
        .eq('userId', userId)
        .eq('type', type)
        .single();
      
      if (existingAchievement) {
        // Update existing achievement
        await supabase
          .from('user_achievements')
          .update({
            count: existingAchievement.count + count,
            updatedAt: new Date().toISOString()
          })
          .eq('id', existingAchievement.id);
      } else {
        // Create new achievement
        await supabase
          .from('user_achievements')
          .insert({
            userId,
            type,
            count,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
      }
      
      // Check if user earned any badges
      await this.checkBadgeEligibility(userId);
    } catch (error) {
      console.error('Error tracking achievement:', error);
    }
  }
  
  /**
   * Get personalized product recommendations based on user history
   * @param userId The user's ID
   * @param limit Maximum number of recommendations
   */
  async getPersonalizedRecommendations(userId: string, limit: number = 5): Promise<any[]> {
    try {
      // Get user's try-on history
      const { data: userSessions } = await supabase
        .from('try_on_sessions')
        .select('type, productId')
        .eq('userId', userId)
        .order('created_at', { ascending: false });
      
      if (!userSessions || userSessions.length === 0) {
        // If no history, return top rated products
        const { data: topProducts } = await supabase
          .from('products')
          .select('*')
          .order('rating', { ascending: false })
          .limit(limit);
        
        return topProducts || [];
      }
      
      // Count product types the user has tried
      const typeCounts: Record<string, number> = {
        makeup: 0,
        hairstyle: 0,
        accessory: 0
      };
      
      userSessions.forEach(session => {
        if (typeCounts[session.type] !== undefined) {
          typeCounts[session.type]++;
        }
      });
      
      // Get the most tried product type
      const preferredType = Object.entries(typeCounts)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0])[0];
      
      // Get products of preferred type excluding already tried ones
      const triedProductIds = userSessions.map(s => s.productId);
      
      const { data: recommendations } = await supabase
        .from('products')
        .select('*')
        .eq('type', preferredType)
        .not('id', 'in', `(${triedProductIds.join(',')})`)
        .order('rating', { ascending: false })
        .limit(limit);
      
      if (recommendations && recommendations.length >= limit) {
        return recommendations;
      }
      
      // If not enough of preferred type, add other popular products
      const remainingLimit = limit - (recommendations?.length || 0);
      
      const { data: otherProducts } = await supabase
        .from('products')
        .select('*')
        .not('id', 'in', `(${triedProductIds.join(',')})`)
        .not('type', 'eq', preferredType)
        .order('rating', { ascending: false })
        .limit(remainingLimit);
      
      return [...(recommendations || []), ...(otherProducts || [])];
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return [];
    }
  }
} 