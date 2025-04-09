'use client';

import { useState, useMemo } from 'react';
import { Goal, HabitLog } from '@/types/progress';
import { format, parseISO, eachDayOfInterval, subDays, isToday, isSameDay } from 'date-fns';
import { ChevronRightIcon, ChevronLeftIcon, PlusIcon } from '@heroicons/react/24/outline';

interface HabitTrackerProps {
  goals: Goal[];
  habitLogs: HabitLog[];
  onLogHabit: (goalId: string, value: number) => void;
}

export function HabitTracker({ goals, habitLogs, onLogHabit }: HabitTrackerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
  const [logValue, setLogValue] = useState<number>(0);
  
  // Generate days for the habit calendar (last 30 days)
  const days = useMemo(() => {
    return eachDayOfInterval({
      start: subDays(currentDate, 29),
      end: currentDate
    });
  }, [currentDate]);
  
  // Get logs for a specific goal and day
  const getLogForDay = (goalId: string, date: Date): HabitLog | undefined => {
    return habitLogs.find(log => 
      log.goalId === goalId && 
      isSameDay(parseISO(log.date), date)
    );
  };
  
  // Calculate streak for a goal
  const calculateStreak = (goalId: string): number => {
    let streak = 0;
    let currentDay = new Date();
    
    // Check backwards from today until we find a day with no log
    while (true) {
      const log = getLogForDay(goalId, currentDay);
      if (log && log.value > 0) {
        streak++;
        currentDay = subDays(currentDay, 1);
      } else {
        break;
      }
    }
    
    return streak;
  };
  
  // Handle log submission
  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeGoalId && logValue >= 0) {
      onLogHabit(activeGoalId, logValue);
      setActiveGoalId(null);
      setLogValue(0);
    }
  };
  
  // Get color intensity based on value and target
  const getColorIntensity = (value: number, goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return 'bg-muted';
    
    // Calculate a percentage of target for intensity
    const percentage = Math.min((value / goal.target) * 100, 100);
    
    if (percentage === 0) return 'bg-muted';
    if (percentage < 25) return `${goal.color}10`;
    if (percentage < 50) return `${goal.color}30`;
    if (percentage < 75) return `${goal.color}50`;
    if (percentage < 100) return `${goal.color}70`;
    return `${goal.color}90`;
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Habit Tracker</h3>
        <div className="flex items-center space-x-2">
          <button
            className="p-1 rounded-full hover:bg-muted"
            onClick={() => setCurrentDate(subDays(currentDate, 30))}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <span className="text-sm">
            {format(subDays(currentDate, 29), 'MMM d')} - {format(currentDate, 'MMM d, yyyy')}
          </span>
          <button
            className="p-1 rounded-full hover:bg-muted"
            disabled={isToday(currentDate)}
            onClick={() => setCurrentDate(new Date())}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="py-2 px-3 text-left text-sm font-medium text-muted-foreground w-40">Habit</th>
              {days.map((day, i) => (
                <th 
                  key={i} 
                  className={`py-2 px-1 text-center text-xs font-medium ${
                    isToday(day) ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <div>
                    {format(day, 'EEE')}
                  </div>
                  <div>
                    {format(day, 'd')}
                  </div>
                </th>
              ))}
              <th className="py-2 px-3 text-center text-sm font-medium text-muted-foreground w-20">Streak</th>
            </tr>
          </thead>
          <tbody>
            {goals.map(goal => (
              <tr key={goal.id} className="border-t border-border">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{
                      goal.type === 'meditation' ? '🧘‍♂️' :
                      goal.type === 'workout' ? '🏋️‍♂️' :
                      goal.type === 'water' ? '💧' :
                      goal.type === 'sleep' ? '😴' :
                      goal.type === 'nutrition' ? '🥗' :
                      goal.type === 'steps' ? '👣' :
                      goal.type === 'weight' ? '⚖️' : '🎯'
                    }</span>
                    <div>
                      <div className="font-medium">{goal.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {goal.target} {goal.unit}/day
                      </div>
                    </div>
                  </div>
                </td>
                
                {days.map((day, i) => {
                  const log = getLogForDay(goal.id, day);
                  const value = log ? log.value : 0;
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <td key={i} className="px-1 py-3">
                      <div className="flex justify-center">
                        {isToday ? (
                          <button
                            className="w-8 h-8 rounded-full flex items-center justify-center border border-primary hover:bg-primary/10 transition-colors"
                            onClick={() => {
                              setActiveGoalId(goal.id);
                              setLogValue(value || (
                                goal.type === 'water' ? 1 : 
                                goal.type === 'workout' ? 30 : 
                                goal.type === 'meditation' ? 10 : 
                                goal.type === 'sleep' ? 8 : 0
                              ));
                            }}
                          >
                            {value > 0 ? value : <PlusIcon className="h-4 w-4" />}
                          </button>
                        ) : (
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              value > 0 
                                ? getColorIntensity(value, goal.id)
                                : 'bg-muted'
                            }`}
                          >
                            {value > 0 && <span className="text-xs">{value}</span>}
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
                
                <td className="py-3 px-3 text-center">
                  <span className="font-medium inline-flex items-center justify-center gap-1">
                    {calculateStreak(goal.id)}
                    {calculateStreak(goal.id) > 0 && 
                      <span className="text-orange-500">🔥</span>
                    }
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Log modal (simple implementation) */}
      {activeGoalId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">
              Log {goals.find(g => g.id === activeGoalId)?.title}
            </h3>
            
            <form onSubmit={handleLogSubmit}>
              <div className="mb-4">
                <label htmlFor="logValue" className="block text-sm font-medium mb-1">
                  Value ({goals.find(g => g.id === activeGoalId)?.unit})
                </label>
                <input
                  type="number"
                  id="logValue"
                  className="form-input w-full"
                  value={logValue}
                  onChange={(e) => setLogValue(Number(e.target.value))}
                  min={0}
                  step={goals.find(g => g.id === activeGoalId)?.type === 'sleep' ? 0.5 : 1}
                  required
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setActiveGoalId(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 