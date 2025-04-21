import sharp from 'sharp';
import { logger } from './logger';

interface ImageProcessingResult {
  url: string;
  width: number;
  height: number;
  format: string;
}

export class ImageProcessor {
  async processImage(
    imageUrl: string,
    options: {
      width?: number;
      height?: number;
      format?: string;
      quality?: number;
    } = {}
  ): Promise<ImageProcessingResult> {
    try {
      const image = sharp(imageUrl);

      if (options.width || options.height) {
        image.resize(options.width, options.height, {
          fit: 'cover',
          position: 'center',
        });
      }

      if (options.format) {
        image.toFormat(options.format as keyof sharp.FormatEnum, {
          quality: options.quality || 80,
        });
      }

      const metadata = await image.metadata();

      // In a real implementation, you would save the processed image
      // and return its URL. For now, we'll return the original URL
      return {
        url: imageUrl,
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
      };
    } catch (error) {
      const errorMessage = `Error processing image: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(errorMessage, 'ImageProcessor', { error: String(error) });
      throw new Error(errorMessage);
    }
  }

  async applyVirtualTryOn(
    imageUrl: string,
    settings: Record<string, any>
  ): Promise<ImageProcessingResult> {
    try {
      // This is a placeholder for virtual try-on implementation
      // In a real application, this would integrate with AR/AI services
      logger.info('Processing image with settings', 'ImageProcessor', { imageUrl, settings });

      return await this.processImage(imageUrl, {
        width: 800,
        height: 600,
        format: 'jpeg',
        quality: 90,
      });
    } catch (error) {
      const errorMessage = `Error applying virtual try-on: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(errorMessage, 'ImageProcessor', { error: String(error) });
      throw new Error(errorMessage);
    }
  }
}

export const imageProcessor = new ImageProcessor();
