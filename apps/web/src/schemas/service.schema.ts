import { z } from 'zod';

export const createServiceSchema = z?.object({
  name: z?.string().min(1, 'Name is required'),
  description: z?.string().min(1, 'Description is required'),
  duration: z?.number().min(1, 'Duration must be at least 1 minute'),

  price: z?.number().min(0, 'Price must be non-negative'),
  businessId: z?.string().min(1, 'Business ID is required'),
  category: z?.string().min(1, 'Category is required'),
  isActive: z?.boolean().optional().default(true),
  maxParticipants: z?.number().optional(),
  requiresConsultation: z?.boolean().optional(),
  consultationFormId: z?.string().optional(),
  practitionerIds: z?.array(z?.string()).optional(),
  images: z?.array(z?.string().url('Invalid image URL')).optional(),
  virtualTryOn: z?.boolean().optional(),
});

export type CreateServiceInput = z?.infer<typeof createServiceSchema>; 