# Vibewell Platform

A comprehensive beauty and wellness booking platform that seamlessly connects beauty professionals, wellness practitioners, and clients. Our AI-powered platform enhances the experience for both beauty services (skincare, hair, makeup, nail care, esthetics, spa treatments) and wellness services (fitness, meditation, nutrition, therapy, holistic healing).

## ✨ Core Features

### Beauty Services
- **Treatment Management**: Comprehensive beauty service scheduling and tracking
- **Beauty Profile**: Client beauty preferences, history, and personalized care plans
- **Product Recommendations**: AI-powered skincare and beauty product suggestions
- **Treatment Tracking**: Progress tracking for skincare and beauty treatments
- **Service Menu**: Customizable beauty service offerings and packages

### Wellness Services
- **Wellness Programs**: Structured wellness and fitness program management
- **Health Tracking**: Client wellness journey and progress monitoring
- **Nutrition Planning**: Dietary recommendations and meal planning
- **Wellness Goals**: Goal setting and achievement tracking
- **Session Planning**: Customizable wellness session templates

### Business Tools
- **Appointment Management**: Smart scheduling for all service types
- **Inventory Control**: Beauty product and wellness equipment tracking
- **Client Management**: Comprehensive CRM for both beauty and wellness clients
- **Marketing Tools**: Targeted promotions for different service categories
- **Analytics Dashboard**: Performance metrics for all service types
- **Payment Processing**: Secure payment handling with multiple options
- **Staff Management**: Provider scheduling and expertise tracking

### Client Experience
- **Mobile Access**: On-the-go booking and management
- **Smart Recommendations**: AI-driven personalization
- **Progress Tracking**: Visual progress and results monitoring
- **Secure Communications**: HIPAA-compliant messaging
- **Online Booking**: Easy service discovery and scheduling
- **Loyalty Program**: Rewards for both beauty and wellness services

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.3, React 18.3, TypeScript
- **Backend**: Node.js (≥18.0.0)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Auth0, JWT
- **State Management**: Recoil, React Query
- **UI Components**: Chakra UI, Radix UI
- **Testing**: Jest, Playwright, Storybook
- **Analytics**: Vercel Analytics, PostHog
- **Monitoring**: Sentry, New Relic
- **AI Integration**: Anthropic, OpenAI
- **Payment Processing**: Stripe, PayPal, Square
- **Cloud Storage**: AWS S3, Azure Blob Storage
- **Search**: Algolia, Meilisearch
- **Caching**: Redis, Node Cache

## 🚀 Getting Started

### Prerequisites

- Node.js ≥18.0.0
- PostgreSQL
- Redis
- pnpm, yarn, or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vibewell.git
cd vibewell
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`

5. Initialize the database:
```bash
pnpm db:migrate
pnpm db:seed
```

6. Start the development server:
```bash
pnpm dev
```

Visit `http://localhost:3000` to see the application.

## 📱 Mobile App

Our mobile app provides seamless access to both beauty and wellness services, featuring:
- Real-time appointment booking and management
- Beauty and wellness progress tracking
- Secure payment processing
- Push notifications for appointments and updates
- Offline access to essential features
- Client-provider messaging

To run the mobile app:
```bash
cd mobile
pnpm install
pnpm start
```

## 🧪 Testing

We employ a comprehensive testing strategy:

```bash
# Unit and integration tests
pnpm test

# End-to-end tests
pnpm test:e2e

# Component tests with Storybook
pnpm storybook

# Accessibility tests
pnpm test:a11y

# Performance tests
pnpm test:performance
```

## 🔒 Security Features

- OAuth2/OIDC authentication with Auth0
- JWT token validation
- Rate limiting with `rate-limiter-flexible`
- Input validation with Zod
- WebAuthn support for passwordless authentication
- Secure session management
- CORS and security headers
- API route protection
- Data encryption at rest
- Regular security audits
- PCI compliance for payment processing
- HIPAA-aligned data protection measures
- Secure file storage for client photos and documents
- End-to-end encryption for sensitive communications
- Regular automated security scanning
- Multi-factor authentication support

## 📦 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript checks
- `pnpm test` - Run tests
- `pnpm db:studio` - Open Prisma Studio
- `pnpm storybook` - Run Storybook for component development
- `pnpm test:e2e` - Run end-to-end tests
- `pnpm test:accessibility` - Run accessibility tests

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your PR adheres to:
- Conventional commit messages
- Includes tests
- Updates documentation
- Follows code style guidelines
- Maintains accessibility standards
- Considers both beauty and wellness use cases

## 🚀 Deployment

### Supported Platforms
- Vercel (recommended)
- AWS
- Google Cloud Platform
- Azure
- Self-hosted

### Deployment Commands
```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Analyze bundle
pnpm analyze
```

## 🔧 Environment Setup

Required environment variables:

```env
# Core
DATABASE_URL=
REDIS_URL=
NODE_ENV=

# Authentication
AUTH0_SECRET=
AUTH0_BASE_URL=
AUTH0_ISSUER_BASE_URL=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=

# Storage
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET_NAME=

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=

# AI Services
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Analytics
POSTHOG_API_KEY=
SENTRY_DSN=
```

See `.env.example` for a complete list of variables.

## 💻 Development

### Code Style

We follow strict coding standards:
- ESLint for code quality
- Prettier for code formatting
- TypeScript strict mode
- Conventional commits

### Branch Strategy

- `main` - Production branch
- `develop` - Development branch
- `feature/*` - Feature branches
- `hotfix/*` - Hotfix branches
- `release/*` - Release branches

### Performance Optimization

- Use React.memo() for expensive components
- Implement proper code splitting
- Optimize images and assets
- Use proper caching strategies
- Monitor bundle size

### Monitoring

- Sentry for error tracking
- New Relic for performance monitoring
- Custom analytics for business metrics
- Health check endpoints

## 📚 Documentation

- [API Documentation](https://docs.vibewell.com/api)
- [Beauty Service Integration Guide](https://docs.vibewell.com/beauty)
- [Wellness Service Integration Guide](https://docs.vibewell.com/wellness)
- [Security Best Practices](https://docs.vibewell.com/security)
- [Mobile App Documentation](https://docs.vibewell.com/mobile)
- [Provider Dashboard Guide](https://docs.vibewell.com/provider)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support:
- Create an issue in the repository
- Email: support@vibewell.com
- Join our Discord community
- Documentation: [docs.vibewell.com](https://docs.vibewell.com)
- Technical Support: [support.vibewell.com](https://support.vibewell.com)

## 📦 Implementation Status and Enhanced Features

### Completed Components
- **Authentication with Auth0**: Auth0 configuration, API routes, protected routes, and role-based access control
- **File Storage with AWS S3**: S3 client setup, presigned URLs, upload components, and access control
- **Payment Processing with Stripe**: Stripe client, payment intents, webhook handlers, and payment form components
- **Serverless Functions with AWS Lambda**: Invocation utilities and Lambda client configuration
- **UI Components**: Auth button, Dashboard page, Landing page, and Unauthorized page

### Performance Optimization
- **Lazy Loading**: Custom `LazyImage`, `React.lazy` with `Suspense`, and utilities in `src/utils/lazyLoad.tsx`
- **Service Workers**: Offline caching via `public/service-worker.js` and registration in `src/utils/serviceWorkerRegistration.ts`
- **Code Splitting**: Leveraged Next.js automatic splitting with examples in `src/app/example/lazy-loading/page.tsx`

### UX Enhancements
- **Dark Mode**: `ThemeProvider` with system detection, localStorage persistence, and user controls
- **Push Notifications**: `PushNotificationProvider`, Firebase Cloud Messaging, subscription API endpoints
- **Progress Indicators**: Accessible indicators with ARIA support demonstrated in demo pages

### Analytics
- **Google Analytics**: Integrated `react-ga`, `AnalyticsProvider` for page views, events, and exception tracking

### Accessibility Improvements
- **ARIA Labels**: Comprehensive ARIA attributes across components with examples in accessibility guides

---

Built with ❤️ by the Vibewell team