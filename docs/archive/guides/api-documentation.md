# VibeWell API Documentation

This document provides comprehensive documentation for the VibeWell API, including endpoints, request/response formats, authentication, error handling, and usage examples.

## API Overview

The VibeWell API is a RESTful API that allows developers to interact with the VibeWell platform programmatically. The API enables access to user data, wellness activities, progress tracking, and more.

**Base URL**: `%API_BASE_URL%`

## Authentication

All API requests require authentication using JSON Web Tokens (JWT).

### Getting an Access Token

To obtain an access token, use Auth0's authentication endpoints:

```
POST https://vibewell.auth0.com/oauth/token
Content-Type: application/json

{
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "audience": "https://api.vibewell.com",
  "grant_type": "client_credentials"
}
```

### Using the Access Token

Include the access token in the Authorization header of all API requests:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## API Endpoints

### User Management

#### Get Current User

Retrieves the profile of the authenticated user.

```
GET /users/me
```

**Response**:
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2023-01-15T10:30:00Z",
  "updatedAt": "2023-04-20T15:45:00Z",
  "profilePicture": "https://s3.amazonaws.com/vibewell/users/profile_123.jpg",
  "preferences": {
    "notifications": true,
    "theme": "light"
  }
}
```

#### Update User Profile

Updates the profile information of the authenticated user.

```
PATCH /users/me
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "preferences": {
    "notifications": false
  }
}
```

**Response**:
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Smith",
  "createdAt": "2023-01-15T10:30:00Z",
  "updatedAt": "2023-06-10T11:20:00Z",
  "profilePicture": "https://s3.amazonaws.com/vibewell/users/profile_123.jpg",
  "preferences": {
    "notifications": false,
    "theme": "light"
  }
}
```

#### Get User by ID (Admin Only)

Retrieves a user profile by ID (requires admin permissions).

```
GET /users/{userId}
```

**Response**: Same format as Get Current User

### Wellness Activities

#### List Wellness Activities

Retrieves a paginated list of wellness activities.

```
GET /activities?page=1&limit=10&category=meditation
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 20, max: 100)
- `category`: Filter by category (optional)
- `difficulty`: Filter by difficulty level (optional)
- `duration`: Filter by duration in minutes (optional)

**Response**:
```json
{
  "data": [
    {
      "id": "activity_123",
      "title": "Morning Meditation",
      "description": "Start your day with a calming meditation session",
      "category": "meditation",
      "difficulty": "beginner",
      "duration": 15,
      "imageUrl": "https://s3.amazonaws.com/vibewell/activities/meditation_123.jpg",
      "createdAt": "2023-02-10T08:00:00Z",
      "updatedAt": "2023-02-10T08:00:00Z"
    },
    {
      "id": "activity_124",
      "title": "Mindful Breathing",
      "description": "Focus on your breath to reduce stress",
      "category": "meditation",
      "difficulty": "beginner",
      "duration": 10,
      "imageUrl": "https://s3.amazonaws.com/vibewell/activities/breathing_124.jpg",
      "createdAt": "2023-02-11T09:30:00Z",
      "updatedAt": "2023-02-11T09:30:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

#### Get Activity Details

Retrieves detailed information about a specific wellness activity.

```
GET /activities/{activityId}
```

**Response**:
```json
{
  "id": "activity_123",
  "title": "Morning Meditation",
  "description": "Start your day with a calming meditation session",
  "category": "meditation",
  "difficulty": "beginner",
  "duration": 15,
  "imageUrl": "https://s3.amazonaws.com/vibewell/activities/meditation_123.jpg",
  "content": {
    "steps": [
      "Find a comfortable seated position",
      "Close your eyes and take deep breaths",
      "Focus on your breathing for 5 minutes",
      "Gradually bring awareness back to your surroundings",
      "Open your eyes and reflect on how you feel"
    ],
    "audioUrl": "https://s3.amazonaws.com/vibewell/audio/meditation_123.mp3",
    "videoUrl": "https://s3.amazonaws.com/vibewell/videos/meditation_123.mp4"
  },
  "benefits": [
    "Reduces stress and anxiety",
    "Improves focus and concentration",
    "Promotes emotional well-being"
  ],
  "createdAt": "2023-02-10T08:00:00Z",
  "updatedAt": "2023-02-10T08:00:00Z"
}
```

#### Create Activity (Admin Only)

Creates a new wellness activity (requires admin permissions).

```
POST /activities
Content-Type: application/json

{
  "title": "Evening Relaxation",
  "description": "Wind down with this relaxing routine",
  "category": "relaxation",
  "difficulty": "intermediate",
  "duration": 20,
  "content": {
    "steps": ["Step 1", "Step 2", "Step 3"],
    "audioUrl": "https://s3.amazonaws.com/vibewell/audio/relaxation_new.mp3"
  },
  "benefits": [
    "Improves sleep quality",
    "Reduces nighttime anxiety"
  ]
}
```

**Response**: Returns the created activity object with a 201 status code.

#### Update Activity (Admin Only)

Updates an existing wellness activity (requires admin permissions).

```
PUT /activities/{activityId}
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "duration": 25
}
```

**Response**: Returns the updated activity object.

#### Delete Activity (Admin Only)

Deletes a wellness activity (requires admin permissions).

```
DELETE /activities/{activityId}
```

**Response**: Returns a 204 No Content status code on success.

### User Progress

#### Track Activity Completion

Records that a user has completed an activity.

```
POST /progress
Content-Type: application/json

{
  "activityId": "activity_123",
  "duration": 15,
  "notes": "Felt very relaxed afterward",
  "rating": 5
}
```

**Response**:
```json
{
  "id": "progress_456",
  "userId": "user_123",
  "activityId": "activity_123",
  "duration": 15,
  "notes": "Felt very relaxed afterward",
  "rating": 5,
  "completedAt": "2023-06-15T19:30:00Z"
}
```

#### Get User Progress

Retrieves a user's progress history.

```
GET /progress?page=1&limit=10&startDate=2023-06-01&endDate=2023-06-30
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 20, max: 100)
- `startDate`: Filter by start date (format: YYYY-MM-DD)
- `endDate`: Filter by end date (format: YYYY-MM-DD)
- `activityId`: Filter by activity ID (optional)
- `category`: Filter by activity category (optional)

**Response**:
```json
{
  "data": [
    {
      "id": "progress_456",
      "userId": "user_123",
      "activity": {
        "id": "activity_123",
        "title": "Morning Meditation",
        "category": "meditation",
        "duration": 15
      },
      "duration": 15,
      "notes": "Felt very relaxed afterward",
      "rating": 5,
      "completedAt": "2023-06-15T19:30:00Z"
    },
    {
      "id": "progress_457",
      "userId": "user_123",
      "activity": {
        "id": "activity_125",
        "title": "Stretching Routine",
        "category": "fitness",
        "duration": 20
      },
      "duration": 18,
      "notes": "Felt more flexible",
      "rating": 4,
      "completedAt": "2023-06-16T07:15:00Z"
    }
  ],
  "pagination": {
    "total": 12,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

#### Get Progress Summary

Retrieves a summary of the user's progress.

```
GET /progress/summary?period=month&date=2023-06
```

**Query Parameters**:
- `period`: Time period for the summary (options: week, month, year)
- `date`: Reference date for the period (format depends on period)

**Response**:
```json
{
  "period": "month",
  "date": "2023-06",
  "totalActivities": 22,
  "totalDuration": 345,
  "categorySummary": {
    "meditation": {
      "count": 12,
      "duration": 180,
      "avgRating": 4.5
    },
    "fitness": {
      "count": 8,
      "duration": 145,
      "avgRating": 4.2
    },
    "nutrition": {
      "count": 2,
      "duration": 20,
      "avgRating": 3.5
    }
  },
  "streaks": {
    "current": 5,
    "longest": 14
  }
}
```

### Wellness Plans

#### List Available Plans

Retrieves a list of available wellness plans.

```
GET /plans?page=1&limit=10&category=fitness
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 20, max: 100)
- `category`: Filter by category (optional)
- `duration`: Filter by plan duration in days (optional)

**Response**:
```json
{
  "data": [
    {
      "id": "plan_123",
      "title": "30-Day Meditation Challenge",
      "description": "Build a daily meditation habit in 30 days",
      "category": "meditation",
      "durationDays": 30,
      "difficulty": "beginner",
      "imageUrl": "https://s3.amazonaws.com/vibewell/plans/meditation_30day.jpg",
      "createdAt": "2023-03-10T12:00:00Z"
    },
    {
      "id": "plan_124",
      "title": "Stress Reduction Program",
      "description": "Reduce stress and anxiety in 14 days",
      "category": "stress-management",
      "durationDays": 14,
      "difficulty": "intermediate",
      "imageUrl": "https://s3.amazonaws.com/vibewell/plans/stress_reduction.jpg",
      "createdAt": "2023-03-15T14:30:00Z"
    }
  ],
  "pagination": {
    "total": 8,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

#### Get Plan Details

Retrieves detailed information about a specific wellness plan.

```
GET /plans/{planId}
```

**Response**:
```json
{
  "id": "plan_123",
  "title": "30-Day Meditation Challenge",
  "description": "Build a daily meditation habit in 30 days",
  "category": "meditation",
  "durationDays": 30,
  "difficulty": "beginner",
  "imageUrl": "https://s3.amazonaws.com/vibewell/plans/meditation_30day.jpg",
  "activities": [
    {
      "day": 1,
      "activityId": "activity_123",
      "title": "Introduction to Meditation",
      "duration": 10
    },
    {
      "day": 2,
      "activityId": "activity_124",
      "title": "Mindful Breathing",
      "duration": 12
    },
    {
      "day": 3,
      "activityId": "activity_125",
      "title": "Body Scan Meditation",
      "duration": 15
    }
  ],
  "benefits": [
    "Establish a consistent meditation practice",
    "Reduce daily stress and anxiety",
    "Improve focus and concentration"
  ],
  "createdAt": "2023-03-10T12:00:00Z",
  "updatedAt": "2023-03-10T12:00:00Z"
}
```

#### Subscribe to Plan

Subscribes the current user to a wellness plan.

```
POST /plans/{planId}/subscribe
```

**Response**:
```json
{
  "id": "subscription_789",
  "userId": "user_123",
  "planId": "plan_123",
  "startDate": "2023-06-20T00:00:00Z",
  "currentDay": 1,
  "status": "active",
  "progress": {
    "completed": 0,
    "total": 30,
    "percentage": 0
  },
  "createdAt": "2023-06-20T08:30:00Z"
}
```

#### Get User Plans

Retrieves the wellness plans subscribed to by the current user.

```
GET /users/me/plans?status=active
```

**Query Parameters**:
- `status`: Filter by subscription status (options: active, completed, abandoned)

**Response**:
```json
{
  "data": [
    {
      "id": "subscription_789",
      "planId": "plan_123",
      "title": "30-Day Meditation Challenge",
      "startDate": "2023-06-20T00:00:00Z",
      "currentDay": 5,
      "status": "active",
      "progress": {
        "completed": 4,
        "total": 30,
        "percentage": 13.33
      },
      "todayActivity": {
        "day": 5,
        "activityId": "activity_127",
        "title": "Loving-Kindness Meditation",
        "duration": 15
      }
    }
  ]
}
```

### File Upload

#### Get S3 Presigned URL

Generates a presigned URL for uploading files directly to S3.

```
GET /uploads/presigned?fileName=profile.jpg&contentType=image/jpeg
```

**Query Parameters**:
- `fileName`: Name of the file to upload
- `contentType`: MIME type of the file
- `fileType`: Type of file (options: profile, activity)

**Response**:
```json
{
  "url": "https://vibewell-uploads.s3.amazonaws.com/...",
  "fields": {
    "key": "users/user_123/profile/profile.jpg",
    "bucket": "vibewell-uploads",
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": "...",
    "X-Amz-Date": "...",
    "X-Amz-Signature": "..."
  },
  "fileUrl": "https://s3.amazonaws.com/vibewell-uploads/users/user_123/profile/profile.jpg"
}
```

### Subscriptions and Payments

#### Get Subscription Plans

Retrieves the available subscription plans.

```
GET /subscriptions/plans
```

**Response**:
```json
{
  "data": [
    {
      "id": "price_1234567890",
      "name": "Basic Plan",
      "description": "Access to essential wellness content",
      "amount": 999,
      "currency": "usd",
      "interval": "month",
      "features": [
        "Basic wellness activities",
        "Progress tracking",
        "Limited wellness plans"
      ]
    },
    {
      "id": "price_0987654321",
      "name": "Premium Plan",
      "description": "Full access to all VibeWell features",
      "amount": 1999,
      "currency": "usd",
      "interval": "month",
      "features": [
        "All wellness activities",
        "Advanced progress analytics",
        "All wellness plans",
        "Personalized recommendations"
      ]
    }
  ]
}
```

#### Create Checkout Session

Creates a Stripe checkout session for subscription purchase.

```
POST /subscriptions/checkout
Content-Type: application/json

{
  "priceId": "price_1234567890",
  "successUrl": "https://vibewell.com/thank-you",
  "cancelUrl": "https://vibewell.com/plans"
}
```

**Response**:
```json
{
  "sessionId": "cs_test_1234567890",
  "url": "https://checkout.stripe.com/pay/cs_test_1234567890"
}
```

#### Get Current Subscription

Retrieves the current user's subscription details.

```
GET /subscriptions/me
```

**Response**:
```json
{
  "subscriptionId": "sub_1234567890",
  "plan": {
    "id": "price_1234567890",
    "name": "Basic Plan",
    "amount": 999,
    "currency": "usd",
    "interval": "month"
  },
  "status": "active",
  "currentPeriodStart": "2023-06-01T00:00:00Z",
  "currentPeriodEnd": "2023-07-01T00:00:00Z",
  "cancelAtPeriodEnd": false
}
```

#### Cancel Subscription

Cancels the current user's subscription at the end of the billing period.

```
POST /subscriptions/me/cancel
```

**Response**:
```json
{
  "subscriptionId": "sub_1234567890",
  "status": "active",
  "cancelAtPeriodEnd": true,
  "currentPeriodEnd": "2023-07-01T00:00:00Z"
}
```

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of requests. In case of an error, the response will include a JSON object with error details.

**Error Response Format**:
```json
{
  "error": {
    "code": "invalid_request",
    "message": "The provided parameter 'email' is invalid",
    "status": 400,
    "details": {
      "field": "email",
      "reason": "format"
    }
  }
}
```

### Common Error Codes

- `invalid_request`: The request was invalid (400)
- `unauthorized`: Authentication is required (401)
- `forbidden`: The authenticated user lacks permission (403)
- `not_found`: The requested resource was not found (404)
- `rate_limit_exceeded`: Too many requests (429)
- `internal_error`: Server error (500)

## Rate Limiting

API requests are subject to rate limiting to prevent abuse. The current limits are:

- 100 requests per minute per user
- 1000 requests per day per user

Rate limit information is included in the response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1623423152
```

If you exceed the rate limit, you'll receive a 429 Too Many Requests response.

## Pagination

List endpoints support pagination through the following query parameters:

- `page`: Page number (starting from 1)
- `limit`: Number of items per page (default: 20, max: 100)

Pagination details are included in the response:

```json
{
  "data": [...],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

## Versioning

The API is versioned through the URL path (e.g., `/latest/users`). When breaking changes are introduced, a new version will be released, and the previous version will be maintained for a deprecation period.

## SDK and Client Libraries

We provide official client libraries for easy integration:

- [JavaScript](https://github.com/vibewell/vibewell-js)
- [Python](https://github.com/vibewell/vibewell-python)
- [Ruby](https://github.com/vibewell/vibewell-ruby)

## Webhook Events

VibeWell can send webhook notifications for various events. To register a webhook endpoint, contact our support team.

**Supported Events**:
- `user.created`
- `user.updated`
- `activity.completed`
- `plan.subscribed`
- `plan.completed`
- `subscription.created`
- `subscription.updated`
- `subscription.canceled`

**Webhook Payload Example**:
```json
{
  "event": "activity.completed",
  "timestamp": "2023-06-15T19:30:00Z",
  "data": {
    "userId": "user_123",
    "activityId": "activity_123",
    "activityTitle": "Morning Meditation",
    "duration": 15,
    "rating": 5
  }
}
```

## Support

For API support, please contact us at api-support@vibewell.com or visit our [Developer Portal](https://developers.vibewell.com). 