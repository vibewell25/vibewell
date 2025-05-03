import { StateManagerType, createState } from './state-manager';

/**
 * Types for beauty products and features
 */

export interface BeautyProduct {
  id: string;
  name: string;
  brand: string;
  category: BeautyCategory;
  price: number;
  description: string;
  colors: ProductColor[];
  featuredColor: string | null;
  images: ProductImage[];
  ratingAverage: number;
  reviewCount: number;
  ingredients: string[];
  benefits: string[];
  isNew: boolean;
  isBestSeller: boolean;
  isFavorite: boolean;
  isVegan: boolean;
  isNatural: boolean;
  isCrueltyFree: boolean;
  isHypoallergenic: boolean;
  availableSizes: ProductSize[];
  tags: string[];
}

export type BeautyCategory =
  | 'makeup'
  | 'skincare'
  | 'haircare'
  | 'fragrance'
  | 'tools'
  | 'nails'
  | 'bath_body';

export interface ProductColor {
  id: string;
  name: string;
  hexCode: string;
  isAvailable: boolean;
  imageUrl: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  colorId?: string;
  isPrimary: boolean;
  isVideo: boolean;
  thumbnailUrl: string;
}

export type ProductSize = 'mini' | 'travel' | 'regular' | 'value';

/**
 * Beauty catalog state
 */

export interface BeautyCatalogState {
  products: BeautyProduct[];
  categories: BeautyCategory[];
  isLoading: boolean;
  error: string | null;
  filters: {
    category: BeautyCategory | null;
    priceRange: [number, number] | null;
    brands: string[];
    tags: string[];
    ratings: number | null;
    isVegan: boolean | null;
    isNatural: boolean | null;
    isCrueltyFree: boolean | null;
  };
  searchQuery: string;

  // Actions
  fetchProducts: () => Promise<void>;
  setFilter: <K extends keyof BeautyCatalogState['filters']>(
    key: K,
    value: BeautyCatalogState['filters'][K],
  ) => void;
  resetFilters: () => void;
  setSearchQuery: (query: string) => void;
  toggleFavorite: (productId: string) => void;
}

// Initial state for the beauty catalog
const initialCatalogState: BeautyCatalogState = {
  products: [],
  categories: ['makeup', 'skincare', 'haircare', 'fragrance', 'tools', 'nails', 'bath_body'],
  isLoading: false,
  error: null,
  filters: {
    category: null,
    priceRange: null,
    brands: [],
    tags: [],
    ratings: null,
    isVegan: null,
    isNatural: null,
    isCrueltyFree: null,
  },
  searchQuery: '',

  // These will be implemented after state creation
  fetchProducts: async () => {},
  setFilter: () => {},
  resetFilters: () => {},
  setSearchQuery: () => {},
  toggleFavorite: () => {},
};

/**
 * Creates the beauty catalog state manager
 * Manages product catalog, filtering, and searching
 *
 * @returns A state manager for beauty catalog
 */
export const createBeautyCatalogState = () => {
  const catalogState = createState<BeautyCatalogState>(initialCatalogState);

  // Implement all the methods
  catalogState?.setState({
    fetchProducts: async (): Promise<void> => {
      catalogState?.setState({ isLoading: true, error: null });
      try {
        // In a real implementation, this would be an API call
        const response = await fetch('/api/beauty/products');
        if (!response?.ok) {
          throw new Error('Failed to fetch products');
        }
        const products = await response?.json();
        catalogState?.setState({ products, isLoading: false });
      } catch (error) {
        catalogState?.setState({
          error: error instanceof Error ? error?.message : 'Unknown error',
          isLoading: false,
        });
      }
    },

    setFilter: <K extends keyof BeautyCatalogState['filters']>(
      key: K,
      value: BeautyCatalogState['filters'][K],
    ): void => {
      const currentState = catalogState?.getState();
      catalogState?.setState({
        filters: {
          ...currentState?.filters,
          [key]: value,
        },
      });
    },

    resetFilters: (): void => {
      catalogState?.setState({
        filters: initialCatalogState?.filters,
        searchQuery: '',
      });
    },

    setSearchQuery: (query: string): void => {
      catalogState?.setState({ searchQuery: query });
    },

    toggleFavorite: (productId: string): void => {
      const currentState = catalogState?.getState();
      catalogState?.setState({
        products: currentState?.products.map((product) =>
          product?.id === productId ? { ...product, isFavorite: !product?.isFavorite } : product,
        ),
      });
    },
  });

  return catalogState;
};

/**
 * Virtual Try-On State
 */

export interface TryOnProduct extends BeautyProduct {
  modelUrls: {
    default: string; // URL to default 3D model
    ar: string; // URL to AR model format
    preview: string; // Preview image URL
  };
  textures: {
    [colorId: string]: string; // Color ID to texture URL mapping
  };
  placement: 'face' | 'lips' | 'eyes' | 'cheeks' | 'nails' | 'hair';
}

export interface VirtualTryOnState {
  availableProducts: TryOnProduct[];
  selectedProduct: TryOnProduct | null;
  selectedColor: ProductColor | null;
  cameraActive: boolean;
  arActive: boolean;
  isLoading: boolean;
  error: string | null;
  recentlyTriedProducts: TryOnProduct[];
  faceDetected: boolean;

  // Actions
  loadTryOnProducts: () => Promise<void>;
  selectProduct: (productId: string) => void;
  selectColor: (colorId: string) => void;
  toggleCamera: () => void;
  startARExperience: () => Promise<boolean>;
  stopARExperience: () => void;
  captureImage: () => Promise<string | null>;
  saveToFavorites: (productId: string, colorId: string) => void;
  shareImage: (imageData: string) => Promise<boolean>;
}

// Initial state for virtual try-on
const initialTryOnState: VirtualTryOnState = {
  availableProducts: [],
  selectedProduct: null,
  selectedColor: null,
  cameraActive: false,
  arActive: false,
  isLoading: false,
  error: null,
  recentlyTriedProducts: [],
  faceDetected: false,

  // These will be implemented after state creation
  loadTryOnProducts: async () => {},
  selectProduct: () => {},
  selectColor: () => {},
  toggleCamera: () => {},
  startARExperience: async () => false,
  stopARExperience: () => {},
  captureImage: async () => null,
  saveToFavorites: () => {},
  shareImage: async () => false,
};

/**
 * Creates the virtual try-on state manager
 * Manages AR camera, product selection, and try-on experience
 *
 * @returns A state manager for virtual try-on features
 */
export const createVirtualTryOnState = () => {
  const tryOnState = createState<VirtualTryOnState>(initialTryOnState);

  // Implement all the methods
  tryOnState?.setState({
    loadTryOnProducts: async (): Promise<void> => {
      tryOnState?.setState({ isLoading: true, error: null });
      try {
        // In a real implementation, this would be an API call
        const response = await fetch('/api/beauty/try-on-products');
        if (!response?.ok) {
          throw new Error('Failed to fetch try-on products');
        }
        const products = await response?.json();
        tryOnState?.setState({ availableProducts: products, isLoading: false });
      } catch (error) {
        tryOnState?.setState({
          error: error instanceof Error ? error?.message : 'Unknown error',
          isLoading: false,
        });
      }
    },

    selectProduct: (productId) => {
      const product =
        tryOnState?.getState().availableProducts?.find((p) => p?.id === productId) || null;
      const firstAvailableColor = product?.colors?.find((c) => c?.isAvailable) || null;

      tryOnState?.setState({
        selectedProduct: product,
        selectedColor: firstAvailableColor,
        // Add to recently tried if not already there
        recentlyTriedProducts: product
          ? [
              product,
              ...tryOnState?.getState().recentlyTriedProducts?.filter((p) => p?.id !== productId),
            ].slice(0, 5) // Keep only 5 most recent
          : tryOnState?.getState().recentlyTriedProducts,
      });
    },

    selectColor: (colorId) => {
      const product = tryOnState?.getState().selectedProduct;
      if (!product) return;

      const color = product?.colors.find((c) => c?.id === colorId) || null;
      tryOnState?.setState({ selectedColor: color });
    },

    toggleCamera: () => {
      const currentState = tryOnState?.getState();
      // If turning off camera, also make sure AR is off
      if (currentState?.cameraActive) {
        tryOnState?.setState({
          cameraActive: false,
          arActive: false,
          faceDetected: false,
        });
      } else {
        tryOnState?.setState({ cameraActive: true });
        // Start face detection when camera is activated
        setTimeout(() => {
          // Simulating face detection success after a short delay
          // In a real app, this would use a face tracking library
          tryOnState?.setState({ faceDetected: true });
        }, 2000);
      }
    },

    startARExperience: async () => {
      tryOnState?.setState({ isLoading: true, error: null });
      try {
        // In a real implementation, this would initialize WebXR
        // For simulation purposes, we'll just return success after a delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        tryOnState?.setState({ arActive: true, isLoading: false });
        return true;
      } catch (error) {
        tryOnState?.setState({
          error: error instanceof Error ? error?.message : 'Failed to start AR',
          isLoading: false,
          arActive: false,
        });
        return false;
      }
    },

    stopARExperience: () => {
      tryOnState?.setState({ arActive: false });
    },

    captureImage: async () => {
      try {
        // In a real implementation, this would capture from canvas/camera
        // For simulation, we'll just return a placeholder
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
      } catch (error) {
        tryOnState?.setState({
          error: error instanceof Error ? error?.message : 'Failed to capture image',
        });
        return null;
      }
    },

    saveToFavorites: (productId, colorId) => {
      // In a real implementation, this would save to user's favorites
      console?.log(`Saved product ${productId} with color ${colorId} to favorites`);
    },

    shareImage: async (imageData) => {
      try {
        // In a real implementation, this would use the Web Share API
        if (navigator?.share) {
          await navigator?.share({
            title: 'My Virtual Try-On',
            text: 'Check out this beauty look I created with Vibewell AR!',
            // In a real app, you'd first upload the image and share the URL
            url: 'https://vibewell?.com/virtual-try-on',
          });
          return true;
        } else {
          // Fallback for browsers that don't support Web Share API
          // Could save locally or copy to clipboard
          return false;
        }
      } catch (error) {
        tryOnState?.setState({
          error: error instanceof Error ? error?.message : 'Failed to share image',
        });
        return false;
      }
    },
  });

  return tryOnState;
};

/**
 * Beauty Booking State
 */

export interface BeautyService {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  category: string;
  image: string;
}

export interface BeautyProvider {
  id: string;
  name: string;
  title: string;
  image: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  availability: {
    [date: string]: string[]; // date -> array of available time slots
  };
}

export interface BeautyBookingState {
  services: BeautyService[];
  providers: BeautyProvider[];
  selectedService: BeautyService | null;
  selectedProvider: BeautyProvider | null;
  selectedDate: string | null;
  selectedTime: string | null;
  customerNotes: string;
  isLoading: boolean;
  error: string | null;
  currentStep: number;

  // Actions
  fetchServices: () => Promise<void>;
  fetchProviders: (serviceId: string) => Promise<void>;
  fetchAvailability: (providerId: string, serviceId: string) => Promise<void>;
  selectService: (serviceId: string) => void;
  selectProvider: (providerId: string) => void;
  selectDate: (date: string) => void;
  selectTime: (time: string) => void;
  setCustomerNotes: (notes: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetBooking: () => void;
  submitBooking: () => Promise<boolean>;
}

// Initial state for beauty booking
const initialBookingState: BeautyBookingState = {
  services: [],
  providers: [],
  selectedService: null,
  selectedProvider: null,
  selectedDate: null,
  selectedTime: null,
  customerNotes: '',
  isLoading: false,
  error: null,
  currentStep: 0,

  // These will be implemented after state creation
  fetchServices: async () => {},
  fetchProviders: async () => {},
  fetchAvailability: async () => {},
  selectService: () => {},
  selectProvider: () => {},
  selectDate: () => {},
  selectTime: () => {},
  setCustomerNotes: () => {},
  nextStep: () => {},
  prevStep: () => {},
  goToStep: () => {},
  resetBooking: () => {},
  submitBooking: async () => false,
};

/**
 * Creates the beauty booking state manager
 * Manages complex multi-step booking flow
 *
 * @returns A state manager for beauty booking
 */
export const createBeautyBookingState = () => {
  const bookingState = createState<BeautyBookingState>(
    initialBookingState,
    StateManagerType?.REDUX, // Explicitly keep Redux for complex booking flow with middleware
  );

  // Implement all the methods
  bookingState?.setState({
    fetchServices: async (): Promise<void> => {
      bookingState?.setState({ isLoading: true, error: null });
      try {
        // In a real implementation, this would be an API call
        const response = await fetch('/api/beauty/services');
        if (!response?.ok) {
          throw new Error('Failed to fetch beauty services');
        }
        const services = await response?.json();
        bookingState?.setState({ services, isLoading: false });
      } catch (error) {
        bookingState?.setState({
          error: error instanceof Error ? error?.message : 'Unknown error',
          isLoading: false,
        });
      }
    },

    fetchProviders: async (serviceId) => {
      bookingState?.setState({ isLoading: true, error: null });
      try {
        // In a real implementation, this would be an API call
        const response = await fetch(`/api/beauty/providers?serviceId=${serviceId}`);
        if (!response?.ok) {
          throw new Error('Failed to fetch beauty providers');
        }
        const providers = await response?.json();
        bookingState?.setState({ providers, isLoading: false });
      } catch (error) {
        bookingState?.setState({
          error: error instanceof Error ? error?.message : 'Unknown error',
          isLoading: false,
        });
      }
    },

    fetchAvailability: async (providerId, serviceId) => {
      bookingState?.setState({ isLoading: true, error: null });
      try {
        // In a real implementation, this would be an API call
        const response = await fetch(
          `/api/beauty/availability?providerId=${providerId}&serviceId=${serviceId}`,
        );
        if (!response?.ok) {
          throw new Error('Failed to fetch availability');
        }

        // Update provider with availability data
        const availability = await response?.json();
        const currentState = bookingState?.getState();

        const updatedProviders = currentState?.providers.map((provider) =>
          provider?.id === providerId ? { ...provider, availability } : provider,
        );

        bookingState?.setState({ providers: updatedProviders, isLoading: false });
      } catch (error) {
        bookingState?.setState({
          error: error instanceof Error ? error?.message : 'Unknown error',
          isLoading: false,
        });
      }
    },

    selectService: (serviceId) => {
      const service = bookingState?.getState().services?.find((s) => s?.id === serviceId) || null;
      bookingState?.setState({
        selectedService: service,
        selectedProvider: null,
        selectedDate: null,
        selectedTime: null,
      });

      // Fetch providers for this service
      if (service) {
        bookingState?.getState().fetchProviders(serviceId);
      }
    },

    selectProvider: (providerId) => {
      const provider = bookingState?.getState().providers?.find((p) => p?.id === providerId) || null;
      bookingState?.setState({
        selectedProvider: provider,
        selectedDate: null,
        selectedTime: null,
      });

      // Fetch availability for this provider and selected service
      const serviceId = bookingState?.getState().selectedService?.id;
      if (provider && serviceId) {
        bookingState?.getState().fetchAvailability(providerId, serviceId);
      }
    },

    selectDate: (date) => {
      bookingState?.setState({
        selectedDate: date,
        selectedTime: null,
      });
    },

    selectTime: (time) => {
      bookingState?.setState({ selectedTime: time });
    },

    setCustomerNotes: (notes) => {
      bookingState?.setState({ customerNotes: notes });
    },

    nextStep: () => {
      const currentStep = bookingState?.getState().currentStep;
      bookingState?.setState({ currentStep: currentStep + 1 });
    },

    prevStep: () => {
      const currentStep = bookingState?.getState().currentStep;
      if (currentStep > 0) {
        bookingState?.setState({ currentStep: currentStep - 1 });
      }
    },

    goToStep: (step) => {
      bookingState?.setState({ currentStep: step });
    },

    resetBooking: () => {
      // Reset all booking data but keep services and providers
      const { services, providers } = bookingState?.getState();
      bookingState?.setState({
        ...initialBookingState,
        services,
        providers,
      });
    },

    submitBooking: async (): Promise<boolean> => {
      const { selectedService, selectedProvider, selectedDate, selectedTime, customerNotes } =
        bookingState?.getState();

      if (!selectedService || !selectedProvider || !selectedDate || !selectedTime) {
        bookingState?.setState({
          error: 'Missing required booking information',
        });
        return false;
      }

      bookingState?.setState({ isLoading: true, error: null });

      try {
        // In a real implementation, this would be an API call
        const response = await fetch('/api/beauty/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON?.stringify({
            serviceId: selectedService?.id,
            providerId: selectedProvider?.id,
            date: selectedDate,
            time: selectedTime,
            notes: customerNotes,
          }),
        });

        if (!response?.ok) {
          throw new Error('Failed to create booking');
        }

        bookingState?.setState({ isLoading: false });
        return true;
      } catch (error) {
        bookingState?.setState({
          error: error instanceof Error ? error?.message : 'Unknown error',
          isLoading: false,
        });
        return false;
      }
    },
  });

  return bookingState;
};

// Export singleton instances for global usage
export {};
export {};
export {};

/**
 * Type definitions for the beauty and virtual try-on functionality
 */

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
}

export interface ProductColor {
  id: string;
  name: string;
  hexValue: string;
  arOverlayUrl: string; // URL to the overlay image used in AR for this color
  thumbnailUrl: string;
}

export interface TryOnProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: string;
  colors: ProductColor[];
  images: ProductImage[];
  isNew?: boolean;
  isBestseller?: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface BeautyState {
  products: TryOnProduct[];
  favorites: string[]; // Array of product IDs
  recentlyViewed: string[]; // Array of product IDs
  recommendations: TryOnProduct[];
}

export interface CapturedImage {
  id: string;
  url: string;
  productId: string;
  colorId: string;
  capturedAt: string; // ISO date string
}

// Mock beauty categories
export {};

// Example product data structure (for development/testing)
export {};
