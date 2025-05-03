# VibeWell Project Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Configuration](#environment-configuration)
4. [Development Setup](#development-setup)
5. [Testing Setup](#testing-setup)
6. [AR Development](#ar-development)
7. [Performance Monitoring](#performance-monitoring)
8. [Security Configuration](#security-configuration)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- Node.js (%NODE_VERSION%)
- npm (v9.x or later)
- Redis (v7.x or later)
- Git
- Docker (optional, for containerization)

### Recommended Tools
- VS Code with recommended extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Three.js Editor (for AR development)
  - Redis extension

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/vibewell.git
cd vibewell
```

2. Install dependencies:
```bash
npm install
```

3. Install development tools:
```bash
npm install -g typescript@latest
npm install -g @playwright/test
```

## Environment Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Configure required environment variables:
```env
# App Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/vibewell

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Authentication
AUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# API Keys
STRIPE_SECRET_KEY=your-stripe-key
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key

# AR Configuration
AR_ASSETS_PATH=/ar-assets
AR_MODEL_CACHE_TIME=3600
```

## Development Setup

1. Start the development server:
```bash
npm run dev
```

2. Start Redis server:
```bash
redis-server
```

3. Setup database:
```bash
npx prisma migrate dev
npx prisma generate
```

4. Run initial data seeding:
```bash
npm run seed
```

## Testing Setup

1. Install test dependencies:
```bash
npm run test:setup
```

2. Configure test environment:
```bash
cp .env.test.example .env.test
```

3. Run different test suites:
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# AR component tests
npm run test:ar

# Load tests
npm run test:load
```

## AR Development

1. Install AR development tools:
```bash
npm install -g @react-three/drei @react-three/fiber three
```

2. Configure AR assets:
- Place 3D models in `/public/ar-assets`
- Configure model optimization in `next.config.js`
- Set up asset preloading in `src/lib/ar/asset-loader.ts`

3. Test AR components:
```bash
npm run test:ar
```

## Performance Monitoring

1. Start monitoring services:
```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

2. Access monitoring dashboards:
- Grafana: http://localhost:3000/monitoring
- Prometheus: http://localhost:9090

3. Run performance tests:
```bash
npm run perf:all
```

## Security Configuration

1. Configure security settings:
```bash
# Generate new API keys
npm run security:generate-keys

# Run security audit
npm run security:audit

# Configure rate limiting
vim src/lib/security/rate-limit-config.ts
```

2. Set up monitoring:
```bash
# Start security monitoring
npm run security:monitor

# View security logs
tail -f logs/security.log
```

## Deployment

1. Build the application:
```bash
npm run build
```

2. Run production checks:
```bash
npm run test:post-deploy
```

3. Deploy using your preferred method:
```bash
# Example using Docker
docker build -t vibewell .
docker run -p 3000:3000 vibewell
```

## Troubleshooting

### Common Issues

1. **Build Failures**
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

2. **AR Issues**
- Check WebGL support: `npm run check:webgl`
- Verify model formats: `npm run validate:models`

3. **Performance Issues**
- Run performance audit: `npm run perf:analyze`
- Check bundle size: `npm run perf:bundle`

4. **Security Issues**
- Run security scan: `npm run security:scan`
- Check rate limiting: `npm run check:rate-limits`

### Getting Help

- Check the [FAQ](./docs/FAQ.md)
- Join our [Discord community](https://discord.gg/vibewell)
- Submit an issue on GitHub
- Contact the development team

## Additional Resources

- [API Documentation](./docs/API.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Security Policy](./SECURITY.md)

---

For more detailed information about specific features or components, please refer to the documentation in the `/docs` directory. 