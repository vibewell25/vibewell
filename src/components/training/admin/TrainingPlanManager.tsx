'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Select, Dialog } from '@/components/ui';
import {
  getAllTrainingPlans,
  assignTrainingPlan,
  bulkUpdateModuleOrder,
} from '@/lib/api/training-admin';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { PlusIcon, PencilIcon } from '@heroicons/react/24/outline';

interface DraggableModuleProps {
  id: string;
  name: string;
  order: number;
  onMove: (dragId: string, hoverId: string) => void;
}

const DraggableModule = ({ id, name, order, onMove }: DraggableModuleProps) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'module',
    item: { id, order },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'module',
    hover: (item: { id: string }) => {
      if (item.id !== id) {
        onMove(item.id, id);
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`mb-2 cursor-move rounded-lg border bg-white p-4 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span>{name}</span>
        <span className="text-gray-500">Order: {order}</span>
      </div>
    </div>
  );
};

export default function TrainingPlanManager() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    try {
      const data = await getAllTrainingPlans();
      setPlans(data);
    } catch (error) {
      console.error('Error loading training plans:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleModuleMove = async (dragId: string, hoverId: string) => {
    if (!selectedPlan) return;

    const dragModule = selectedPlan.modules.find((m: any) => m.id === dragId);
    const hoverModule = selectedPlan.modules.find((m: any) => m.id === hoverId);

    if (!dragModule || !hoverModule) return;

    const newModules = [...selectedPlan.modules];
    const dragIndex = newModules.indexOf(dragModule);
    const hoverIndex = newModules.indexOf(hoverModule);

    // Swap modules
    newModules.splice(dragIndex, 1);
    newModules.splice(hoverIndex, 0, dragModule);

    // Update order numbers
    const updates = newModules.map((module, index) => ({
      id: module.id,
      order: index + 1,
    }));

    try {
      await bulkUpdateModuleOrder(updates);
      setSelectedPlan({
        ...selectedPlan,
        modules: newModules.map((module, index) => ({
          ...module,
          order: index + 1,
        })),
      });
    } catch (error) {
      console.error('Error updating module order:', error);
    }
  };

  const handleAssign = async () => {
    if (!selectedPlan || !selectedStaff.length) return;

    try {
      await assignTrainingPlan(selectedPlan.id, selectedStaff);
      setIsAssignDialogOpen(false);
      setSelectedStaff([]);
      loadPlans();
    } catch (error) {
      console.error('Error assigning training plan:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Plans List */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Training Plans</h2>
            <Button size="sm">
              <PlusIcon className="mr-1 h-4 w-4" />
              New Plan
            </Button>
          </div>
          <div className="space-y-2">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`cursor-pointer rounded-lg p-3 ${
                  selectedPlan?.id === plan.id
                    ? 'border-blue-200 bg-blue-50'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedPlan(plan)}
              >
                <h3 className="font-medium">{plan.title}</h3>
                <p className="text-sm text-gray-500">{plan.modules.length} modules</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Selected Plan Details */}
        {selectedPlan && (
          <div className="space-y-6 md:col-span-2">
            <Card className="p-6">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold">{selectedPlan.title}</h2>
                  <p className="text-gray-500">{selectedPlan.description}</p>
                </div>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => setIsAssignDialogOpen(true)}>
                    Assign to Staff
                  </Button>
                  <Button variant="outline">
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <h3 className="mb-4 text-lg font-semibold">Modules</h3>
              <div className="space-y-2">
                {selectedPlan.modules.map((module: any) => (
                  <DraggableModule
                    key={module.id}
                    id={module.id}
                    name={module.name}
                    order={module.order}
                    onMove={handleModuleMove}
                  />
                ))}
              </div>
            </Card>

            {/* Progress Overview */}
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Progress Overview</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <h4 className="text-sm font-medium text-gray-500">Assigned Staff</h4>
                  <p className="mt-1 text-2xl font-semibold">{selectedPlan.staff?.length || 0}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <h4 className="text-sm font-medium text-gray-500">Completion Rate</h4>
                  <p className="mt-1 text-2xl font-semibold">
                    {selectedPlan.progress?.toFixed(1)}%
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <h4 className="text-sm font-medium text-gray-500">Average Score</h4>
                  <p className="mt-1 text-2xl font-semibold">
                    {selectedPlan.modules
                      .reduce((acc: number, m: any) => acc + (m.progress?.[0]?.score || 0), 0)
                      .toFixed(1)}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Assign Dialog */}
      <Dialog
        open={isAssignDialogOpen}
        onClose={() => setIsAssignDialogOpen(false)}
        title="Assign Training Plan"
      >
        <div className="space-y-4">
          <Select
            label="Select Staff Members"
            multiple
            value={selectedStaff}
            onChange={setSelectedStaff}
            options={[
              // You would populate this with actual staff data
              { value: 'staff1', label: 'John Doe' },
              { value: 'staff2', label: 'Jane Smith' },
            ]}
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign}>Assign</Button>
          </div>
        </div>
      </Dialog>
    </DndProvider>
  );
}
