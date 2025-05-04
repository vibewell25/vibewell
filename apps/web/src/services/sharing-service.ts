
import { prisma } from '@/lib/database/client';
import { v4 as uuidv4 } from 'uuid';

import fs from 'fs/promises';
import path from 'path';


import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Configure AWS S3 client for file storage
const s3Client = new S3Client({

  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export interface ShareData {
  email: string;
  imageData: string;
  type: 'makeup' | 'hairstyle' | 'accessory';
  userId?: string;
}

export class SharingService {
  static async shareImage(
    data: ShareData,
  ): Promise<{ success: boolean; shareId?: string; error?: string }> {
    try {
      // Generate a unique ID for the share
      const shareId = uuidv4();

      // Upload image to AWS S3 Storage
      const imageBuffer = Buffer.from(data.imageData.split(',')[1], 'base64');

      // Determine if we're in development mode and handle file storage differently
      let imageUrl: string;

      if (process.env.NODE_ENV === 'development' && !process.env.AWS_ACCESS_KEY_ID) {
        // For development without S3, store locally in the public directory
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'shares');

        // Ensure directory exists
        await fs.mkdir(uploadsDir, { recursive: true });

        // Save the file
        await fs.writeFile(path.join(uploadsDir, `${shareId}.png`), imageBuffer);

        // URL for local development

        imageUrl = `/uploads/shares/${shareId}.png`;
      } else {
        // Upload to S3
        const command = new PutObjectCommand({

          Bucket: process.env.AWS_S3_BUCKET_NAME || 'vibewell-uploads',
          Key: `shares/${shareId}.png`,
          Body: imageBuffer,

          ContentType: 'image/png',
        });

        await s3Client.send(command);

        // Construct S3 URL

        imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/shares/${shareId}.png`;
      }

      // Create share record in database using Prisma
      await prisma.share.create({
        data: {
          id: shareId,
          userId: data.userId,
          email: data.email,
          type: data.type,
          imageUrl: imageUrl,
          createdAt: new Date(),
        },
      });

      return { success: true, shareId };
    } catch (error) {
      console.error('Error sharing image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to share image',
      };
    }
  }

  static async getShare(shareId: string) {
    try {
      const data = await prisma.share.findUnique({
        where: { id: shareId },
      });

      if (!data) {
        throw new Error('Share not found');
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error getting share:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get share',
      };
    }
  }
}
