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
