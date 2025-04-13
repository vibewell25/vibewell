# Vibewell Platform

Vibewell is a comprehensive wellness application designed to connect users with wellness providers, beauty services, and health resources.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Component Library](#component-library)
- [API Documentation](#api-documentation)
- [Development Setup](#development-setup)
- [Testing](#testing)
- [Build Instructions](#build-instructions)
- [Deployment](#deployment)
- [Known Issues](#known-issues)
- [Contact](#contact)

## Features

- User authentication and profile management
- Beauty services booking
- Provider directory and management
- Real-time notifications
- Analytics dashboard
- Admin controls
- Responsive design for all devices
- Augmented Reality (AR) try-on features
- Mobile application with cross-platform support

## Project Structure

The project follows a modular architecture:

```
vibewell/
├── app/                 # Next.js app router components
├── components/          # Reusable UI components
│   ├── ui/              # Base UI components
│   ├── ar/              # AR-related components
│   ├── auth/            # Authentication components
│   ├── booking/         # Booking-related components
│   └── provider/        # Provider-related components
├── contexts/            # React contexts for state management
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries and client configurations
├── prisma/              # Database schema and migrations
├── public/              # Static assets
├── services/            # API service abstractions
├── styles/              # Global styles and theme configuration
├── test-utils/          # Testing utilities
└── types/               # TypeScript type definitions
```

## Component Library

Vibewell includes a comprehensive UI component library built with React, TypeScript, and Tailwind CSS. The components are designed to be:

- **Accessible**: Following WCAG guidelines
- **Responsive**: Working on all device sizes
- **Reusable**: Easily integrated into various parts of the application
- **Themeable**: Supporting light and dark mode

For detailed component documentation, refer to the [Component Documentation](docs/components/README.md).

## API Documentation

The API is organized around RESTful principles and uses standard HTTP methods and status codes. All API responses are JSON-formatted.

Key API areas:
- Authentication
- User Management
- Provider Management
- Booking Services
- [Notification Services](docs/api/notification-api.yaml)
- Analytics
- AR Integration

For detailed API documentation, refer to the API docs in the `docs/api/` directory.

## Development Setup

1. Clone the repository
   ```
   git clone https://github.com/yourusername/vibewell.git
   cd vibewell
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Fill in the necessary values for your environment

4. Set up the database:
   ```
   npx prisma migrate dev
   ```

5. Run the development server:
   ```
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Testing

The project uses Jest and React Testing Library for unit and integration tests.

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Structure

- Unit tests for UI components are located next to the component files
- Integration tests are in the `__tests__/integration` directory
- E2E tests are in the `__tests__/e2e` directory
- API tests are in the `__tests__/api` directory

For more information about testing strategies, see [TESTING-UPDATES.md](TESTING-UPDATES.md).

## Build Instructions

Due to the complexity of the application, there are some considerations with the build process:

1. For local testing, use the development server:
   ```
   npm run dev
   ```

2. For production deployment:
   ```
   npm run build
   ```

3. To analyze the bundle size:
   ```
   npm run analyze
   ```

## Deployment

For deployment, we recommend using a Node.js server environment with the following:

1. Set up all required environment variables as specified in `.env.example`
2. Deploy the standalone output from the build process
3. Use a process manager like PM2 to keep the application running
4. Set up a reverse proxy using Nginx or similar
5. Enable HTTPS for secure connections

### CI/CD Pipeline

The project includes GitHub Actions workflows for:
- Running tests
- Code quality checks
- Building and deploying to staging
- Building and deploying to production

## Known Issues

- Some pages using `useSearchParams` need to be wrapped in a Suspense boundary
- Redis client requires Node.js specific APIs
- Web Push notifications require VAPID keys
- AR features may not work in all browsers (WebXR support is required)

## Contact

For more information or technical support, please contact the development team at dev@vibewell.com.

## License

This project is licensed under the MIT License - see the LICENSE file for details.