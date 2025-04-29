import { PrismaClient } from '@prisma/client';
import type { Service, Prisma } from '@prisma/client';
import { NotificationService } from './notification-service';
import { logger } from '@/lib/logger';
import { createServiceSchema, updateServiceSchema, serviceSearchSchema } from '@/types/service.types';
import type { CreateServiceDTO, UpdateServiceDTO, ServiceSearchParams } from '@/types/service.types';
import { RateLimiter } from '@/lib/rate-limiter';
import { sanitizeInput, sanitizeOutput } from '@/lib/sanitization';
import { BusinessService } from './business-service';

const prisma = new PrismaClient();
const rateLimiter = new RateLimiter();

export class ServiceService {
  private notificationService: NotificationService;
  private businessService: BusinessService;

  constructor(
    notificationService: NotificationService,
    businessService: BusinessService
  ) {
    this.notificationService = notificationService;
    this.businessService = businessService;
  }

  async createService(data: CreateServiceDTO, userId: string): Promise<Service> {
    try {
      // Rate limiting
      await rateLimiter.checkLimit(`create_service_${userId}`, 10, 60); // 10 requests per minute

      // Validate input
      const sanitizedData = sanitizeInput(data);
      const validatedData = createServiceSchema.parse(sanitizedData);

      // Check business ownership
      const hasAccess = await this.businessService.checkUserAccess(validatedData.businessId, userId);
      if (!hasAccess) {
        throw new Error('Unauthorized: User does not have access to this business');
      }

      const service = await prisma.service.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          duration: validatedData.duration,
          price: validatedData.price,
          isActive: validatedData.isActive,
          images: validatedData.images ?? [],
          virtualTryOn: validatedData.virtualTryOn,
          maxParticipants: validatedData.maxParticipants,
          requiresConsultation: validatedData.requiresConsultation,
          featured: validatedData.featured,
          business: {
            connect: { id: validatedData.businessId }
          },
          practitioners: validatedData.practitionerIds?.length ? {
            createMany: {
              data: validatedData.practitionerIds.map(id => ({ practitionerId: id }))
            }
          } : undefined,
          serviceCategory: validatedData.categoryId ? {
            connect: { id: validatedData.categoryId }
          } : undefined,
          ...(validatedData.consultationFormId && {
            consultationForms: {
              connect: [{ id: validatedData.consultationFormId }]
            }
          })
        }
      });

      logger.info(`Created service ${service.id} by user ${userId}`);
      return sanitizeOutput(service);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error('Error creating service:', { error: errorMessage, userId });
      throw error;
    }
  }

  async updateService(data: UpdateServiceDTO, userId: string): Promise<Service> {
    try {
      // Rate limiting
      await rateLimiter.checkLimit(`update_service_${userId}`, 20, 60); // 20 requests per minute

      // Validate input
      const sanitizedData = sanitizeInput(data);
      const validatedData = updateServiceSchema.parse(sanitizedData);

      // Check service ownership
      const service = await this.getService(validatedData.id);
      if (!service) {
        throw new Error('Service not found');
      }

      const hasAccess = await this.businessService.checkUserAccess(service.businessId, userId);
      if (!hasAccess) {
        throw new Error('Unauthorized: User does not have access to this service');
      }

      const updateData: Prisma.ServiceUpdateInput = {
        ...(validatedData.name !== undefined && { name: validatedData.name }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.duration !== undefined && { duration: validatedData.duration }),
        ...(validatedData.price !== undefined && { price: validatedData.price }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
        ...(validatedData.images !== undefined && { images: validatedData.images }),
        ...(validatedData.virtualTryOn !== undefined && { virtualTryOn: validatedData.virtualTryOn }),
        ...(validatedData.maxParticipants !== undefined && { maxParticipants: validatedData.maxParticipants }),
        ...(validatedData.requiresConsultation !== undefined && { requiresConsultation: validatedData.requiresConsultation }),
        ...(validatedData.featured !== undefined && { featured: validatedData.featured }),
        ...(validatedData.practitionerIds?.length && {
          practitioners: {
            deleteMany: {},
            createMany: {
              data: validatedData.practitionerIds.map(id => ({ practitionerId: id }))
            }
          }
        }),
        ...(validatedData.categoryId !== undefined && {
          serviceCategory: validatedData.categoryId ? {
            connect: { id: validatedData.categoryId }
          } : { disconnect: true }
        }),
        ...(validatedData.consultationFormId !== undefined && {
          consultationForms: validatedData.consultationFormId ? {
            set: [{ id: validatedData.consultationFormId }]
          } : { set: [] }
        })
      };

      const updatedService = await prisma.service.update({
        where: { id: validatedData.id },
        data: updateData
      });

      logger.info(`Updated service ${updatedService.id} by user ${userId}`);
      return sanitizeOutput(updatedService);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error('Error updating service:', { error: errorMessage, userId });
      throw error;
    }
  }

  async deleteService(id: string, userId: string): Promise<void> {
    try {
      // Rate limiting
      await rateLimiter.checkLimit(`delete_service_${userId}`, 5, 60); // 5 requests per minute

      // Check service ownership
      const service = await this.getService(id);
      if (!service) {
        throw new Error('Service not found');
      }

      const hasAccess = await this.businessService.checkUserAccess(service.businessId, userId);
      if (!hasAccess) {
        throw new Error('Unauthorized: User does not have access to this service');
      }

      await prisma.service.delete({
        where: { id }
      });

      logger.info(`Deleted service ${id} by user ${userId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error('Error deleting service:', { error: errorMessage, userId });
      throw error;
    }
  }

  async getService(id: string): Promise<Service | null> {
    const service = await prisma.service.findUnique({
      where: { id }
    });
    return service ? sanitizeOutput(service) : null;
  }

  async searchServices(params: ServiceSearchParams): Promise<Service[]> {
    try {
      // Validate and sanitize search parameters
      const sanitizedParams = sanitizeInput(params);
      const validatedParams = serviceSearchSchema.parse(sanitizedParams);

      const where: Prisma.ServiceWhereInput = {
        isActive: validatedParams.isActive ?? true,
        ...(validatedParams.query && {
          OR: [
            { name: { contains: validatedParams.query, mode: 'insensitive' } },
            { description: { contains: validatedParams.query, mode: 'insensitive' } }
          ]
        }),
        ...(validatedParams.category && {
          serviceCategory: {
            name: {
              equals: validatedParams.category,
              mode: 'insensitive'
            }
          }
        }),
        ...(validatedParams.minPrice || validatedParams.maxPrice ? {
          price: {
            ...(validatedParams.minPrice && { gte: validatedParams.minPrice }),
            ...(validatedParams.maxPrice && { lte: validatedParams.maxPrice })
          }
        } : {}),
        ...(validatedParams.duration && { duration: validatedParams.duration }),
        ...(validatedParams.featured !== undefined && { featured: validatedParams.featured }),
        ...(validatedParams.practitionerId && {
          practitioners: {
            some: { practitionerId: validatedParams.practitionerId }
          }
        })
      };

      const services = await prisma.service.findMany({
        where,
        take: 100 // Limit results to prevent DoS
      });

      return services.map(service => sanitizeOutput(service));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error('Error searching services:', errorMessage);
      throw error;
    }
  }
} 