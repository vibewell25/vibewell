# VibeWell Wellness App

VibeWell is a comprehensive wellness platform designed to help users find, book, and manage wellness services including massage, facials, hair styling, and nail treatments.

## Features

### Core Features
- **Modern UI/UX**: Clean, intuitive interface with a mobile-first design
- **Theme System**: Custom theme with natural green/beige color palette
- **Authentication**: User registration and login functionality
- **Service Booking**: Browse and book wellness services
- **Personalized Profiles**: User profiles with preferences and history

### Pages & Functionality
- **Home (/spa)**: Featured services, categories, search, and upcoming appointments
- **Services (/spa/services)**: Browse services with category filtering
- **Service Detail (/spa/services/[id])**: View service details and book appointments
- **Bookings (/spa/bookings)**: Manage upcoming and past appointments
- **Social Feed (/spa/social)**: User-generated content, stories, and community engagement
- **Profile (/spa/profile)**: Personal information, preferences, and payment methods

### UI Components
- **Bottom Navigation**: Mobile-friendly navigation with notification indicators
- **Loading Spinner**: Visual feedback for async operations
- **Notification System**: Toast notifications for user feedback
- **Service Cards**: Consistent display of service information
- **Category Filters**: Interactive filtering for service types

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
