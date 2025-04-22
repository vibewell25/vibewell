import { CreateModuleContentInput, UpdateModuleContentInput } from '@/types/module';

export async function getModuleContent(moduleId: string) {
  const response = await fetch(`/api/training/module/${moduleId}/content`);
  if (!response.ok) {
    throw new Error('Failed to fetch module content');
  }
  return response.json();
}

export async function createModuleContent(moduleId: string, data: CreateModuleContentInput) {
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
  return response.json();
}

export async function updateModuleContent(moduleId: string, data: UpdateModuleContentInput) {
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
  return response.json();
}

export async function deleteModuleContent(moduleId: string, contentId: string) {
  const response = await fetch(`/api/training/module/${moduleId}/content?contentId=${contentId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete module content');
  }
  return response.json();
} 