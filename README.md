# VibeWell Beauty & Wellness Platform

VibeWell is a comprehensive beauty and wellness platform that combines service booking with social networking features. It helps users find, book, and manage beauty and wellness services while connecting with providers and other users through a modern social media experience.

## Features

### Core Features
- **Modern UI/UX**: Clean, intuitive interface with a mobile-first design
- **Theme System**: Custom theme with natural green/beige color palette
- **Authentication**: User registration and login functionality
- **Service Booking**: Browse and book beauty and wellness services
- **Personalized Profiles**: User profiles with preferences and history
- **Social Networking**: Instagram/TikTok-style social feed with modern features

### Pages & Functionality
- **Home (/spa)**: Featured services, categories, search, and upcoming appointments
- **Services (/spa/services)**: Browse services with category filtering
- **Service Detail (/spa/services/[id])**: View service details and book appointments
- **Bookings (/spa/bookings)**: Manage upcoming and past appointments
- **Social Feed (/spa/social)**: 
  - Instagram/TikTok-style feed with video and photo posts
  - Stories and Reels feature
  - Like, comment, and share functionality
  - User and provider tagging
  - Direct messaging
  - Content discovery and trending
- **Profile (/spa/profile)**: Personal information, preferences, and payment methods
- **Chat (/spa/chat)**: Direct messaging with providers and other users

### UI Components
- **Bottom Navigation**: Mobile-friendly navigation with notification indicators
- **Loading Spinner**: Visual feedback for async operations
- **Notification System**: Toast notifications for user feedback
- **Service Cards**: Consistent display of service information
- **Category Filters**: Interactive filtering for service types
- **Social Components**:
  - Post creation with media upload
  - Story/Reel viewer
  - Comment section with reactions
  - Direct message interface
  - User tagging system
  - Content sharing options

## Technology Stack

- **Framework**: Next.js with App Router
- **Styling**: Tailwind CSS with custom theme variables
- **State Management**: React hooks for local state
- **Image Handling**: Next.js Image component for optimization
- **Routing**: Next.js dynamic and static routes

## Getting Started

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000/spa
   ```

## Key URLs

- **Main App**: http://localhost:3000/spa
- **Services**: http://localhost:3000/spa/services
- **Social Feed**: http://localhost:3000/spa/social
- **Profile**: http://localhost:3000/spa/profile
- **Bookings**: http://localhost:3000/spa/bookings

## Development

### Building for Production
```
npm run build
```

### Running Tests
```
npm test
```

## Project Structure

- `/app`: Next.js App Router pages and layouts
- `/pages`: Legacy Next.js Pages Router (being phased out)
- `/src/components`: Reusable UI components
- `/src/styles`: Global styles and theme variables
- `/public`: Static assets like images and icons

## Contributors

- VibeWell Development Team

## License

This project is licensed under the MIT License

## Documentation

All project documentation is maintained in the `docs/` folder and published via Docusaurus.

- View locally:
```bash
cd docs && npm run start
```
- Live site: https://yourusername.github.io/vibewell/docs

---

# Vibewell - Virtual Try-On Experience

![Vibewell Logo](https://via.placeholder.com/150x50?text=Vibewell)

## Overview

Vibewell is a beauty and wellness platform featuring a cutting-edge Virtual Try-On experience that allows users to visualize beauty products in real-time using their camera or uploaded photos.

## Features

- **Virtual Try-On**: Try beauty products like makeup, hair colors, and skincare using your camera or photos
- **Mobile-Responsive UI**: Optimized experience across desktop, tablet, and mobile devices
- **Product Catalog**: Browse and filter products with smooth loading states
- **Camera Integration**: Real-time AR overlay with face detection

## Technical Highlights

- **React + Next.js**: Modern frontend architecture
- **TypeScript**: Type safety across the entire codebase
- **Tailwind CSS**: Utility-first styling with custom components
- **AR Integration**: Camera-based augmented reality using canvas and webcam APIs 
- **Optimized Performance**: Efficient image processing and smooth transitions

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/vibewell.git
cd vibewell

# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
vibewell/
├── apps/
│   └── web/                  # Next.js web application
│       ├── public/           # Static assets
│       └── src/              # Source code
│           ├── components/   # React components
│           │   └── beauty/   # Beauty-related components
│           │       └── VirtualTryOn/  # Virtual try-on feature
│           ├── pages/        # Next.js pages
│           ├── services/     # API services
│           ├── utils/        # Utility functions
│           └── providers/    # React context providers
└── packages/                 # Shared packages
```

## Usage

The Virtual Try-On component can be used in any page by importing and rendering it:

```jsx
import { VirtualTryOn } from '@/components/beauty/VirtualTryOn';

export default function BeautyPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Try On Beauty Products</h1>
      <VirtualTryOn />
    </div>
  );
}
```

## Recovery Achievements

Vibewell's recovery plan has been successfully completed with the following achievements:

- ✅ Fixed broken files and syntax errors
- ✅ Resolved configuration issues
- ✅ Implemented performance optimizations
- ✅ Enhanced user experience with improved UI/UX
- ✅ Added proper loading states and error handling
- ✅ Ensured mobile responsiveness across devices
- ✅ Improved accessibility features

## License

Copyright © 2023 Vibewell. All rights reserved.

---

## Deployment Instructions

We've implemented production-ready components for Redis client, two-factor authentication, WebAuthn biometric authentication, payment processing, and booking management. Follow these steps to deploy the application:

### Step 1: Environment Setup

Run the environment setup script to create the `.env` file with all required configuration:

```bash
./environment-setup.sh
```

Edit the `.env` file and update with your actual values for production:
- Database connection string
- Redis connection details
- Auth0 configuration
- WebAuthn settings
- Stripe API keys
- AWS S3 credentials

### Step 2: Database Setup

Initialize the database with all required tables and columns:

```bash
./init-db.sh
```

This script will:
1. Create the PostgreSQL database if it doesn't exist
2. Set up all necessary tables
3. Apply migrations for authentication and payment features
4. Create the required database indexes

### Step 3: Build Application

Build the application for production:

```bash
./build-app.sh
```

This script will:
1. Install dependencies
2. Build the application for production

### Running the Application

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

## Implemented Components

### Redis Client
- Production implementation using ioredis
- Development mock using in-memory Map
- Supports TLS for secure connections

### Two-Factor Authentication
- TOTP implementation using speakeasy
- Recovery keys generation and verification
- Database integration for user settings

### WebAuthn Authentication
- Biometric/security key authentication
- Implementation using SimpleWebAuthn
- Support for all major browsers and devices

### Payment Service
- Stripe integration for payment processing
- Support for multiple payment methods
- Refund processing capabilities

### Booking Service
- Real availability checking based on business hours
- Interval-based booking system
- Conflict detection for overlapping bookings

## Additional Documentation

For more details, refer to [DEPLOYMENT.md](DEPLOYMENT.md) for a complete deployment guide and checklist.

## Environment Variables

See the `.env` file for all required configuration variables. All components require specific environment variables to function properly in production.

## Dependency Management

Vibewell uses several tools to manage dependencies effectively:

1. **Check Dependencies**: View outdated dependencies and security vulnerabilities
   ```bash
   npm run deps:check
   ```

2. **Update Dependencies**: Run the comprehensive upgrade process
   ```bash
   npm run deps:update
   ```

3. **Security Audit**: Check for security vulnerabilities
   ```bash
   npm run deps:security
   ```

4. **Generate Reports**: Create detailed dependency reports
   ```bash
   npm run deps:report
   ```

5. **Code Quality Check**: Run a comprehensive code quality check
   ```bash
   npm run quality
   ```

For more information, see the [dependency management documentation](docs/DEPENDENCY_MANAGEMENT.md).
