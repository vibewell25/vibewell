'use client';

import { useState, useEffect, useCallback } from 'react';
import { Goal, GoalType, HabitLog, WellnessDay, ProgressSummary } from '@/types/progress';
import { useAuth } from '@/hooks/useAuth';
import * as wellnessAPI from '@/lib/api/wellness';

// Fallback dummy data
const DUMMY_GOALS: Goal[] = [
  {
    id: '1',
    title: 'Daily Meditation',
    description: 'Meditate for at least 10 minutes every day',
    type: 'meditation',
    target: 10,
    current: 7,
    unit: 'minutes',
    frequency: 'daily',
    startDate: '2023-08-01T00:00:00.000Z',
    status: 'in_progress',
    color: '#8B5CF6',
    reminders: true,
    reminderTime: '07:00',
  },
  {
    id: '2',
    title: 'Weekly Workouts',
    description: 'Complete 3 workout sessions per week',
    type: 'workout',
    target: 3,
    current: 2,
    unit: 'sessions',
    frequency: 'weekly',
    startDate: '2023-08-01T00:00:00.000Z',
    status: 'in_progress',
    color: '#EC4899',
  },
  {
    id: '3',
    title: 'Hydration',
    description: 'Drink 8 glasses of water daily',
    type: 'water',
    target: 8,
    current: 5,
    unit: 'glasses',
    frequency: 'daily',
    startDate: '2023-08-01T00:00:00.000Z',
    status: 'in_progress',
    color: '#0EA5E9',
  },
  {
    id: '4',
    title: 'Sleep Goal',
    description: 'Get 8 hours of sleep per night',
    type: 'sleep',
    target: 8,
    current: 6.5,
    unit: 'hours',
    frequency: 'daily',
    startDate: '2023-08-01T00:00:00.000Z',
    status: 'in_progress',
    color: '#6366F1',
  },
  {
    id: '5',
    title: 'Daily Steps',
    description: 'Walk 10,000 steps per day',
    type: 'steps',
    target: 10000,
    current: 8543,
    unit: 'steps',
    frequency: 'daily',
    startDate: '2023-08-01T00:00:00.000Z',
    status: 'in_progress',
    color: '#84CC16',
  },
];

// Dummy data for habit logs
const DUMMY_HABIT_LOGS: HabitLog[] = [
  // Meditation logs for the past week
  { id: 'm1', goalId: '1', date: '2023-08-01T00:00:00.000Z', value: 10 },
  { id: 'm2', goalId: '1', date: '2023-08-02T00:00:00.000Z', value: 5 },
  { id: 'm3', goalId: '1', date: '2023-08-03T00:00:00.000Z', value: 12 },
  { id: 'm4', goalId: '1', date: '2023-08-04T00:00:00.000Z', value: 8 },
  { id: 'm5', goalId: '1', date: '2023-08-05T00:00:00.000Z', value: 15 },
  { id: 'm6', goalId: '1', date: '2023-08-06T00:00:00.000Z', value: 10 },
  { id: 'm7', goalId: '1', date: '2023-08-07T00:00:00.000Z', value: 7 },
  
  // Workout logs for the past week
  { id: 'w1', goalId: '2', date: '2023-08-01T00:00:00.000Z', value: 1 },
  { id: 'w2', goalId: '2', date: '2023-08-03T00:00:00.000Z', value: 1 },
  { id: 'w3', goalId: '2', date: '2023-08-05T00:00:00.000Z', value: 0 },
  { id: 'w4', goalId: '2', date: '2023-08-07T00:00:00.000Z', value: 1 },
  
  // Water logs for the past week
  { id: 'h1', goalId: '3', date: '2023-08-01T00:00:00.000Z', value: 6 },
  { id: 'h2', goalId: '3', date: '2023-08-02T00:00:00.000Z', value: 7 },
  { id: 'h3', goalId: '3', date: '2023-08-03T00:00:00.000Z', value: 8 },
  { id: 'h4', goalId: '3', date: '2023-08-04T00:00:00.000Z', value: 5 },
  { id: 'h5', goalId: '3', date: '2023-08-05T00:00:00.000Z', value: 7 },
  { id: 'h6', goalId: '3', date: '2023-08-06T00:00:00.000Z', value: 6 },
  { id: 'h7', goalId: '3', date: '2023-08-07T00:00:00.000Z', value: 5 },
  
  // Sleep logs for the past week
  { id: 's1', goalId: '4', date: '2023-08-01T00:00:00.000Z', value: 7.5 },
  { id: 's2', goalId: '4', date: '2023-08-02T00:00:00.000Z', value: 6 },
  { id: 's3', goalId: '4', date: '2023-08-03T00:00:00.000Z', value: 8 },
  { id: 's4', goalId: '4', date: '2023-08-04T00:00:00.000Z', value: 7 },
  { id: 's5', goalId: '4', date: '2023-08-05T00:00:00.000Z', value: 6.5 },
  { id: 's6', goalId: '4', date: '2023-08-06T00:00:00.000Z', value: 7.5 },
  { id: 's7', goalId: '4', date: '2023-08-07T00:00:00.000Z', value: 6.5 },
  
  // Steps logs for the past week
  { id: 'st1', goalId: '5', date: '2023-08-01T00:00:00.000Z', value: 9200 },
  { id: 'st2', goalId: '5', date: '2023-08-02T00:00:00.000Z', value: 8500 },
  { id: 'st3', goalId: '5', date: '2023-08-03T00:00:00.000Z', value: 12000 },
  { id: 'st4', goalId: '5', date: '2023-08-04T00:00:00.000Z', value: 7800 },
  { id: 'st5', goalId: '5', date: '2023-08-05T00:00:00.000Z', value: 10500 },
  { id: 'st6', goalId: '5', date: '2023-08-06T00:00:00.000Z', value: 6300 },
  { id: 'st7', goalId: '5', date: '2023-08-07T00:00:00.000Z', value: 8543 },
];

// Dummy wellness days data
const DUMMY_WELLNESS_DAYS: WellnessDay[] = [
  {
    date: '2023-08-01T00:00:00.000Z',
    meditation: 10,
    workout: 30,
    water: 6,
    sleep: 7.5,
    steps: 9200,
    mood: 4,
  },
  {
    date: '2023-08-02T00:00:00.000Z',
    meditation: 5,
    workout: 0,
    water: 7,
    sleep: 6,
    steps: 8500,
    mood: 3,
  },
  {
    date: '2023-08-03T00:00:00.000Z',
    meditation: 12,
    workout: 45,
    water: 8,
    sleep: 8,
    steps: 12000,
    mood: 5,
  },
  {
    date: '2023-08-04T00:00:00.000Z',
    meditation: 8,
    workout: 0,
    water: 5,
    sleep: 7,
    steps: 7800,
    mood: 4,
  },
  {
    date: '2023-08-05T00:00:00.000Z',
    meditation: 15,
    workout: 0,
    water: 7,
    sleep: 6.5,
    steps: 10500,
    mood: 4,
  },
  {
    date: '2023-08-06T00:00:00.000Z',
    meditation: 10,
    workout: 60,
    water: 6,
    sleep: 7.5,
    steps: 6300,
    mood: 3,
  },
  {
    date: '2023-08-07T00:00:00.000Z',
    meditation: 7,
    workout: 30,
    water: 5,
    sleep: 6.5,
    steps: 8543,
    mood: 4,
  },
];

export function useWellnessData() {
  const { user, loading: authLoading } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [wellnessDays, setWellnessDays] = useState<WellnessDay[]>([]);
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch goals
      const fetchedGoals = await wellnessAPI.getGoals(user.id);
      setGoals(fetchedGoals.length > 0 ? fetchedGoals : DUMMY_GOALS);

      // Fetch habit logs for the last 30 days
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      const startDate = thirtyDaysAgo.toISOString().split('T')[0];

      const fetchedLogs = await wellnessAPI.getHabitLogs(user.id, undefined, startDate);
      setHabitLogs(fetchedLogs.length > 0 ? fetchedLogs : DUMMY_HABIT_LOGS);

      // Fetch wellness days for the last 7 days
      const fetchedDays = await wellnessAPI.getWellnessDays(user.id);
      setWellnessDays(fetchedDays.length > 0 ? fetchedDays : DUMMY_WELLNESS_DAYS);

      // Fetch summary
      const fetchedSummary = await wellnessAPI.getProgressSummary(user.id);
      if (fetchedSummary) {
        setSummary(fetchedSummary);
      } else {
        // Generate fallback summary if API fails
        generateFallbackSummary(fetchedGoals.length > 0 ? fetchedGoals : DUMMY_GOALS);
      }
    } catch (err) {
      console.error('Error fetching wellness data:', err);
      setError('Failed to load wellness data');
      
      // Use dummy data as fallback
      setGoals(DUMMY_GOALS);
      setHabitLogs(DUMMY_HABIT_LOGS);
      setWellnessDays(DUMMY_WELLNESS_DAYS);
      generateFallbackSummary(DUMMY_GOALS);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Generate fallback summary from goal data
  const generateFallbackSummary = (goalsData: Goal[]) => {
    const activeGoals = goalsData.filter((g) => g.status === 'in_progress').length;
    const completedGoals = goalsData.filter((g) => g.status === 'completed').length;
    const dailyStreak = 0;

    const thisWeekProgress = {
      meditation: 0,
      workout: 0,
      water: 0,
      sleep: 0,
      steps: 0,
    };

    const improvement = {
      meditation: 0,
      workout: 0,
      water: 0,
      sleep: 0,
      steps: 0,
    };

    setSummary({
      activeGoals,
      completedGoals,
      dailyStreak,
      thisWeekProgress,
      improvement,
    });
  };

  // Load data on component mount and when user changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Create a new goal
  const createGoal = async (newGoal: Omit<Goal, 'id' | 'current' | 'status'>) => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const createdGoal = await wellnessAPI.createGoal(user.id, newGoal);
      
      if (createdGoal) {
        setGoals((prevGoals) => [createdGoal, ...prevGoals]);
      } else {
        throw new Error('Failed to create goal');
      }
    } catch (err) {
      console.error('Error creating goal:', err);
      setError('Failed to create goal');
      
      // Optimistic update with a temp ID
      const tempGoal: Goal = {
        id: `temp-${Date.now()}`,
        ...newGoal,
        current: 0,
        status: 'not_started',
      };
      
      setGoals((prevGoals) => [tempGoal, ...prevGoals]);
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing goal
  const updateGoal = async (goalId: string, updatedData: Partial<Omit<Goal, 'id'>>) => {
    try {
      setIsLoading(true);
      const updatedGoal = await wellnessAPI.updateGoal(goalId, updatedData);
      
      if (updatedGoal) {
        setGoals((prevGoals) => 
          prevGoals.map((goal) => (goal.id === goalId ? updatedGoal : goal))
        );
      } else {
        throw new Error('Failed to update goal');
      }
    } catch (err) {
      console.error('Error updating goal:', err);
      setError('Failed to update goal');
      
      // Optimistic update
      setGoals((prevGoals) => 
        prevGoals.map((goal) => 
          goal.id === goalId ? { ...goal, ...updatedData } : goal
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a goal
  const deleteGoal = async (goalId: string) => {
    try {
      setIsLoading(true);
      const success = await wellnessAPI.deleteGoal(goalId);
      
      if (success) {
        setGoals((prevGoals) => prevGoals.filter((goal) => goal.id !== goalId));
      } else {
        throw new Error('Failed to delete goal');
      }
    } catch (err) {
      console.error('Error deleting goal:', err);
      setError('Failed to delete goal');
    } finally {
      setIsLoading(false);
    }
  };

  // Log progress for a goal
  const logHabit = async (goalId: string, value: number) => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const newLog = await wellnessAPI.logHabit(user.id, goalId, value);
      
      if (newLog) {
        // Add the new log
        setHabitLogs((prevLogs) => [newLog, ...prevLogs]);
        
        // Update the goal's current value optimistically
        setGoals((prevGoals) => 
          prevGoals.map((goal) => {
            if (goal.id === goalId) {
              return { 
                ...goal, 
                current: goal.current + value,
                status: goal.status === 'not_started' ? 'in_progress' : goal.status
              };
            }
            return goal;
          })
        );
        
        // Refresh data to update summary
        fetchData();
      } else {
        throw new Error('Failed to log habit');
      }
    } catch (err) {
      console.error('Error logging habit:', err);
      setError('Failed to log habit progress');
      
      // Optimistic update with a temp ID
      const tempLog: HabitLog = {
        id: `temp-${Date.now()}`,
        goalId,
        date: new Date().toISOString(),
        value,
      };
      
      setHabitLogs((prevLogs) => [tempLog, ...prevLogs]);
      
      // Update the goal's current value optimistically
      setGoals((prevGoals) => 
        prevGoals.map((goal) => {
          if (goal.id === goalId) {
            return { 
              ...goal, 
              current: goal.current + value,
              status: goal.status === 'not_started' ? 'in_progress' : goal.status
            };
          }
          return goal;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh all data
  const refreshData = () => {
    fetchData();
  };

  return {
    goals,
    habitLogs,
    wellnessDays,
    summary,
    isLoading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    logHabit,
    refreshData
  };
} 