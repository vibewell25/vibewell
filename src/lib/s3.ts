import { S3Client } from '@aws-sdk/client-s3';
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Default bucket name
const defaultBucket = process.env.AWS_S3_BUCKET || 'vibewell-uploads';

/**
 * Generate a presigned URL for uploading a file directly to S3
 */
export const getPresignedUploadUrl = async (
  key: string,
  contentType: string,
  expiresIn = 3600,
  bucket = defaultBucket
) => {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return { url, key };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
};

/**
 * Generate a presigned URL for downloading a file from S3
 */
export const getPresignedDownloadUrl = async (
  key: string,
  expiresIn = 3600,
  bucket = defaultBucket
) => {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return { url, key };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
};

/**
 * Delete a file from S3
 */
export const deleteFile = async (key: string, bucket = defaultBucket) => {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  try {
    const response = await s3Client.send(command);
    return response;
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw error;
  }
};

/**
 * Generate a unique key for S3 storage
 */
export const generateS3Key = (folder: string, filename: string, userId?: string) => {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9-.]/g, '_');
  const userPrefix = userId ? `${userId}/` : '';

  return `${folder}/${userPrefix}${timestamp}-${sanitizedFilename}`;
};

// Export the S3 client for direct use
export default s3Client;
