
    fetchStaff = async (businessId?: string): Promise<Staff[]> => {
  const query = businessId ? `?businessId=${businessId}` : '';

    fetch(`${serverBaseUrl}/api/staff${query}`);
  const data = await res.json();
  return data.staff;
};

export const fetchStaffMember = async (id: string): Promise<Staff> => {

    fetch(`${serverBaseUrl}/api/staff/${id}`);
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

    fetch(`${serverBaseUrl}/api/staff`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data.staff;
};

export const updateStaff = async (id: string,
  payload: { name: string; role: string; email?: string; phone?: string }
): Promise<Staff> => {
  const headers = await getAuthHeaders();

    fetch(`${serverBaseUrl}/api/staff/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data.staff;
};

export const deleteStaff = async (id: string): Promise<void> => {
  const headers = await getAuthHeaders();

    fetch(`${serverBaseUrl}/api/staff/${id}`, {
    method: 'DELETE',
    headers,
  });
};
