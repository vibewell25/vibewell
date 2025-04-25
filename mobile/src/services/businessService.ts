import AsyncStorage from '@react-native-async-storage/async-storage';
import { serverBaseUrl } from '../config';
import { storageKeys } from '../config';
import { Business } from '../types/navigation';

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await AsyncStorage.getItem(storageKeys.AUTH_TOKEN);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

export const fetchBusinesses = async (): Promise<Business[]> => {
  const res = await fetch(`${serverBaseUrl}/api/businesses`);
  const data = await res.json();
  return data.businesses;
};

export const fetchBusiness = async (id: string): Promise<Business> => {
  const res = await fetch(`${serverBaseUrl}/api/businesses/${id}`);
  const data = await res.json();
  return data.business;
};

export const createBusiness = async (payload: {
  providerId: string;
  name: string;
  address?: string;
  description?: string;
}): Promise<Business> => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${serverBaseUrl}/api/businesses`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data.business;
};

export const updateBusiness = async (
  id: string,
  payload: { name: string; address?: string; description?: string }
): Promise<Business> => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${serverBaseUrl}/api/businesses/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data.business;
};

export const deleteBusiness = async (id: string): Promise<void> => {
  const headers = await getAuthHeaders();
  await fetch(`${serverBaseUrl}/api/businesses/${id}`, {
    method: 'DELETE',
    headers,
  });
};
