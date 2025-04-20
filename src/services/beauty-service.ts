import { PrismaClient } from '@prisma/client';
import { NotificationService } from './notification-service';
import { logger } from '@/lib/logger';
import { uploadImage, processVirtualTryOn } from '@/lib/image-processing';

const prisma = new PrismaClient();

export interface CreateBeautyServiceDTO {
  businessId: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category: string;
  subcategory?: string;
  images?: string[];
  virtualTryOn?: boolean;
}

export interface CreatePractitionerDTO {
  businessId: string;
  userId: string;
  name: string;
  bio?: string;
  specialties: string[];
  experience: number;
  certifications: string[];
  availability: Record<string, any>;
  profileImage?: string;
}

export interface CreatePortfolioItemDTO {
  practitionerId: string;
  title: string;
  description?: string;
  imageUrl: string;
  category: string;
  tags: string[];
  beforeImage?: string;
  afterImage?: string;
}

export class BeautyService {
  private notificationService: NotificationService;

  constructor(notificationService: NotificationService) {
    this.notificationService = notificationService;
  }

  async createBeautyService(data: CreateBeautyServiceDTO) {
    try {
      const service = await prisma.beautyService.create({
        data: {
          businessId: data.businessId,
          name: data.name,
          description: data.description,
          duration: data.duration,
          price: data.price,
          category: data.category,
          subcategory: data.subcategory,
          images: data.images || [],
          virtualTryOn: data.virtualTryOn || false,
        },
      });

      logger.info('Created beauty service', { serviceId: service.id });
      return service;
    } catch (error) {
      logger.error('Error creating beauty service:', error);
      throw error;
    }
  }

  async createPractitioner(data: CreatePractitionerDTO) {
    try {
      const practitioner = await prisma.practitioner.create({
        data: {
          businessId: data.businessId,
          userId: data.userId,
          name: data.name,
          bio: data.bio,
          specialties: data.specialties,
          experience: data.experience,
          certifications: data.certifications,
          availability: data.availability,
          profileImage: data.profileImage,
        },
      });

      logger.info('Created practitioner', { practitionerId: practitioner.id });
      return practitioner;
    } catch (error) {
      logger.error('Error creating practitioner:', error);
      throw error;
    }
  }

  async addPortfolioItem(data: CreatePortfolioItemDTO) {
    try {
      const item = await prisma.portfolioItem.create({
        data: {
          practitionerId: data.practitionerId,
          title: data.title,
          description: data.description,
          imageUrl: data.imageUrl,
          category: data.category,
          tags: data.tags,
          beforeImage: data.beforeImage,
          afterImage: data.afterImage,
        },
      });

      logger.info('Added portfolio item', { itemId: item.id });
      return item;
    } catch (error) {
      logger.error('Error adding portfolio item:', error);
      throw error;
    }
  }

  async processVirtualTryOn(userId: string, serviceId: string, imageUrl: string, settings: any) {
    try {
      // Upload original image
      const uploadedImageUrl = await uploadImage(imageUrl);

      // Process the image with virtual try-on
      const resultUrl = await processVirtualTryOn(uploadedImageUrl, settings);

      // Save the try-on record
      const tryOn = await prisma.virtualTryOn.create({
        data: {
          userId,
          serviceId,
          imageUrl: uploadedImageUrl,
          resultUrl,
          settings,
        },
      });

      logger.info('Processed virtual try-on', { tryOnId: tryOn.id });
      return tryOn;
    } catch (error) {
      logger.error('Error processing virtual try-on:', error);
      throw error;
    }
  }

  async searchServices(query: string, filters: Record<string, any> = {}) {
    try {
      const services = await prisma.beautyService.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
          isActive: true,
          ...filters,
        },
        include: {
          practitioners: {
            include: {
              practitioner: true,
            },
          },
        },
      });

      return services;
    } catch (error) {
      logger.error('Error searching services:', error);
      throw error;
    }
  }

  async getPractitionerPortfolio(practitionerId: string) {
    try {
      const portfolio = await prisma.portfolioItem.findMany({
        where: {
          practitionerId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return portfolio;
    } catch (error) {
      logger.error('Error getting practitioner portfolio:', error);
      throw error;
    }
  }

  async addPractitionerReview(
    practitionerId: string,
    userId: string,
    rating: number,
    comment?: string,
    serviceId?: string,
    bookingId?: string
  ) {
    try {
      const review = await prisma.practitionerReview.create({
        data: {
          practitionerId,
          userId,
          rating,
          comment,
          serviceId,
          bookingId,
        },
      });

      // Update practitioner's average rating
      const reviews = await prisma.practitionerReview.findMany({
        where: {
          practitionerId,
        },
        select: {
          rating: true,
        },
      });

      const averageRating =
        reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

      await prisma.practitioner.update({
        where: {
          id: practitionerId,
        },
        data: {
          rating: averageRating,
        },
      });

      logger.info('Added practitioner review', { reviewId: review.id });
      return review;
    } catch (error) {
      logger.error('Error adding practitioner review:', error);
      throw error;
    }
  }
} 