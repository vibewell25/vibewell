# Vibewell

![Vibewell Logo](./public/images/logo.svg)

## Project Status

| Feature | Status | Notes |
|---------|--------|-------|
| Authentication | ✅ Complete | Supabase auth with MFA support |
| User Management | ✅ Complete | Role-based access control |
| Rate Limiting | ✅ Complete | Dual-mode (memory/Redis) system with specialized limiters |
| Security Headers | ✅ Complete | CSP and other security headers implemented |
| Accessibility | ✅ Complete | WCAG compliant components and structure |
| UI Components | ✅ Complete | Responsive design with dark/light mode |
| Admin Dashboard | ✅ Complete | Analytics and management features |
| API Endpoints | ✅ Complete | RESTful and GraphQL APIs |
| Redis Integration | ✅ Complete | Production-ready implementation with ioredis |
| Load Testing | ✅ Complete | Implemented with k6 for rate limiting and performance testing |

See [COMPLETED_TASKS.md](./COMPLETED_TASKS.md) for a detailed breakdown of implemented features.

Vibewell is a comprehensive platform designed to connect customers with wellness and beauty service providers. The platform streamlines the booking process, enhances provider discovery, builds trust through a robust review system, and offers a variety of tools to help providers grow their beauty and wellness businesses.

## Features

### For Customers
- **Provider Discovery**: Search and browse wellness and beauty providers based on service type (e.g., hair, nails, makeup, spa treatments, wellness therapy), location, ratings, and availability.
- **Booking Management**: Schedule, track, and manage wellness and beauty service appointments (e.g., haircuts, facials, makeup, yoga, etc.) with real-time availability updates.
- **Review System**: Leave detailed reviews and ratings for wellness and beauty services, including categories like cleanliness, value, and service quality, ensuring the platform maintains trust and transparency.
- **Messaging**: Direct communication with service providers before and after booking, ensuring customer queries are addressed promptly.
- **Profile Management**: Track booking history, manage personal preferences, and access/download training certificates for wellness and beauty-related training programs.
- **Subscription & Payment Management**: Subscribe to training programs, beauty services, and exclusive content (e.g., beauty tutorials, wellness tips, fitness routines).
- **Certificate Management**: Download and store training certificates from wellness and beauty courses or completed sessions.
- **Virtual Try-On**: Experience beauty products and services virtually using AR technology before booking.
- **Loyalty Program**: Earn points for bookings, reviews, and referrals that can be redeemed for discounts and exclusive offers.
- **Influencer Marketplace**: Connect with beauty and wellness influencers for collaborations and sponsored content.

### For Providers
- **Business Profile**: Showcase beauty and wellness services, qualifications, certifications, portfolio, and pricing. Providers can highlight specific beauty and wellness skills such as hair styling, makeup, skincare, yoga, and massage therapy.
- **Service & Pricing Management**: Manage a variety of wellness and beauty services like haircuts, facials, makeup, massage therapy, yoga, etc. Providers can create service bundles, set pricing, and manage availability.
- **Training Program Management**: Providers can create and sell wellness and beauty training courses such as makeup workshops, skincare tutorials, yoga sessions, and fitness classes.
- **Product Selling**: Sell beauty and wellness products such as makeup, skincare, wellness tools, and fitness equipment. Manage inventory, set pricing, and process secure orders.
- **Review Management**: Respond to customer reviews, ensuring continued improvement and customer satisfaction.
- **Analytics Dashboard**: Track performance, revenue, client retention, and customer satisfaction, focusing on beauty and wellness services.
- **Subscription & Payment Management**: Offer subscription plans for recurring beauty and wellness services or courses, manage one-time payments, and handle subscriptions for exclusive content.
- **Certificate Issuance**: Upload and send completion certificates to clients after completing wellness and beauty training programs.
- **AR Service Preview**: Showcase services using augmented reality to demonstrate potential results.
- **Influencer Collaboration**: Connect with influencers for marketing and promotional opportunities.
- **Advanced Analytics**: Detailed insights into customer behavior, service popularity, and revenue trends.

### For Admin
- **User & Provider Management**: Admins can approve/reject provider registrations, manage user accounts, and handle reported content.
- **Service & Booking Oversight**: Track and manage wellness and beauty service bookings, ensuring all bookings are fulfilled and ensuring provider compliance.
- **Revenue & Commission Management**: Track earnings from wellness and beauty service commissions, product sales, and training program fees. Admins can also generate revenue reports and manage payouts.
- **Content Moderation**: Monitor reviews, manage flagged content, and resolve disputes.
- **Analytics & Reporting**: Real-time insights into platform performance, booking trends, and user engagement.
- **Influencer Program Management**: Oversee influencer partnerships and collaborations.
- **Loyalty Program Administration**: Manage points, rewards, and promotional campaigns.
- **AR Content Management**: Oversee and approve AR content for virtual try-ons and service previews.

## Technical Implementation

### Frontend
- **Framework**: Next.js 15 with React 19 for building dynamic, high-performance pages and handling real-time interactions.
- **Language**: TypeScript for type safety, ensuring robust and maintainable code.
- **Styling**: Tailwind CSS for responsive and utility-first design.
- **Architecture**: Component-based architecture using modern React patterns and hooks.
- **State Management**: Context API and custom hooks for managing global and local state.
- **AR Integration**: WebXR and Three.js for virtual try-on and service preview features.

### Backend
- **Architecture**: RESTful API architecture for handling requests and data management.
- **Database**: Supabase for authentication, user management, and database services.
- **Real-time Services**: WebSockets for real-time messaging and updates.
- **Security**: Advanced data validation and encryption to protect user and business data.
- **AI Services**: Integration with AI models for personalized recommendations and AR features.

### Key Components
- **Authentication System**: Secure login and registration flow with OAuth and JWT-based authentication.
- **Booking Engine**: Real-time availability, appointment scheduling, and reminders.
- **Review System**: Comprehensive rating and feedback mechanism for building trust.
- **Admin Panel**: Content moderation, platform management, and reporting tools for admins.
- **Messaging System**: Real-time communication between users, service providers, and admins.
- **AR Engine**: Virtual try-on and service preview system.
- **Loyalty System**: Points tracking and rewards management.
- **Influencer Platform**: Marketplace for connecting providers with influencers.

## Review System

Vibewell features a sophisticated review system designed to enhance trust and improve services:

- **Detailed Ratings**: Overall and category-specific ratings (cleanliness, value, service, etc.).
- **Written Reviews**: Customers can provide detailed feedback on their experiences, including the option to upload photos.
- **Provider Responses**: Service providers can directly respond to reviews to resolve issues or thank customers.
- **Moderation**: Admins can review and moderate flagged or reported content to ensure compliance with platform policies.
- **Analytics**: Providers can track their rating trends over time, receiving insights into areas of improvement.

## Security and Privacy

- **Data Encryption**: All sensitive data is encrypted at rest and in transit using AES-256 and HTTPS/TLS.
- **Authentication**: Secure authentication with JWT tokens and refresh tokens.
- **Authorization**: Role-based access control (RBAC) ensures that users can only access features according to their permissions.
- **Data Protection**: Full compliance with data protection regulations (e.g., GDPR, CCPA).
- **Content Moderation**: Anti-spam and anti-abuse measures for reviews, messaging, and other content, along with automated flagging systems.
- **AR Data Protection**: Secure handling of user images and facial data for virtual try-ons.

## Additional Features

### Dedicated Business Building Hub
- Marketing tools, CRM integrations, and client retention strategies
- Digital marketing resources including guides and webinars
- Lead generation tools to help providers grow their clientele

### Business Directory with a Small Listing Fee
- Premium business listings with enhanced visibility options
- Providers can showcase their business details and unique selling points
- Tiered listing options to match different business needs and budgets

### Custom Build Plans with Smart Pricing
- Dynamic pricing models where providers can select and pay for specific features
- Tiered subscription plans catering to businesses of all sizes
- Flexibility to scale features as the business grows

### Beauty and Wellness-Specific Features
- **Provider Discovery**: Search for beauty and wellness providers based on specific services offered, location, and ratings.
- **Training Programs & Certificates**: Providers can offer training in beauty and wellness-related skills and issue certificates upon completion.
- **Product Sales**: Dedicated e-commerce section for beauty and wellness products.
- **AI-Powered Recommendations**: AI-based suggestions for beauty services, training programs, or wellness products based on customer preferences.
- **Virtual Try-On**: AR-powered virtual makeup and hairstyle previews.
- **Service Visualization**: AR demonstrations of wellness and beauty services.
- **Personalized Beauty Recommendations**: AI-driven product and service suggestions based on user preferences and skin/hair type.

## Security Features

### Rate Limiting

Vibewell implements a robust rate limiting system to protect against abuse and enhance security. The system provides:

- **API Protection**: Prevents abuse of API endpoints and DoS attacks
- **Specialized Limiters**: Custom rate limits for authentication, password resets, and financial operations
- **Dual-Mode Operation**: Works in both development (in-memory) and production (Redis) environments
- **Monitoring**: Comprehensive logging and analytics for rate limiting events
- **Load Testing**: Thorough testing of rate limiting performance with k6

### Configuration

Rate limiting can be configured through environment variables in `.env`:

```
# Rate limiting mode (memory or redis)
RATE_LIMIT_MODE=memory

# Default rate limit (requests per window)
DEFAULT_RATE_LIMIT_MAX=60
DEFAULT_RATE_LIMIT_WINDOW=60

# Specialized rate limiters
AUTH_RATE_LIMIT_MAX=10
AUTH_RATE_LIMIT_WINDOW=900
```

See `.env.example` for all available configuration options.

### Documentation

For detailed documentation on rate limiting implementation, usage, and monitoring:

- [Rate Limiting Guide](./docs/rate-limiting.md) - Comprehensive documentation
- [Load Testing Guide](./docs/load-testing.md) - Performance testing with k6
- [k6 Installation Guide](./docs/k6-installation.md) - How to install k6
- [Redis Installation Guide](./docs/redis-installation.md) - How to set up Redis
- [Security Implementation](./docs/security-implementation.md) - Related security measures

### Usage in Code

Rate limiting can be applied to any API route:

```typescript
import { applyRateLimit, authRateLimiter } from '@/app/api/auth/rate-limit-middleware';

export async function POST(req: NextRequest) {
  // Apply rate limiting with specialized auth limiter
  const rateLimitResult = await applyRateLimit(req, authRateLimiter);
  if (rateLimitResult) {
    return rateLimitResult; // Return error response if rate limited
  }
  
  // Continue with normal request handling
}
```

### Load Testing

Vibewell includes comprehensive load testing for the rate limiting system using k6:

```bash
# Run load tests with default settings
./scripts/load-testing.sh

# Run load tests with Redis enabled (production mode)
NODE_ENV=production ./scripts/load-testing.sh
```

The load testing suite includes:

- **Test Endpoints**: Specialized endpoints for testing different rate limiters
- **Realistic Scenarios**: Various traffic patterns to simulate real-world usage
- **Distributed Testing**: Support for simulating requests from multiple IPs
- **Results Analysis**: Detailed metrics and HTML reports for analyzing performance

See the [Load Testing Guide](./docs/load-testing.md) and [Example Usage](./docs/examples/load-testing-example.md) for more details.

## Testing

Vibewell implements a comprehensive testing suite to ensure the reliability, performance, and security of the application:

### Test Types

#### End-to-End Tests
- Verify critical user flows from start to finish
- Test real-world scenarios like business profile creation
- Simulate user interactions across multiple pages and components

#### Integration Tests
- Validate the interaction between different system components
- Test backup and recovery processes
- Ensure data flows correctly between services

#### Load Tests
- Measure application performance under high traffic
- Identify performance bottlenecks
- Ensure the system can handle expected user loads
- Test performance monitoring capabilities

### Running Tests

You can run all tests with the provided test script:

```bash
# Run all tests (unit, integration, e2e, and load tests)
./scripts/run-tests.sh

# Run specific test types
npx jest tests/integration
npx jest tests/post-deploy
k6 run tests/load-testing/performance-monitoring.test.js
```

### Test Requirements

- **k6**: Required for load testing. [Installation instructions](https://k6.io/docs/getting-started/installation/)
- **Jest**: Used for unit, integration, and e2e tests, included in dev dependencies

### Test Results

Test results are saved to the `test-results`