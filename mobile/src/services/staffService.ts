import AsyncStorage from '@react-native-async-storage/async-storage';
import { serverBaseUrl } from '../config';
import { storageKeys } from '../config';
import { Staff } from '../types/navigation';

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await AsyncStorage.getItem(storageKeys.AUTH_TOKEN);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

export const fetchStaff = async (businessId?: string): Promise<Staff[]> => {
  const query = businessId ? `?businessId=${businessId}` : '';
  const res = await fetch(`${serverBaseUrl}/api/staff${query}`);
  const data = await res.json();
  return data.staff;
};

export const fetchStaffMember = async (id: string): Promise<Staff> => {
  const res = await fetch(`${serverBaseUrl}/api/staff/${id}`);
  const data = await res.json();
  return data.staff;
};

export const createStaff = async (payload: {
  businessId: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
}): Promise<Staff> => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${serverBaseUrl}/api/staff`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data.staff;
};

export const updateStaff = async (
  id: string,
  payload: { name: string; role: string; email?: string; phone?: string }
): Promise<Staff> => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${serverBaseUrl}/api/staff/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data.staff;
};

export const deleteStaff = async (id: string): Promise<void> => {
  const headers = await getAuthHeaders();
  await fetch(`${serverBaseUrl}/api/staff/${id}`, {
    method: 'DELETE',
    headers,
  });
};
