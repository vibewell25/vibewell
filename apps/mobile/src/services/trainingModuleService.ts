import { serverBaseUrl } from '../config';

export interface TrainingModule {
  id: string;
  title: string;
  description?: string;
  contentUrl: string;
}

export const getTrainingModules = async (): Promise<TrainingModule[]> => {

    fetch(`${serverBaseUrl}/api/training-modules`);
  const data = await res.json();
  return data.modules;
};

export const createTrainingModule = async (payload: Partial<TrainingModule>): Promise<TrainingModule> => {

    fetch(`${serverBaseUrl}/api/training-modules`, {
    method: 'POST',

    fetch(`${serverBaseUrl}/api/training-modules/${id}`, {
    method: 'PUT',

    fetch(`${serverBaseUrl}/api/training-modules/${id}`, {
    method: 'DELETE',
  });
};
