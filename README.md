# VibeWell

VibeWell is a comprehensive wellness platform designed to help users improve their mental, physical, and emotional well-being through guided activities, personalized wellness plans, and progress tracking.

## 🌟 Features

- **Wellness Activities**: Access a library of guided meditation, fitness, yoga, nutrition, and stress-reduction activities
- **Beauty & Wellness Services**: Book appointments with beauty professionals, spas, and wellness practitioners
- **Virtual Try-On**: Try makeup and beauty products virtually before purchasing using AR technology
- **Personalized Plans**: Follow structured wellness plans tailored to specific goals
- **Progress Tracking**: Monitor your wellness journey with detailed progress analytics
- **Community Support**: Connect with like-minded individuals on similar wellness journeys
- **Expert Guidance**: Content created by certified wellness professionals
- **Subscription Tiers**: Choose from different subscription levels based on your needs

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Auth0 for secure user authentication and authorization
- **File Storage**: AWS S3
- **Payments**: Stripe
- **Deployment**: Vercel

## 📋 Documentation

- [Deployment Guide](DEPLOYMENT-GUIDE.md): Instructions for deploying the application
- [Development Setup](DEVELOPMENT-SETUP.md): Guide for setting up the development environment
- [Database Guide](docs/DATABASE-GUIDE.md): Information about our Prisma database setup
- [API Documentation](API-DOCUMENTATION.md): Comprehensive API reference
- [Troubleshooting Guide](TROUBLESHOOTING-GUIDE.md): Solutions for common issues
- [Security Best Practices](SECURITY-BEST-PRACTICES.md): Security guidelines for the platform

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16.x or later)
- NPM (version 8.x or later)
- PostgreSQL database
- AWS account (for S3)
- Auth0 account
- Stripe account (for payment processing)

### Quick Start

1. Clone the repository
   ```bash
   git clone https://github.com/your-org/vibewell.git
   cd vibewell
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   Create a `.env.local` file with the necessary environment variables (see [Development Setup](DEVELOPMENT-SETUP.md) for details)

4. Run database migrations
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📦 Project Structure

```
vibewell/
├── app/                  # Next.js app directory
│   ├── api/              # API routes
│   ├── components/       # React components
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   │   ├── auth/         # Auth0 integration
│   │   ├── database/     # Prisma database client
│   │   ├── aws/          # AWS S3 integration
│   │   └── stripe/       # Stripe payment integration
│   ├── lib/              # Utility functions and libraries
│   ├── pages/            # Page components
│   ├── styles/           # Global styles
│   └── types/            # TypeScript type definitions
├── prisma/               # Prisma schema and migrations
├── public/               # Static assets
├── scripts/              # Utility scripts
├── test/                 # Test files
└── .env.example          # Example environment variables
```

## 🧪 Testing

We use Jest and React Testing Library for testing.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🔄 Database Migration

VibeWell has successfully migrated from Supabase to Prisma ORM for improved database access, type safety, and schema management. Key benefits of this migration include:

- **Better TypeScript Integration**: Full type safety with auto-generated Prisma Client
- **Simplified Query API**: More intuitive and consistent database operations
- **Improved Migration Management**: Robust schema versioning and migration tools
- **Enhanced Performance**: Optimized database access patterns

For more details, see the [Database Guide](docs/DATABASE-GUIDE.md) and [Troubleshooting Guide](TROUBLESHOOTING-GUIDE.md).

## 🔐 Authentication

VibeWell uses Auth0 for secure authentication:

- **Secure Login**: Support for email/password, social login, and MFA
- **Role-Based Access Control**: Fine-grained permission management
- **JWT Authentication**: Secure, token-based API access
- **Customizable Login Experience**: Branded authentication flows

## 🤝 Contributing

We welcome contributions from the community! Please check out our [contribution guidelines](CONTRIBUTING.md) to get started.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, please contact us at support@vibewell.com or visit our [support portal](https://support.vibewell.com).

## 🙌 Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [Auth0](https://auth0.com/)
- [Stripe](https://stripe.com/)
- [Vercel](https://vercel.com/)

---

Made with ❤️ by the VibeWell Team