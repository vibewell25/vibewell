import { prisma } from '@/lib/database/client';
import { 
  Goal, 
  GoalType, 
  GoalFrequency, 
  GoalUnit, 
  GoalStatus,
  HabitLog,
  WellnessDay,
  ProgressSummary
} from '@/types/progress';

// Transform goal data from Supabase to the application model
function transformGoal(goalData: any): Goal {
  return {
    id: goalData.id,
    title: goalData.title,
    description: goalData.description || '',
    type: goalData.type as GoalType,
    target: goalData.target,
    current: goalData.current,
    unit: goalData.unit as GoalUnit,
    frequency: goalData.frequency as GoalFrequency,
    startDate: goalData.start_date,
    endDate: goalData.end_date,
    status: goalData.status as GoalStatus,
    color: goalData.color,
    reminders: !!goalData.reminder_time,
    reminderTime: goalData.reminder_time,
  };
}

// Transform application model to Supabase data format
function transformGoalForDB(goal: Omit<Goal, 'id' | 'current' | 'status'>): any {
  return {
    title: goal.title,
    description: goal.description,
    type: goal.type,
    target: goal.target,
    unit: goal.unit,
    frequency: goal.frequency,
    start_date: goal.startDate,
    end_date: goal.endDate,
    color: goal.color,
    reminder_time: goal.reminderTime,
  };
}

// Get all goals for a user
export async function getGoals(userId: string): Promise<Goal[]> {
  try {
    const { data, error } = await supabase
      .from('wellness_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching goals:', error);
      return [];
    }
    
    return (data || []).map(transformGoal);
  } catch (error) {
    console.error('Error in getGoals:', error);
    return [];
  }
}

// Create a new goal
export async function createGoal(
  userId: string, 
  goalData: Omit<Goal, 'id' | 'current' | 'status'>
): Promise<Goal | null> {
  try {
    const transformedData = transformGoalForDB(goalData);
    
    const { data, error } = await supabase
      .from('wellness_goals')
      .insert({
        ...transformedData,
        user_id: userId,
        current: 0,
        status: 'not_started',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating goal:', error);
      return null;
    }
    
    return transformGoal(data);
  } catch (error) {
    console.error('Error in createGoal:', error);
    return null;
  }
}

// Update an existing goal
export async function updateGoal(
  goalId: string,
  goalData: Partial<Omit<Goal, 'id'>>
): Promise<Goal | null> {
  try {
    // Transform to DB format
    const updateData: any = {};
    
    if (goalData.title !== undefined) updateData.title = goalData.title;
    if (goalData.description !== undefined) updateData.description = goalData.description;
    if (goalData.type !== undefined) updateData.type = goalData.type;
    if (goalData.target !== undefined) updateData.target = goalData.target;
    if (goalData.current !== undefined) updateData.current = goalData.current;
    if (goalData.unit !== undefined) updateData.unit = goalData.unit;
    if (goalData.frequency !== undefined) updateData.frequency = goalData.frequency;
    if (goalData.startDate !== undefined) updateData.start_date = goalData.startDate;
    if (goalData.endDate !== undefined) updateData.end_date = goalData.endDate;
    if (goalData.status !== undefined) updateData.status = goalData.status;
    if (goalData.color !== undefined) updateData.color = goalData.color;
    if (goalData.reminderTime !== undefined) updateData.reminder_time = goalData.reminderTime;
    
    updateData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('wellness_goals')
      .update(updateData)
      .eq('id', goalId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating goal:', error);
      return null;
    }
    
    return transformGoal(data);
  } catch (error) {
    console.error('Error in updateGoal:', error);
    return null;
  }
}

// Delete a goal
export async function deleteGoal(goalId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('wellness_goals')
      .delete()
      .eq('id', goalId);
    
    if (error) {
      console.error('Error deleting goal:', error);
      return false;
    }
    
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
    const { data: existingLogs, error: checkError } = await supabase
      .from('habit_logs')
      .select('id, value')
      .eq('goal_id', goalId)
      .eq('date', date);
    
    if (checkError) {
      console.error('Error checking existing logs:', checkError);
      return null;
    }
    
    let logData;
    
    if (existingLogs && existingLogs.length > 0) {
      // Update existing log
      const { data, error } = await supabase
        .from('habit_logs')
        .update({
          value,
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingLogs[0].id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating habit log:', error);
        return null;
      }
      
      logData = data;
    } else {
      // Create new log
      const { data, error } = await supabase
        .from('habit_logs')
        .insert({
          goal_id: goalId,
          user_id: userId,
          date,
          value,
          notes,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating habit log:', error);
        return null;
      }
      
      logData = data;
    }
    
    // Update goal's current value
    await updateGoalProgress(goalId);
    
    return {
      id: logData.id,
      goalId: logData.goal_id,
      date: logData.date,
      value: logData.value,
      notes: logData.notes
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
    let query = supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', userId);
    
    if (goalId) {
      query = query.eq('goal_id', goalId);
    }
    
    if (startDate) {
      query = query.gte('date', startDate);
    }
    
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    const { data, error } = await query.order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching habit logs:', error);
      return [];
    }
    
    return (data || []).map(log => ({
      id: log.id,
      goalId: log.goal_id,
      date: log.date,
      value: log.value,
      notes: log.notes
    }));
  } catch (error) {
    console.error('Error in getHabitLogs:', error);
    return [];
  }
}

// Get wellness days summary for a date range
export async function getWellnessDays(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<WellnessDay[]> {
  try {
    const today = new Date();
    const defaultEndDate = today.toISOString().split('T')[0];
    
    // Default to 7 days if no start date provided
    const defaultStartDate = new Date(today);
    defaultStartDate.setDate(today.getDate() - 6);
    
    const start = startDate || defaultStartDate.toISOString().split('T')[0];
    const end = endDate || defaultEndDate;
    
    // Get all logs in the date range
    const { data: logs, error } = await supabase
      .from('habit_logs')
      .select('*, goal:wellness_goals(type)')
      .eq('user_id', userId)
      .gte('date', start)
      .lte('date', end);
    
    if (error) {
      console.error('Error fetching wellness days:', error);
      return [];
    }
    
    // Get mood logs
    const { data: moodLogs, error: moodError } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('date', start)
      .lte('date', end);
    
    if (moodError) {
      console.error('Error fetching mood logs:', moodError);
    }
    
    // Group logs by date
    const dayMap = new Map<string, Partial<WellnessDay>>();
    
    // Initialize days
    const days: string[] = [];
    const currentDate = new Date(start);
    const endDateObj = new Date(end);
    
    while (currentDate <= endDateObj) {
      const dateStr = currentDate.toISOString().split('T')[0];
      days.push(dateStr);
      dayMap.set(dateStr, {
        date: dateStr,
        meditation: 0,
        workout: 0,
        water: 0,
        sleep: 0,
        steps: 0,
        mood: 3, // Default mood
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Group logs by date and type
    logs.forEach(log => {
      const day = dayMap.get(log.date) || { date: log.date };
      const goalType = log.goal?.type;
      
      if (goalType) {
        // Add the log value to the corresponding type
        day[goalType] = (day[goalType] || 0) + log.value;
      }
      
      dayMap.set(log.date, day);
    });
    
    // Add mood data
    if (moodLogs) {
      moodLogs.forEach(moodLog => {
        const day = dayMap.get(moodLog.date);
        if (day) {
          day.mood = moodLog.value;
        }
      });
    }
    
    // Convert to array and fill in missing values
    return days.map(date => {
      const day = dayMap.get(date) || { date };
      return {
        date,
        meditation: day.meditation || 0,
        workout: day.workout || 0,
        water: day.water || 0,
        sleep: day.sleep || 0,
        steps: day.steps || 0,
        mood: day.mood || 3,
        notes: day.notes
      };
    });
  } catch (error) {
    console.error('Error in getWellnessDays:', error);
    return [];
  }
}

// Update the current progress value of a goal
async function updateGoalProgress(goalId: string): Promise<void> {
  try {
    // Get the goal to check its frequency
    const { data: goal, error: goalError } = await supabase
      .from('wellness_goals')
      .select('frequency, type, unit')
      .eq('id', goalId)
      .single();
    
    if (goalError) {
      console.error('Error fetching goal for progress update:', goalError);
      return;
    }
    
    let startDate;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Determine the start date based on the goal frequency
    if (goal.frequency === 'daily') {
      startDate = today;
    } else if (goal.frequency === 'weekly') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      startDate = startOfWeek.toISOString().split('T')[0];
    } else if (goal.frequency === 'monthly') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate = startOfMonth.toISOString().split('T')[0];
    }
    
    // For one-time goals, sum all logs
    
    // Get the sum of logs for the relevant period
    const { data: logs, error: logsError } = await supabase
      .from('habit_logs')
      .select('value')
      .eq('goal_id', goalId)
      .gte('date', startDate || '2000-01-01'); // If no start date, get all logs
    
    if (logsError) {
      console.error('Error fetching logs for progress update:', logsError);
      return;
    }
    
    // Calculate the current value
    let current = 0;
    
    if (logs && logs.length > 0) {
      if (goal.type === 'sleep' && goal.unit === 'hours') {
        // For sleep, we want the average hours
        current = logs.reduce((sum, log) => sum + log.value, 0) / logs.length;
      } else {
        // For other types, we want the sum
        current = logs.reduce((sum, log) => sum + log.value, 0);
      }
    }
    
    // Update the goal
    await supabase
      .from('wellness_goals')
      .update({
        current,
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId);
    
    // Also check if the goal status should be updated
    await updateGoalStatus(goalId, current);
  } catch (error) {
    console.error('Error updating goal progress:', error);
  }
}

// Update the status of a goal based on progress and dates
async function updateGoalStatus(goalId: string, currentValue: number): Promise<void> {
  try {
    const { data: goal, error } = await supabase
      .from('wellness_goals')
      .select('*')
      .eq('id', goalId)
      .single();
    
    if (error) {
      console.error('Error fetching goal for status update:', error);
      return;
    }
    
    let newStatus: GoalStatus = goal.status;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // If the goal hasn't started yet but we have progress, mark as in progress
    if (goal.status === 'not_started' && currentValue > 0) {
      newStatus = 'in_progress';
    }
    
    // If the goal is complete (reached or exceeded target)
    if (currentValue >= goal.target && goal.status !== 'completed') {
      newStatus = 'completed';
    }
    
    // If the goal has an end date and it's in the past
    if (goal.end_date && goal.end_date < today) {
      if (currentValue < goal.target && goal.status !== 'failed') {
        newStatus = 'failed';
      }
    }
    
    // Update the status if it changed
    if (newStatus !== goal.status) {
      await supabase
        .from('wellness_goals')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId);
    }
  } catch (error) {
    console.error('Error updating goal status:', error);
  }
}

// Calculate progress summary
export async function getProgressSummary(userId: string): Promise<ProgressSummary | null> {
  try {
    // Get all active and completed goals
    const { data: goals, error: goalsError } = await supabase
      .from('wellness_goals')
      .select('status')
      .eq('user_id', userId);
    
    if (goalsError) {
      console.error('Error fetching goals for summary:', goalsError);
      return null;
    }
    
    // Count goals by status
    const activeGoals = goals.filter(g => g.status === 'in_progress').length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    
    // Get wellness days for this week and last week
    const today = new Date();
    
    // Start of this week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
    
    // Start of last week
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    const startOfLastWeekStr = startOfLastWeek.toISOString().split('T')[0];
    
    // End of last week (Saturday)
    const endOfLastWeek = new Date(startOfWeek);
    endOfLastWeek.setDate(endOfLastWeek.getDate() - 1);
    const endOfLastWeekStr = endOfLastWeek.toISOString().split('T')[0];
    
    // Get this week's data
    const thisWeekDays = await getWellnessDays(userId, startOfWeekStr);
    
    // Get last week's data
    const lastWeekDays = await getWellnessDays(userId, startOfLastWeekStr, endOfLastWeekStr);
    
    // Calculate daily streak
    const { data: logs, error: logsError } = await supabase
      .from('habit_logs')
      .select('date')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (logsError) {
      console.error('Error fetching logs for streak:', logsError);
      return null;
    }
    
    // Count streak days
    let streak = 0;
    if (logs && logs.length > 0) {
      const dates = logs.map(log => log.date);
      const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      
      if (uniqueDates.length > 0) {
        const todayStr = today.toISOString().split('T')[0];
        
        // Check if there's a log for today
        if (uniqueDates[0] === todayStr) {
          streak = 1;
          
          // Check consecutive days
          for (let i = 1; i < uniqueDates.length; i++) {
            const currentDate = new Date(uniqueDates[i-1]);
            currentDate.setDate(currentDate.getDate() - 1);
            const expectedDate = currentDate.toISOString().split('T')[0];
            
            if (uniqueDates[i] === expectedDate) {
              streak++;
            } else {
              break;
            }
          }
        }
      }
    }
    
    // Calculate this week's progress
    const thisWeekProgress = {
      meditation: thisWeekDays.reduce((sum, day) => sum + day.meditation, 0),
      workout: thisWeekDays.reduce((sum, day) => sum + day.workout, 0),
      water: thisWeekDays.reduce((sum, day) => sum + day.water, 0),
      sleep: thisWeekDays.reduce((sum, day) => sum + day.sleep, 0) / (thisWeekDays.filter(d => d.sleep > 0).length || 1), // Average
      steps: thisWeekDays.reduce((sum, day) => sum + day.steps, 0),
    };
    
    // Calculate last week's progress
    const lastWeekProgress = {
      meditation: lastWeekDays.reduce((sum, day) => sum + day.meditation, 0),
      workout: lastWeekDays.reduce((sum, day) => sum + day.workout, 0),
      water: lastWeekDays.reduce((sum, day) => sum + day.water, 0),
      sleep: lastWeekDays.reduce((sum, day) => sum + day.sleep, 0) / (lastWeekDays.filter(d => d.sleep > 0).length || 1), // Average
      steps: lastWeekDays.reduce((sum, day) => sum + day.steps, 0),
    };
    
    // Calculate improvement percentages
    const calculateImprovement = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };
    
    const improvement = {
      meditation: calculateImprovement(thisWeekProgress.meditation, lastWeekProgress.meditation),
      workout: calculateImprovement(thisWeekProgress.workout, lastWeekProgress.workout),
      water: calculateImprovement(thisWeekProgress.water, lastWeekProgress.water),
      sleep: calculateImprovement(thisWeekProgress.sleep, lastWeekProgress.sleep),
      steps: calculateImprovement(thisWeekProgress.steps, lastWeekProgress.steps),
    };
    
    return {
      activeGoals,
      completedGoals,
      dailyStreak: streak,
      thisWeekProgress,
      improvement
    };
  } catch (error) {
    console.error('Error in getProgressSummary:', error);
    return null;
  }
} 