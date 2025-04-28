import { cachedFetch } from '@/lib/cache';
import { prisma } from '@/lib/database/client';

export interface Provider {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  banner_url: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  email: string;
  website?: string;
  rating: number;
  review_count: number;
  categories: string[];
  services: Service[];
  business_hours: BusinessHours[];
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  provider_id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  image_url?: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessHours {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export interface ProviderSearchParams {
  query?: string;
  category?: string;
  location?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  min_rating?: number;
  max_price?: number;
  limit?: number;
  offset?: number;
}

export class ProviderService {
  /**
   * Fetch all providers with caching
   */
  async getAllProviders(limit = 20, offset = 0): Promise<Provider[]> {
    try {
      const providers = await prisma.provider.findMany({
        skip: offset,
        take: limit,
        orderBy: { name: 'asc' },
      });

      return providers as Provider[];
    } catch (error) {
      console.error('Error fetching providers:', error);
      return [];
    }
  }

  /**
   * Fetch a provider by ID with caching
   */
  async getProviderById(id: string): Promise<Provider | null> {
    // Use cached fetch for an API endpoint
    try {
      return await cachedFetch<Provider>(`/api/providers/${id}`, {
        ttl: 15 * 60 * 1000, // Cache for 15 minutes
      });
    } catch (error) {
      console.error('Error fetching provider:', error);
      return null;
    }
  }

  /**
   * Search providers with caching for short-lived results
   */
  async searchProviders(params: ProviderSearchParams): Promise<Provider[]> {
    try {
      return await cachedFetch<Provider[]>('/api/providers/search', {
        method: 'GET',
        params, // Will be used to generate a unique cache key
        ttl: 5 * 60 * 1000, // Cache for 5 minutes
      });
    } catch (error) {
      console.error('Error searching providers:', error);
      return [];
    }
  }

  /**
   * Fetch featured providers (homepage content, longer cache)
   */
  async getFeaturedProviders(): Promise<Provider[]> {
    try {
      return await cachedFetch<Provider[]>('/api/providers/featured', {
        ttl: 60 * 60 * 1000, // Cache for 1 hour
      });
    } catch (error) {
      console.error('Error fetching featured providers:', error);
      return [];
    }
  }

  /**
   * Fetch providers by category
   */
  async getProvidersByCategory(category: string, limit = 20, offset = 0): Promise<Provider[]> {
    try {
      return await cachedFetch<Provider[]>(
        `/api/providers/category/${encodeURIComponent(category)}`,
        {
          params: { limit, offset },
          ttl: 30 * 60 * 1000, // Cache for 30 minutes
        },
      );
    } catch (error) {
      console.error(`Error fetching providers by category ${category}:`, error);
      return [];
    }
  }

  /**
   * Get provider services (medium-term cache)
   */
  async getProviderServices(providerId: string): Promise<Service[]> {
    try {
      return await cachedFetch<Service[]>(`/api/providers/${providerId}/services`, {
        ttl: 20 * 60 * 1000, // Cache for 20 minutes
      });
    } catch (error) {
      console.error(`Error fetching services for provider ${providerId}:`, error);
      return [];
    }
  }

  /**
   * Get providers near location (short-term cache due to location relevance)
   */
  async getProvidersNearLocation(lat: number, lng: number, radius = 10): Promise<Provider[]> {
    try {
      return await cachedFetch<Provider[]>('/api/providers/nearby', {
        params: { lat, lng, radius },
        ttl: 5 * 60 * 1000, // Cache for 5 minutes
      });
    } catch (error) {
      console.error('Error fetching nearby providers:', error);
      return [];
    }
  }
}
