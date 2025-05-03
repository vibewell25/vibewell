# Notification System Guide

This guide explains how to use and implement the notification system in the VibeWell platform.

## Table of Contents

1. [Overview](#overview)
2. [Notification Schema](#notification-schema)
3. [API Endpoints](#api-endpoints)
4. [Frontend Components](#frontend-components)
5. [Usage Examples](#usage-examples)
6. [Best Practices](#best-practices)

## Overview

The VibeWell notification system provides a way to communicate important information to users through the application interface. Notifications can be related to bookings, loyalty programs, marketing campaigns, or general system messages.

Key features:
- Real-time notification badge with unread count
- Mark notifications as read individually or all at once
- Filter notifications by read status
- Link notifications to specific pages or resources
- Pagination for browsing large numbers of notifications
- Categorization by notification type

## Notification Schema

Notifications in the database have the following structure:

```prisma
model Notification {
  id        String            @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  message   String
  data      Json?
  read      Boolean           @default(false)
  status    NotificationStatus @default(PENDING)
  createdAt DateTime          @default(now())
  updatedAt DateTime          @updatedAt
  linkUrl   String?           // Optional URL to navigate to when clicked

  // Relations
  user      User              @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([type])
  @@index([status])
  @@index([read])
}

enum NotificationType {
  SYSTEM
  BOOKING
  LOYALTY
  MARKETING
}

enum NotificationStatus {
  PENDING
  DELIVERED
  FAILED
}
```

## API Endpoints

The notification system provides the following API endpoints:

### Get Notifications (with pagination)

```
GET /api/notifications?page=1&limit=10&filter=all|unread|read
```

Returns paginated notifications for the authenticated user with optional filtering.

### Get Notification Counts

```
GET /api/notifications/count
```

Returns the count of total and unread notifications for the authenticated user.

### Mark a Notification as Read

```
PUT /api/notifications/[id]/read
```

Marks a specific notification as read.

### Mark All Notifications as Read

```
PUT /api/notifications/read-all
```

Marks all unread notifications as read for the authenticated user.

### Delete a Notification

```
DELETE /api/notifications/[id]
```

Deletes a specific notification for the authenticated user.

### Create a Notification (Admin/System)

```
POST /api/notifications
```

Creates a new notification for a user (requires admin access).

## Frontend Components

The notification system includes several frontend components:

### NotificationCenter

A dropdown component that shows a list of recent notifications and provides actions to mark as read or delete.

```tsx
import { NotificationCenter } from '@/components/NotificationCenter';

// Use in a header or navigation bar
<NotificationCenter />

// With custom navigation handler
<NotificationCenter 
  onNavigate={(url) => {
    // Custom navigation logic
    router.push(url);
  }} 
/>
```

### NotificationBadge

A simple badge component that shows the unread notification count.

```tsx
import { NotificationBadge } from '@/components/NotificationBadge';

// Use in a header or navigation bar
<NotificationBadge 
  onClick={() => {
    // Custom click handler, e.g., opening a modal or navigating
    router.push('/notifications');
  }} 
/>
```

### NotificationsPage

A full page for viewing and managing all notifications.

```tsx
// Already implemented at /src/app/(dashboard)/notifications/page.tsx
// Access at the route /notifications
```

### useNotifications Hook

A custom hook for interacting with notifications from any component.

```tsx
import { useNotifications } from '@/hooks/use-notifications';

function MyComponent() {
  const {
    notifications,
    pagination,
    counts,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    goToNextPage,
    goToPrevPage,
    refresh
  } = useNotifications({
    filter: 'all', // or 'read', 'unread'
    pageSize: 10
  });

  // Use the notifications data and functions in your component
}
```

## Usage Examples

### Creating a System Notification When a Booking is Confirmed

```tsx
// In a booking confirmation handler
import axios from 'axios';

async function createBookingConfirmationNotification(userId: string, bookingId: string) {
  try {
    await axios.post('/api/notifications', {
      userId,
      title: 'Booking Confirmed',
      message: 'Your appointment has been confirmed. We look forward to seeing you!',
      type: 'BOOKING',
      linkUrl: `/bookings/${bookingId}`
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}
```

### Showing a Notification Badge in a Custom Header

```tsx
import { NotificationBadge } from '@/components/NotificationBadge';

export function CustomHeader() {
  return (
    <header className="flex justify-between items-center p-4 border-b">
      <div className="logo">VibeWell</div>
      <nav className="flex items-center gap-4">
        {/* Other navigation items */}
        <NotificationBadge onClick={() => router.push('/notifications')} />
      </nav>
    </header>
  );
}
```

## Best Practices

1. **Keep notifications concise**: Use clear, short titles and messages.

2. **Use appropriate notification types**: Choose the correct type to help users filter and identify important notifications.

3. **Include actionable links**: When relevant, include a `linkUrl` to direct users to the related resource.

4. **Clean up old notifications**: Implement a periodic cleanup of old notifications to maintain database performance.

5. **Handle errors gracefully**: Always include error handling when interacting with notification APIs.

6. **Prioritize important notifications**: Use the type field to indicate priority - system and booking notifications are typically higher priority than marketing messages.

7. **Test with different volumes**: Ensure your UI works well with both zero notifications and many notifications.

8. **Consider accessibility**: Ensure notification indicators are accessible to all users, including those using screen readers.

9. **Rate limit notifications**: Avoid sending too many notifications to a user in a short period to prevent notification fatigue.

10. **Provide bulk actions**: Always allow users to mark all notifications as read or clear them in bulk.

## Related Documentation

- [Authentication Guide](./authentication-guide.md)
- [API Integration Guide](./api-integration-guide.md)
- [Form Validation Guide](./form-validation-standardization-guide.md)
- [Testing Guide](./testing-guide.md) 