import AsyncStorage from '@react-native-async-storage/async-storage';
import { serverBaseUrl } from '../config';
import { storageKeys } from '../config';
import { Provider } from '../types/navigation';

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem(storageKeys.AUTH_TOKEN);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

export const fetchProviders = async (): Promise<Provider[]> => {
  const res = await fetch(`${serverBaseUrl}/api/providers`);
  const data = await res.json();
  return data.providers;
};

export const fetchProvider = async (id: string): Promise<Provider> => {
  const res = await fetch(`${serverBaseUrl}/api/providers/${id}`);
  const data = await res.json();
  return data.provider;
};

export const createProvider = async (payload: {
  name: string;
  description?: string;
  businessName?: string;
}): Promise<Provider> => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${serverBaseUrl}/api/providers`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data.provider;
};

export const updateProvider = async (
  id: string,
  payload: { name: string; description?: string; businessName?: string }
): Promise<Provider> => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${serverBaseUrl}/api/providers/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data.provider;
};

export const deleteProvider = async (id: string): Promise<void> => {
  const headers = await getAuthHeaders();
  await fetch(`${serverBaseUrl}/api/providers/${id}`, {
    method: 'DELETE',
    headers,
  });
};
