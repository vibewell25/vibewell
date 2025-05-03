import { Provider, Review } from './navigation';

export interface BeautyCategory {
  id: string;
  name: string;
  icon: string;
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
}

export interface BeautyFilter {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  minRating?: number;
  featured?: boolean;
  // Allow dynamic iteration over filter keys
  [key: string]: string | number | boolean | undefined;
}

export interface BookingResponse {
  bookingId: string;
  userId: string;
  serviceId: string;
  serviceTitle: string;
  appointmentDate: string; // ISO date string
  duration: number; // in minutes
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  providerName?: string;
  location?: string;
  price: number;
  date?: string; // For backward compatibility
  time?: string; // For backward compatibility
  amount?: number; // For backward compatibility
  userInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}