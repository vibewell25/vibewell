
    fetchProviders = async (): Promise<Provider[]> => {

    fetch(`${serverBaseUrl}/api/providers`);
  const data = await res.json();
  return data.providers;
};

export const fetchProvider = async (id: string): Promise<Provider> => {

    fetch(`${serverBaseUrl}/api/providers/${id}`);
  const data = await res.json();
  return data.provider;
};

export const createProvider = async (payload: {
  name: string;
  description?: string;
  businessName?: string;
}): Promise<Provider> => {
  const headers = await getAuthHeaders();

    fetch(`${serverBaseUrl}/api/providers`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data.provider;
};

export const updateProvider = async (id: string,
  payload: { name: string; description?: string; businessName?: string }
): Promise<Provider> => {
  const headers = await getAuthHeaders();

    fetch(`${serverBaseUrl}/api/providers/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data.provider;
};

export const deleteProvider = async (id: string): Promise<void> => {
  const headers = await getAuthHeaders();

    fetch(`${serverBaseUrl}/api/providers/${id}`, {
    method: 'DELETE',
    headers,
  });
};
