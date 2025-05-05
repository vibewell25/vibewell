import { serverBaseUrl } from '../config';

export interface AttendanceRecord {
  id: string;
  scheduleId: string;
  status: string;
  timestamp: string;
export const getAttendance = async (): Promise<AttendanceRecord[]> => {
  const res = await fetch(`${serverBaseUrl}/api/attendance`);
  const data = await res.json();
  return data.records;
export const getAttendanceBySchedule = async (scheduleId: string): Promise<AttendanceRecord[]> => {
  const res = await fetch(`${serverBaseUrl}/api/attendance/schedule/${scheduleId}`);
  const data = await res.json();
  return data.records;
export const createAttendance = async (scheduleId: string, status: string): Promise<AttendanceRecord> => {
  const res = await fetch(`${serverBaseUrl}/api/attendance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scheduleId, status }),
return res.json();
export const deleteAttendance = async (id: string): Promise<void> => {
  await fetch(`${serverBaseUrl}/api/attendance/${id}`, { method: 'DELETE' });
