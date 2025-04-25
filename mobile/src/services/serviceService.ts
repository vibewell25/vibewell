import AsyncStorage from '@react-native-async-storage/async-storage';
import { serverBaseUrl } from '../config';
import { storageKeys } from '../config';
import { Service } from '../types/navigation';

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await AsyncStorage.getItem(storageKeys.AUTH_TOKEN);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

export const fetchServices = async (): Promise<Service[]> => {
  const res = await fetch(`${serverBaseUrl}/api/services`);
  const data = await res.json();
  return data.services;
};

export const fetchService = async (id: string): Promise<Service> => {
  const res = await fetch(`${serverBaseUrl}/api/services/${id}`);
  const data = await res.json();
  return data.service;
};

export const createService = async (payload: {
  providerId: string;
  name: string;
  price: number;
  duration: number;
}): Promise<Service> => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${serverBaseUrl}/api/services`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data.service;
};

export const updateService = async (
  id: string,
  payload: { name: string; price: number; duration: number }
): Promise<Service> => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${serverBaseUrl}/api/services/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data.service;
};

export const deleteService = async (id: string): Promise<void> => {
  const headers = await getAuthHeaders();
  await fetch(`${serverBaseUrl}/api/services/${id}`, {
    method: 'DELETE',
    headers,
  });
};
