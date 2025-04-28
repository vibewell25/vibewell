import { serverBaseUrl } from '../config';

export interface StaffSchedule {
  id: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
}

export const getSchedules = async (): Promise<StaffSchedule[]> => {
  const res = await fetch(`${serverBaseUrl}/api/staff-schedules`);
  const data = await res.json();
  return data.schedules;
};

export const createSchedule = async (payload: Partial<StaffSchedule>): Promise<StaffSchedule> => {
  const res = await fetch(`${serverBaseUrl}/api/staff-schedules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const updateSchedule = async (id: string, payload: Partial<StaffSchedule>) => {
  const res = await fetch(`${serverBaseUrl}/api/staff-schedules/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const deleteSchedule = async (id: string) => {
  await fetch(`${serverBaseUrl}/api/staff-schedules/${id}`, { method: 'DELETE' });
};
