# AWS S3 Storage Deployment Guide for VibeWell

This guide provides step-by-step instructions for setting up AWS S3 storage for the VibeWell platform in a production environment.

## Prerequisites

- AWS account with administrative access
- Access to the VibeWell production environment
- Node.js and npm installed

## Step 1: AWS Account Setup

1. Log in to your [AWS Console](https://aws.amazon.com/console/)
2. Ensure you have administrative access or the following permissions:
   - S3 full access
   - IAM user and policy management

## Step 2: Configure AWS Credentials

1. Create an AWS access key:
   - Go to IAM > Users > Your User > Security credentials
   - Create new access key
   - Save the Access Key ID and Secret Access Key

2. Update your production environment variables:
   ```
   AWS_ACCESS_KEY_ID=your-access-key-id
   AWS_SECRET_ACCESS_KEY=your-secret-access-key
   AWS_REGION=your-preferred-region
   AWS_S3_BUCKET_NAME=vibewell-uploads
   ```

## Step 3: Run Setup Script

1. Run the S3 setup script:
   ```bash
   npm run setup:s3
   ```

   This script will:
   - Create an S3 bucket
   - Configure CORS settings
   - Create an IAM user for S3 access
   - Set up appropriate bucket policies

## Step 4: Verify Configuration

1. Check S3 bucket creation:
   - Go to S3 in AWS Console
   - Verify bucket `vibewell-uploads` exists
   - Check CORS configuration

2. Verify IAM user:
   - Go to IAM > Users
   - Check `vibewell-s3-user` exists
   - Verify policy attachments

## Step 5: Test File Operations

1. Test file upload:
   ```javascript
   // Using the uploadToS3 function
   const result = await uploadToS3(file);
   console.log('Upload successful:', result);
   ```

2. Test file retrieval:
   ```javascript
   // Using the getSignedUrl function
   const url = getSignedUrl(fileKey);
   console.log('File URL:', url);
   ```

## Step 6: Security Considerations

1. Bucket Security:
   - Verify bucket is not publicly accessible
   - Enable server-side encryption
   - Enable versioning if needed

2. IAM Security:
   - Review IAM user permissions
   - Rotate access keys regularly
   - Monitor AWS CloudTrail for S3 activities

3. Access Control:
   - Use presigned URLs for temporary access
   - Implement proper file access validation
   - Set appropriate CORS policies

## Step 7: Monitoring and Maintenance

1. Set up CloudWatch Alarms:
   - Monitor bucket size
   - Track request metrics
   - Set up error rate alerts

2. Configure Lifecycle Rules:
   - Set up object expiration rules
   - Configure transition to cheaper storage
   - Implement backup strategies

3. Performance Optimization:
   - Enable transfer acceleration if needed
   - Implement proper caching strategies
   - Use appropriate storage classes

## Troubleshooting

### Common Issues

1. Upload Failures:
   - Check IAM permissions
   - Verify bucket policies
   - Check file size limits

2. Access Denied Errors:
   - Verify CORS configuration
   - Check IAM user permissions
   - Validate presigned URL expiration

3. Performance Issues:
   - Check region configuration
   - Verify network connectivity
   - Monitor CloudWatch metrics

### Support

For additional support:
1. Check AWS S3 documentation
2. Review AWS troubleshooting guides
3. Contact VibeWell support team

## Maintenance Tasks

1. Regular Checks:
   - Monitor storage usage
   - Review access logs
   - Check for failed operations

2. Security Updates:
   - Rotate access keys
   - Update bucket policies
   - Review security settings

3. Performance Monitoring:
   - Check request latency
   - Monitor error rates
   - Optimize storage configuration

## Best Practices

1. File Management:
   - Implement proper file naming conventions
   - Use appropriate content types
   - Set up file versioning

2. Cost Optimization:
   - Use appropriate storage classes
   - Implement lifecycle policies
   - Monitor usage patterns

3. Backup Strategy:
   - Configure cross-region replication
   - Set up regular backups
   - Test restoration procedures 