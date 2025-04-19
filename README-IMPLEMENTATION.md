# VibeWell Platform Implementation

## Overview
VibeWell is a holistic wellness platform that connects users with wellness providers, offers virtual services, and provides e-commerce capabilities. This document outlines both the implementation details and current status.

## Implementation Status

### ✅ Completed Components

#### Authentication with Auth0
- Auth0 configuration and integration
- Auth0 API routes for login/logout
- Protected route component
- User profile information handling
- Role-based access control

#### File Storage with AWS S3
- S3 client configuration
- Presigned URL generation for uploads/downloads
- File upload component with progress tracking
- Secure file access control

#### Payment Processing with Stripe
- Stripe client configuration
- Payment intent API
- Webhook handler for Stripe events
- Payment form component

#### Serverless Functions with AWS Lambda
- Lambda client configuration
- Utility functions for invoking Lambda functions

#### UI Components
- Auth button component
- Dashboard page
- Landing page
- Unauthorized page

## Technical Stack

### Frontend: Next.js with React
- **Platform**: Built using Next.js and React for a dynamic and responsive UI
- **Hosting**: Vercel for seamless deployment and automatic scaling

### Backend/API: AWS Lambda
- **Serverless Backend**: AWS Lambda for scalable serverless functions
- **Database**: PostgreSQL via Prisma ORM for data storage

### Authentication: Auth0
- **User Management**: Advanced authentication and role management

### E-Commerce: Stripe and S3
- **Payments**: Stripe for payment processing and subscriptions
- **File Storage**: Amazon S3 for media assets

### Performance Optimizations
- **Lazy Loading**: For heavy components like AR models
- **Image Optimizations**: Responsive images and compression
- **Service Workers**: Offline support and asset caching

## Current Issues and Solutions

### 1. Dependency Installation
To resolve dependency conflicts:

```bash
npm install --save @auth0/nextjs-auth0@2.8.0 --legacy-peer-deps
npm install --save @aws-sdk/client-s3@3.428.0 @aws-sdk/s3-request-presigner@3.428.0 @aws-sdk/client-lambda@3.428.0 --legacy-peer-deps
npm install --save stripe@13.9.0 @stripe/stripe-js@2.1.7 @stripe/react-stripe-js@2.3.1 --legacy-peer-deps
npm install --save-dev crypto-browserify@3.12.0 stream-browserify@3.0.0 buffer@6.0.3 path-browserify@1.0.1 --legacy-peer-deps
```

### 2. TypeScript Configuration
Create necessary type declarations in `src/@types`:

```typescript
// src/@types/auth0.d.ts
declare module '@auth0/nextjs-auth0';
declare module '@auth0/nextjs-auth0/client';

// src/@types/aws-sdk.d.ts
declare module '@aws-sdk/client-s3';
declare module '@aws-sdk/s3-request-presigner';
declare module '@aws-sdk/client-lambda';

// src/@types/stripe.d.ts
declare module 'stripe';
declare module '@stripe/stripe-js';
declare module '@stripe/react-stripe-js';
```

## Setup and Configuration

### Prerequisites
- Node.js v18+
- npm or yarn
- PostgreSQL database
- AWS account (S3 and Lambda access)
- Auth0 account
- Stripe account

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/vibewell?schema=public"

# Auth0
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_SECRET=your-long-secure-random-string
AUTH0_AUDIENCE=https://api.vibewell.com
AUTH0_NAMESPACE=https://vibewell.com

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET=vibewell-uploads

# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret
```

## Implementation Details

### Authentication Flow
1. `ProtectedRoute` component checks authentication
2. Redirects to Auth0 login if needed
3. Auth0 redirects back after successful login
4. Session maintained via cookies

### File Upload Process
1. Client requests presigned URL
2. Server generates temporary URL
3. Client uploads directly to S3
4. Server stores file reference

### Payment Processing
1. Client creates payment intent
2. Server returns client secret
3. Client confirms via Stripe Elements
4. Webhooks handle payment events

## Next Steps

1. **Complete Auth0 Integration**
   - Set up Auth0 tenant and application
   - Configure role assignment rules
   - Implement proper redirections

2. **AWS Resource Setup**
   - Create and configure S3 bucket
   - Set up IAM permissions
   - Deploy Lambda functions

3. **Stripe Integration**
   - Complete account setup
   - Configure webhooks
   - Test payment flows

4. **Environment Setup**
   - Update configuration with real values
   - Configure deployment environment

5. **Vercel Deployment**
   - Connect GitHub repository
   - Configure environment variables
   - Deploy application

## Contributing
Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 