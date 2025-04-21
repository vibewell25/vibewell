# Vibewell Platform

A comprehensive wellness and fitness platform that connects practitioners with clients, featuring AR-enhanced experiences, social features, and advanced booking capabilities.

## 📊 Project Status

The project is currently in active development. Check [PROJECT-STATUS.md](PROJECT-STATUS.md) for the current status, outstanding tasks, and implementation plan.

**Key metrics:**
- Test coverage: 4.24%
- Outstanding tasks: Code consolidation, service implementation, testing improvements
- Immediate focus: Resolving duplicate code patterns and standardizing core components

## 🌟 Features

### Core Features
- **Booking System**: Advanced scheduling and appointment management
- **Payment Processing**: Secure payment handling with Stripe integration
- **User Management**: Complete user lifecycle management with Auth0
- **Business Management**: Tools for practitioners to manage their services
- **Analytics & Reporting**: Comprehensive insights and performance metrics

### Enhanced Experience
- **AR Integration**: Interactive AR experiences for fitness and wellness
- **Social Features**: Community engagement, events, and social interactions
- **Real-time Notifications**: SMS and email notifications via Twilio and SMTP
- **Progressive Web App**: Full offline support and mobile-first design

### Technical Features
- **TypeScript**: Full type safety across the codebase
- **Next.js**: Server-side rendering and optimal performance
- **Prisma**: Type-safe database access
- **WebSocket Support**: Real-time features and notifications
- **Redis Caching**: Optimized performance and response times

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL
- Redis
- Yarn or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/vibewell.git
cd vibewell
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your configuration values.

4. Set up the database:
```bash
yarn prisma migrate dev
yarn prisma generate
```

5. Start the development server:
```bash
yarn dev
```

Visit `http://localhost:3000` to see the application.

## 📚 Documentation

- [Project Status](PROJECT-STATUS.md) (current development status and roadmap)
- [API Documentation](docs/API.md)
- [Integration Guide](docs/INTEGRATION-GUIDE.md)
- [Testing Guide](docs/TESTING.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## 🧪 Testing

We use Jest for unit tests and Cypress for end-to-end testing:

```bash
# Run unit tests
yarn test

# Run e2e tests
yarn cypress:run
```

## 📦 Deployment

The platform supports multiple deployment options:

- Vercel (recommended)
- Docker
- AWS
- Self-hosted

See the [Deployment Guide](docs/DEPLOYMENT.md) for detailed instructions.

## 🔒 Security

- OAuth2 authentication with Auth0
- HTTPS enforcement
- Rate limiting
- Input validation
- XSS protection
- CSRF protection
- Security headers

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- All contributors who have helped shape Vibewell
- The open-source community for the amazing tools and libraries
- Our users for their valuable feedback and support

## 📞 Support

For support, email support@vibewell.com or join our [Discord community](https://discord.gg/vibewell).