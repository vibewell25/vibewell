import { serverBaseUrl } from '../config';

export interface TrainingModule {
  id: string;
  title: string;
  description?: string;
  contentUrl: string;
}

export const getTrainingModules = async (): Promise<TrainingModule[]> => {
  const res = await fetch(`${serverBaseUrl}/api/training-modules`);
  const data = await res.json();
  return data.modules;
};

export const createTrainingModule = async (payload: Partial<TrainingModule>): Promise<TrainingModule> => {
  const res = await fetch(`${serverBaseUrl}/api/training-modules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const updateTrainingModule = async (
  id: string,
  payload: Partial<TrainingModule>
): Promise<TrainingModule> => {
  const res = await fetch(`${serverBaseUrl}/api/training-modules/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const deleteTrainingModule = async (id: string): Promise<void> => {
  await fetch(`${serverBaseUrl}/api/training-modules/${id}`, {
    method: 'DELETE',
  });
};
