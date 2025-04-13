// Implementation for appointment creation logic
export const createAppointment = async (appointmentData) => {
  try {
    const response = await fetch('/api/beauty/appointments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create appointment');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

// Implementation for appointment status management
export const updateAppointmentStatus = async (appointmentId, status) => {
  try {
    const response = await fetch(`/api/beauty/appointments/${appointmentId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update appointment status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};
