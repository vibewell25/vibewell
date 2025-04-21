import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreatePractitionerParams {
  userId: string;
  businessId: string;
  specialization: string[];
  experience: number;
  bio?: string;
  certifications?: string[];
  education?: string[];
  languages?: string[];
}

export interface UpdatePractitionerParams extends Partial<CreatePractitionerParams> {
  rating?: number;
  availability?: Record<string, any>;
}

export class PractitionerService {
  async createPractitioner(data: CreatePractitionerParams) {
    return prisma.practitioner.create({
      data: {
        userId: data.userId,
        businessId: data.businessId,
        specialization: data.specialization,
        experience: data.experience,
        bio: data.bio,
        certifications: data.certifications || [],
        education: data.education || [],
        languages: data.languages || [],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        services: {
          select: {
            id: true,
            name: true,
            description: true,
            duration: true,
            price: true,
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

  async getPractitionerById(id: string) {
    return prisma.practitioner.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        services: {
          select: {
            id: true,
            name: true,
            description: true,
            duration: true,
            price: true,
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
        specialties: true,
      },
    });
  }

  async getPractitionerByUserId(userId: string) {
    return prisma.practitioner.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        services: {
          select: {
            id: true,
            name: true,
            description: true,
            duration: true,
            price: true,
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
        specialties: true,
      },
    });
  }

  async getPractitionersByBusiness(businessId: string) {
    return prisma.practitioner.findMany({
      where: { businessId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        services: {
          select: {
            id: true,
            name: true,
            description: true,
            duration: true,
            price: true,
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
        specialties: true,
      },
    });
  }

  async updatePractitioner(id: string, data: UpdatePractitionerParams) {
    return prisma.practitioner.update({
      where: { id },
      data: {
        specialization: data.specialization,
        experience: data.experience,
        bio: data.bio,
        rating: data.rating,
        availability: data.availability,
        certifications: data.certifications,
        education: data.education,
        languages: data.languages,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        services: {
          select: {
            id: true,
            name: true,
            description: true,
            duration: true,
            price: true,
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
        specialties: true,
      },
    });
  }

  async deletePractitioner(id: string) {
    return prisma.practitioner.delete({
      where: { id },
    });
  }

  async addServiceToPractitioner(practitionerId: string, serviceId: string) {
    return prisma.practitioner.update({
      where: { id: practitionerId },
      data: {
        services: {
          connect: { id: serviceId },
        },
      },
    });
  }

  async removeServiceFromPractitioner(practitionerId: string, serviceId: string) {
    return prisma.practitioner.update({
      where: { id: practitionerId },
      data: {
        services: {
          disconnect: { id: serviceId },
        },
      },
    });
  }

  async addSpecialtyToPractitioner(practitionerId: string, specialtyId: string) {
    return prisma.practitioner.update({
      where: { id: practitionerId },
      data: {
        specialties: {
          connect: { id: specialtyId },
        },
      },
    });
  }

  async removeSpecialtyFromPractitioner(practitionerId: string, specialtyId: string) {
    return prisma.practitioner.update({
      where: { id: practitionerId },
      data: {
        specialties: {
          disconnect: { id: specialtyId },
        },
      },
    });
  }
}
