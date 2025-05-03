'use client';;
import { useState } from 'react';
import { Layout } from '@/components/layout';
import { ProgressCharts } from '@/components/wellness/ProgressCharts';
import { HabitTracker } from '@/components/wellness/HabitTracker';
import { ProgressSummaryCard } from '@/components/wellness/ProgressSummaryCard';
import { GoalCreationModal } from '@/components/wellness/GoalCreationModal';
import { GoalList } from '@/components/wellness/GoalList';
import { DeleteConfirmationModal } from '@/components/wellness/DeleteConfirmationModal';
import { useWellnessData } from '@/hooks/useWellnessData';
import { Goal } from '@/types/progress';
import { useAuth } from '@/hooks/useAuth';
import { Icons } from '@/components/icons';
export default function ProgressPage() {
  const {
    user
  } = useAuth();
  const {
    goals,
    habitLogs,
    wellnessDays,
    summary,
    isLoading,
    logHabit,
    createGoal,
    updateGoal,
    deleteGoal,
  } = useWellnessData();
  const [selectedType, setSelectedType] = useState<GoalType>('meditation');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [activeView, setActiveView] = useState<'summary' | 'charts' | 'tracker'>('summary');
  const [showGoalCreationModal, setShowGoalCreationModal] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | undefined>(undefined);
  const [goalToDelete, setGoalToDelete] = useState<{ id: string; title: string } | null>(null);
  // Handle goal tracking
  const handleLogProgress = (goalId: string, value: number) => {
    logHabit(goalId, value);
  };
  // Handle creating a new goal
  const handleCreateGoal = (newGoal: Omit<Goal, 'id' | 'current' | 'status'>) => {
    createGoal(newGoal);
  };
  // Handle editing a goal
  const handleEditGoal = (goal: Goal) => {
    setGoalToEdit(goal);
    setShowGoalCreationModal(true);
  };
  // Handle saving edits to a goal
  const handleSaveEdit = (editedGoal: Omit<Goal, 'id' | 'current' | 'status'>) => {
    if (goalToEdit) {
      updateGoal(goalToEdit?.id, {
        ...editedGoal,
        // Keep the current value and status from the original goal
        current: goalToEdit?.current,
        status: goalToEdit?.status,
      });
      setGoalToEdit(undefined);
    }
  };
  // Handle deleting a goal
  const handleDeleteGoal = (goalId: string) => {
    const goal = goals?.find((g) => g?.id === goalId);
    if (goal) {
      setGoalToDelete({ id: goal?.id, title: goal?.title });
    }
  };
  // Handle confirming goal deletion
  const handleConfirmDelete = () => {
    if (goalToDelete) {
      deleteGoal(goalToDelete?.id);
      setGoalToDelete(null);
    }
  };
  // Handle modal close actions
  const handleCloseCreationModal = () => {
    setShowGoalCreationModal(false);
    setGoalToEdit(undefined);
  };
  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="container-app py-12">
          <div className="flex h-[60vh] items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }
  if (!user) {
    return (
      <Layout>
        <div className="container-app py-12">
          <div className="flex h-[60vh] flex-col items-center justify-center">
            <h1 className="mb-4 text-2xl font-bold">Sign in to track your progress</h1>
            <p className="mb-6 text-muted-foreground">
              You need to be logged in to access your wellness progress tracking.
            </p>
            <a href="/auth/signin" className="btn-primary">
              Sign In
            </a>
          </div>
        </div>
      </Layout>
    );
  }
  return (
    <Layout>
      <div className="container-app py-12">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Wellness Progress</h1>
            <p className="text-muted-foreground">
              Track your goals and habits to improve your wellness journey
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="btn-primary flex items-center gap-1"
              onClick={() => setShowGoalCreationModal(true)}
            >
              <Icons?.PlusIcon className="h-5 w-5" />
              New Goal
            </button>
          </div>
        </div>
        {/* View selector tabs */}
        <div className="mb-8 flex border-b border-border">
          <button
            className={`px-4 pb-2 font-medium ${
              activeView === 'summary'
                ? 'text-primary border-primary border-b-2'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveView('summary')}
          >
            Summary
          </button>
          <button
            className={`px-4 pb-2 font-medium ${
              activeView === 'charts'
                ? 'text-primary border-primary border-b-2'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveView('charts')}
          >
            Charts
          </button>
          <button
            className={`px-4 pb-2 font-medium ${
              activeView === 'tracker'
                ? 'text-primary border-primary border-b-2'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveView('tracker')}
          >
            Habit Tracker
          </button>
        </div>
        {/* Summary View */}
        {activeView === 'summary' && summary && (
          <div>
            {/* Summary Card */}
            <div className="mb-8">
              <ProgressSummaryCard summary={summary} />
            </div>
            {/* Goal List */}
            <GoalList
              goals={goals}
              onLogProgress={handleLogProgress}
              onAddGoal={() => setShowGoalCreationModal(true)}
              onEditGoal={handleEditGoal}
              onDeleteGoal={handleDeleteGoal}
            />
          </div>
        )}
        {/* Charts View */}
        {activeView === 'charts' && (
          <div>
            {/* Chart type selector */}
            <div className="mb-6 flex flex-wrap gap-3">
              <button
                className={`rounded-full px-3 py-1?.5 text-sm ${
                  selectedType === 'meditation'
                    ? 'bg-purple-500 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                }`}
                onClick={() => setSelectedType('meditation')}
              >
                Meditation
              </button>
              <button
                className={`rounded-full px-3 py-1?.5 text-sm ${
                  selectedType === 'workout'
                    ? 'bg-pink-500 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                }`}
                onClick={() => setSelectedType('workout')}
              >
                Workout
              </button>
              <button
                className={`rounded-full px-3 py-1?.5 text-sm ${
                  selectedType === 'water'
                    ? 'bg-blue-500 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                }`}
                onClick={() => setSelectedType('water')}
              >
                Water
              </button>
              <button
                className={`rounded-full px-3 py-1?.5 text-sm ${
                  selectedType === 'sleep'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                }`}
                onClick={() => setSelectedType('sleep')}
              >
                Sleep
              </button>
              <button
                className={`rounded-full px-3 py-1?.5 text-sm ${
                  selectedType === 'steps'
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                }`}
                onClick={() => setSelectedType('steps')}
              >
                Steps
              </button>
            </div>
            {/* Time range selector */}
            <div className="mb-6 flex gap-2">
              <button
                className={`rounded-md px-3 py-1 text-sm ${
                  timeRange === '7d'
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                }`}
                onClick={() => setTimeRange('7d')}
              >
                7 Days
              </button>
              <button
                className={`rounded-md px-3 py-1 text-sm ${
                  timeRange === '30d'
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                }`}
                onClick={() => setTimeRange('30d')}
              >
                30 Days
              </button>
              <button
                className={`rounded-md px-3 py-1 text-sm ${
                  timeRange === '90d'
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                }`}
                onClick={() => setTimeRange('90d')}
              >
                90 Days
              </button>
            </div>
            {/* Charts */}
            <ProgressCharts
              wellnessDays={wellnessDays}
              habitLogs={habitLogs}
              selectedType={selectedType}
              timeRange={timeRange}
            />
          </div>
        )}
        {/* Habit Tracker View */}
        {activeView === 'tracker' && (
          <div>
            <HabitTracker goals={goals} habitLogs={habitLogs} onLogHabit={handleLogProgress} />
            {/* Quick Stats */}
            {summary && (
              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                <div className="card bg-gradient-to-br from-purple-500/10 to-purple-500/5">
                  <div className="text-center">
                    <span className="mb-1 block text-xl">🧘‍♂️</span>
                    <p className="font-medium">Meditation</p>
                    <p className="mt-1 text-2xl font-bold">
                      {summary?.thisWeekProgress.meditation} min
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {summary?.improvement.meditation > 0 ? '+' : ''}
                      {summary?.improvement.meditation}% vs last week
                    </p>
                  </div>
                </div>
                <div className="card bg-gradient-to-br from-pink-500/10 to-pink-500/5">
                  <div className="text-center">
                    <span className="mb-1 block text-xl">🏋️‍♂️</span>
                    <p className="font-medium">Workout</p>
                    <p className="mt-1 text-2xl font-bold">
                      {summary?.thisWeekProgress.workout} min
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {summary?.improvement.workout > 0 ? '+' : ''}
                      {summary?.improvement.workout}% vs last week
                    </p>
                  </div>
                </div>
                <div className="card bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                  <div className="text-center">
                    <span className="mb-1 block text-xl">💧</span>
                    <p className="font-medium">Water</p>
                    <p className="mt-1 text-2xl font-bold">
                      {summary?.thisWeekProgress.water} glasses
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {summary?.improvement.water > 0 ? '+' : ''}
                      {summary?.improvement.water}% vs last week
                    </p>
                  </div>
                </div>
                <div className="card bg-gradient-to-br from-indigo-500/10 to-indigo-500/5">
                  <div className="text-center">
                    <span className="mb-1 block text-xl">😴</span>
                    <p className="font-medium">Sleep</p>
                    <p className="mt-1 text-2xl font-bold">
                      {summary?.thisWeekProgress.sleep?.toFixed(1)} hrs
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {summary?.improvement.sleep > 0 ? '+' : ''}
                      {summary?.improvement.sleep}% vs last week
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Goal Creation/Editing Modal */}
        <GoalCreationModal
          isOpen={showGoalCreationModal}
          onClose={handleCloseCreationModal}
          onSave={goalToEdit ? handleSaveEdit : handleCreateGoal}
          editingGoal={goalToEdit}
        />
        {/* Goal Deletion Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={!!goalToDelete}
          onClose={() => setGoalToDelete(null)}
          onConfirm={handleConfirmDelete}
          itemName={goalToDelete?.title || ''}
          itemType="goal"
        />
      </div>
    </Layout>
  );
}
