'use client';

import { Icons } from '@/components/icons';
import { useState } from 'react';
import { Goal, GoalType, GoalStatus } from '@/types/progress';
import { GoalProgressCard } from './GoalProgressCard';

interface GoalListProps {
  goals: Goal[];
  onLogProgress: (goalId: string, value: number) => void;
  onAddGoal: () => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
}
export function GoalList({ 
  goals, 
  onLogProgress, 
  onAddGoal,
  onEditGoal,
  onDeleteGoal
}: GoalListProps) {
  const [selectedType, setSelectedType] = useState<GoalType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<GoalStatus | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  // Filter goals by type and status
  const filteredGoals = goals.filter(goal => {
    const matchesType = selectedType === 'all' || goal.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || goal.status === selectedStatus;
    return matchesType && matchesStatus;
  });
  // Sort goals by status (active first) and then by creation date
  const sortedGoals = [...filteredGoals].sort((a, b) => {
    // First sort by status (in_progress first, then not_started, then completed, then failed)
    const statusOrder: Record<GoalStatus, number> = {
      'in_progress': 0,
      'not_started': 1,
      'completed': 2,
      'failed': 3,
    };
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    // Then sort by date (newest first)
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold">Your Goals</h2>
        <div className="flex gap-2 self-start">
          <button
            className="btn-secondary flex items-center gap-1 text-sm py-1.5"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Icons.FunnelIcon className="h-4 w-4" />
            Filter
          </button>
          <button
            className="btn-primary flex items-center gap-1 text-sm py-1.5"
            onClick={onAddGoal}
          >
            <Icons.PlusIcon className="h-4 w-4" />
            New Goal
          </button>
        </div>
      </div>
      {/* Filters */}
      {showFilters && (
        <div className="mb-6 p-4 border border-border rounded-lg bg-background">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="typeFilter" className="block text-sm font-medium mb-1">
                Goal Type
              </label>
              <select
                id="typeFilter"
                className="form-select w-full"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as GoalType | 'all')}
              >
                <option value="all">All Types</option>
                <option value="meditation">Meditation</option>
                <option value="workout">Workout</option>
                <option value="water">Water</option>
                <option value="sleep">Sleep</option>
                <option value="nutrition">Nutrition</option>
                <option value="steps">Steps</option>
                <option value="weight">Weight</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium mb-1">
                Status
              </label>
              <select
                id="statusFilter"
                className="form-select w-full"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as GoalStatus | 'all')}
              >
                <option value="all">All Statuses</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>
      )}
      {/* Goals */}
      {sortedGoals.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <p className="text-muted-foreground mb-4">No goals found. Create your first goal to get started!</p>
          <button
            className="btn-primary flex items-center gap-1 mx-auto"
            onClick={onAddGoal}
          >
            <Icons.PlusIcon className="h-5 w-5" />
            Create Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedGoals.map(goal => (
            <GoalProgressCard 
              key={goal.id} 
              goal={goal} 
              onLogProgress={(value) => onLogProgress(goal.id, value)}
              onEdit={() => onEditGoal(goal)}
              onDelete={() => onDeleteGoal(goal.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
} 