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
export function GoalList({
  goals,
  onLogProgress,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
: GoalListProps) {
  const [selectedType, setSelectedType] = useState<GoalType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<GoalStatus | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  // Filter goals by type and status
  const filteredGoals = goals.filter((goal) => {
    const matchesType = selectedType === 'all' || goal.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || goal.status === selectedStatus;
    return matchesType && matchesStatus;
// Sort goals by status (active first) and then by creation date
  const sortedGoals = [...filteredGoals].sort((a, b) => {
    // First sort by status (in_progress first, then not_started, then completed, then failed)
    const statusOrder: Record<GoalStatus, number> = {
      in_progress: 0,
      not_started: 1,
      completed: 2,
      failed: 3,
const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    // Then sort by date (newest first)
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
return (
    <div>
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <h2 className="text-xl font-bold">Your Goals</h2>
        <div className="flex gap-2 self-start">
          <button
            className="btn-secondary flex items-center gap-1 py-1.5 text-sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Icons.FunnelIcon className="h-4 w-4" />
            Filter
          </button>
          <button
            className="btn-primary flex items-center gap-1 py-1.5 text-sm"
            onClick={onAddGoal}
          >
            <Icons.PlusIcon className="h-4 w-4" />
            New Goal
          </button>
        </div>
      </div>
      {/* Filters */}
      {showFilters && (
        <div className="mb-6 rounded-lg border border-border bg-background p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="typeFilter" className="mb-1 block text-sm font-medium">
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
              <label htmlFor="statusFilter" className="mb-1 block text-sm font-medium">
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
        <div className="rounded-lg border border-dashed border-border py-12 text-center">
          <p className="mb-4 text-muted-foreground">
            No goals found. Create your first goal to get started!
          </p>
          <button className="btn-primary mx-auto flex items-center gap-1" onClick={onAddGoal}>
            <Icons.PlusIcon className="h-5 w-5" />
            Create Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedGoals.map((goal) => (
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
