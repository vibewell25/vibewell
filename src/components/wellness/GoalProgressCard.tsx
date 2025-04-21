'use client';

import { Icons } from '@/components/icons';
import { useState } from 'react';
import { Goal } from '@/types/progress';

interface GoalProgressCardProps {
  goal: Goal;
  streak?: number;
  improvement?: number;
  onLogProgress: (value: number) => void;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goalId: string) => void;
}

export function GoalProgressCard({
  goal,
  streak = 0,
  improvement = 0,
  onLogProgress,
  onEdit,
  onDelete,
}: GoalProgressCardProps) {
  const [showLogForm, setShowLogForm] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [logValue, setLogValue] = useState<number>(
    goal.type === 'water'
      ? 1
      : goal.type === 'workout'
        ? 30
        : goal.type === 'meditation'
          ? 10
          : goal.type === 'sleep'
            ? 8
            : 0
  );
  // Calculate progress percentage
  const progressPercentage = Math.min((goal.current / goal.target) * 100, 100);
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogProgress(logValue);
    setShowLogForm(false);
  };
  // Format unit for display
  const formatUnit = (value: number, unit: string) => {
    if (unit === 'minutes' && value >= 60) {
      const hours = Math.floor(value / 60);
      const mins = value % 60;
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${value} ${value === 1 ? unit.replace(/s$/, '') : unit}`;
  };
  // Get goal icon
  const getGoalIcon = () => {
    switch (goal.type) {
      case 'meditation':
        return '🧘‍♂️';
      case 'workout':
        return '🏋️‍♂️';
      case 'water':
        return '💧';
      case 'sleep':
        return '😴';
      case 'nutrition':
        return '🥗';
      case 'steps':
        return '👣';
      case 'weight':
        return '⚖️';
      default:
        return '🎯';
    }
  };
  // Handle closing menus when clicking outside
  const handleClickOutside = () => {
    setShowActions(false);
  };
  // Add event listener for clicks outside the menu
  if (typeof window !== 'undefined' && showActions) {
    window.addEventListener('click', handleClickOutside);
  }
  return (
    <div className="card overflow-hidden relative">
      <div className="h-2 mb-4" style={{ backgroundColor: goal.color || '#6366F1' }} />
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{getGoalIcon()}</span>
            <h3 className="text-lg font-semibold">{goal.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
        </div>
        <div className="flex gap-2">
          {/* More Actions Button */}
          <button
            className="text-muted-foreground hover:text-foreground"
            onClick={e => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
          >
            <Icons.EllipsisHorizontalIcon className="h-5 w-5" />
          </button>
          {/* Log Progress Button */}
          <button
            className="btn-primary-outline text-sm py-1 px-3 flex items-center gap-1"
            onClick={() => setShowLogForm(!showLogForm)}
          >
            <Icons.PlusIcon className="h-4 w-4" />
            Log
          </button>
        </div>
      </div>
      {/* Actions Menu */}
      {showActions && (
        <div className="absolute right-0 top-12 bg-card shadow-lg rounded-md border border-border overflow-hidden z-10">
          {onEdit && (
            <button
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-muted"
              onClick={e => {
                e.stopPropagation();
                setShowActions(false);
                onEdit(goal);
              }}
            >
              <Icons.PencilIcon className="h-4 w-4" />
              Edit Goal
            </button>
          )}
          {onDelete && (
            <button
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-muted text-red-500"
              onClick={e => {
                e.stopPropagation();
                setShowActions(false);
                onDelete(goal.id);
              }}
            >
              <Icons.TrashIcon className="h-4 w-4" />
              Delete Goal
            </button>
          )}
        </div>
      )}
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">
            {formatUnit(goal.current, goal.unit)} of {formatUnit(goal.target, goal.unit)}
          </span>
          <span className="text-sm font-medium">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-500 ease-in-out"
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: goal.color || '#6366F1',
            }}
          />
        </div>
      </div>
      {/* Stats */}
      <div className="flex gap-4 text-sm">
        {streak > 0 && (
          <div className="flex items-center gap-1 text-orange-500">
            <Icons.FireIcon className="h-4 w-4" />
            <span>{streak} day streak</span>
          </div>
        )}
        {improvement !== 0 && (
          <div
            className={`flex items-center gap-1 ${improvement > 0 ? 'text-green-500' : 'text-red-500'}`}
          >
            {improvement > 0 ? (
              <Icons.ArrowUpIcon className="h-4 w-4" />
            ) : (
              <Icons.ArrowDownIcon className="h-4 w-4" />
            )}
            <span>{Math.abs(improvement)}% vs last week</span>
          </div>
        )}
        {goal.frequency && (
          <div className="text-muted-foreground">
            {goal.frequency.charAt(0).toUpperCase() + goal.frequency.slice(1)}
          </div>
        )}
      </div>
      {/* Log form (conditionally rendered) */}
      {showLogForm && (
        <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-border">
          <div className="mb-3">
            <label htmlFor="logValue" className="block text-sm font-medium mb-1">
              Log your progress
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                id="logValue"
                className="form-input w-full"
                value={logValue}
                onChange={e => setLogValue(Number(e.target.value))}
                min={0}
                step={goal.type === 'sleep' ? 0.5 : 1}
                required
              />
              <span className="flex items-center text-sm text-muted-foreground">{goal.unit}</span>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn-secondary text-sm py-1"
              onClick={() => setShowLogForm(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary text-sm py-1 flex items-center gap-1">
              <Icons.CheckIcon className="h-4 w-4" />
              Save
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
