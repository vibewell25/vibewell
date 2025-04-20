const { 
  S3Client, 
  CreateBucketCommand, 
  PutBucketCorsCommand,
  PutBucketPolicyCommand 
} = require('@aws-sdk/client-s3');
const { IAMClient, CreateUserCommand, PutUserPolicyCommand } = require('@aws-sdk/client-iam');
require('dotenv').config();

// Initialize clients
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const iamClient = new IAMClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'vibewell-uploads';
const IAM_USER_NAME = 'vibewell-s3-user';

async function setupS3() {
  try {
    // Create S3 bucket
    try {
      await s3Client.send(
        new CreateBucketCommand({
          Bucket: BUCKET_NAME,
          CreateBucketConfiguration: {
            LocationConstraint: process.env.AWS_REGION,
          },
        })
      );
      console.log(`Created bucket: ${BUCKET_NAME}`);
    } catch (error) {
      if (error.name === 'BucketAlreadyExists') {
        console.log(`Bucket ${BUCKET_NAME} already exists`);
      } else {
        throw error;
      }
    }

    // Configure CORS
    const corsConfig = {
      Bucket: BUCKET_NAME,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE'],
            AllowedOrigins: [
              'http://localhost:3000',
              process.env.NEXT_PUBLIC_SITE_URL || 'https://vibewell.com',
            ],
            ExposeHeaders: ['ETag'],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    };

    await s3Client.send(new PutBucketCorsCommand(corsConfig));
    console.log('Configured CORS for bucket');

    // Create IAM user
    try {
      await iamClient.send(
        new CreateUserCommand({
          UserName: IAM_USER_NAME,
        })
      );
      console.log(`Created IAM user: ${IAM_USER_NAME}`);
    } catch (error) {
      if (error.name === 'EntityAlreadyExists') {
        console.log(`IAM user ${IAM_USER_NAME} already exists`);
      } else {
        throw error;
      }
    }

    // Create and attach bucket policy
    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'VibeWellS3Access',
          Effect: 'Allow',
          Action: [
            's3:PutObject',
            's3:GetObject',
            's3:DeleteObject',
            's3:ListBucket',
          ],
          Resource: [
            `arn:aws:s3:::${BUCKET_NAME}`,
            `arn:aws:s3:::${BUCKET_NAME}/*`,
          ],
        },
      ],
    };

    await iamClient.send(
      new PutUserPolicyCommand({
        UserName: IAM_USER_NAME,
        PolicyName: 'VibeWellS3Policy',
        PolicyDocument: JSON.stringify(bucketPolicy),
      })
    );
    console.log('Created and attached bucket policy');

    console.log('S3 setup completed successfully');
  } catch (error) {
    console.error('Error setting up S3:', error);
    process.exit(1);
  }
}

setupS3(); 