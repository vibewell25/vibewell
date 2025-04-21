import { BeautyService } from '@prisma/client';
import { Storage } from '@google-cloud/storage';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

const storage = new Storage();
const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET || '');

export async function uploadImage(image: Buffer | string): Promise<string> {
  // If image is a base64 string, convert to buffer
  const imageBuffer =
    typeof image === 'string'
      ? Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64')
      : image;

  // Process image with sharp
  const processedImage = await sharp(imageBuffer)
    .resize(800, 800, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toBuffer();

  const fileName = `try-on/${uuidv4()}.jpg`;
  const file = bucket.file(fileName);

  await file.save(processedImage, {
    metadata: {
      contentType: 'image/jpeg',
    },
  });

  return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
}

export async function processImage(
  imageUrl: string,
  service?: BeautyService | null
): Promise<string> {
  // Download the image
  const response = await fetch(imageUrl);
  const imageBuffer = await response.buffer();

  // Apply AI/ML processing based on service type
  // This is a placeholder - implement actual AI/ML processing
  const processedImage = await applyVirtualTryOn(imageBuffer, service);

  // Upload processed image
  const fileName = `try-on/processed-${uuidv4()}.jpg`;
  const file = bucket.file(fileName);

  await file.save(processedImage, {
    metadata: {
      contentType: 'image/jpeg',
    },
  });

  return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
}

async function applyVirtualTryOn(
  imageBuffer: Buffer,
  service?: BeautyService | null
): Promise<Buffer> {
  // This is where you would integrate with your AI/ML service
  // For now, we'll just add a simple overlay as a placeholder
  const overlay = await sharp({
    create: {
      width: 800,
      height: 800,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 0.2 },
    },
  }).toBuffer();

  return sharp(imageBuffer)
    .resize(800, 800, { fit: 'inside' })
    .composite([{ input: overlay, blend: 'overlay' }])
    .jpeg({ quality: 80 })
    .toBuffer();
}
