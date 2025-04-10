# Vibewell API Documentation

## Overview

This document provides detailed information about the Vibewell RESTful API endpoints, authentication requirements, request/response formats, and usage examples.

## Base URL

All API endpoints are relative to:

```
https://api.vibewell.com/v1
```

For development environments:

```
http://localhost:3000/api
```

## Authentication

Most API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Getting a Token

```
POST /auth/login
```

Request body:
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

> **SECURITY NOTE**: All JWT tokens shown in the examples are non-functional samples used for illustrative purposes only. They are truncated and do not represent actual authentication tokens. Never share real authentication tokens in documentation or code repositories.

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer"
  }
}
```

## Rate Limiting

To ensure fair usage and protect our systems, all API endpoints are subject to rate limiting. The specific limits vary by endpoint and user role.

### Rate Limit Headers

Rate limit information is returned in the following HTTP headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1628537268
```

If you exceed the rate limit, you'll receive a `429 Too Many Requests` response with a `Retry-After` header indicating how many seconds to wait before retrying.

### Rate Limits by Endpoint Category

| Category | Default Limit | Notes |
|----------|--------------|-------|
| General API | 100 requests per minute | Applied to most endpoints |
| Authentication | 10 requests per minute | Login, signup, password reset |
| Password Reset | 3 requests per hour | Per email address |
| User Registration | 5 registrations per day | Per IP address |
| MFA Operations | Varies | See below |
| Financial Operations | 10 per 5 minutes | Payment processing, subscriptions |

### MFA-Specific Rate Limits

| Operation | Limit |
|-----------|-------|
| MFA Enrollment | 3 enrollments per hour per user |
| MFA Verification | 5 attempts per 15 minutes per user |
| MFA Unenrollment | 2 unenrollments per 24 hours per user |

### Best Practices for Handling Rate Limits

1. **Implement exponential backoff**: When receiving a 429 response, use the `Retry-After` header to wait before retrying, and increase the delay for consecutive failures.

2. **Cache responses**: Where appropriate, cache API responses to reduce the number of requests.

3. **Use bulk operations**: Instead of making multiple individual requests, use bulk endpoints where available.

4. **Monitor your usage**: Keep track of your rate limit headers to ensure you're not approaching limits.

### Example: Handling Rate Limits in Client Code

```javascript
async function makeApiRequest(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Check if rate limited
    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
      console.log(`Rate limited. Retrying after ${retryAfter} seconds`);
      
      // Wait and retry
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return makeApiRequest(url); // Retry the request
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}
```

## Error Handling

All API errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional information
  }
}
```

Common error codes:
- `UNAUTHORIZED`: Authentication required or token invalid
- `FORBIDDEN`: Insufficient permissions for the operation
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Request data failed validation
- `INTERNAL_ERROR`: Server error

## User API

### Get Current User

Retrieves the profile information for the currently authenticated user.

```
GET /users/me
```

Response:
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "profileImage": "https://storage.vibewell.com/avatars/user_123.jpg",
  "role": "customer",
  "preferences": {
    "notifications": {
      "email": true,
      "sms": false,
      "push": true
    },
    "privacy": {
      "profileVisibility": "public",
      "emailVisibility": "private"
    }
  },
  "createdAt": "2023-01-15T12:00:00Z",
  "updatedAt": "2023-02-20T15:30:00Z"
}
```

### Update User Profile

Updates profile information for the current user.

```
PATCH /users/me
```

Request body:
```json
{
  "name": "John Smith",
  "phone": "+1987654321",
  "preferences": {
    "notifications": {
      "sms": true
    }
  }
}
```

Response:
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Smith",
  "phone": "+1987654321",
  "profileImage": "https://storage.vibewell.com/avatars/user_123.jpg",
  "role": "customer",
  "preferences": {
    "notifications": {
      "email": true,
      "sms": true,
      "push": true
    },
    "privacy": {
      "profileVisibility": "public",
      "emailVisibility": "private"
    }
  },
  "updatedAt": "2023-03-10T09:45:00Z"
}
```

### Upload Profile Image

Uploads a new profile image.

```
POST /users/me/profile-image
```

Request: multipart/form-data with 'image' field containing the image file

Response:
```json
{
  "profileImage": "https://storage.vibewell.com/avatars/user_123.jpg",
  "updatedAt": "2023-03-15T14:20:00Z"
}
```

## Booking API

### Get User Bookings

Retrieves all bookings for the current user.

```
GET /bookings
```

Query parameters:
- `status` (optional): Filter by status (pending, confirmed, completed, cancelled)
- `from` (optional): Start date (YYYY-MM-DD)
- `to` (optional): End date (YYYY-MM-DD)
- `limit` (optional): Maximum number of results (default: 20)
- `offset` (optional): Results offset for pagination (default: 0)

Response:
```json
{
  "bookings": [
    {
      "id": "booking_123",
      "providerId": "provider_456",
      "providerName": "Style Studio",
      "serviceId": "service_789",
      "serviceName": "Haircut & Style",
      "date": "2023-04-15",
      "startTime": "14:00:00",
      "endTime": "15:00:00",
      "status": "confirmed",
      "price": 75.00,
      "currency": "USD",
      "notes": "Please arrive 10 minutes early",
      "createdAt": "2023-03-20T10:15:00Z"
    },
    // More bookings...
  ],
  "total": 5,
  "limit": 20,
  "offset": 0
}
```

### Create Booking

Creates a new booking.

```
POST /bookings
```

Request body:
```json
{
  "providerId": "provider_456",
  "serviceId": "service_789",
  "date": "2023-05-10",
  "startTime": "11:00:00",
  "notes": "First-time client"
}
```

Response:
```json
{
  "id": "booking_124",
  "providerId": "provider_456",
  "providerName": "Style Studio",
  "serviceId": "service_789",
  "serviceName": "Haircut & Style",
  "date": "2023-05-10",
  "startTime": "11:00:00",
  "endTime": "12:00:00",
  "status": "pending",
  "price": 75.00,
  "currency": "USD",
  "notes": "First-time client",
  "createdAt": "2023-03-25T09:30:00Z"
}
```

### Cancel Booking

Cancels an existing booking.

```
POST /bookings/{bookingId}/cancel
```

Request body:
```json
{
  "reason": "Schedule conflict"
}
```

Response:
```json
{
  "id": "booking_123",
  "status": "cancelled",
  "cancellationReason": "Schedule conflict",
  "cancellationDate": "2023-03-26T15:45:00Z",
  "refundAmount": 0.00
}
```

## Provider API

### Get Provider Details

Retrieves detailed information about a service provider.

```
GET /providers/{providerId}
```

Response:
```json
{
  "id": "provider_456",
  "name": "Style Studio",
  "description": "Premium hair salon with 15 years of experience",
  "images": [
    "https://storage.vibewell.com/providers/provider_456_1.jpg",
    "https://storage.vibewell.com/providers/provider_456_2.jpg"
  ],
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "coordinates": {
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  },
  "contactInfo": {
    "phone": "+1234567890",
    "email": "contact@stylestudio.com",
    "website": "https://stylestudio.com"
  },
  "businessHours": [
    {
      "day": "monday",
      "open": "09:00:00",
      "close": "18:00:00"
    },
    // Other days...
  ],
  "services": [
    {
      "id": "service_789",
      "name": "Haircut & Style",
      "description": "Professional haircut and styling",
      "duration": 60,
      "price": 75.00,
      "currency": "USD"
    },
    // More services...
  ],
  "rating": 4.8,
  "reviewCount": 124,
  "verified": true
}
```

### Search Providers

Searches for providers based on various criteria.

```
GET /providers/search
```

Query parameters:
- `query` (optional): Search term
- `category` (optional): Service category
- `location` (optional): Location name
- `lat` & `lng` (optional): Coordinates for location-based search
- `radius` (optional): Search radius in km (default: 10)
- `minRating` (optional): Minimum rating
- `limit` (optional): Maximum number of results (default: 20)
- `offset` (optional): Results offset for pagination (default: 0)

Response:
```json
{
  "providers": [
    {
      "id": "provider_456",
      "name": "Style Studio",
      "description": "Premium hair salon with 15 years of experience",
      "mainImage": "https://storage.vibewell.com/providers/provider_456_1.jpg",
      "address": {
        "city": "New York",
        "state": "NY"
      },
      "distance": 2.4,
      "rating": 4.8,
      "reviewCount": 124,
      "priceRange": "$$$",
      "topService": "Haircut & Style"
    },
    // More providers...
  ],
  "total": 15,
  "limit": 20,
  "offset": 0
}
```

## Service API

### Get Services by Category

Retrieves services filtered by category.

```
GET /services
```

Query parameters:
- `category` (required): Service category ID
- `limit` (optional): Maximum number of results (default: 20)
- `offset` (optional): Results offset for pagination (default: 0)

Response:
```json
{
  "services": [
    {
      "id": "service_789",
      "name": "Haircut & Style",
      "category": "haircare",
      "description": "Professional haircut and styling",
      "image": "https://storage.vibewell.com/services/haircut.jpg",
      "duration": 60,
      "price": {
        "amount": 75.00,
        "currency": "USD"
      },
      "popularityScore": 98
    },
    // More services...
  ],
  "total": 25,
  "limit": 20,
  "offset": 0
}
```

## AR API

### Get AR Models

Retrieves available AR models for virtual try-on.

```
GET /ar/models
```

Query parameters:
- `category` (optional): Filter by category (makeup, hairstyle, accessory)
- `limit` (optional): Maximum number of results (default: 20)
- `offset` (optional): Results offset for pagination (default: 0)

Response:
```json
{
  "models": [
    {
      "id": "model_123",
      "name": "Natural Makeup Look",
      "category": "makeup",
      "description": "Subtle everyday makeup look",
      "thumbnail": "https://storage.vibewell.com/ar/thumbnails/model_123.jpg",
      "modelUrl": "https://storage.vibewell.com/ar/models/model_123.glb",
      "previewImages": [
        "https://storage.vibewell.com/ar/previews/model_123_1.jpg",
        "https://storage.vibewell.com/ar/previews/model_123_2.jpg"
      ],
      "popularity": 95,
      "attributes": {
        "style": "natural",
        "complexity": "simple",
        "occasion": "everyday"
      }
    },
    // More models...
  ],
  "total": 30,
  "limit": 20,
  "offset": 0
}
```

### Get Model Details

Retrieves detailed information about a specific AR model.

```
GET /ar/models/{modelId}
```

Response:
```json
{
  "id": "model_123",
  "name": "Natural Makeup Look",
  "category": "makeup",
  "description": "Subtle everyday makeup look with neutral tones for a fresh appearance",
  "thumbnail": "https://storage.vibewell.com/ar/thumbnails/model_123.jpg",
  "modelUrl": "https://storage.vibewell.com/ar/models/model_123.glb",
  "previewImages": [
    "https://storage.vibewell.com/ar/previews/model_123_1.jpg",
    "https://storage.vibewell.com/ar/previews/model_123_2.jpg",
    "https://storage.vibewell.com/ar/previews/model_123_3.jpg"
  ],
  "popularity": 95,
  "version": "1.2",
  "fileSize": 2.4, // Size in MB
  "lastUpdated": "2023-02-10T14:25:00Z",
  "attributes": {
    "style": "natural",
    "complexity": "simple",
    "occasion": "everyday",
    "colors": ["beige", "pink", "brown"],
    "recommendedFor": ["fair skin", "medium skin"]
  },
  "relatedServices": [
    {
      "id": "service_456",
      "name": "Natural Makeup Application",
      "providers": [
        {
          "id": "provider_789",
          "name": "Beauty Studio",
          "rating": 4.7
        }
      ]
    }
  ]
}
```

## Content API

### Get Content Articles

Retrieves wellness content articles.

```
GET /content/articles
```

Query parameters:
- `category` (optional): Filter by category (meditation, yoga, nutrition, etc.)
- `tags` (optional): Filter by tags (comma-separated list)
- `limit` (optional): Maximum number of results (default: 20)
- `offset` (optional): Results offset for pagination (default: 0)

Response:
```json
{
  "articles": [
    {
      "id": "article_123",
      "title": "Beginner's Guide to Meditation",
      "summary": "Learn the basics of meditation in this comprehensive guide",
      "category": "meditation",
      "image": "https://storage.vibewell.com/content/meditation_guide.jpg",
      "author": {
        "id": "author_456",
        "name": "Sarah Johnson",
        "title": "Meditation Instructor"
      },
      "readTime": 8, // minutes
      "published": "2023-01-20T12:00:00Z",
      "tags": ["meditation", "beginners", "wellness"]
    },
    // More articles...
  ],
  "total": 45,
  "limit": 20,
  "offset": 0
}
```

### Get Article Content

Retrieves the full content of a specific article.

```
GET /content/articles/{articleId}
```

Response:
```json
{
  "id": "article_123",
  "title": "Beginner's Guide to Meditation",
  "summary": "Learn the basics of meditation in this comprehensive guide",
  "content": "# Beginner's Guide to Meditation\n\nMeditation is a practice that has been around for thousands of years...",
  "contentFormat": "markdown",
  "category": "meditation",
  "image": "https://storage.vibewell.com/content/meditation_guide.jpg",
  "author": {
    "id": "author_456",
    "name": "Sarah Johnson",
    "title": "Meditation Instructor",
    "bio": "Sarah is a certified meditation instructor with 10 years of experience",
    "image": "https://storage.vibewell.com/authors/sarah.jpg"
  },
  "readTime": 8, // minutes
  "published": "2023-01-20T12:00:00Z",
  "updated": "2023-01-25T09:15:00Z",
  "tags": ["meditation", "beginners", "wellness"],
  "relatedArticles": [
    {
      "id": "article_124",
      "title": "Benefits of Daily Meditation",
      "summary": "Discover how daily meditation can improve your mental health"
    }
  ]
}
```

## Reviews API

### Get Reviews for Provider

Retrieves reviews for a specific service provider.

```
GET /providers/{providerId}/reviews
```

Query parameters:
- `rating` (optional): Filter by rating (1-5)
- `sort` (optional): Sort order (newest, oldest, highest, lowest) (default: newest)
- `limit` (optional): Maximum number of results (default: 20)
- `offset` (optional): Results offset for pagination (default: 0)

Response:
```json
{
  "reviews": [
    {
      "id": "review_123",
      "rating": 5,
      "title": "Excellent service!",
      "content": "I had a wonderful experience. Very professional and friendly staff.",
      "serviceId": "service_789",
      "serviceName": "Haircut & Style",
      "user": {
        "id": "user_456",
        "name": "Jane Smith",
        "image": "https://storage.vibewell.com/avatars/user_456.jpg"
      },
      "date": "2023-03-15T16:30:00Z",
      "images": [
        "https://storage.vibewell.com/reviews/review_123_1.jpg"
      ],
      "helpfulCount": 12,
      "providerResponse": {
        "content": "Thank you for your kind words, Jane! We look forward to seeing you again.",
        "date": "2023-03-16T10:45:00Z"
      }
    },
    // More reviews...
  ],
  "summary": {
    "average": 4.8,
    "total": 124,
    "distribution": {
      "5": 98,
      "4": 20,
      "3": 4,
      "2": 1,
      "1": 1
    }
  },
  "limit": 20,
  "offset": 0
}
```

### Create Review

Creates a new review for a completed service.

```
POST /bookings/{bookingId}/review
```

Request body:
```json
{
  "rating": 5,
  "title": "Excellent service!",
  "content": "I had a wonderful experience. Very professional and friendly staff.",
  "images": [
    {
      "data": "base64EncodedImageData..."
    }
  ]
}
```

Response:
```json
{
  "id": "review_124",
  "rating": 5,
  "title": "Excellent service!",
  "content": "I had a wonderful experience. Very professional and friendly staff.",
  "bookingId": "booking_456",
  "serviceId": "service_789",
  "serviceName": "Haircut & Style",
  "providerId": "provider_123",
  "providerName": "Style Studio",
  "date": "2023-03-25T14:20:00Z",
  "images": [
    "https://storage.vibewell.com/reviews/review_124_1.jpg"
  ]
}
```

## Webhook Notifications

Vibewell provides webhook notifications for key events. To receive webhooks:

1. Register a webhook URL in the developer dashboard
2. Select which events you want to receive
3. Implement an endpoint to receive the webhook POST requests

Example webhook payload:

```json
{
  "event": "booking.created",
  "timestamp": "2023-03-25T14:20:00Z",
  "data": {
    "bookingId": "booking_123",
    "providerId": "provider_456",
    "userId": "user_789",
    "serviceId": "service_101",
    "date": "2023-05-10",
    "status": "pending"
  }
}
```

Available webhook events:
- `booking.created`
- `booking.confirmed`
- `booking.cancelled`
- `booking.completed`
- `review.created`
- `user.registered`
- `payment.succeeded`
- `payment.failed`

## API Versioning

The API uses URL versioning (e.g., `/v1/users`). When breaking changes are introduced, a new API version will be released.

Deprecation process:
1. Announcement of upcoming changes (at least 3 months in advance)
2. Introduction of new version alongside the old one
3. Deprecation warning headers in responses from the old version
4. Eventual retirement of the old version

## Request Examples

### cURL

```bash
# Get user profile
curl -X GET "https://api.vibewell.com/v1/users/me" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create a booking
curl -X POST "https://api.vibewell.com/v1/bookings" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": "provider_456",
    "serviceId": "service_789",
    "date": "2023-05-10",
    "startTime": "11:00:00",
    "notes": "First-time client"
  }'
```

### JavaScript

```javascript
// Get user profile
async function getUserProfile() {
  const response = await fetch('https://api.vibewell.com/v1/users/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return await response.json();
}

// Create a booking
async function createBooking(bookingData) {
  const response = await fetch('https://api.vibewell.com/v1/bookings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bookingData)
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return await response.json();
}
``` 