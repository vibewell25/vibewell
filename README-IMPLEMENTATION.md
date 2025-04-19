# VibeWell Platform

VibeWell is a holistic wellness platform that connects users with wellness providers, offers virtual services, and provides e-commerce capabilities.

## Implementation Details

### Frontend: Next.js with React
- **Platform**: The frontend is built using Next.js and React, providing a dynamic and responsive user interface.
- **Hosting**: The application can be hosted on Vercel for seamless deployment, automatic scaling, and high performance.

### Backend/API: AWS Lambda
- **Serverless Backend**: AWS Lambda is used for serverless functions. The serverless model allows easy scaling as the platform grows.
- **Database**: PostgreSQL via Prisma ORM is used as the relational database to store application data such as user profiles, appointments, transactions, etc.

### Authentication: Auth0
- **User Management**: Auth0 handles advanced authentication and user roles, ensuring secure identity management across the platform.

### E-Commerce: Stripe and S3
- **Payments**: Stripe is used for handling payments, including subscription management, one-time payments, and booking fees.
- **File Storage**: Amazon S3 is used for storing and managing product images, user-uploaded content, and other media assets.

### Performance Optimizations
- **Lazy Loading**: Implemented lazy loading for heavy components such as AR models and media to improve initial load time and performance.
- **Image Optimizations**: Optimized image assets using techniques like responsive images, image compression, and lazy loading.
- **Service Workers**: Set up service workers for offline support and better caching of assets, especially for mobile users and AR functionality.

## Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn
- PostgreSQL database
- AWS account with S3 and Lambda access
- Auth0 account
- Stripe account

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/vibewell.git
cd vibewell
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Copy `.env.example` to `.env.local` and fill in your own values.

4. Run the development server
```bash
npm run dev
```

5. Open http://localhost:3000 in your browser to see the application.

### Environment Setup

The following environment variables need to be configured:

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

## Features

### Authentication
- User registration and login via Auth0
- Role-based access control (user, provider, admin)
- Protected API routes and pages

### File Storage
- Secure file uploads to AWS S3
- Presigned URLs for direct uploads
- File access control based on user roles

### Payment Processing
- Secure payment processing with Stripe
- Subscription management
- Payment webhook handling

### Serverless Functions
- AWS Lambda integration for backend processing
- Scalable API endpoints

## Deployment

### Production Build
```bash
npm run build
```

### Deploy to Vercel
```bash
vercel --prod
```

## Contributing
Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 