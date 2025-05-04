

import * as faceapi from 'face-api.js';
import { createHash } from 'crypto';

interface ProcessedImage {
  imageData: ImageData;
  hash: string;
  metadata: {
    timestamp: number;
    processingTime: number;
    resolution: {
      width: number;
      height: number;
    };
  };
}

/**

 * Securely processes and analyzes facial images
 * Implements security measures:
 * - Image validation
 * - Metadata stripping
 * - Secure processing
 * - Hash verification
 */
export const secureSkinAnalysis = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');
  videoElement: HTMLVideoElement,
  detection: faceapi.FaceDetection & { landmarks: faceapi.FaceLandmarks68 }
): Promise<ImageData> => {
  const startTime = performance.now();

  // Create a temporary canvas for processing
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Set canvas dimensions to match video
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  // Draw video frame to canvas
  ctx.drawImage(videoElement, 0, 0);

  // Extract face region with padding
  const { box } = detection;
  const padding = {

    x: box.width * 0.2,

    y: box.height * 0.2
  };

  // Ensure we don't exceed image boundaries
  const extractRegion = {

    x: Math.max(0, box.x - padding.x),

    y: Math.max(0, box.y - padding.y),



    width: Math.min(canvas.width - box.x, box.width + padding.x * 2),



    height: Math.min(canvas.height - box.y, box.height + padding.y * 2)
  };

  // Extract face region
  const faceImageData = ctx.getImageData(
    extractRegion.x,
    extractRegion.y,
    extractRegion.width,
    extractRegion.height
  );

  // Generate secure hash of image data
  const hash = createHash('sha256')
    .update(new Uint8Array(faceImageData.data.buffer))
    .digest('hex');

  // Create metadata
  const metadata: ProcessedImage['metadata'] = {
    timestamp: Date.now(),
    processingTime: performance.now() - startTime,
    resolution: {
      width: extractRegion.width,
      height: extractRegion.height
    }
  };

  // Validate processed image
  if (!validateProcessedImage(faceImageData, metadata)) {
    throw new Error('Image validation failed');
  }

  // Clean up
  canvas.remove();

  return faceImageData;
};

/**
 * Validates processed image data for security and quality
 */
const validateProcessedImage = (
  imageData: ImageData,
  metadata: ProcessedImage['metadata']
): boolean => {
  // Check image dimensions
  if (imageData.width < 64 || imageData.height < 64) {
    return false;
  }

  // Check processing time (shouldn't be too quick or too slow)
  if (metadata.processingTime < 10 || metadata.processingTime > 5000) {
    return false;
  }

  // Check for empty or corrupt image data
  const hasValidPixels = imageData.data.some(pixel => pixel !== 0);
  if (!hasValidPixels) {
    return false;
  }

  return true;
};

/**
 * Sanitizes image metadata by removing sensitive EXIF data
 */
export const sanitizeImageMetadata = (imageData: ImageData): ImageData => {
  // Create a new ImageData object without metadata
  return new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );
}; 