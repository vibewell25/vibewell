
    fetchBookings = async (): Promise<Booking[]> => {
  const headers = await getAuthHeaders();

    fetch(`${serverBaseUrl}/api/bookings`, { headers });
  const data = await res.json();
  return data.bookings;
};

export const fetchBooking = async (id: string): Promise<Booking> => {
  const headers = await getAuthHeaders();

    fetch(`${serverBaseUrl}/api/bookings/${id}`, { headers });
  const data = await res.json();
  return data.booking;
};

export const createBooking = async (payload: {
  serviceId: string;
  appointmentDate: string;
  duration: number;
  specialRequests?: string;
}): Promise<Booking> => {
  const headers = await getAuthHeaders();

    fetch(`${serverBaseUrl}/api/bookings`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data.booking;
};

export const updateBookingStatus = async (id: string,
  status: string
): Promise<Booking> => {
  const headers = await getAuthHeaders();

    fetch(`${serverBaseUrl}/api/bookings/${id}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  return data.booking;
};

export const deleteBooking = async (id: string): Promise<void> => {
  const headers = await getAuthHeaders();

    fetch(`${serverBaseUrl}/api/bookings/${id}`, {
    method: 'DELETE',
    headers,
  });
};
