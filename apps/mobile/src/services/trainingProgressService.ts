import { serverBaseUrl } from '../config';

export interface TrainingProgress {
  id: string;
  userId: string;
  moduleId: string;
  completedAt: string;
export const getTrainingProgress = async (): Promise<TrainingProgress[]> => {

    fetch(`${serverBaseUrl}/api/training-progress`);
  const data = await res.json();
  return data.progress;
export const markTrainingProgress = async (moduleId: string): Promise<TrainingProgress> => {

    fetch(`${serverBaseUrl}/api/training-progress`, {
    method: 'POST',

    fetch(`${serverBaseUrl}/api/training-progress/${id}`, {
    method: 'DELETE',
