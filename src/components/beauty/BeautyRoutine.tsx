import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Switch } from '@/components/ui';
import { getRoutines, updateRoutine, createRoutine, Routine, RoutineStep } from '@/lib/api/beauty';

export default function BeautyRoutine() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<string>('morning');
  const [isEditing, setIsEditing] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = async () => {
    try {
      const data = await getRoutines();
      setRoutines(data);
    } catch (error) {
      console.error('Error loading routines:', error);
    }
  };

  const handleSaveRoutine = async () => {
    if (!editingRoutine) return;
    try {
      const updatedRoutine = await updateRoutine(editingRoutine);
      setRoutines(routines.map(r => r.id === updatedRoutine.id ? updatedRoutine : r));
      setIsEditing(false);
      setEditingRoutine(null);
    } catch (error) {
      console.error('Error saving routine:', error);
    }
  };

  const routineTypes = [
    { value: 'morning', label: 'Morning Routine' },
    { value: 'evening', label: 'Evening Routine' },
    { value: 'weekly', label: 'Weekly Treatment' },
  ];

  const currentRoutine = routines.find(r => r.type === selectedRoutine);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Beauty Routine</h2>
        {!isEditing && (
          <Button onClick={() => {
            setIsEditing(true);
            setEditingRoutine(currentRoutine || null);
          }}>
            Edit Routine
          </Button>
        )}
      </div>

      <div className="flex gap-4">
        {routineTypes.map(type => (
          <Button
            key={type.value}
            variant={selectedRoutine === type.value ? 'default' : 'outline'}
            onClick={() => setSelectedRoutine(type.value)}
          >
            {type.label}
          </Button>
        ))}
      </div>

      {isEditing ? (
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Edit {routineTypes.find(t => t.value === selectedRoutine)?.label}</h3>
            {editingRoutine?.steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-4">
                <Input
                  value={step.order}
                  type="number"
                  className="w-16"
                  onChange={e => {
                    const newSteps = [...editingRoutine.steps];
                    newSteps[index] = { ...step, order: parseInt(e.target.value) };
                    setEditingRoutine({ ...editingRoutine, steps: newSteps });
                  }}
                />
                <Input
                  value={step.name}
                  className="flex-1"
                  onChange={e => {
                    const newSteps = [...editingRoutine.steps];
                    newSteps[index] = { ...step, name: e.target.value };
                    setEditingRoutine({ ...editingRoutine, steps: newSteps });
                  }}
                />
                <Select
                  value={step.category}
                  options={[
                    { value: 'cleanse', label: 'Cleanse' },
                    { value: 'treat', label: 'Treatment' },
                    { value: 'moisturize', label: 'Moisturize' },
                    { value: 'protect', label: 'Protection' },
                  ]}
                  onChange={e => {
                    const newSteps = [...editingRoutine.steps];
                    newSteps[index] = { ...step, category: e.target.value };
                    setEditingRoutine({ ...editingRoutine, steps: newSteps });
                  }}
                />
                <Button
                  variant="destructive"
                  onClick={() => {
                    const newSteps = editingRoutine.steps.filter((_, i) => i !== index);
                    setEditingRoutine({ ...editingRoutine, steps: newSteps });
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              onClick={() => {
                const newStep: RoutineStep = {
                  id: Date.now().toString(),
                  order: editingRoutine?.steps.length || 0,
                  name: '',
                  category: 'cleanse',
                  completed: false,
                };
                setEditingRoutine({
                  ...editingRoutine!,
                  steps: [...(editingRoutine?.steps || []), newStep],
                });
              }}
            >
              Add Step
            </Button>
            <div className="flex justify-end gap-4 mt-4">
              <Button variant="outline" onClick={() => {
                setIsEditing(false);
                setEditingRoutine(null);
              }}>
                Cancel
              </Button>
              <Button onClick={handleSaveRoutine}>Save Changes</Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="space-y-4">
            {currentRoutine?.steps.map(step => (
              <div key={step.id} className="flex items-center gap-4">
                <Switch
                  checked={step.completed}
                  onCheckedChange={checked => {
                    const updatedRoutine = {
                      ...currentRoutine,
                      steps: currentRoutine.steps.map(s =>
                        s.id === step.id ? { ...s, completed: checked } : s
                      ),
                    };
                    updateRoutine(updatedRoutine);
                    setRoutines(routines.map(r =>
                      r.id === currentRoutine.id ? updatedRoutine : r
                    ));
                  }}
                />
                <div className="flex-1">
                  <h4 className="font-medium">{step.name}</h4>
                  <p className="text-sm text-gray-600">{step.category}</p>
                </div>
                <span className="text-sm text-gray-500">Step {step.order + 1}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Routine Progress</h3>
        <div className="space-y-4">
          {routineTypes.map(type => {
            const routine = routines.find(r => r.type === type.value);
            const completed = routine?.steps.filter(s => s.completed).length || 0;
            const total = routine?.steps.length || 0;
            const progress = total > 0 ? (completed / total) * 100 : 0;

            return (
              <div key={type.value} className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">{type.label}</span>
                  <span className="text-sm text-gray-600">
                    {completed}/{total} steps completed
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
} 