# External Service Setup Guide for VibeWell

This guide provides detailed instructions for setting up the external services required by the VibeWell platform.

## 1. Auth0 Setup

### Create an Auth0 Account and Application
1. Go to [Auth0](https://auth0.com/) and create an account or sign in.
2. Create a new tenant for VibeWell.
3. Navigate to the Applications section and create a new Regular Web Application:
   - Name: VibeWell
   - Application Type: Regular Web Application

### Configure Application Settings
1. Go to the Application Settings tab.
2. Configure the following URLs:
   - Allowed Callback URLs: `http://localhost:3000/api/auth/callback` (for development) and your production URL
   - Allowed Logout URLs: `http://localhost:3000` (for development) and your production URL
   - Allowed Web Origins: `http://localhost:3000` (for development) and your production URL
3. Save the settings.

### Create API
1. Go to the APIs section and create a new API:
   - Name: VibeWell API
   - Identifier: `https://api.vibewell.com` (or your preferred audience value)

### Set Up Roles
1. Go to User Management > Roles and create the following roles:
   - `admin`: For administrative users
   - `provider`: For wellness service providers
   - `user`: For regular users (optional, as this can be the default)

### Create a Rule for Role Assignment
1. Go to Auth Pipeline > Rules and create a new rule:
   - Name: Assign Roles to Users
   - Script:
     ```javascript
     function assignRoles(user, context, callback) {
       // Example rule to assign roles based on email domains
       const namespace = 'https://vibewell.com';
       
       // Initialize the roles array
       let roles = [];
       
       // Example: assign admin role to specific emails or domains
       if (user.email && user.email.endsWith('@admin.vibewell.com')) {
         roles.push('admin');
       }
       
       // Example: assign provider role to specific emails or domains
       if (user.email && user.email.endsWith('@provider.vibewell.com')) {
         roles.push('provider');
       }
       
       // If no roles were assigned, make the user a regular user
       if (roles.length === 0) {
         roles.push('user');
       }
       
       // Add the roles to the ID token
       context.idToken[`${namespace}/roles`] = roles;
       
       callback(null, user, context);
     }
     ```

### Get Your Auth0 Credentials
Copy the following values from your Auth0 dashboard to your `.env.local` file:
- Domain (as `AUTH0_ISSUER_BASE_URL`): `https://{tenant}.auth0.com`
- Client ID (as `AUTH0_CLIENT_ID`)
- Client Secret (as `AUTH0_CLIENT_SECRET`)

## 2. AWS Setup

### Create an AWS Account
1. Go to [AWS](https://aws.amazon.com/) and create an account or sign in.

### Set Up S3 Bucket
1. Navigate to the S3 service.
2. Create a new bucket:
   - Name: `vibewell-uploads` (or your preferred name)
   - Region: Choose a region close to your users
   - Block all public access: Yes (we'll use presigned URLs for access)
3. Set up CORS configuration for the bucket:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["http://localhost:3000", "https://your-production-domain.com"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

### Create IAM User for S3 Access
1. Navigate to the IAM service.
2. Create a new policy:
   - Name: `VibeWellS3Access`
   - Policy Document:
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Effect": "Allow",
           "Action": [
             "s3:PutObject",
             "s3:GetObject",
             "s3:DeleteObject",
             "s3:ListBucket"
           ],
           "Resource": [
             "arn:aws:s3:::vibewell-uploads",
             "arn:aws:s3:::vibewell-uploads/*"
           ]
         }
       ]
     }
     ```
3. Create a new user:
   - Name: `vibewell-s3-user`
   - Access type: Programmatic access
   - Attach the `VibeWellS3Access` policy
4. Save the Access Key ID and Secret Access Key.

### Set Up Lambda Functions (Optional)
1. Navigate to the Lambda service.
2. Create a new function:
   - Name: `vibewell-image-resize`
   - Runtime: Node.js 18.x
   - Role: Create a new role with basic Lambda permissions
3. Add S3 permissions to the role:
   - Navigate to the IAM service
   - Find the role created for your Lambda function
   - Attach the `VibeWellS3Access` policy
4. Example Lambda function for image resizing:
   ```javascript
   const AWS = require('aws-sdk');
   const sharp = require('sharp');
   const s3 = new AWS.S3();

   exports.handler = async (event) => {
     // Get the object from the event
     const bucket = event.Records[0].s3.bucket.name;
     const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
     
     try {
       // Get the original image
       const data = await s3.getObject({ Bucket: bucket, Key: key }).promise();
       
       // Resize the image
       const resizedImage = await sharp(data.Body)
         .resize(800) // Max width: 800px
         .toBuffer();
       
       // Upload the resized image
       const resizedKey = `resized/${key.split('/').pop()}`;
       await s3.putObject({
         Bucket: bucket,
         Key: resizedKey,
         Body: resizedImage,
         ContentType: data.ContentType,
       }).promise();
       
       return {
         statusCode: 200,
         body: JSON.stringify({ message: 'Image resized successfully' }),
       };
     } catch (error) {
       console.error(error);
       return {
         statusCode: 500,
         body: JSON.stringify({ message: 'Error resizing image' }),
       };
     }
   };
   ```

### Get Your AWS Credentials
Copy the following values to your `.env.local` file:
- AWS_REGION: The region you chose (e.g., `us-east-1`)
- AWS_ACCESS_KEY_ID: The Access Key ID from the IAM user
- AWS_SECRET_ACCESS_KEY: The Secret Access Key from the IAM user
- AWS_S3_BUCKET: The name of your S3 bucket (e.g., `vibewell-uploads`)

## 3. Stripe Setup

### Create a Stripe Account
1. Go to [Stripe](https://stripe.com/) and create an account or sign in.

### Get API Keys
1. Go to the Developers > API keys section.
2. Copy the Publishable Key and Secret Key.

### Set Up Webhooks
1. Go to the Developers > Webhooks section.
2. Create a new webhook endpoint:
   - URL: `https://your-production-domain.com/api/webhooks/stripe` (for production)
   - Events to listen to:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `checkout.session.completed`
     - Add more as needed
3. For local development, you can use Stripe CLI or a service like ngrok to create a tunnel to your local server.

### Get Your Stripe Credentials
Copy the following values to your `.env.local` file:
- STRIPE_SECRET_KEY: The Secret Key from your Stripe dashboard
- STRIPE_PUBLISHABLE_KEY: The Publishable Key from your Stripe dashboard
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Same as STRIPE_PUBLISHABLE_KEY
- STRIPE_WEBHOOK_SECRET: The Signing Secret from your webhook configuration

## 4. Environment Variables
After setting up all the services, your `.env.local` file should contain:

```
# Auth0 configuration
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_SECRET=a-long-secret-value
AUTH0_AUDIENCE=https://api.vibewell.com
AUTH0_NAMESPACE=https://vibewell.com

# AWS configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET=vibewell-uploads

# File storage
NEXT_PUBLIC_FILE_BASE_URL=https://vibewell-uploads.s3.amazonaws.com

# Stripe configuration
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret

# Database (if using Prisma)
DATABASE_URL=postgresql://postgres:password@localhost:5432/vibewell-db
```

## 5. Vercel Deployment

### Connect GitHub Repository
1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com/) and create an account or sign in.
3. Create a new project and import your GitHub repository.

### Configure Environment Variables
1. In your Vercel project settings, go to the Environment Variables section.
2. Add all the environment variables from your `.env.local` file.
3. Ensure that you update the URLs to use your production domain.

### Deploy
1. Trigger a deployment.
2. Once deployed, update your Auth0 and Stripe configurations with the production URLs.

## Conclusion
With these services set up, your VibeWell platform should be fully functional with authentication, file storage, and payment processing capabilities. If you encounter any issues, check the service-specific documentation or reach out for support. 