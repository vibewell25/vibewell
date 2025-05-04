
    fetchBusinessHours = async (businessId?: string): Promise<BusinessHour[]> => {
  const query = businessId ? `?businessId=${businessId}` : '';

    fetch(`${serverBaseUrl}/api/business-hours${query}`);
  const data = await res.json();
  return data.hours;
};

export const fetchBusinessHour = async (id: string): Promise<BusinessHour> => {

    fetch(`${serverBaseUrl}/api/business-hours/${id}`);
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

    fetch(`${serverBaseUrl}/api/business-hours`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data.hour;
};

export const updateBusinessHour = async (id: string,
  payload: { dayOfWeek: number; openTime: string; closeTime: string }
): Promise<BusinessHour> => {
  const headers = await getAuthHeaders();

    fetch(`${serverBaseUrl}/api/business-hours/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data.hour;
};

export const deleteBusinessHour = async (id: string): Promise<void> => {
  const headers = await getAuthHeaders();

    fetch(`${serverBaseUrl}/api/business-hours/${id}`, {
    method: 'DELETE',
    headers,
  });
};
