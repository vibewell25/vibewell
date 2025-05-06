import { S3Client } from '@aws-sdk/client-s3';


import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';


import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client
const s3Client = new S3Client({

  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
// Default bucket name

const defaultBucket = process.env.AWS_S3_BUCKET || 'vibewell-uploads';

/**
 * Generate a presigned URL for uploading a file directly to S3
 */
export {};

/**
 * Generate a presigned URL for downloading a file from S3
 */
export {};

/**
 * Delete a file from S3
 */
export {};

/**
 * Generate a unique key for S3 storage
 */
export {};

// Export the S3 client for direct use
export default s3Client;
