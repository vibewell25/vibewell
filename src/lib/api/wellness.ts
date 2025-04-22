import { prisma } from '@/lib/database/client';
import {
  Goal,
  GoalType,
  GoalFrequency,
  GoalUnit,
  GoalStatus,
  HabitLog,
  WellnessDay,
  ProgressSummary,
} from '@/types/progress';
import { Prisma } from '@prisma/client';

export type WellnessGoal = {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetDate: string;
  completed: boolean;
  progress: number;
  category: string;
  createdAt: string;
  updatedAt: string;
};

export type HabitLog = {
  id: string;
  goalId: string;
  date: string;
  completed: boolean;
  notes?: string;
};

function transformGoal(goal: any): WellnessGoal {
  return {
    id: goal.id,
    userId: goal.userId,
    title: goal.title,
    description: goal.description,
    targetDate: goal.targetDate.toISOString(),
    completed: goal.completed,
    progress: goal.progress,
    category: goal.category,
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
  };
}

function transformHabitLog(log: any): HabitLog {
  return {
    id: log.id,
    goalId: log.goalId,
    date: log.date.toISOString(),
    completed: log.completed,
    notes: log.notes,
  };
}

// Get all goals for a user
export async function getGoals(userId: string): Promise<WellnessGoal[]> {
  try {
    const goals = await prisma.wellnessGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return goals.map(transformGoal);
  } catch (error) {
    console.error('Error in getGoals:', error);
    return [];
  }
}

// Create a new goal
export async function createGoal(
  userId: string,
  data: Omit<WellnessGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<WellnessGoal | null> {
  try {
    const goal = await prisma.wellnessGoal.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        targetDate: new Date(data.targetDate),
        completed: data.completed,
        progress: data.progress,
        category: data.category,
      },
    });

    return transformGoal(goal);
  } catch (error) {
    console.error('Error in createGoal:', error);
    return null;
  }
}

// Update an existing goal
export async function updateGoal(
  goalId: string,
  data: Partial<Omit<WellnessGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<WellnessGoal | null> {
  try {
    const goal = await prisma.wellnessGoal.update({
      where: { id: goalId },
      data: {
        ...data,
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
        updatedAt: new Date(),
      },
    });

    return transformGoal(goal);
  } catch (error) {
    console.error('Error in updateGoal:', error);
    return null;
  }
}

// Delete a goal
export async function deleteGoal(goalId: string): Promise<boolean> {
  try {
    await prisma.wellnessGoal.delete({
      where: { id: goalId },
    });
    return true;
  } catch (error) {
    console.error('Error in deleteGoal:', error);
    return false;
  }
}

// Log progress for a goal
export async function logHabit(
  userId: string,
  goalId: string,
  value: number,
  date = new Date().toISOString().split('T')[0],
  notes?: string
): Promise<HabitLog | null> {
  try {
    // Check if there's already a log for this date
    const existingLog = await prisma.habitLog.findFirst({
      where: {
        goalId,
        date,
      },
    });

    let log;
    if (existingLog) {
      // Update existing log
      log = await prisma.habitLog.update({
        where: { id: existingLog.id },
        data: {
          value,
          notes,
        },
      });
    } else {
      // Create new log
      log = await prisma.habitLog.create({
        data: {
          goalId,
          userId,
          date,
          value,
          notes,
        },
      });
    }

    // Update goal's current value
    await updateGoalProgress(goalId);

    return {
      id: log.id,
      goalId: log.goalId,
      date: log.date,
      value: log.value,
      notes: log.notes,
    };
  } catch (error) {
    console.error('Error in logHabit:', error);
    return null;
  }
}

// Get habit logs for a goal or all goals within a date range
export async function getHabitLogs(
  userId: string,
  goalId?: string,
  startDate?: string,
  endDate?: string
): Promise<HabitLog[]> {
  try {
    const where: Prisma.HabitLogWhereInput = { userId };
    
    if (goalId) where.goalId = goalId;
    if (startDate) where.date = { gte: startDate };
    if (endDate) where.date = { ...where.date, lte: endDate };

    const logs = await prisma.habitLog.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return logs.map(log => ({
      id: log.id,
      goalId: log.goalId,
      date: log.date,
      value: log.value,
      notes: log.notes,
    }));
  } catch (error) {
    console.error('Error in getHabitLogs:', error);
    return [];
  }
}

// Get wellness days summary
export async function getWellnessDays(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<WellnessDay[]> {
  try {
    const where: Prisma.HabitLogWhereInput = { userId };
    
    if (startDate) where.date = { gte: startDate };
    if (endDate) where.date = { ...where.date, lte: endDate };

    const logs = await prisma.habitLog.findMany({
      where,
      include: {
        goal: true,
      },
      orderBy: { date: 'desc' },
    });

    const dayMap = new Map<string, WellnessDay>();

    logs.forEach(log => {
      const day = dayMap.get(log.date) || {
        date: log.date,
        goals: [],
        totalProgress: 0,
        completedGoals: 0,
      };

      day.goals.push({
        id: log.goalId,
        title: log.goal.title,
        target: log.goal.target,
        value: log.value,
        unit: log.goal.unit as GoalUnit,
        notes: log.notes,
      });

      const progress = (log.value / log.goal.target) * 100;
      day.totalProgress += progress;
      if (progress >= 100) day.completedGoals++;

      dayMap.set(log.date, day);
    });

    return Array.from(dayMap.values()).map(day => ({
      ...day,
      totalProgress: day.goals.length > 0 ? day.totalProgress / day.goals.length : 0,
    }));
  } catch (error) {
    console.error('Error in getWellnessDays:', error);
    return [];
  }
}

// Update goal progress
async function updateGoalProgress(goalId: string): Promise<void> {
  try {
    const goal = await prisma.wellnessGoal.findUnique({
      where: { id: goalId },
      include: {
        logs: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    });

    if (!goal) return;

    const currentValue = goal.logs[0]?.value || 0;
    await updateGoalStatus(goalId, currentValue);

  } catch (error) {
    console.error('Error in updateGoalProgress:', error);
  }
}

// Update goal status based on progress
async function updateGoalStatus(goalId: string, currentValue: number): Promise<void> {
  try {
    const goal = await prisma.wellnessGoal.findUnique({
      where: { id: goalId },
    });

    if (!goal) return;

    let status: GoalStatus = goal.status as GoalStatus;
    const progress = (currentValue / goal.target) * 100;

    if (progress >= 100) {
      status = 'completed';
    } else if (progress > 0) {
      status = 'in_progress';
    } else if (new Date(goal.startDate) > new Date()) {
      status = 'not_started';
    } else {
      status = 'behind';
    }

    await prisma.wellnessGoal.update({
      where: { id: goalId },
      data: {
        current: currentValue,
        status,
      },
    });
  } catch (error) {
    console.error('Error in updateGoalStatus:', error);
  }
}

// Get progress summary
export async function getProgressSummary(userId: string): Promise<ProgressSummary | null> {
  try {
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    const [currentGoals, weeklyLogs, lastWeekLogs] = await Promise.all([
      prisma.wellnessGoal.findMany({
        where: { userId },
      }),
      prisma.habitLog.findMany({
        where: {
          userId,
          date: { gte: startOfWeek.toISOString().split('T')[0] },
        },
      }),
      prisma.habitLog.findMany({
        where: {
          userId,
          date: {
            gte: startOfLastWeek.toISOString().split('T')[0],
            lt: startOfWeek.toISOString().split('T')[0],
          },
        },
      }),
    ]);

    const totalGoals = currentGoals.length;
    const completedGoals = currentGoals.filter(g => g.status === 'completed').length;
    const inProgressGoals = currentGoals.filter(g => g.status === 'in_progress').length;

    const weeklyProgress = weeklyLogs.reduce((sum, log) => sum + log.value, 0);
    const lastWeekProgress = lastWeekLogs.reduce((sum, log) => sum + log.value, 0);

    const calculateImprovement = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      totalGoals,
      completedGoals,
      inProgressGoals,
      weeklyProgress,
      lastWeekProgress,
      improvement: calculateImprovement(weeklyProgress, lastWeekProgress),
    };
  } catch (error) {
    console.error('Error in getProgressSummary:', error);
    return null;
  }
}
