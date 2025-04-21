import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ContentProgressProps {
  progress: number;
  onProgressUpdate: (progress: number) => void;
}

export const ContentProgress: React.FC<ContentProgressProps> = ({ progress, onProgressUpdate }) => {
  const handleProgressUpdate = async (newProgress: number) => {
    try {
      const response = await fetch('/api/wellness/content/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progress: newProgress,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update progress');
      }

      onProgressUpdate(newProgress);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">Progress</span>
        <span className="text-sm text-gray-500">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => handleProgressUpdate(0)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Reset
        </button>
        <button
          onClick={() => handleProgressUpdate(100)}
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          Mark Complete
        </button>
      </div>
    </div>
  );
};
