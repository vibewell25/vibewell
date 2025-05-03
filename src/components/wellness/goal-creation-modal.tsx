'use client';

import { Icons } from '@/components/icons';
import { useState, useEffect } from 'react';
import { Goal, GoalType, GoalFrequency, GoalUnit } from '@/types/progress';
// Color options for goals
const colorOptions = [
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#3B82F6', // Blue
  '#F97316', // Orange
];
interface GoalCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<Goal, 'id' | 'current' | 'status'>) => void;
  editingGoal?: Goal;
}
export function GoalCreationModal({
  isOpen,
  onClose,
  onSave,
  editingGoal,
}: GoalCreationModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'meditation' as GoalType,
    target: 10,
    unit: 'minutes' as GoalUnit,
    frequency: 'daily' as GoalFrequency,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    color: '#6366F1',
    reminders: false,
    reminderTime: '08:00',
  });
  // Initialize form with editing goal data if available
  useEffect(() => {
    if (editingGoal) {
      setFormData({
        title: editingGoal?.title,
        description: editingGoal?.description || '',
        type: editingGoal?.type,
        target: editingGoal?.target,
        unit: editingGoal?.unit,
        frequency: editingGoal?.frequency,
        startDate: editingGoal?.startDate.split('T')[0],
        endDate: editingGoal?.endDate ? editingGoal?.endDate.split('T')[0] : '',
        color: editingGoal?.color || '#6366F1',
        reminders: !!editingGoal?.reminderTime,
        reminderTime: editingGoal?.reminderTime || '08:00',
      });
    } else {
      // Reset form when not editing
      setFormData({
        title: '',
        description: '',
        type: 'meditation' as GoalType,
        target: 10,
        unit: 'minutes' as GoalUnit,
        frequency: 'daily' as GoalFrequency,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        color: '#6366F1',
        reminders: false,
        reminderTime: '08:00',
      });
    }
  }, [editingGoal, isOpen]);
  // Handle input changes
  const handleChange = (
    e: React?.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e?.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // Handle checkbox changes
  const handleCheckboxChange = (e: React?.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e?.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };
  // Handle color selection
  const handleColorSelect = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      color,
    }));
  };
  // Handle type selection and update unit accordingly
  const handleTypeChange = (e: React?.ChangeEvent<HTMLSelectElement>) => {
    const newType = e?.target.value as GoalType;
    let newUnit: GoalUnit = 'minutes';
    let newTarget = 10;
    // Only update unit and target if not editing or if changing from the original type
    if (!editingGoal || editingGoal?.type !== newType) {
      // Set default unit based on type
      switch (newType) {
        case 'meditation':
          newUnit = 'minutes';
          newTarget = 10;
          break;
        case 'workout':
          newUnit = 'minutes';
          newTarget = 30;
          break;
        case 'water':
          newUnit = 'glasses';
          newTarget = 8;
          break;
        case 'sleep':
          newUnit = 'hours';
          newTarget = 8;
          break;
        case 'steps':
          newUnit = 'steps';
          newTarget = 10000;
          break;
        case 'weight':
          newUnit = 'kg';
          newTarget = 70;
          break;
        case 'nutrition':
          newUnit = 'calories';
          newTarget = 2000;
          break;
        default:
          newUnit = 'custom';
          newTarget = 1;
      }
      setFormData((prev) => ({
        ...prev,
        type: newType,
        unit: newUnit,
        target: newTarget,
      }));
    } else {
      // Just update the type if we're editing and keeping the original unit and target
      setFormData((prev) => ({
        ...prev,
        type: newType,
      }));
    }
  };
  // Handle form submission
  const handleSubmit = (e: React?.FormEvent) => {
    e?.preventDefault();
    onSave({
      title: formData?.title,
      description: formData?.description,
      type: formData?.type,
      target: Number(formData?.target),
      unit: formData?.unit,
      frequency: formData?.frequency,
      startDate: formData?.startDate,
      endDate: formData?.endDate || undefined,
      color: formData?.color,
      reminders: formData?.reminders,
      reminderTime: formData?.reminders ? formData?.reminderTime : undefined,
    });
    onClose();
  };
  if (!isOpen) return null;
  // Helper function to get icon for goal type
  const getGoalIcon = (type: GoalType): string => {
    switch (type) {
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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{editingGoal ? 'Edit Goal' : 'Create New Goal'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <Icons?.XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-4">
            <label htmlFor="title" className="mb-1 block text-sm font-medium">
              Goal Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-input w-full"
              value={formData?.title}
              onChange={handleChange}
              placeholder="e?.g., Daily Meditation"
              required
            />
          </div>
          {/* Description */}
          <div className="mb-4">
            <label htmlFor="description" className="mb-1 block text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              className="form-input w-full"
              value={formData?.description}
              onChange={handleChange}
              placeholder="Why is this goal important to you?"
            />
          </div>
          {/* Goal Type */}
          <div className="mb-4">
            <label htmlFor="type" className="mb-1 block text-sm font-medium">
              Goal Type *
            </label>
            <select
              id="type"
              name="type"
              className="form-select w-full"
              value={formData?.type}
              onChange={handleTypeChange}
              required
            >
              <option value="meditation">Meditation</option>
              <option value="workout">Workout</option>
              <option value="water">Water Intake</option>
              <option value="sleep">Sleep</option>
              <option value="nutrition">Nutrition</option>
              <option value="steps">Steps</option>
              <option value="weight">Weight</option>
              <option value="custom">Custom</option>
            </select>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xl">{getGoalIcon(formData?.type)}</span>
              <span className="text-sm text-muted-foreground">
                {formData?.type === 'meditation'
                  ? 'Track meditation minutes'
                  : formData?.type === 'workout'
                    ? 'Track workout duration'
                    : formData?.type === 'water'
                      ? 'Track water consumption'
                      : formData?.type === 'sleep'
                        ? 'Track sleep hours'
                        : formData?.type === 'nutrition'
                          ? 'Track calorie intake'
                          : formData?.type === 'steps'
                            ? 'Track daily steps'
                            : formData?.type === 'weight'
                              ? 'Track body weight'
                              : 'Custom goal tracking'}
              </span>
            </div>
          </div>
          {/* Target and Unit */}
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="target" className="mb-1 block text-sm font-medium">
                Target *
              </label>
              <input
                type="number"
                id="target"
                name="target"
                className="form-input w-full"
                value={formData?.target}
                onChange={handleChange}
                min={0}
                step={formData?.type === 'sleep' ? 0?.5 : 1}
                required
              />
            </div>
            <div>
              <label htmlFor="unit" className="mb-1 block text-sm font-medium">
                Unit *
              </label>
              <select
                id="unit"
                name="unit"
                className="form-select w-full"
                value={formData?.unit}
                onChange={handleChange}
                required
              >
                <option value="minutes">Minutes</option>
                <option value="sessions">Sessions</option>
                <option value="glasses">Glasses</option>
                <option value="hours">Hours</option>
                <option value="calories">Calories</option>
                <option value="steps">Steps</option>
                <option value="kg">Kilograms</option>
                <option value="lbs">Pounds</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
          {/* Frequency */}
          <div className="mb-4">
            <label htmlFor="frequency" className="mb-1 block text-sm font-medium">
              Frequency *
            </label>
            <select
              id="frequency"
              name="frequency"
              className="form-select w-full"
              value={formData?.frequency}
              onChange={handleChange}
              required
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="one_time">One Time</option>
            </select>
          </div>
          {/* Start and End Dates */}
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="mb-1 block text-sm font-medium">
                Start Date *
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                className="form-input w-full"
                value={formData?.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="endDate" className="mb-1 block text-sm font-medium">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                className="form-input w-full"
                value={formData?.endDate}
                onChange={handleChange}
              />
            </div>
          </div>
          {/* Color Selection */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">Color</label>
            <div className="flex flex-wrap gap-2">
              {colorOptions?.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`h-8 w-8 rounded-full border-2 ${
                    formData?.color === color ? 'border-primary' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                />
              ))}
            </div>
          </div>
          {/* Reminders */}
          <div className="mb-6">
            <div className="mb-2 flex items-center">
              <input
                type="checkbox"
                id="reminders"
                name="reminders"
                className="form-checkbox"
                checked={formData?.reminders}
                onChange={handleCheckboxChange}
              />
              <label htmlFor="reminders" className="ml-2 text-sm font-medium">
                Enable Reminders
              </label>
            </div>
            {formData?.reminders && (
              <div>
                <label htmlFor="reminderTime" className="mb-1 block text-sm font-medium">
                  Reminder Time
                </label>
                <input
                  type="time"
                  id="reminderTime"
                  name="reminderTime"
                  className="form-input w-full"
                  value={formData?.reminderTime}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingGoal ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
