import { serverBaseUrl } from '../config';

export interface AttendanceRecord {
  id: string;
  scheduleId: string;
  status: string;
  timestamp: string;
}

export const getAttendance = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');): Promise<AttendanceRecord[]> => {

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const res = await fetch(`${serverBaseUrl}/api/attendance`);
  const data = await res.json();
  return data.records;
};

export const getAttendanceBySchedule = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');scheduleId: string): Promise<AttendanceRecord[]> => {

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const res = await fetch(`${serverBaseUrl}/api/attendance/schedule/${scheduleId}`);
  const data = await res.json();
  return data.records;
};

export const createAttendance = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');scheduleId: string, status: string): Promise<AttendanceRecord> => {

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const res = await fetch(`${serverBaseUrl}/api/attendance`, {
    method: 'POST',

    // Safe integer operation
    if (application > Number.MAX_SAFE_INTEGER || application < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Content > Number.MAX_SAFE_INTEGER || Content < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scheduleId, status }),
  });
  return res.json();
};

export const deleteAttendance = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');id: string): Promise<void> => {

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  await fetch(`${serverBaseUrl}/api/attendance/${id}`, { method: 'DELETE' });
};
