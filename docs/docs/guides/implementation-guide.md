# VibeWell Implementation Guide

## Overview

This document provides comprehensive guidelines for implementing and extending features in the VibeWell platform. It serves as the consolidated reference for developers working on the codebase, superseding previous implementation guides.

## Getting Started

### Prerequisites

Before you begin implementing features, ensure you have:

1. Set up your development environment according to the [Development Setup Guide](../../DEVELOPMENT-SETUP.md)
2. Reviewed the [System Architecture Document](../architecture/system-architecture.md)
3. Familiarized yourself with the [Component Library](./ui-component-library.md)
4. Understood the [Coding Standards](../../docs/coding-standards.md)

### Development Workflow

The standard development workflow is:

1. Create a feature branch from the `main` branch
2. Implement your changes following this guide
3. Write tests for your implementation
4. Run the linter and type-checker
5. Submit a pull request for review

## Implementation Standards

### Component Implementation

#### Creating New Components

When creating new components:

1. **Determine the Scope**:
   - Is it a UI component? Place it in `src/components/ui/`
   - Is it a feature-specific component? Place it in `src/components/[feature]/`
   - Is it a layout component? Place it in `src/components/layout/`

2. **Follow the Component Template**:
   ```tsx
   import React from 'react';
   
   interface ComponentProps {
     // Define props with TypeScript interfaces
     label: string;
     onClick?: () => void;
   }
   
   /**
    * Component description
    * 
    * @component
    * @example
    * ```tsx
    * <Component label="Example" onClick={() => console.log('clicked')} />
    * ```
    */
   export function Component({ label, onClick }: ComponentProps) {
     return (
       <div>
         <button onClick={onClick}>{label}</button>
       </div>
     );
   }
   ```

3. **Create Tests**:
   - Unit tests for component functionality
   - Snapshot tests for UI consistency
   - Accessibility tests for a11y compliance

#### Extending Existing Components

When extending existing components:

1. Understand the component's API and purpose
2. Maintain backward compatibility
3. Add proper types for new props
4. Update tests to cover new functionality

### Service Implementation

#### Creating New Services

Services should be implemented following the repository pattern:

1. Create a new file in `src/services/[domain]/`
2. Define a clear interface for the service
3. Implement the service class or functions
4. Export the service for use in components or API routes

Example:

```typescript
// src/services/notification/notification-service.ts
import { prisma } from '@/lib/prisma';
import type { Notification, NotificationType, User } from '@prisma/client';

export interface NotificationService {
  createNotification(userId: string, type: NotificationType, message: string): Promise<Notification>;
  getNotifications(userId: string): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<Notification>;
}

export const notificationService: NotificationService = {
  async createNotification(userId, type, message) {
    return prisma.notification.create({
      data: {
        userId,
        type,
        message,
        read: false,
      },
    });
  },
  
  async getNotifications(userId) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },
  
  async markAsRead(notificationId) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  },
};
```

### API Implementation

#### REST API Endpoints

Create Next.js API routes in `src/pages/api/`:

1. Define the API handler with proper HTTP methods
2. Implement input validation using Zod
3. Add error handling and appropriate status codes
4. Document the API endpoint

Example:

```typescript
// src/pages/api/notifications/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { notificationService } from '@/services/notification/notification-service';
import { authOptions } from '@/lib/auth';

const createNotificationSchema = z.object({
  type: z.enum(['SYSTEM', 'BOOKING', 'PAYMENT', 'MARKETING']),
  message: z.string().min(1).max(500),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  if (req.method === 'GET') {
    const notifications = await notificationService.getNotifications(session.user.id);
    return res.status(200).json(notifications);
  }
  
  if (req.method === 'POST') {
    try {
      const data = createNotificationSchema.parse(req.body);
      const notification = await notificationService.createNotification(
        session.user.id,
        data.type,
        data.message
      );
      return res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
```

### Database Schema Implementation

When modifying the database schema:

1. Update the Prisma schema in `prisma/schema.prisma`
2. Create a migration: `npm run db:migrate`
3. Update relevant services and APIs
4. Add or modify tests to cover the changes

### 3D/AR Feature Implementation

For 3D and AR features:

1. Place components in `src/components/ar/`
2. Use React Three Fiber for declarative 3D rendering
3. Implement performance optimizations (see [Performance Guide](./performance-optimization.md))
4. Test compatibility across devices

## Feature Implementation Guidelines

### Authentication Features

Implement authentication features using:

- Next Auth for OAuth providers
- TOTP for two-factor authentication
- JWT for session management

### Booking System

The booking system implementation should:

- Use the booking service for business logic
- Implement real-time availability checking
- Support recurring appointments
- Handle cancellations and rescheduling

### Payment Processing

Payment implementation should:

- Use Stripe for payment processing
- Implement proper error handling
- Store transaction records securely
- Support multiple payment methods

### Notification System

The notification system should:

- Support multiple channels (in-app, email, SMS)
- Use queue-based processing for reliability
- Implement templates for consistent messaging
- Allow user preference management

## Testing Your Implementation

All implementations should include:

1. **Unit Tests**: Test individual components and functions
2. **Integration Tests**: Test interactions between components
3. **E2E Tests**: Test complete user flows
4. **Accessibility Tests**: Ensure WCAG compliance

Run tests with:

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- path/to/test-file.test.ts

# Run with coverage
npm run test:coverage
```

## Common Implementation Patterns

### Form Handling

Use the standardized form validation utility:

```typescript
import { validateForm } from '@/utils/form-validation';

const formData = { email, password };
const validationResult = validateForm(formData);

if (!validationResult.isValid) {
  // Handle validation errors
  setErrors(validationResult.errors);
  return;
}

// Proceed with form submission
```

### Authentication

Use the unified auth hook:

```typescript
import { useUnifiedAuth } from '@/hooks/use-unified-auth';

function MyComponent() {
  const { user, signIn, signOut, isLoading } = useUnifiedAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <SignInButton onClick={signIn} />;
  }
  
  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### API Calls

Use the centralized API client:

```typescript
import { apiClient } from '@/lib/api/client';

// In an async function or useEffect
const fetchData = async () => {
  try {
    const data = await apiClient.get('/api/endpoint');
    // Handle response
  } catch (error) {
    // Handle error
  }
};
```

## Troubleshooting Implementation Issues

If you encounter issues during implementation:

1. Check the [Troubleshooting Guide](../../TROUBLESHOOTING-GUIDE.md)
2. Review the error logs in the browser console or server logs
3. Look for similar issues in the project's issue tracker
4. Consult the [API Documentation](../api/api-reference.md)

## Related Documents

- [System Architecture](../architecture/system-architecture.md)
- [Component Library](./ui-component-library.md)
- [API Reference](../api/api-reference.md)
- [Performance Optimization](./performance-optimization.md)
- [Accessibility Guide](../accessibility/accessibility-guide.md) 