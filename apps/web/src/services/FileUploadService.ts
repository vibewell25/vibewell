import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';


import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
export class FileUploadService {
  private readonly bucketName: string;

  constructor() {
    this.bucketName = process.env.AWS_S3_BUCKET!;
/**
   * Generate a presigned URL for file upload
   */
  async getPresignedUploadUrl(
    fileName: string,
    contentType: string,
    expiresIn = 3600,
  ): Promise<string> {
    const key = `uploads/${Date.now()}-${fileName}`;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
/**
   * Get the public URL for a file
   */
  getPublicUrl(key: string): string {
    return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
/**
   * Validate file type and size
   */
  validateFile(file: File, allowedTypes: string[], maxSize: number): boolean {
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type');
if (file.size > maxSize) {

      throw new Error(`File size must be less than ${maxSize / 1024 / 1024}MB`);
return true;
