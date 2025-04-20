import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateBeautyServiceParams {
  name: string;
  description?: string;
  duration: number;
  price: number;
  categoryId: string;
  businessId: string;
  virtualTryOn?: boolean;
  requirements?: string;
  contraindications?: string;
  aftercare?: string;
  practitionerIds?: string[];
}

export class BeautyServiceService {
  async createService(data: CreateBeautyServiceParams) {
    return prisma.beautyService.create({
      data: {
        name: data.name,
        description: data.description,
        duration: data.duration,
        price: data.price,
        categoryId: data.categoryId,
        businessId: data.businessId,
        virtualTryOn: data.virtualTryOn,
        requirements: data.requirements,
        contraindications: data.contraindications,
        aftercare: data.aftercare,
        practitioners: data.practitionerIds ? {
          connect: data.practitionerIds.map(id => ({ id })),
        } : undefined,
      },
      include: {
        category: true,
        practitioners: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            specialization: true,
            experience: true,
            rating: true,
          },
        },
      },
    });
  }

  async getServiceById(id: string) {
    return prisma.beautyService.findUnique({
      where: { id },
      include: {
        category: true,
        practitioners: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            specialization: true,
            experience: true,
            rating: true,
          },
        },
        portfolio: {
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            beforeImage: true,
            afterImage: true,
            category: true,
            tags: true,
          },
        },
      },
    });
  }

  async getServicesByBusiness(businessId: string) {
    return prisma.beautyService.findMany({
      where: { businessId },
      include: {
        category: true,
        practitioners: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            specialization: true,
            experience: true,
            rating: true,
          },
        },
      },
    });
  }

  async updateService(id: string, data: Partial<CreateBeautyServiceParams>) {
    return prisma.beautyService.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        duration: data.duration,
        price: data.price,
        categoryId: data.categoryId,
        virtualTryOn: data.virtualTryOn,
        requirements: data.requirements,
        contraindications: data.contraindications,
        aftercare: data.aftercare,
        practitioners: data.practitionerIds ? {
          set: data.practitionerIds.map(id => ({ id })),
        } : undefined,
      },
      include: {
        category: true,
        practitioners: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            specialization: true,
            experience: true,
            rating: true,
          },
        },
      },
    });
  }

  async deleteService(id: string) {
    return prisma.beautyService.delete({
      where: { id },
    });
  }

  async getServiceCategories() {
    return prisma.serviceCategory.findMany({
      include: {
        services: true,
      },
    });
  }
} 