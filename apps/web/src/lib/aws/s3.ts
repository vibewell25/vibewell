import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,

  region: process.env.AWS_REGION || 'us-east-1',
const s3 = new AWS.S3();

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'vibewell-uploads';

/**
 * Upload a file to S3
 * @param file The file to upload
 * @param key Optional key (path) for the file. If not provided, a UUID will be generated
 * @returns The key of the uploaded file
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); uploadToS3(file: File, key?: string): Promise<string> {
  try {
    const fileKey = key || `uploads/${uuidv4()}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const params = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: buffer,
      ContentType: file.type,
await s3.upload(params).promise();
    return fileKey;
catch (error) {
    console.error('Error uploading file to S3:', error);
    throw new Error('Failed to upload file');
/**
 * Get a signed URL for an S3 object
 * @param key The key (path) of the object
 * @param expiresIn The number of seconds the URL is valid for (default: 3600 = 1 hour)
 * @returns The signed URL
 */
export function getSignedUrl(key: string, expiresIn: number = 3600): string {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Expires: expiresIn,
return s3.getSignedUrl('getObject', params);
catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate signed URL');
/**
 * Delete an object from S3
 * @param key The key (path) of the object to delete
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); deleteFromS3(key: string): Promise<void> {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
await s3.deleteObject(params).promise();
catch (error) {
    console.error('Error deleting file from S3:', error);
    throw new Error('Failed to delete file');
