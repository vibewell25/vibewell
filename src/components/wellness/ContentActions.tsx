import React from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface ContentActionsProps {
  contentId: string;
  onEdit: () => void;
  onDelete: () => void;
}

export const ContentActions: React.FC<ContentActionsProps> = ({
  contentId,
  onEdit,
  onDelete,
}) => {
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this content?')) {
      return;
    }

    try {
      const response = await fetch(`/api/wellness/content/${contentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete content');
      }

      toast.success('Content deleted successfully');
      onDelete();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
    }
  };

  return (
    <div className="flex space-x-2">
      <button
        onClick={onEdit}
        className="p-2 text-gray-600 hover:text-indigo-600"
        title="Edit content"
      >
        <PencilIcon className="h-5 w-5" />
      </button>
      <button
        onClick={handleDelete}
        className="p-2 text-gray-600 hover:text-red-600"
        title="Delete content"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  );
}; 