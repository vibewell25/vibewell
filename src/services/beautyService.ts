import { api } from '@/lib/api';

// Define types for beauty services
export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface BeautyService {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  duration: number;
  categoryId: string;
  providerId: string;
  featured?: boolean;
  rating: number;
  reviews?: Review[];
}

export interface BeautyCategory {
  id: string;
  name: string;
  icon: string;
}

export interface BeautyServiceDetails extends BeautyService {
  imageUrls: string[];
  highlights: string[];
  availability?: {
    dates: string[];
    timeSlots: { id: string; time: string; available: boolean }[];
  };
}

export interface ReviewInput {
  serviceId: string;
  rating: number;
  comment: string;
  userName: string;
}

/**
 * Fetch all beauty services
 */
export const getBeautyServices = async (): Promise<BeautyService[]> => {
  try {
    const response = await api.get('/api/beauty-services');
    return response.data;
  } catch (error) {
    console.error('Error fetching beauty services:', error);
    return [];
  }
};

/**
 * Fetch beauty service by ID
 */
export const getBeautyServiceById = async (id: string): Promise<BeautyServiceDetails | null> => {
  try {
    const response = await api.get(`/api/beauty-services/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching beauty service with ID ${id}:`, error);
    return null;
  }
};

/**
 * Fetch beauty categories
 */
export const getBeautyCategories = async (): Promise<BeautyCategory[]> => {
  try {
    const response = await api.get('/api/beauty-categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching beauty categories:', error);
    return [];
  }
};

/**
 * Add a review to a beauty service
 */
export const addServiceReview = async (reviewData: ReviewInput): Promise<boolean> => {
  try {
    await api.post('/api/beauty-services/reviews', reviewData);
    return true;
  } catch (error) {
    console.error('Error adding service review:', error);
    return false;
  }
};

/**
 * Book a beauty service
 */
export const bookBeautyService = async (
  serviceId: string,
  date: string,
  timeSlot: { id: string; time: string },
  userInfo: { name: string; email: string; phone: string }
): Promise<{ bookingId: string } | null> => {
  try {
    const response = await api.post('/api/beauty-services/book', {
      serviceId,
      date,
      timeSlot,
      userInfo,
    });
    return response.data;
  } catch (error) {
    console.error('Error booking beauty service:', error);
    return null;
  }
};

/**
 * Check service availability
 */
export const checkServiceAvailability = async (
  serviceId: string,
  date: string
): Promise<{ id: string; time: string; available: boolean }[]> => {
  try {
    const response = await api.get(`/api/beauty-services/${serviceId}/availability`, {
      params: { date },
    });
    return response.data;
  } catch (error) {
    console.error('Error checking service availability:', error);
    return [];
  }
};

/**
 * Get service reviews
 */
export const getServiceReviews = async (serviceId: string): Promise<Review[]> => {
  try {
    const response = await api.get(`/api/beauty-services/${serviceId}/reviews`);
    return response.data;
  } catch (error) {
    console.error('Error fetching service reviews:', error);
    return [];
  }
};

/**
 * Get similar beauty services
 */
export const getSimilarBeautyServices = async (serviceId: string): Promise<BeautyService[]> => {
  try {
    const response = await api.get(`/api/beauty-services/${serviceId}/similar`);
    return response.data;
  } catch (error) {
    console.error('Error fetching similar beauty services:', error);
    return [];
  }
};
