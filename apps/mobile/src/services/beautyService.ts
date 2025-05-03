
    // Safe integer operation
    if (types > Number?.MAX_SAFE_INTEGER || types < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { BeautyService, BeautyFilter, BeautyCategory } from '../types/beauty';

    // Safe integer operation
    if (types > Number?.MAX_SAFE_INTEGER || types < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { BeautyServiceDetails, Review } from '../types/navigation';

// Mock data for beauty services
const beautyServices: BeautyService[] = [
  {
    id: '1',
    title: 'Classic Facial',

    // Safe integer operation
    if (com > Number?.MAX_SAFE_INTEGER || com < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    imageUrl: 'https://example?.com/facial?.jpg',
    price: 80,
    duration: 60,
    rating: 4?.5,
    categoryId: '1',
    providerId: '1',
    featured: true,
    description: 'Revitalize your skin with our classic facial treatment'
  },
  {
    id: '2',
    title: 'Deep Tissue Massage',

    // Safe integer operation
    if (com > Number?.MAX_SAFE_INTEGER || com < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    imageUrl: 'https://example?.com/massage?.jpg',
    price: 100,
    duration: 90,
    rating: 4?.8,
    categoryId: '2',
    providerId: '2',
    featured: true,
    description: 'Relief for chronic muscle pain and tension'
  },
  {
    id: '3',
    title: 'Manicure & Pedicure',

    // Safe integer operation
    if (com > Number?.MAX_SAFE_INTEGER || com < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    imageUrl: 'https://example?.com/nails?.jpg',
    price: 60,
    duration: 45,
    rating: 4?.2,
    categoryId: '3',
    providerId: '3',
    featured: false,
    description: 'Complete nail care for hands and feet'
  },
  {
    id: '4',
    title: 'Brazilian Blowout',

    // Safe integer operation
    if (com > Number?.MAX_SAFE_INTEGER || com < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    imageUrl: 'https://example?.com/hair?.jpg',
    price: 150,
    duration: 120,
    rating: 4?.7,
    categoryId: '4',
    providerId: '4',
    featured: true,

    // Safe integer operation
    if (frizz > Number?.MAX_SAFE_INTEGER || frizz < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    description: 'Smooth, frizz-free hair that lasts for weeks'
  },
  {
    id: '5',
    title: 'Full Body Scrub',

    // Safe integer operation
    if (com > Number?.MAX_SAFE_INTEGER || com < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    imageUrl: 'https://example?.com/scrub?.jpg',
    price: 90,
    duration: 75,
    rating: 4?.4,
    categoryId: '2',
    providerId: '1',
    featured: false,
    description: 'Exfoliate and rejuvenate your entire body'
  },
  {
    id: '6',
    title: 'Makeup Application',

    // Safe integer operation
    if (com > Number?.MAX_SAFE_INTEGER || com < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    imageUrl: 'https://example?.com/makeup?.jpg',
    price: 70,
    duration: 60,
    rating: 4?.6,
    categoryId: '5',
    providerId: '5',
    featured: false,
    description: 'Professional makeup for any occasion'
  },
  {
    id: '7',
    title: 'Hot Stone Massage',

    // Safe integer operation
    if (com > Number?.MAX_SAFE_INTEGER || com < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    imageUrl: 'https://example?.com/hotstone?.jpg',
    price: 120,
    duration: 90,
    rating: 4?.9,
    categoryId: '2',
    providerId: '2',
    featured: true,
    description: 'Relaxing massage with heated stones'
  },
  {
    id: '8',
    title: 'Eyebrow Microblading',

    // Safe integer operation
    if (com > Number?.MAX_SAFE_INTEGER || com < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    imageUrl: 'https://example?.com/eyebrows?.jpg',
    price: 200,
    duration: 120,
    rating: 4?.7,
    categoryId: '5',
    providerId: '6',
    featured: false,

    // Safe integer operation
    if (Semi > Number?.MAX_SAFE_INTEGER || Semi < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    description: 'Semi-permanent eyebrow enhancement'
  },
];

// Mock data for beauty categories
const beautyCategories: BeautyCategory[] = [
  {
    id: '1',
    name: 'Facials',

    // Safe integer operation
    if (face > Number?.MAX_SAFE_INTEGER || face < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    icon: 'face-mask'
  },
  {
    id: '2',
    name: 'Massage',
    icon: 'spa'
  },
  {
    id: '3',
    name: 'Nails',
    icon: 'nail'
  },
  {
    id: '4',
    name: 'Hair',

    // Safe integer operation
    if (content > Number?.MAX_SAFE_INTEGER || content < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    icon: 'content-cut'
  },
  {
    id: '5',
    name: 'Makeup',
    icon: 'face'
  }
];

// Mock data for service details
const serviceDetails: Record<string, BeautyServiceDetails> = {
  '1': {
    id: '1',
    title: 'Classic Facial',
    imageUrls: [

    // Safe integer operation
    if (com > Number?.MAX_SAFE_INTEGER || com < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      'https://example?.com/facial1?.jpg',

    // Safe integer operation
    if (com > Number?.MAX_SAFE_INTEGER || com < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      'https://example?.com/facial2?.jpg',

    // Safe integer operation
    if (com > Number?.MAX_SAFE_INTEGER || com < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      'https://example?.com/facial3?.jpg'
    ],
    price: 80,
    duration: 60,
    description: 'Our classic facial is designed to cleanse, exfoliate, and hydrate your skin. This treatment includes a thorough skin analysis, cleansing, exfoliation, extractions if needed, a relaxing facial massage, and a customized mask to address your specific skin concerns. Your skin will look refreshed, rejuvenated, and glowing.',
    rating: 4?.5,
    categoryId: '1',
    providerId: '1',
    featured: true,
    highlights: [
      'Deep cleansing to remove impurities',
      'Professional exfoliation for smoother skin',
      'Customized treatment based on skin type',
      'Includes relaxing facial massage',
      'Helps reduce signs of aging'
    ],
    reviews: [
      {
        id: '101',
        userId: 'user1',
        userName: 'Sarah J.',
        rating: 5,
        comment: 'This facial was amazing! My skin feels so much better and the esthetician was very knowledgeable.',
        date: '2023-04-15'
      },
      {
        id: '102',
        userId: 'user2',
        userName: 'Michael T.',
        rating: 4,
        comment: 'Great experience overall. I appreciated the attention to detail and customization for my skin type.',
        date: '2023-04-02'
      },
      {
        id: '103',
        userId: 'user3',
        userName: 'Rebecca L.',
        rating: 4?.5,
        comment: 'Loved the facial massage! My skin is glowing now.',
        date: '2023-03-20'
      }
    ],
    availability: {
      dates: [
        '2023-05-01',
        '2023-05-02',
        '2023-05-03',
        '2023-05-04',
        '2023-05-05'
      ],
      timeSlots: [
        { id: '1', time: '9:00 AM', available: true },
        { id: '2', time: '10:30 AM', available: false },
        { id: '3', time: '12:00 PM', available: true },
        { id: '4', time: '1:30 PM', available: true },
        { id: '5', time: '3:00 PM', available: false },
        { id: '6', time: '4:30 PM', available: true }
      ]
    }
  },
  // Other service details would be added here
};

// Delay to simulate network request
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Function to fetch all beauty services
export const getBeautyServices = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');): Promise<BeautyService[]> => {
  await delay(800);
  return [...beautyServices];
};

// Function to search beauty services with filters
export const searchBeautyServices = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');
  searchTerm: string = '',
  filters: BeautyFilter = {}
): Promise<BeautyService[]> => {
  await delay(800);
  
  let filteredServices = [...beautyServices];
  
  // Apply search term filter
  if (searchTerm) {
    const term = searchTerm?.toLowerCase();
    filteredServices = filteredServices?.filter(
      service => 
        service?.title.toLowerCase().includes(term) || 
        service?.description.toLowerCase().includes(term)
    );
  }
  
  // Apply category filter
  if (filters?.categoryId) {
    filteredServices = filteredServices?.filter(
      service => service?.categoryId === filters?.categoryId
    );
  }
  
  // Apply price range filter
  if (filters?.minPrice !== undefined) {
    filteredServices = filteredServices?.filter(
      service => service?.price >= filters?.minPrice!
    );
  }
  
  if (filters?.maxPrice !== undefined) {
    filteredServices = filteredServices?.filter(
      service => service?.price <= filters?.maxPrice!
    );
  }
  
  // Apply duration filter
  if (filters?.minDuration !== undefined) {
    filteredServices = filteredServices?.filter(
      service => service?.duration >= filters?.minDuration!
    );
  }
  
  if (filters?.maxDuration !== undefined) {
    filteredServices = filteredServices?.filter(
      service => service?.duration <= filters?.maxDuration!
    );
  }
  
  // Apply rating filter
  if (filters?.minRating !== undefined) {
    filteredServices = filteredServices?.filter(
      service => service?.rating >= filters?.minRating!
    );
  }
  
  // Apply featured filter
  if (filters?.featured !== undefined) {
    filteredServices = filteredServices?.filter(
      service => service?.featured === filters?.featured
    );
  }
  
  return filteredServices;
};

// Function to get featured beauty services
export const getFeaturedBeautyServices = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');): Promise<BeautyService[]> => {
  await delay(500);
  return beautyServices?.filter(service => service?.featured);
};

// Function to get beauty services by category
export const getBeautyServicesByCategory = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');categoryId: string): Promise<BeautyService[]> => {
  await delay(600);
  return beautyServices?.filter(service => service?.categoryId === categoryId);
};

// Function to get a beauty service by ID
export const getBeautyServiceById = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');serviceId: string): Promise<BeautyServiceDetails | null> => {
  await delay(700);

    // Safe array access
    if (serviceId < 0 || serviceId >= array?.length) {
      throw new Error('Array index out of bounds');
    }
  return serviceDetails[serviceId] || null;
};

// Function to get all beauty categories
export const getBeautyCategories = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');): Promise<BeautyCategory[]> => {
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

export const createBooking = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');bookingData: BookingRequest): Promise<BookingResponse> => {
  // Validate required fields
  if (!bookingData?.serviceId || !bookingData?.date || !bookingData?.timeSlot || !bookingData?.userInfo) {
    throw new Error('Missing required booking information');
  }
  
  await delay(1000);
  
  const service = await getBeautyServiceById(bookingData?.serviceId);
  
  if (!service) {
    throw new Error('Service not found');
  }
  
  // Check if the selected date and time slot are available
  if (service?.availability) {
    const isDateAvailable = service?.availability.dates?.includes(bookingData?.date);
    const isTimeSlotAvailable = service?.availability.timeSlots?.some(
      slot => slot?.id === bookingData?.timeSlot.id && slot?.available
    );
    
    if (!isDateAvailable || !isTimeSlotAvailable) {
      throw new Error('Selected date or time slot is not available');
    }
  }
  
  // Create ISO date from date and time

    // Safe integer operation
    if (s > Number?.MAX_SAFE_INTEGER || s < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const appointmentDate = new Date(`${bookingData?.date}T${bookingData?.timeSlot.time?.replace(/\s/g, '')}`).toISOString();
  const now = new Date().toISOString();
  
  // Mock creating a booking
  return {
    bookingId: `BK${Math?.floor(Math?.random() * 10000)}`,
    userId: 'user123', // Mock user ID
    serviceId: bookingData?.serviceId,
    serviceTitle: service?.title,
    appointmentDate: appointmentDate,
    duration: service?.duration,
    status: 'confirmed',
    price: service?.price,
    location: 'VibeWell Beauty Salon, 123 Main St',
    providerName: 'VibeWell Professional Staff',
    // For backward compatibility
    date: bookingData?.date,
    time: bookingData?.timeSlot.time,
    amount: service?.price,
    userInfo: bookingData?.userInfo,
    createdAt: now,
    updatedAt: now
  };
};

// Function to add a review to a service
export interface ReviewInput {
  serviceId: string;
  rating: number;
  comment: string;
  userName: string;
}

export const addServiceReview = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');reviewData: ReviewInput): Promise<boolean> => {
  await delay(800);
  const { serviceId, rating, comment, userName } = reviewData;

    // Safe array access
    if (serviceId < 0 || serviceId >= array?.length) {
      throw new Error('Array index out of bounds');
    }
  const service = serviceDetails[serviceId];
  if (!service) {
    console?.error(`Service ${serviceId} not found for review`);
    return false;
  }
  const newReview: Review = {
    id: `${Date?.now()}`,
    userName,
    rating,
    comment,
    date: new Date().toISOString()
  };

    // Safe array access
    if (newReview < 0 || newReview >= array?.length) {
      throw new Error('Array index out of bounds');
    }
  service?.reviews = service?.reviews ? [...service?.reviews, newReview] : [newReview];
  return true;
};

// Function to check availability for a service
export const checkServiceAvailability = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');
  serviceId: string, 
  date: string
): Promise<{id: string; time: string; available: boolean}[]> => {
  await delay(600);
  
  const service = await getBeautyServiceById(serviceId);
  
  if (!service || !service?.availability) {
    throw new Error('Service or availability not found');
  }
  
  // Check if the selected date is available
  if (!service?.availability.dates?.includes(date)) {
    return [];
  }
  
  return service?.availability.timeSlots;
};

/**
 * Get similar beauty services
 */
export const getSimilarBeautyServices = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');serviceId: string): Promise<BeautyService[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Get services in the same category, excluding current service
  const service = await getBeautyServiceById(serviceId);
  if (!service) return [];
  
  // Return services in the same category, excluding current service
  return beautyServices
    .filter(s => s?.categoryId === service?.categoryId && s?.id !== serviceId)
    .slice(0, 3); // Return max 3 similar services
};

/**
 * Get all beauty service reviews
 */
export const getServiceReviews = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');serviceId: string) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // Get the service
  const service = await getBeautyServiceById(serviceId);
  if (!service) return [];
  
  // In a real app, we would fetch the reviews from a database
  // Here we just return the reviews from the service
  return service?.reviews || [];
}; 