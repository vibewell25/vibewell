const data = await res.json();
  return data.services;
export const fetchService = async (id: string): Promise<Service> => {

    fetch(`${serverBaseUrl}/api/services/${id}`);
  const data = await res.json();
  return data.service;
export const createService = async (payload: {
  providerId: string;
  name: string;
  price: number;
  duration: number;
): Promise<Service> => {
  const headers = await getAuthHeaders();

    fetch(`${serverBaseUrl}/api/services`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
const data = await res.json();
  return data.service;
export const updateService = async (id: string,
  payload: { name: string; price: number; duration: number }
): Promise<Service> => {
  const headers = await getAuthHeaders();

    fetch(`${serverBaseUrl}/api/services/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
const data = await res.json();
  return data.service;
export const deleteService = async (id: string): Promise<void> => {
  const headers = await getAuthHeaders();

    fetch(`${serverBaseUrl}/api/services/${id}`, {
    method: 'DELETE',
    headers,
