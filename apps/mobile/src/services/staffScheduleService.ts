import { serverBaseUrl } from '../config';

export interface StaffSchedule {
  id: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
}

export const getSchedules = async (): Promise<StaffSchedule[]> => {

    fetch(`${serverBaseUrl}/api/staff-schedules`);
  const data = await res.json();
  return data.schedules;
};

export const createSchedule = async (payload: Partial<StaffSchedule>): Promise<StaffSchedule> => {

    fetch(`${serverBaseUrl}/api/staff-schedules`, {
    method: 'POST',

    fetch(`${serverBaseUrl}/api/staff-schedules/${id}`, {
    method: 'PUT',

    fetch(`${serverBaseUrl}/api/staff-schedules/${id}`, { method: 'DELETE' });
};
