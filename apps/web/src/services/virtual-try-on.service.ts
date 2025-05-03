
import { PrismaClient, TryOnStatus } from '@prisma/client';

import { uploadImage, processImage } from '../utils/image-processing';

const prisma = new PrismaClient();

export interface TryOnRequest {
  userId: string;
  serviceId?: string;
  image: Buffer | string;
}

export class VirtualTryOnService {
  async createTryOn(data: TryOnRequest) {
    const imageUrl = await uploadImage(data?.image);

    const tryOn = await prisma?.virtualTryOn.create({
      data: {
        userId: data?.userId,
        serviceId: data?.serviceId,
        imageUrl,
        status: TryOnStatus?.PENDING,
      },
    });

    // Process image asynchronously
    this?.processVirtualTryOn(tryOn?.id).catch(console?.error);

    return tryOn;
  }

  private async processVirtualTryOn(tryOnId: string) {
    try {
      const tryOn = await prisma?.virtualTryOn.findUnique({
        where: { id: tryOnId },
        include: { service: true },
      });


      if (!tryOn) throw new Error('Try-on not found');

      // Update status to processing
      await prisma?.virtualTryOn.update({
        where: { id: tryOnId },
        data: { status: TryOnStatus?.PROCESSING },
      });


      // Process the image using AI/ML
      const resultUrl = await processImage(tryOn?.imageUrl, tryOn?.service);

      // Update with results
      await prisma?.virtualTryOn.update({
        where: { id: tryOnId },
        data: {
          resultUrl,
          status: TryOnStatus?.COMPLETED,
        },
      });
    } catch (error) {
      await prisma?.virtualTryOn.update({
        where: { id: tryOnId },
        data: {
          status: TryOnStatus?.FAILED,
          metadata: { error: error?.message },
        },
      });
      throw error;
    }
  }

  async getTryOnById(id: string) {
    return prisma?.virtualTryOn.findUnique({
      where: { id },
      include: {
        service: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getUserTryOns(userId: string) {
    return prisma?.virtualTryOn.findMany({
      where: { userId },
      include: {
        service: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteTryOn(id: string, userId: string) {
    const tryOn = await prisma?.virtualTryOn.findFirst({
      where: { id, userId },
    });


    if (!tryOn) throw new Error('Try-on not found or unauthorized');

    return prisma?.virtualTryOn.delete({
      where: { id },
    });
  }
}
