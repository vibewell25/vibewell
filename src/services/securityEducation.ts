import { Redis } from 'ioredis';
import { logger } from '@/lib/logger';

export interface SecurityTip {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  triggers: string[];
  displayConditions?: {
    userRole?: string;
    userAction?: string;
    frequency?: number; // in days
  };
}

export interface SecurityAwarenessModule {
  id: string;
  title: string;
  description: string;
  content: string;
  quizQuestions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>;
  completionCriteria: {
    minScore: number;
    requiredTime: number; // in minutes
  };
}

export interface UserSecurityProgress {
  userId: string;
  completedModules: Array<{
    moduleId: string;
    completedAt: Date;
    score: number;
    timeSpent: number;
  }>;
  acknowledgedTips: string[];
  lastAssessment?: {
    date: Date;
    score: number;
  };
}

export class SecurityEducationService {
  private redis: Redis;
  private readonly keyPrefix = 'security:education';

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || '');
  }

  /**
   * Get relevant security tips for a user
   */
  async getRelevantTips(
    userId: string,
    userRole: string,
    currentAction?: string
  ): Promise<SecurityTip[]> {
    try {
      // Get all tips
      const tips = await this.getAllTips();
      
      // Get user's progress
      const progress = await this.getUserProgress(userId);
      
      // Filter tips based on relevance
      return tips.filter(tip => {
        // Check if tip has been recently acknowledged
        const hasAcknowledged = progress.acknowledgedTips.includes(tip.id);
        if (hasAcknowledged) return false;

        // Check display conditions
        if (tip.displayConditions) {
          if (tip.displayConditions.userRole && 
              tip.displayConditions.userRole !== userRole) {
            return false;
          }
          
          if (tip.displayConditions.userAction && 
              tip.displayConditions.userAction !== currentAction) {
            return false;
          }
        }

        return true;
      });
    } catch (error) {
      logger.error('Failed to get security tips', 'security_education', { error, userId });
      return [];
    }
  }

  /**
   * Get all security tips
   */
  private async getAllTips(): Promise<SecurityTip[]> {
    const tipData = await this.redis.hgetall(`${this.keyPrefix}:tips`);
    return Object.values(tipData).map(data => JSON.parse(data));
  }

  /**
   * Add a new security tip
   */
  async addSecurityTip(tip: Omit<SecurityTip, 'id'>): Promise<SecurityTip> {
    try {
      const id = `tip:${Date.now()}:${Math.random().toString(36).slice(2)}`;
      const newTip: SecurityTip = { ...tip, id };

      await this.redis.hset(
        `${this.keyPrefix}:tips`,
        {
          [id]: JSON.stringify(newTip)
        }
      );

      logger.info('Security tip added', 'security_education', { tipId: id });
      return newTip;
    } catch (error) {
      logger.error('Failed to add security tip', 'security_education', { error, tip });
      throw error;
    }
  }

  /**
   * Get available security awareness modules
   */
  async getAvailableModules(userRole: string): Promise<SecurityAwarenessModule[]> {
    try {
      const moduleData = await this.redis.hgetall(`${this.keyPrefix}:modules`);
      const modules = Object.values(moduleData).map(data => 
        JSON.parse(data) as SecurityAwarenessModule
      );

      // Filter modules based on user role if needed
      return modules;
    } catch (error) {
      logger.error('Failed to get modules', 'security_education', { error });
      return [];
    }
  }

  /**
   * Add a new security awareness module
   */
  async addModule(
    module: Omit<SecurityAwarenessModule, 'id'>
  ): Promise<SecurityAwarenessModule> {
    try {
      const id = `module:${Date.now()}:${Math.random().toString(36).slice(2)}`;
      const newModule: SecurityAwarenessModule = { ...module, id };

      await this.redis.hset(
        `${this.keyPrefix}:modules`,
        {
          [id]: JSON.stringify(newModule)
        }
      );

      logger.info('Security module added', 'security_education', { moduleId: id });
      return newModule;
    } catch (error) {
      logger.error('Failed to add module', 'security_education', { error, module });
      throw error;
    }
  }

  /**
   * Record module completion
   */
  async recordModuleCompletion(
    userId: string,
    moduleId: string,
    score: number,
    timeSpent: number
  ): Promise<void> {
    try {
      const progress = await this.getUserProgress(userId);
      
      progress.completedModules.push({
        moduleId,
        completedAt: new Date(),
        score,
        timeSpent
      });

      await this.updateUserProgress(userId, progress);
      
      logger.info('Module completion recorded', 'security_education', {
        userId,
        moduleId,
        score
      });
    } catch (error) {
      logger.error('Failed to record module completion', 'security_education', {
        error,
        userId,
        moduleId
      });
      throw error;
    }
  }

  /**
   * Acknowledge security tip
   */
  async acknowledgeTip(userId: string, tipId: string): Promise<void> {
    try {
      const progress = await this.getUserProgress(userId);
      
      if (!progress.acknowledgedTips.includes(tipId)) {
        progress.acknowledgedTips.push(tipId);
        await this.updateUserProgress(userId, progress);
      }

      logger.info('Security tip acknowledged', 'security_education', {
        userId,
        tipId
      });
    } catch (error) {
      logger.error('Failed to acknowledge tip', 'security_education', {
        error,
        userId,
        tipId
      });
      throw error;
    }
  }

  /**
   * Get user's security education progress
   */
  private async getUserProgress(userId: string): Promise<UserSecurityProgress> {
    const data = await this.redis.get(`${this.keyPrefix}:progress:${userId}`);
    
    if (data) {
      return JSON.parse(data);
    }

    // Initialize new progress record
    return {
      userId,
      completedModules: [],
      acknowledgedTips: []
    };
  }

  /**
   * Update user's security education progress
   */
  private async updateUserProgress(
    userId: string,
    progress: UserSecurityProgress
  ): Promise<void> {
    await this.redis.set(
      `${this.keyPrefix}:progress:${userId}`,
      JSON.stringify(progress)
    );
  }

  /**
   * Check if user needs security assessment
   */
  async needsSecurityAssessment(userId: string): Promise<boolean> {
    const progress = await this.getUserProgress(userId);
    
    if (!progress.lastAssessment) return true;

    // Check if last assessment was more than 6 months ago
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return progress.lastAssessment.date < sixMonthsAgo;
  }

  /**
   * Record security assessment completion
   */
  async recordAssessment(userId: string, score: number): Promise<void> {
    try {
      const progress = await this.getUserProgress(userId);
      
      progress.lastAssessment = {
        date: new Date(),
        score
      };

      await this.updateUserProgress(userId, progress);
      
      logger.info('Security assessment recorded', 'security_education', {
        userId,
        score
      });
    } catch (error) {
      logger.error('Failed to record assessment', 'security_education', {
        error,
        userId,
        score
      });
      throw error;
    }
  }
} 