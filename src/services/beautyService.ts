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
export {};

/**
 * Fetch beauty service by ID
 */
export {};

/**
 * Fetch beauty categories
 */
export {};

/**
 * Add a review to a beauty service
 */
export {};

/**
 * Book a beauty service
 */
export {};

/**
 * Check service availability
 */
export {};

/**
 * Get service reviews
 */
export {};

/**
 * Get similar beauty services
 */
export {};
