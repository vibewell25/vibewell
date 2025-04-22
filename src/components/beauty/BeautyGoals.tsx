import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Badge } from '@/components/ui';
import { getBeautyGoals, createBeautyGoal, updateBeautyGoal } from '@/lib/api/beauty';
import { BeautyGoal } from '@/lib/api/beauty';

const goalCategories = [
  'skin_health',
  'anti_aging',
  'acne_management',
  'hydration',
  'even_tone',
  'texture_improvement',
  'other'
] as const;

const goalStatuses = ['not_started', 'in_progress', 'completed', 'on_hold'] as const;

export default function BeautyGoals() {
  const [goals, setGoals] = useState<BeautyGoal[]>([]);
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [newGoal, setNewGoal] = useState<Omit<BeautyGoal, 'id' | 'userId' | 'createdAt'>>({
    title: '',
    description: '',
    category: 'skin_health',
    targetDate: '',
    status: 'not_started',
    progress: 0,
    milestones: [],
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const userGoals = await getBeautyGoals();
      setGoals(userGoals);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const handleAddMilestone = () => {
    setNewGoal(prev => ({
      ...prev,
      milestones: [...prev.milestones, { description: '', completed: false }],
    }));
  };

  const handleMilestoneChange = (index: number, description: string) => {
    setNewGoal(prev => ({
      ...prev,
      milestones: prev.milestones.map((milestone, i) =>
        i === index ? { ...milestone, description } : milestone
      ),
    }));
  };

  const handleSubmit = async () => {
    try {
      await createBeautyGoal(newGoal);
      setShowNewGoal(false);
      setNewGoal({
        title: '',
        description: '',
        category: 'skin_health',
        targetDate: '',
        status: 'not_started',
        progress: 0,
        milestones: [],
      });
      loadGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const handleUpdateStatus = async (goalId: string, newStatus: typeof goalStatuses[number]) => {
    try {
      await updateBeautyGoal(goalId, { status: newStatus });
      loadGoals();
    } catch (error) {
      console.error('Error updating goal status:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Beauty Goals</h2>
        <Button onClick={() => setShowNewGoal(!showNewGoal)}>
          {showNewGoal ? 'Cancel' : 'New Goal'}
        </Button>
      </div>

      {showNewGoal && (
        <Card className="p-6 space-y-4">
          <Input
            label="Goal Title"
            value={newGoal.title}
            onChange={e => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
          />
          
          <Input
            label="Description"
            value={newGoal.description}
            onChange={e => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
          />

          <Select
            label="Category"
            value={newGoal.category}
            onChange={e => setNewGoal(prev => ({ ...prev, category: e.target.value as typeof goalCategories[number] }))}
            options={goalCategories.map(cat => ({
              value: cat,
              label: cat.replace('_', ' ').split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' '),
            }))}
          />

          <Input
            type="date"
            label="Target Date"
            value={newGoal.targetDate}
            onChange={e => setNewGoal(prev => ({ ...prev, targetDate: e.target.value }))}
          />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Milestones</h3>
              <Button variant="outline" onClick={handleAddMilestone}>Add Milestone</Button>
            </div>

            {newGoal.milestones.map((milestone, index) => (
              <Input
                key={index}
                label={`Milestone ${index + 1}`}
                value={milestone.description}
                onChange={e => handleMilestoneChange(index, e.target.value)}
              />
            ))}
          </div>

          <Button onClick={handleSubmit}>Create Goal</Button>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map(goal => (
          <Card key={goal.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">{goal.title}</h3>
                <p className="text-gray-600">{goal.description}</p>
              </div>
              <Badge>{goal.category.replace('_', ' ')}</Badge>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Target Date: {new Date(goal.targetDate).toLocaleDateString()}
                </p>
                <Select
                  value={goal.status}
                  onChange={e => handleUpdateStatus(goal.id, e.target.value as typeof goalStatuses[number])}
                  options={goalStatuses.map(status => ({
                    value: status,
                    label: status.replace('_', ' ').split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' '),
                  }))}
                />
              </div>

              {goal.milestones.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Milestones</h4>
                  <div className="space-y-2">
                    {goal.milestones.map((milestone, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={milestone.completed}
                          onChange={() => {
                            const updatedMilestones = goal.milestones.map((m, i) =>
                              i === index ? { ...m, completed: !m.completed } : m
                            );
                            updateBeautyGoal(goal.id, { milestones: updatedMilestones });
                            loadGoals();
                          }}
                        />
                        <span className={milestone.completed ? 'line-through text-gray-500' : ''}>
                          {milestone.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 