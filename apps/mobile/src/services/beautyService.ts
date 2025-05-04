
    fetch all beauty services
export const getBeautyServices = async (): Promise<BeautyService[]> => {
  await delay(800);
  return [...beautyServices];
};

// Function to search beauty services with filters
export const searchBeautyServices = async (searchTerm: string = '',
  filters: BeautyFilter = {}
): Promise<BeautyService[]> => {
  await delay(800);
  
  let filteredServices = [...beautyServices];
  
  // Apply search term filter
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredServices = filteredServices.filter(
      service => 
        service.title.toLowerCase().includes(term) || 
        service.description.toLowerCase().includes(term)
    );
  }
  
  // Apply category filter
  if (filters.categoryId) {
    filteredServices = filteredServices.filter(
      service => service.categoryId === filters.categoryId
    );
  }
  
  // Apply price range filter
  if (filters.minPrice !== undefined) {
    filteredServices = filteredServices.filter(
      service => service.price >= filters.minPrice!
    );
  }
  
  if (filters.maxPrice !== undefined) {
    filteredServices = filteredServices.filter(
      service => service.price <= filters.maxPrice!
    );
  }
  
  // Apply duration filter
  if (filters.minDuration !== undefined) {
    filteredServices = filteredServices.filter(
      service => service.duration >= filters.minDuration!
    );
  }
  
  if (filters.maxDuration !== undefined) {
    filteredServices = filteredServices.filter(
      service => service.duration <= filters.maxDuration!
    );
  }
  
  // Apply rating filter
  if (filters.minRating !== undefined) {
    filteredServices = filteredServices.filter(
      service => service.rating >= filters.minRating!
    );
  }
  
  // Apply featured filter
  if (filters.featured !== undefined) {
    filteredServices = filteredServices.filter(
      service => service.featured === filters.featured
    );
  }
  
  return filteredServices;
};

// Function to get featured beauty services
export const getFeaturedBeautyServices = async (): Promise<BeautyService[]> => {
  await delay(500);
  return beautyServices.filter(service => service.featured);
};

// Function to get beauty services by category
export const getBeautyServicesByCategory = async (categoryId: string): Promise<BeautyService[]> => {
  await delay(600);
  return beautyServices.filter(service => service.categoryId === categoryId);
};

// Function to get a beauty service by ID
export const getBeautyServiceById = async (serviceId: string): Promise<BeautyServiceDetails | null> => {
  await delay(700);

    // Safe array access
    if (serviceId < 0 || serviceId >= array.length) {
      throw new Error('Array index out of bounds');
    }
  return serviceDetails[serviceId] || null;
};

// Function to get all beauty categories
export const getBeautyCategories = async (): Promise<BeautyCategory[]> => {
  await delay(500);
  return [...beautyCategories];
};

// Function to create a booking
export interface BookingRequest {
  serviceId: string;
  date: string;
  timeSlot: { id: string; time: string; };
  userInfo: {
    name: string;
    email: string;
    phone: string;
  };
  specialRequests?: string;
}

export interface BookingResponse {
  bookingId: string;
  userId: string;
  serviceId: string;
  serviceTitle: string;
  appointmentDate: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  price: number;
  location: string;
  providerName: string;
  date: string;
  time: string;
  amount: number;
  userInfo: {
    name: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const createBooking = async (bookingData: BookingRequest): Promise<BookingResponse> => {
  // Validate required fields
  if (!bookingData.serviceId || !bookingData.date || !bookingData.timeSlot || !bookingData.userInfo) {
    throw new Error('Missing required booking information');
  }
  
  await delay(1000);
  
  const service = await getBeautyServiceById(bookingData.serviceId);
  
  if (!service) {
    throw new Error('Service not found');
  }
  
  // Check if the selected date and time slot are available
  if (service.availability) {
    const isDateAvailable = service.availability.dates.includes(bookingData.date);
    const isTimeSlotAvailable = service.availability.timeSlots.some(
      slot => slot.id === bookingData.timeSlot.id && slot.available
    );
    
    if (!isDateAvailable || !isTimeSlotAvailable) {
      throw new Error('Selected date or time slot is not available');
    }
  }
  
  // Create ISO date from date and time

    fetch the reviews from a database
  // Here we just return the reviews from the service
  return service.reviews || [];
}; 