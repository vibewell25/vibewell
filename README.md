# Vibewell Platform

Vibewell is a comprehensive wellness application designed to connect users with wellness providers, beauty services, and health resources.

## Features

- User authentication and profile management
- Beauty services booking
- Provider directory and management
- Real-time notifications
- Analytics dashboard
- Admin controls
- Responsive design for all devices

## Build Status

The application has been enhanced with multiple features including:

- Performance optimization (lazy loading, service workers, code splitting)
- User experience enhancements (dark mode, push notifications)
- Analytics integration
- Accessibility improvements
- Internationalization (i18n)
- Backup and disaster recovery
- Security enhancements
- SEO optimizations
- User feedback and notification system

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Fill in the necessary values for your environment

4. Run the development server:
   ```
   npm run dev
   ```

## Build Instructions

Due to the complexity of the application, there are some limitations with the build process:

1. For local testing, use the development server:
   ```
   npm run dev
   ```

2. For production deployment:
   ```
   npm run build
   ```

Note: When building the application, you may encounter warnings related to Node.js APIs being used in client components. These are expected and don't affect the functionality when deployed to a Node.js environment.

## Known Build Issues

- Some pages using `useSearchParams` need to be wrapped in a Suspense boundary
- Redis client requires Node.js specific APIs
- Web Push notifications require VAPID keys

## Deployment

For deployment, we recommend using a Node.js server environment with the following:

1. Set up all required environment variables
2. Deploy the standalone output from the build process
3. Use a process manager like PM2 to keep the application running

## Contact

For more information, please contact the development team.