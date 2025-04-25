import AsyncStorage from '@react-native-async-storage/async-storage';
import { serverBaseUrl } from '../config';
import { storageKeys } from '../config';
import { BusinessHour } from '../types/navigation';

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await AsyncStorage.getItem(storageKeys.AUTH_TOKEN);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

export const fetchBusinessHours = async (businessId?: string): Promise<BusinessHour[]> => {
  const query = businessId ? `?businessId=${businessId}` : '';
  const res = await fetch(`${serverBaseUrl}/api/business-hours${query}`);
  const data = await res.json();
  return data.hours;
};

export const fetchBusinessHour = async (id: string): Promise<BusinessHour> => {
  const res = await fetch(`${serverBaseUrl}/api/business-hours/${id}`);
  const data = await res.json();
  return data.hour;
};

export const createBusinessHour = async (payload: {
  businessId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
}): Promise<BusinessHour> => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${serverBaseUrl}/api/business-hours`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data.hour;
};

export const updateBusinessHour = async (
  id: string,
  payload: { dayOfWeek: number; openTime: string; closeTime: string }
): Promise<BusinessHour> => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${serverBaseUrl}/api/business-hours/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data.hour;
};

export const deleteBusinessHour = async (id: string): Promise<void> => {
  const headers = await getAuthHeaders();
  await fetch(`${serverBaseUrl}/api/business-hours/${id}`, {
    method: 'DELETE',
    headers,
  });
};
