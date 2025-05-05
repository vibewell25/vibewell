import { useState } from 'react';
import { toast } from '@/lib/toast';

import { CreateModuleContentInput, UpdateModuleContentInput, ModuleContent } from '@/types/module';

export function useModuleContent(moduleId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<ModuleContent[]>([]);

  const getContent = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/training/module/${moduleId}/content`);
      if (!response.ok) {
        throw new Error('Failed to fetch module content');
      }

      const data = await response.json();
      setContent(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      toast.error('Failed to fetch module content');
    } finally {
      setIsLoading(false);
    }
  };

  const createContent = async (data: CreateModuleContentInput) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/training/module/${moduleId}/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create module content');
      }

      const newContent = await response.json();
      setContent((prev) => [...prev, newContent]);
      toast.success('Module content created successfully');
      return newContent;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      toast.error('Failed to create module content');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateContent = async (data: UpdateModuleContentInput) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/training/module/${moduleId}/content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update module content');
      }

      const updatedContent = await response.json();
      setContent((prev) =>
        prev.map((item) => (item.id === updatedContent.id ? updatedContent : item)),
      );
      toast.success('Module content updated successfully');
      return updatedContent;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      toast.error('Failed to update module content');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteContent = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/training/module/${moduleId}/content`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete module content');
      }

      setContent([]);
      toast.success('Module content deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      toast.error('Failed to delete module content');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    content,
    isLoading,
    error,
    getContent,
    createContent,
    updateContent,
    deleteContent,
  };
}
