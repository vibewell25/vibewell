# Vibewell Technical Documentation

## 🏗️ Architecture Overview

### Tech Stack
- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Cache**: Redis
- **Search**: Elasticsearch
- **Message Queue**: RabbitMQ
- **File Storage**: AWS S3
- **CDN**: Cloudflare
- **Containerization**: Docker
- **Orchestration**: Kubernetes

### System Components
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │     │     Backend     │     │    Database     │
│   (Next.js)     │────▶│    (Node.js)    │────▶│  (PostgreSQL)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               │
         ┌───────────────┬─────┴─────┬───────────────┐
         ▼               ▼           ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│    Redis    │  │  RabbitMQ   │  │    AWS S3   │  │    Auth     │
│   (Cache)   │  │   (Queue)   │  │  (Storage)  │  │  (JWT/MFA)  │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

## 🔧 Development Setup

### Prerequisites
- Node.js v18+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+
- Yarn or npm

### Local Development
1. Clone the repository
```bash
git clone https://github.com/yourusername/vibewell.git
cd vibewell
```

2. Install dependencies
```bash
yarn install
```

3. Set up environment variables
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Start development services
```bash
docker-compose up -d
```

5. Run database migrations
```bash
yarn prisma migrate dev
```

6. Start development server
```bash
yarn dev
```

### Environment Variables
```env
# App
NODE_ENV=development
APP_URL=http://localhost:3000
API_URL=http://localhost:3000/api

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vibewell

# Redis
REDIS_URL=redis://localhost:6379

# AWS
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-west-2
AWS_BUCKET_NAME=vibewell-uploads

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
MFA_SECRET=your_mfa_secret

# External Services
STRIPE_SECRET_KEY=your_stripe_secret
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
SENDGRID_API_KEY=your_sendgrid_key
```

## 📁 Project Structure

```
vibewell/
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── lib/                 # Shared utilities
│   ├── services/           # Business logic services
│   ├── models/             # Data models
│   ├── hooks/              # Custom React hooks
│   ├── styles/             # Global styles
│   └── types/              # TypeScript types
├── prisma/                 # Database schema and migrations
├── public/                # Static assets
├── tests/                 # Test files
├── docs/                  # Documentation
└── scripts/               # Utility scripts
```

## 🗄️ Database Schema

### Core Tables
- `users`
- `sessions`
- `practitioners`
- `clients`
- `services`
- `bookings`
- `payments`
- `notifications`

### Relationships
```mermaid
erDiagram
    users ||--o{ sessions : has
    users ||--o{ bookings : makes
    practitioners ||--o{ services : offers
    services ||--o{ bookings : included_in
    bookings ||--o{ payments : has
    users ||--o{ notifications : receives
```

## 🔐 Authentication Flow

1. **Registration**
```mermaid
sequenceDiagram
    Client->>+API: POST /auth/register
    API->>+DB: Create User
    DB-->>-API: User Created
    API->>+Email: Send Verification
    API-->>-Client: Success Response
```

2. **Login**
```mermaid
sequenceDiagram
    Client->>+API: POST /auth/login
    API->>+DB: Verify Credentials
    DB-->>-API: User Data
    API->>+JWT: Generate Token
    JWT-->>-API: Access Token
    API-->>-Client: Token Response
```

## 📡 WebSocket Events

### Client Events
- `booking:created`
- `booking:updated`
- `booking:cancelled`
- `notification:received`
- `message:received`
- `payment:processed`

### Server Events
- `status:update`
- `session:expired`
- `system:maintenance`

## 🔄 State Management

### Redux Store Structure
```typescript
interface RootState {
  auth: {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
  };
  bookings: {
    items: Booking[];
    loading: boolean;
    error: string | null;
  };
  notifications: {
    items: Notification[];
    unread: number;
    loading: boolean;
  };
  // ... other slices
}
```

## 🧪 Testing

### Unit Tests
```bash
# Run all unit tests
yarn test

# Run specific test file
yarn test path/to/test

# Run tests in watch mode
yarn test:watch
```

### E2E Tests
```bash
# Start test environment
yarn test:e2e:setup

# Run Cypress tests
yarn test:e2e

# Run specific Cypress test
yarn test:e2e --spec "cypress/e2e/auth/**/*"
```

## 📦 Deployment

### Production Deployment
1. Build application
```bash
yarn build
```

2. Start production server
```bash
yarn start
```

### Docker Deployment
```bash
# Build Docker image
docker build -t vibewell:latest .

# Run container
docker run -p 3000:3000 vibewell:latest
```

### Kubernetes Deployment
```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n vibewell
```

## 🔍 Monitoring

### Health Checks
- `/api/health`: Basic health check
- `/api/health/db`: Database connectivity
- `/api/health/redis`: Redis connectivity
- `/api/health/detailed`: Detailed system status

### Metrics
- Request latency
- Error rates
- Database connection pool
- Cache hit rates
- API endpoint usage
- Authentication success/failure rates

## 🔒 Security

### Security Measures
1. **Authentication**
   - JWT-based authentication
   - MFA support
   - Session management
   - Rate limiting

2. **Data Protection**
   - Data encryption at rest
   - SSL/TLS encryption in transit
   - Regular security audits
   - GDPR compliance

3. **API Security**
   - Input validation
   - Request sanitization
   - CORS configuration
   - API key management

## 🚀 Performance Optimization

### Caching Strategy
1. **Redis Caching**
   - Session data
   - API responses
   - User preferences
   - Frequently accessed data

2. **Browser Caching**
   - Static assets
   - API responses
   - Images and media

### Database Optimization
1. **Indexing**
   - Commonly queried fields
   - Foreign keys
   - Full-text search fields

2. **Query Optimization**
   - Prepared statements
   - Query planning
   - Connection pooling

## 📚 Additional Resources

- [API Documentation](./API.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Security Policy](./SECURITY.md)
- [Changelog](./CHANGELOG.md)
- [License](./LICENSE.md) 