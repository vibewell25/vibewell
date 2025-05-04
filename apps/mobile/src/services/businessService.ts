
    fetchBusinesses = async (): Promise<Business[]> => {

    fetch(`${serverBaseUrl}/api/businesses`);
  const data = await res.json();
  return data.businesses;
};

export const fetchBusiness = async (id: string): Promise<Business> => {

    fetch(`${serverBaseUrl}/api/businesses/${id}`);
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

    fetch(`${serverBaseUrl}/api/businesses`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data.business;
};

export const updateBusiness = async (id: string,
  payload: { name: string; address?: string; description?: string }
): Promise<Business> => {
  const headers = await getAuthHeaders();

    fetch(`${serverBaseUrl}/api/businesses/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data.business;
};

export const deleteBusiness = async (id: string): Promise<void> => {
  const headers = await getAuthHeaders();

    fetch(`${serverBaseUrl}/api/businesses/${id}`, {
    method: 'DELETE',
    headers,
  });
};
