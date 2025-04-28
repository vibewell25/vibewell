import { serverBaseUrl } from '../config';

export interface TrainingProgress {
  id: string;
  userId: string;
  moduleId: string;
  completedAt: string;
}

export const getTrainingProgress = async (): Promise<TrainingProgress[]> => {
  const res = await fetch(`${serverBaseUrl}/api/training-progress`);
  const data = await res.json();
  return data.progress;
};

export const markTrainingProgress = async (moduleId: string): Promise<TrainingProgress> => {
  const res = await fetch(`${serverBaseUrl}/api/training-progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ moduleId }),
  });
  return res.json();
};

export const deleteTrainingProgress = async (id: string): Promise<void> => {
  await fetch(`${serverBaseUrl}/api/training-progress/${id}`, {
    method: 'DELETE',
  });
};
