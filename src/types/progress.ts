// Types for wellness tracking

export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'failed';

export type GoalType =
  | 'meditation'
  | 'workout'
  | 'water'
  | 'sleep'
  | 'nutrition'
  | 'steps'
  | 'weight'
  | 'custom';

export type GoalFrequency = 'daily' | 'weekly' | 'monthly' | 'one_time';

export type GoalUnit =
  | 'minutes'
  | 'sessions'
  | 'glasses'
  | 'hours'
  | 'calories'
  | 'steps'
  | 'kg'
  | 'lbs'
  | 'custom';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  type: GoalType;
  target: number;
  current: number;
  unit: GoalUnit;
  frequency: GoalFrequency;
  startDate: string;
  endDate?: string;
  status: GoalStatus;
  color?: string;
  reminders?: boolean;
  reminderTime?: string;
}

export interface HabitLog {
  id: string;
  goalId: string;
  date: string;
  value: number;
  notes?: string;
}

export interface WellnessDay {
  date: string;
  meditation: number; // minutes
  workout: number; // minutes
  water: number; // glasses
  sleep: number; // hours
  steps: number;
  mood: 1 | 2 | 3 | 4 | 5; // 1-5 scale
  notes?: string;
}

export interface ProgressSummary {
  activeGoals: number;
  completedGoals: number;
  dailyStreak: number;
  thisWeekProgress: {
    meditation: number;
    workout: number;
    water: number;
    sleep: number;
    steps: number;
  };
  improvement: {
    meditation: number; // percentage compared to last week
    workout: number;
    water: number;
    sleep: number;
    steps: number;
  };
}

export interface ContentProgress {
  contentId: string;
  contentType: 'video' | 'audio' | 'article' | 'program';
  lastPosition?: number; // For videos/audio - seconds
  completed: boolean;
  completedDate?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}
