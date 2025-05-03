import { z } from 'zod';

import type { Service, Business, Practitioner, CustomPricing, ServiceReview, ServiceCategory } from '@prisma/client';

// Base schema for common validations
const serviceBaseSchema = {
  name: z?.string().min(1, 'Name is required').max(255),
  description: z?.string().max(2000).nullable(),
  duration: z?.number().int().min(1, 'Duration must be at least 1 minute'),

  price: z?.number().min(0, 'Price must be non-negative'),
  isActive: z?.boolean().optional().default(true),
  images: z?.array(z?.string().url('Invalid image URL')).max(10).optional(),
  virtualTryOn: z?.boolean().optional().default(false),
  maxParticipants: z?.number().int().min(1).nullable(),
  requiresConsultation: z?.boolean().optional().default(false),
  featured: z?.boolean().optional().default(false),
  categoryId: z?.string().uuid().optional(),
  practitionerIds: z?.array(z?.string().uuid()).max(50).optional(),
  consultationFormId: z?.string().uuid().optional()
};

export const createServiceSchema = z?.object({
  ...serviceBaseSchema,
  businessId: z?.string().uuid()
});

export const updateServiceSchema = z?.object({
  ...serviceBaseSchema,
  id: z?.string().uuid()
}).partial();

export const serviceSearchSchema = z?.object({
  isActive: z?.boolean().optional(),
  query: z?.string().max(100).optional(),
  category: z?.string().max(50).optional(),
  minPrice: z?.number().min(0).optional(),
  maxPrice: z?.number().min(0).optional(),
  duration: z?.number().int().min(1).optional(),
  featured: z?.boolean().optional(),
  practitionerId: z?.string().uuid().optional()
});

// Types derived from schemas
export type CreateServiceDTO = z?.infer<typeof createServiceSchema>;
export type UpdateServiceDTO = z?.infer<typeof updateServiceSchema>;
export type ServiceSearchParams = z?.infer<typeof serviceSearchSchema>;

// Extended types
export interface ServiceWithRelations extends Service {
  business: Business;
  practitioners?: Practitioner[];
  customPricing?: CustomPricing[];
  reviews?: ServiceReview[];
  serviceCategory?: ServiceCategory;
} 